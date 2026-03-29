import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { MdReceiptLong } from 'react-icons/md'
import { useFinance } from '../context/FinanceContext.jsx'
import { useDebounce } from '../hooks/useDebounce.js'
import TransactionCard from '../components/TransactionCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Filters from '../components/Filters.jsx'
import PageTransition from '../components/PageTransition.jsx'

function transactionDateKey(iso) {
  try {
    return format(parseISO(iso), 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

export default function Transactions() {
  const { transactions, deleteTransaction } = useFinance()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('date-newest')

  const handleClearFilters = useCallback(() => {
    setCategoryFilter('all')
    setTypeFilter('all')
    setDateFrom('')
    setDateTo('')
    setSortBy('date-newest')
  }, [])

  const filtered = useMemo(() => {
    let list = [...transactions]

    const q = debouncedSearch.trim().toLowerCase()
    if (q) {
      list = list.filter((t) => {
        const title = (t.title ?? '').toLowerCase()
        const notes = (t.notes ?? '').toLowerCase()
        return title.includes(q) || notes.includes(q)
      })
    }

    if (categoryFilter !== 'all') {
      list = list.filter((t) => t.category === categoryFilter)
    }

    if (typeFilter !== 'all') {
      list = list.filter((t) => t.type === typeFilter)
    }

    if (dateFrom) {
      list = list.filter((t) => transactionDateKey(t.date) >= dateFrom)
    }
    if (dateTo) {
      list = list.filter((t) => transactionDateKey(t.date) <= dateTo)
    }

    return list
  }, [
    transactions,
    debouncedSearch,
    categoryFilter,
    typeFilter,
    dateFrom,
    dateTo,
  ])

  const displayList = useMemo(() => {
    const list = [...filtered]
    switch (sortBy) {
      case 'date-newest':
        list.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        break
      case 'date-oldest':
        list.sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        )
        break
      case 'amount-high':
        list.sort((a, b) => b.amount - a.amount)
        break
      case 'amount-low':
        list.sort((a, b) => a.amount - b.amount)
        break
      case 'category-az':
        list.sort((a, b) =>
          a.category.localeCompare(b.category, undefined, {
            sensitivity: 'base',
          }),
        )
        break
      default:
        break
    }
    return list
  }, [filtered, sortBy])

  const hasTransactions = transactions.length > 0
  const hasNoResults = hasTransactions && displayList.length === 0

  return (
    <PageTransition>
      <div className="transactions-page">
      <header className="transactions-page__header">
        <h1 className="page-title">Transactions</h1>
        <Link to="/transactions/new" className="transactions-page__add-link">
          Add transaction
        </Link>
      </header>

      {!hasTransactions ? (
        <div className="transactions-empty" role="status">
          <MdReceiptLong
            className="transactions-empty__icon"
            aria-hidden
          />
          <h2 className="transactions-empty__title">No transactions yet</h2>
          <p className="transactions-empty__text">
            When you add income or expenses, they will show up here. Start by
            recording your first transaction.
          </p>
          <Link
            to="/transactions/new"
            className="transactions-empty__cta"
          >
            Add your first transaction
          </Link>
        </div>
      ) : (
        <>
          <SearchBar
            searchQuery={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Filters
            categoryFilter={categoryFilter}
            typeFilter={typeFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            sortBy={sortBy}
            onCategoryChange={setCategoryFilter}
            onTypeChange={setTypeFilter}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
          />

          {hasNoResults ? (
            <p className="transactions-page__no-results" role="status">
              No transactions match your search or filters. Try adjusting or
              clearing them.
            </p>
          ) : (
            <ul className="transactions-page__list">
              {displayList.map((t) => (
                <li key={t.id}>
                  <TransactionCard
                    transaction={t}
                    onDelete={deleteTransaction}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
    </PageTransition>
  )
}
