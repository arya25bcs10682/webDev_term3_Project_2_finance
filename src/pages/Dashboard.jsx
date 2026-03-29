import { useMemo, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  startOfMonth,
  subMonths,
  addMonths,
  format as formatDate,
  isSameMonth,
  parseISO,
  isAfter,
} from 'date-fns'
import { FiChevronLeft, FiChevronRight, FiTrendingUp, FiInbox } from 'react-icons/fi'
import { useFinance } from '../context/FinanceContext'
import { useCurrency } from '../hooks/useCurrency'
import { useTheme } from '../context/ThemeContext'
import PageTransition from '../components/PageTransition'
import './Dashboard.css'

export default function Dashboard() {
  const { transactions } = useFinance()
  const { format } = useCurrency()
  const { theme } = useTheme()

  // ── Month selector state (default = current month) ────────
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()))

  // ── Income Breakdown tab ──────────────────────────────────
  const [incomeTab, setIncomeTab] = useState('source') // 'source' | 'trend'

  const today = startOfMonth(new Date())
  const isCurrentMonth = isSameMonth(selectedMonth, today)

  const handlePrevMonth = () => setSelectedMonth(prev => subMonths(prev, 1))
  const handleNextMonth = () => {
    if (!isCurrentMonth) setSelectedMonth(prev => addMonths(prev, 1))
  }

  // ── Theme-aware chart colors ──────────────────────────────
  const colors = theme === 'dark' ? {
    income: '#10b981',
    expense: '#ef4444',
    grid: '#222222',
    axis: '#aaaaaa',
    tooltipBg: '#111111',
    tooltipText: '#ffffff',
    pieColors: ['#10b981','#3b82f6','#f59e0b','#ef4444',
                 '#8b5cf6','#ec4899','#06b6d4','#f97316'],
  } : {
    income: '#14c21dff',
    expense: '#dc2626',
    grid: '#a7f3d0',
    axis: '#065f46',
    tooltipBg: '#ffffff',
    tooltipText: '#064e3b',
    pieColors: ['#14c21dff','#2563eb','#d97706','#dc2626',
                 '#7c3aed','#db2777','#0891b2','#ea580c'],
  }

  // ── All-time summary data ─────────────────────────────────
  const {
    totalIncome,
    totalExpenses,
    netBalance,
    topCategory,
    categoryData,
    monthlyTrendData,
  } = useMemo(() => {
    let income = 0
    let expense = 0
    const catMap = {}

    transactions.forEach((t) => {
      if (t.type === 'income') {
        income += t.amount
      } else if (t.type === 'expense') {
        expense += t.amount
        catMap[t.category] = (catMap[t.category] || 0) + t.amount
      }
    })

    const net = income - expense
    const categories = Object.entries(catMap).map(([name, value]) => ({ name, value }))
    categories.sort((a, b) => b.value - a.value)
    const topCat = categories.length > 0 ? categories[0].name : 'N/A'

    // Last 6 months expense trend (always ends at today)
    const now = new Date()
    const months = Array.from({ length: 6 }).map((_, i) => startOfMonth(subMonths(now, 5 - i)))
    const monthlyData = months.map(month => ({
      month: formatDate(month, 'MMM yyyy'),
      expenses: transactions.reduce((sum, t) => {
        if (t.type === 'expense' && isSameMonth(parseISO(t.date), month)) return sum + t.amount
        return sum
      }, 0),
    }))

    return { totalIncome: income, totalExpenses: expense, netBalance: net, topCategory: topCat, categoryData: categories, monthlyTrendData: monthlyData }
  }, [transactions])

  // ── Monthly income data (reacts to selectedMonth) ─────────
  const { monthlyIncome, incomeBySource, incomeTrend } = useMemo(() => {
    // Total income for the selected month
    const monthlyInc = transactions.reduce((sum, t) => {
      if (t.type === 'income' && isSameMonth(parseISO(t.date), selectedMonth)) {
        return sum + t.amount
      }
      return sum
    }, 0)

    // Income grouped by category for selected month
    const sourceMap = {}
    transactions.forEach(t => {
      if (t.type === 'income' && isSameMonth(parseISO(t.date), selectedMonth)) {
        sourceMap[t.category] = (sourceMap[t.category] || 0) + t.amount
      }
    })
    const bySource = Object.entries(sourceMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)

    // 6-month income trend ending at selectedMonth
    const trendMonths = Array.from({ length: 6 }).map((_, i) =>
      startOfMonth(subMonths(selectedMonth, 5 - i))
    )
    const trend = trendMonths.map(month => ({
      month: formatDate(month, 'MMM yy'),
      income: transactions.reduce((sum, t) => {
        if (t.type === 'income' && isSameMonth(parseISO(t.date), month)) return sum + t.amount
        return sum
      }, 0),
    }))

    return { monthlyIncome: monthlyInc, incomeBySource: bySource, incomeTrend: trend }
  }, [transactions, selectedMonth])

  // ── Tooltip components ────────────────────────────────────
  const tooltipStyle = {
    backgroundColor: colors.tooltipBg,
    color: colors.tooltipText,
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      const label = item.name || item.payload?.month || item.payload?.name
      return (
        <div style={tooltipStyle}>
          <p style={{ margin: 0, fontWeight: 600 }}>{`${label}: ${format(item.value)}`}</p>
        </div>
      )
    }
    return null
  }

  const IncomeTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={tooltipStyle}>
          <p style={{ margin: 0, fontWeight: 600 }}>{label || payload[0].payload?.month}</p>
          <p style={{ margin: '4px 0 0', color: colors.income, fontWeight: 500 }}>
            {format(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const selectedMonthLabel = formatDate(selectedMonth, 'MMMM yyyy')

  return (
    <PageTransition>
      <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1 className="page-title">Dashboard</h1>
      </header>

      {/* ── Summary Cards ───────────────────────────────────── */}
      <section className="summary-cards">
        <div className="summary-card">
          <span className="summary-card__label">Total Income</span>
          <span className="summary-card__value summary-card__value--income">{format(totalIncome)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__label">Total Expenses</span>
          <span className="summary-card__value summary-card__value--expense">{format(totalExpenses)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__label">Net Balance</span>
          <span className={`summary-card__value ${netBalance < 0 ? 'summary-card__value--expense' : ''}`}>
            {format(netBalance)}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-card__label">Top Spending Category</span>
          <span className="summary-card__value summary-card__value--text">{topCategory}</span>
        </div>

        {/* Monthly Income Card (reacts to selectedMonth) */}
        <div className="summary-card summary-card--income-month">
          <span className="summary-card__label">Monthly Income</span>
          <span className="summary-card__sublabel">{selectedMonthLabel}</span>
          <div className="summary-card__value-row">
            <span className="summary-card__value summary-card__value--income">
              {format(monthlyIncome)}
            </span>
            <FiTrendingUp style={{ color: 'var(--success)', fontSize: '1.5rem', flexShrink: 0 }} />
          </div>
        </div>
      </section>

      {/* ── Monthly Income Breakdown ──────────────────────── */}
      <section className="dashboard-chart-card dashboard-income-section">

        {/* Header: title + month selector */}
        <div className="income-section__header">
          <h2 className="dashboard-chart-card__title" style={{ margin: 0 }}>
            Monthly Income Breakdown
          </h2>
          <div className="month-selector">
            <button
              className="month-selector__arrow"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <FiChevronLeft />
            </button>
            <span className="month-selector__label">{selectedMonthLabel}</span>
            <button
              className="month-selector__arrow"
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              aria-label="Next month"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="income-tabs">
          <button
            className={`income-tab ${incomeTab === 'source' ? 'income-tab--active' : ''}`}
            onClick={() => setIncomeTab('source')}
          >
            By Source
          </button>
          <button
            className={`income-tab ${incomeTab === 'trend' ? 'income-tab--active' : ''}`}
            onClick={() => setIncomeTab('trend')}
          >
            Trend (6 Months)
          </button>
        </div>

        {/* Chart area */}
        <div className="dashboard-chart-card__wrapper dashboard-chart-card__wrapper--tall">
          {incomeTab === 'source' ? (
            incomeBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeBySource} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: colors.axis }}
                    angle={-30}
                    textAnchor="end"
                    dy={8}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(v) => format(v)}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: colors.axis }}
                    width={82}
                  />
                  <Tooltip content={<IncomeTooltip />} cursor={{ fill: 'var(--accent-subtle)' }} />
                  <Bar dataKey="amount" name="Income" fill={colors.income} radius={[5, 5, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState month={selectedMonthLabel} />
            )
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: colors.axis }}
                  dy={10}
                />
                <YAxis
                  tickFormatter={(v) => format(v)}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: colors.axis }}
                  width={82}
                />
                <Tooltip content={<IncomeTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke={colors.income}
                  strokeWidth={3}
                  dot={{ r: 4, fill: colors.income, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── Expense Charts ──────────────────────────────────── */}
      <section className="dashboard-charts">
        <div className="dashboard-chart-card">
          <h2 className="dashboard-chart-card__title">Monthly Spending Trend</h2>
          <div className="dashboard-chart-card__wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: colors.axis }} dy={10} />
                <YAxis tickFormatter={(val) => format(val)} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: colors.axis }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, color: colors.tooltipText, border: 'none', borderRadius: '8px' }} content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke={colors.expense} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-chart-card">
          <h2 className="dashboard-chart-card__title">Spending by Category</h2>
          <div className="dashboard-chart-card__wrapper">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors.pieColors[index % colors.pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, color: colors.tooltipText, border: 'none', borderRadius: '8px' }} content={<CustomTooltip />} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="dashboard-chart-card__empty">No expenses yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
    </PageTransition>
  )
}

function EmptyState({ month }) {
  return (
    <div className="income-empty">
      <FiInbox className="income-empty__icon" />
      <p className="income-empty__text">No income recorded for {month}</p>
    </div>
  )
}
