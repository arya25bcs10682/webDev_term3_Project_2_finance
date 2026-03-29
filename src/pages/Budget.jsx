import { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import { useBudget } from '../hooks/useBudget'
import { useFinance } from '../context/FinanceContext'
import { useCurrency } from '../hooks/useCurrency'
import PageTransition from '../components/PageTransition'
import './Budget.css'

export default function Budget() {
  const { monthlyBudget, totalExpenses, remaining, percentageUsed } = useBudget()
  const { transactions, setBudget } = useFinance()
  const { format } = useCurrency()

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const handleEditClick = () => {
    setEditValue(monthlyBudget.toString())
    setIsEditing(true)
  }

  const handleSave = () => {
    const val = Number(editValue)
    if (isNaN(val) || val < 0) {
      toast.error('Please enter a valid budget amount.')
      return
    }
    setBudget(val)
    setIsEditing(false)
    toast.success('Budget updated successfully!')
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  // Progress Bar Color Logic
  const getProgressColorClass = () => {
    if (percentageUsed < 75) return 'budget-progress__fill--safe'
    if (percentageUsed < 100) return 'budget-progress__fill--warning'
    return 'budget-progress__fill--danger'
  }

  // Recurring Expenses Calculation
  const recurringExpenses = useMemo(() => {
    return transactions.filter((t) => t.recurring && t.type === 'expense')
  }, [transactions])

  const totalRecurringCost = useMemo(() => {
    return recurringExpenses.reduce((sum, t) => sum + t.amount, 0)
  }, [recurringExpenses])

  return (
    <PageTransition>
      <div className="budget-page">
      <header className="budget-page__header">
        <h1 className="page-title">Budget</h1>
      </header>

      <section className="budget-card">
        <div className="budget-card__top">
          <div className="budget-card__main-amt">
            <span className="budget-card__label">Monthly Budget</span>
            {!isEditing ? (
              <div className="budget-card__amount-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 className="budget-card__amount">{format(monthlyBudget)}</h2>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="budget-card__edit-btn"
                  aria-label="Edit budget"
                >
                  <FiEdit2 /> Edit
                </button>
              </div>
            ) : (
              <div className="budget-edit-form">
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="budget-edit-form__input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                />
                <div className="budget-edit-form__actions">
                  <button type="button" onClick={handleSave} className="budget-edit-form__btn budget-edit-form__btn--save" aria-label="Save budget">
                    <FiCheck />
                  </button>
                  <button type="button" onClick={handleCancel} className="budget-edit-form__btn budget-edit-form__btn--cancel" aria-label="Cancel editing">
                    <FiX />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="budget-stats">
          <div className="budget-stat">
            <span className="budget-stat__label">Total Expenses</span>
            <span className="budget-stat__value">{format(totalExpenses)}</span>
          </div>
          <div className="budget-stat">
            <span className="budget-stat__label">Remaining</span>
            <span className={`budget-stat__value ${remaining < 0 ? 'budget-stat__value--negative' : ''}`}>
              {format(remaining)}
            </span>
          </div>
        </div>

        <div className="budget-progress">
          <div className="budget-progress__header">
            <span className="budget-progress__label">Budget Used</span>
            <span className="budget-progress__pct">{percentageUsed.toFixed(1)}%</span>
          </div>
          <div className="budget-progress__bar">
            <div
              className={`budget-progress__fill ${getProgressColorClass()}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            ></div>
          </div>
        </div>
      </section>

      <section className="recurring-section">
        <h3 className="recurring-section__title">Recurring Expenses</h3>
        {recurringExpenses.length > 0 ? (
          <div className="recurring-list">
            {recurringExpenses.map((expense) => (
              <div key={expense.id} className="transaction-card">
                <div className="transaction-card__main">
                  <div className="transaction-card__title-row">
                    <h4 className="transaction-card__title">{expense.title}</h4>
                    <p className="transaction-card__amount transaction-card__amount--expense">
                      {format(expense.amount)}
                    </p>
                  </div>
                  <div className="transaction-card__meta">
                    <span className="transaction-card__category">{expense.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="transactions-empty" style={{ padding: '1.5rem', marginTop: '0' }}>
            <p className="transactions-empty__text" style={{ margin: 0 }}>No recurring expenses found.</p>
          </div>
        )}

        <div className="recurring-summary">
          <span className="recurring-summary__label">Total Monthly Recurring Cost</span>
          <span className="recurring-summary__value">{format(totalRecurringCost)}</span>
        </div>
      </section>
    </div>
    </PageTransition>
  )
}
