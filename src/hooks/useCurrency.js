import { useCallback, useMemo } from 'react'

export function useCurrency() {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [],
  )

  const format = useCallback(
    (amount) => formatter.format(amount),
    [formatter],
  )

  return { format }
}
