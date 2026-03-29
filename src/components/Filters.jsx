import { useMemo } from 'react'
import { useFinance } from '../context/FinanceContext.jsx'

const CORE_CATEGORIES = [
  'Food',
  'Travel',
  'Rent',
  'Shopping',
  'Entertainment',
  'Health',
  'Utilities',
  'Subscriptions',
  'Job Payment',
  'Business Income',
  'Cash Deposit',
  'Freelance',
  'Investment Returns',
  'Rental Income',
]

const SORT_OPTIONS = [
  { value: 'date-newest', label: 'Date: Newest First' },
  { value: 'date-oldest', label: 'Date: Oldest First' },
  { value: 'amount-high', label: 'Amount: High to Low' },
  { value: 'amount-low', label: 'Amount: Low to High' },
  { value: 'category-az', label: 'Category: A–Z' },
]

export default function Filters({
  categoryFilter,
  typeFilter,
  dateFrom,
  dateTo,
  sortBy,
  onCategoryChange,
  onTypeChange,
  onDateFromChange,
  onDateToChange,
  onSortChange,
  onClearFilters,
}) {
  const { transactions } = useFinance()

  const CATEGORY_OPTIONS = useMemo(() => {
    const customCats = transactions
      .map((t) => t.category)
      .filter((c) => !CORE_CATEGORIES.includes(c) && c !== 'Other')
    return Array.from(new Set([...CORE_CATEGORIES, ...customCats])).sort((a, b) =>
      a.localeCompare(b),
    )
  }, [transactions])

  return (
    <div className="filters">
      <div className="filters__rows">

        {/* ROW 1: Category + Type */}
        <div className="filters__row">
          <div className="filters__field">
            <label className="filters__label" htmlFor="filter-category">
              Category
            </label>
            <select
              id="filter-category"
              className="filters__input filters__select"
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="all">All</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filters__field">
            <label className="filters__label" htmlFor="filter-type">
              Type
            </label>
            <select
              id="filter-type"
              className="filters__input filters__select"
              value={typeFilter}
              onChange={(e) => onTypeChange(e.target.value)}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        {/* ROW 2: Date Range */}
        <div className="filters__row filters__row--dates">
          <div className="filters__field">
            <span className="filters__label">Date range</span>
            <div className="filters__date-inputs">
              <div className="filters__date-field">
                <label className="filters__sublabel" htmlFor="filter-date-from">
                  From
                </label>
                <input
                  id="filter-date-from"
                  type="date"
                  className="filters__input"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                />
              </div>
              <div className="filters__date-field">
                <label className="filters__sublabel" htmlFor="filter-date-to">
                  To
                </label>
                <input
                  id="filter-date-to"
                  type="date"
                  className="filters__input"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: Sort by */}
        <div className="filters__row filters__row--sort">
          <div className="filters__field filters__field--sort">
            <label className="filters__label" htmlFor="filter-sort">
              Sort by
            </label>
            <select
              id="filter-sort"
              className="filters__input filters__select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ROW 4: Clear Filters */}
        <div className="filters__actions">
          <button
            type="button"
            className="filters__clear"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        </div>

      </div>
    </div>
  )
}
