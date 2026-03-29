import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'finance-app-state'

const MOCK_TRANSACTIONS = [
  {
    id: 'a1b2c3d4-e5f6-4789-a012-345678901234',
    title: 'Whole Foods Market',
    amount: 94.32,
    category: 'Food',
    type: 'expense',
    date: '2026-03-27T18:30:00.000Z',
    notes: 'Weekly groceries and produce',
    recurring: false,
  },
  {
    id: 'b2c3d4e5-f6a7-4890-b123-456789012345',
    title: 'Apartment rent',
    amount: 1750,
    category: 'Rent',
    type: 'expense',
    date: '2026-03-01T08:00:00.000Z',
    notes: 'March rent payment',
    recurring: true,
  },
  {
    id: 'c3d4e5f6-a7b8-4901-c234-567890123456',
    title: 'Employer payroll',
    amount: 4280,
    category: 'Shopping',
    type: 'income',
    date: '2026-03-15T09:00:00.000Z',
    notes: 'Biweekly salary deposit',
    recurring: true,
  },
  {
    id: 'd4e5f6a7-b8c9-4012-d345-678901234567',
    title: 'United Airlines',
    amount: 312.5,
    category: 'Travel',
    type: 'expense',
    date: '2026-03-20T14:15:00.000Z',
    notes: 'Round trip for spring break',
    recurring: false,
  },
  {
    id: 'e5f6a7b8-c9d0-4123-e456-789012345678',
    title: 'Spotify Premium',
    amount: 11.99,
    category: 'Subscriptions',
    type: 'expense',
    date: '2026-03-12T00:00:00.000Z',
    notes: 'Family plan share',
    recurring: true,
  },
  {
    id: 'f6a7b8c9-d0e1-4234-f567-890123456789',
    title: 'CVS Pharmacy',
    amount: 28.45,
    category: 'Health',
    type: 'expense',
    date: '2026-03-25T11:20:00.000Z',
    notes: 'Prescription copay and vitamins',
    recurring: false,
  },
]

const DEFAULT_BUDGET = { monthlyBudget: 3200 }

function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (
      data &&
      Array.isArray(data.transactions) &&
      data.budget &&
      typeof data.budget.monthlyBudget === 'number'
    ) {
      return {
        transactions: data.transactions,
        budget: { monthlyBudget: data.budget.monthlyBudget },
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

function getInitialState() {
  const stored = loadStoredState()
  if (stored) return stored
  return {
    transactions: MOCK_TRANSACTIONS,
    budget: DEFAULT_BUDGET,
  }
}

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const [state, setState] = useState(getInitialState)

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          transactions: state.transactions,
          budget: state.budget,
        }),
      )
    } catch {
      /* ignore */
    }
  }, [state.transactions, state.budget])

  const addTransaction = useCallback((transaction) => {
    setState((prev) => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        {
          ...transaction,
          id: transaction.id ?? uuidv4(),
        },
      ],
    }))
  }, [])

  const deleteTransaction = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }))
  }, [])

  const updateTransaction = useCallback((id, updatedData) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, ...updatedData, id: t.id } : t,
      ),
    }))
  }, [])

  const setBudget = useCallback((amount) => {
    setState((prev) => ({
      ...prev,
      budget: { monthlyBudget: amount },
    }))
  }, [])

  const value = {
    transactions: state.transactions,
    budget: state.budget,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    setBudget,
  }

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return ctx
}
