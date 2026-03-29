import { useFinance } from '../context/FinanceContext.jsx'

export function useTransactions() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction } =
    useFinance()

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  }
}
