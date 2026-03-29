import { useMemo } from 'react'
import { useFinance } from '../context/FinanceContext.jsx'

export function useBudget() {
  const { transactions, budget } = useFinance()
  const monthlyBudget = budget.monthlyBudget

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  )

  const remaining = monthlyBudget - totalExpenses

  const percentageUsed =
    monthlyBudget === 0 ? 0 : (totalExpenses / monthlyBudget) * 100

  return {
    monthlyBudget,
    totalExpenses,
    remaining,
    percentageUsed,
  }
}
