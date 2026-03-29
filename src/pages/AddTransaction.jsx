import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { useFinance } from '../context/FinanceContext.jsx'
import PageTransition from '../components/PageTransition.jsx'

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Rent',
  'Shopping',
  'Entertainment',
  'Health',
  'Utilities',
  'Subscriptions',
]

const INCOME_CATEGORIES = [
  'Job Payment',
  'Business Income',
  'Cash Deposit',
  'Freelance',
  'Investment Returns',
  'Rental Income',
]

const schema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(2, 'Title must be at least 2 characters'),
  amount: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null || Number.isNaN(value)
        ? undefined
        : value,
    )
    .required('Amount is required')
    .typeError('Enter a valid amount')
    .moreThan(0, 'Amount must be greater than 0'),
  category: yup
    .string()
    .required('Category is required')
    .min(2, 'Category must be at least 2 characters'),
  date: yup.string().required('Date is required'),
  type: yup
    .string()
    .required('Select a type')
    .oneOf(['income', 'expense'], 'Select income or expense'),
  notes: yup.string().optional(),
  recurring: yup.boolean().optional(),
})

export default function AddTransaction() {
  const navigate = useNavigate()
  const { addTransaction } = useFinance()
  const [isCustomCategory, setIsCustomCategory] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      amount: undefined,
      category: '',
      date: new Date().toISOString().slice(0, 10),
      type: 'expense',
      notes: '',
      recurring: false,
    },
  })

  const type = watch('type')
  const currentCategoryList = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleCategorySelectChange = (e) => {
    if (e.target.value === 'Other') {
      setIsCustomCategory(true)
      setValue('category', '')
    }
  }

  const onSubmit = (data) => {
    addTransaction({
      id: uuidv4(),
      title: data.title.trim(),
      amount: data.amount,
      category: data.category.trim(),
      type: data.type,
      date: new Date(`${data.date}T12:00:00`).toISOString(),
      notes: (data.notes && data.notes.trim()) || '',
      recurring: Boolean(data.recurring),
    })
    toast.success('Transaction added successfully')
    navigate('/transactions')
  }

  return (
    <PageTransition>
      <div className="add-transaction">
      <header className="add-transaction__header">
        <h1 className="page-title">Add Transaction</h1>
        <p className="add-transaction__subtitle">
          Record a new income or expense. Fields marked with * are required.
        </p>
      </header>

      <form
        className="add-transaction__form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="add-transaction__field">
          <label className="add-transaction__label" htmlFor="title">
            Title <span aria-hidden>*</span>
          </label>
          <input
            id="title"
            type="text"
            className="add-transaction__input"
            placeholder="e.g. Grocery run"
            autoComplete="off"
            aria-invalid={errors.title ? 'true' : 'false'}
            {...register('title')}
          />
          {errors.title && (
            <p className="add-transaction__error" role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="add-transaction__field">
          <label className="add-transaction__label" htmlFor="amount">
            Amount <span aria-hidden>*</span>
          </label>
          <input
            id="amount"
            type="number"
            step="any"
            min="0"
            className="add-transaction__input"
            placeholder="0.00"
            aria-invalid={errors.amount ? 'true' : 'false'}
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="add-transaction__error" role="alert">
              {errors.amount.message}
            </p>
          )}
        </div>

        <fieldset className="add-transaction__fieldset">
          <legend className="add-transaction__label add-transaction__legend">
            Type <span aria-hidden>*</span>
          </legend>
          <div className="add-transaction__radios">
            <label className="add-transaction__radio-label">
              <input
                type="radio"
                value="income"
                className="add-transaction__radio"
                {...register('type')}
                onChange={(e) => {
                  register('type').onChange(e)
                  setValue('category', '')
                  setIsCustomCategory(false)
                }}
              />
              <span>Income</span>
            </label>
            <label className="add-transaction__radio-label">
              <input
                type="radio"
                value="expense"
                className="add-transaction__radio"
                {...register('type')}
                onChange={(e) => {
                  register('type').onChange(e)
                  setValue('category', '')
                  setIsCustomCategory(false)
                }}
              />
              <span>Expense</span>
            </label>
          </div>
          {errors.type && (
            <p className="add-transaction__error" role="alert">
              {errors.type.message}
            </p>
          )}
        </fieldset>

        <div className="add-transaction__field">
          <label className="add-transaction__label" htmlFor="category">
            Category <span aria-hidden>*</span>
          </label>
          {isCustomCategory ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                id="category"
                className="add-transaction__input"
                placeholder="Type custom category..."
                autoFocus
                aria-invalid={errors.category ? 'true' : 'false'}
                {...register('category')}
              />
              <button
                type="button"
                className="add-transaction__btn add-transaction__btn--secondary"
                style={{ padding: '0.65rem 0.85rem' }}
                onClick={() => {
                  setIsCustomCategory(false)
                  setValue('category', '')
                }}
                aria-label="Back to dropdown"
              >
                ✕
              </button>
            </div>
          ) : (
            <select
              id="category"
              className="add-transaction__input add-transaction__select"
              aria-invalid={errors.category ? 'true' : 'false'}
              {...register('category')}
              onChange={(e) => {
                register('category').onChange(e)
                handleCategorySelectChange(e)
              }}
            >
              <option value="">Select a category</option>
              {currentCategoryList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Other">Other (type your own)</option>
            </select>
          )}
          {errors.category && (
            <p className="add-transaction__error" role="alert">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="add-transaction__field">
          <label className="add-transaction__label" htmlFor="date">
            Date <span aria-hidden>*</span>
          </label>
          <input
            id="date"
            type="date"
            className="add-transaction__input"
            aria-invalid={errors.date ? 'true' : 'false'}
            {...register('date')}
          />
          {errors.date && (
            <p className="add-transaction__error" role="alert">
              {errors.date.message}
            </p>
          )}
        </div>

        <div className="add-transaction__field">
          <label className="add-transaction__label" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            className="add-transaction__input add-transaction__textarea"
            rows={4}
            placeholder="Optional details…"
            {...register('notes')}
          />
          {errors.notes && (
            <p className="add-transaction__error" role="alert">
              {errors.notes.message}
            </p>
          )}
        </div>

        <div className="add-transaction__field add-transaction__field--inline">
          <label className="add-transaction__checkbox-label">
            <input
              type="checkbox"
              className="add-transaction__checkbox"
              {...register('recurring')}
            />
            <span>Recurring transaction</span>
          </label>
        </div>

        <div className="add-transaction__actions">
          <button
            type="button"
            className="add-transaction__btn add-transaction__btn--secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="add-transaction__btn add-transaction__btn--primary"
            disabled={isSubmitting}
          >
            Save transaction
          </button>
        </div>
      </form>
    </div>
    </PageTransition>
  )
}
