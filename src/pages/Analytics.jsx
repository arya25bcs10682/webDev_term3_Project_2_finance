import { useMemo, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
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
  getYear,
  isSameYear,
  eachMonthOfInterval
} from 'date-fns'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useFinance } from '../context/FinanceContext'
import { useCurrency } from '../hooks/useCurrency'
import { useTheme } from '../context/ThemeContext'
import PageTransition from '../components/PageTransition'
import './Analytics.css'

export default function Analytics() {
  const { transactions } = useFinance()
  const { format } = useCurrency()
  const { theme } = useTheme()

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
    income: '#059669',
    expense: '#dc2626',
    grid: '#a7f3d0',
    axis: '#065f46',
    tooltipBg: '#ffffff',
    tooltipText: '#064e3b',
    pieColors: ['#059669','#2563eb','#d97706','#dc2626',
                 '#7c3aed','#db2777','#0891b2','#ea580c'],
  }

  const [viewMode, setViewMode] = useState('monthly') // 'monthly' | 'yearly'
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()))
  const [selectedYear, setSelectedYear] = useState(() => getYear(new Date()))

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map((t) => getYear(parseISO(t.date))))
    years.add(getYear(new Date())) // Ensure current year is always available
    return Array.from(years).sort((a, b) => b - a)
  }, [transactions])

  const handlePrevMonth = () => setSelectedMonth((prev) => subMonths(prev, 1))
  const handleNextMonth = () => setSelectedMonth((prev) => addMonths(prev, 1))

  const handlePrevYear = () => {
    const idx = availableYears.indexOf(selectedYear)
    if (idx < availableYears.length - 1) setSelectedYear(availableYears[idx + 1])
  }
  
  const handleNextYear = () => {
    const idx = availableYears.indexOf(selectedYear)
    if (idx > 0) setSelectedYear(availableYears[idx - 1])
  }

  const {
    barData,
    categoryData,
    totalExpenses,
  } = useMemo(() => {
    let monthsToChart = []
    let isTargetPeriod = (dateIso) => false

    if (viewMode === 'monthly') {
      // Last 6 months ending in selectedMonth
      monthsToChart = Array.from({ length: 6 }).map((_, i) => subMonths(selectedMonth, 5 - i))
      isTargetPeriod = (dateIso) => isSameMonth(parseISO(dateIso), selectedMonth)
    } else {
      // 12 months of selectedYear
      monthsToChart = eachMonthOfInterval({
        start: new Date(selectedYear, 0, 1),
        end: new Date(selectedYear, 11, 31)
      })
      isTargetPeriod = (dateIso) => isSameYear(parseISO(dateIso), new Date(selectedYear, 0, 1))
    }
    
    // Compute Bar Chart Data
    const bar = monthsToChart.map(month => {
      const monthStr = formatDate(month, 'MMM yyyy')
      let income = 0
      let expense = 0
      
      transactions.forEach(t => {
        if (isSameMonth(parseISO(t.date), month)) {
          if (t.type === 'income') income += t.amount
          else if (t.type === 'expense') expense += t.amount
        }
      })
      
      return { month: monthStr, income, expense, hasData: income > 0 || expense > 0 }
    })

    // Compute Category Data for Pie Chart & Table
    const catMap = {}
    let totalExp = 0

    transactions.forEach((t) => {
      if (t.type === 'expense' && isTargetPeriod(t.date)) {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount
        totalExp += t.amount
      }
    })

    const categories = Object.entries(catMap).map(([name, value]) => ({ 
      name, 
      value,
      percentage: totalExp > 0 ? ((value / totalExp) * 100).toFixed(1) : 0
    }))
    categories.sort((a, b) => b.value - a.value)

    return {
      barData: bar,
      categoryData: categories,
      totalExpenses: totalExp,
    }
  }, [transactions, viewMode, selectedMonth, selectedYear])

  const CustomTooltipBar = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: colors.tooltipBg, color: colors.tooltipText, border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.fill, margin: '4px 0 0 0', fontWeight: 500 }}>
              {entry.name}: {format(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomTooltipPie = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: colors.tooltipBg, color: colors.tooltipText, border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{`${payload[0].name} : ${format(payload[0].value)}`}</p>
        </div>
      )
    }
    return null
  }

  const hasAnyBarData = barData.some(d => d.hasData)

  return (
    <PageTransition>
      <div className="analytics-page">
      <header className="analytics-page__header">
        <h1 className="page-title">Analytics</h1>
        
        <div className="analytics-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'monthly' ? 'toggle-btn--active' : ''}`} 
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'yearly' ? 'toggle-btn--active' : ''}`} 
              onClick={() => setViewMode('yearly')}
            >
              Yearly
            </button>
          </div>
          
          <div className="period-selector">
            {viewMode === 'monthly' ? (
              <>
                <button onClick={handlePrevMonth} className="period-arrow" aria-label="Previous month"><FiChevronLeft /></button>
                <span className="period-label">{formatDate(selectedMonth, 'MMMM yyyy')}</span>
                <button onClick={handleNextMonth} className="period-arrow" aria-label="Next month"><FiChevronRight /></button>
              </>
            ) : (
              <>
                <button 
                  onClick={handlePrevYear} 
                  disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1} 
                  className="period-arrow"
                  aria-label="Previous year"
                ><FiChevronLeft /></button>
                <span className="period-label">{selectedYear}</span>
                <button 
                  onClick={handleNextYear} 
                  disabled={availableYears.indexOf(selectedYear) === 0} 
                  className="period-arrow"
                  aria-label="Next year"
                ><FiChevronRight /></button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="analytics-grid">
        <section className="analytics-card analytics-card--full">
          <h2 className="analytics-card__title">
            Income vs Expense ({viewMode === 'monthly' ? 'Last 6 Months' : `Year ${selectedYear}`})
          </h2>
          <div className="analytics-card__chart">
            {hasAnyBarData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: colors.axis }} dy={10} />
                  <YAxis tickFormatter={(val) => format(val)} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: colors.axis }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, color: colors.tooltipText, border: 'none', borderRadius: '8px' }} content={<CustomTooltipBar />} cursor={{ fill: 'var(--accent-subtle)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="income" name="Income" fill={colors.income} radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="expense" name="Expense" fill={colors.expense} radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-card__empty">No transactions found for this period.</div>
            )}
          </div>
        </section>

        <section className="analytics-card analytics-card--full">
          <h2 className="analytics-card__title">
            Spending by Category ({viewMode === 'monthly' ? formatDate(selectedMonth, 'MMMM yyyy') : selectedYear})
          </h2>
          <div className="analytics-card__chart analytics-card__chart--pie">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors.pieColors[index % colors.pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, color: colors.tooltipText, border: 'none', borderRadius: '8px' }} content={<CustomTooltipPie />} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-card__empty">No expenses found for this period.</div>
            )}
          </div>
        </section>

        <section className="analytics-card analytics-card--full">
          <h2 className="analytics-card__title">
            Category Summary ({viewMode === 'monthly' ? formatDate(selectedMonth, 'MMMM yyyy') : selectedYear})
          </h2>
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Total Spent</th>
                  <th className="text-right">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.length > 0 ? (
                  categoryData.map((cat, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="cat-cell">
                          <span className="cat-dot" style={{ backgroundColor: colors.pieColors[idx % colors.pieColors.length] }}></span>
                          {cat.name}
                        </div>
                      </td>
                      <td className="text-right font-medium">{format(cat.value)}</td>
                      <td className="text-right">{cat.percentage}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted">No category data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
    </PageTransition>
  )
}
