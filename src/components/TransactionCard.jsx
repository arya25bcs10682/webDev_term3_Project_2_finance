import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import {
  MdRestaurant,
  MdFlight,
  MdHome,
  MdShoppingBag,
  MdMovie,
  MdLocalHospital,
  MdBolt,
  MdSubscriptions,
  MdEdit,
  MdDelete,
} from 'react-icons/md'
import { TbRepeat } from 'react-icons/tb'

const CATEGORY_ICONS = {
  Food: MdRestaurant,
  Travel: MdFlight,
  Rent: MdHome,
  Shopping: MdShoppingBag,
  Entertainment: MdMovie,
  Health: MdLocalHospital,
  Utilities: MdBolt,
  Subscriptions: MdSubscriptions,
}

function CategoryIcon({ category }) {
  const Icon = CATEGORY_ICONS[category] ?? MdShoppingBag
  return <Icon className="transaction-card__cat-icon" aria-hidden />
}

export default function TransactionCard({ transaction, onDelete }) {
  const navigate = useNavigate()
  const { id, title, category, amount, type, date, recurring } = transaction

  const formattedDate = (() => {
    try {
      return format(parseISO(date), 'dd MMM yyyy')
    } catch {
      return date
    }
  })()

  const amountClass =
    type === 'income'
      ? 'transaction-card__amount transaction-card__amount--income'
      : 'transaction-card__amount transaction-card__amount--expense'

  const amountPrefix = type === 'income' ? '+' : '−'

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete “${title}”? This cannot be undone.`,
      )
    ) {
      onDelete(id)
    }
  }

  return (
    <article className="transaction-card">
      <div className="transaction-card__main">
        <div className="transaction-card__title-row">
          <h2 className="transaction-card__title">{title}</h2>
          <p className={amountClass}>
            <span className="transaction-card__amount-prefix" aria-hidden>
              {amountPrefix}
            </span>
            {typeof amount === 'number' ? amount.toFixed(2) : amount}
          </p>
        </div>
        <div className="transaction-card__meta">
          <span className="transaction-card__category">
            <CategoryIcon category={category} />
            <span>{category}</span>
          </span>
          <span className="transaction-card__date">{formattedDate}</span>
        </div>
        {recurring && (
          <span className="transaction-card__badge">
            <TbRepeat className="transaction-card__badge-icon" aria-hidden />
            Recurring
          </span>
        )}
      </div>
      <div className="transaction-card__actions">
        <button
          type="button"
          className="transaction-card__btn transaction-card__btn--edit"
          onClick={() => navigate(`/transactions/edit/${id}`)}
        >
          <MdEdit aria-hidden />
          Edit
        </button>
        <button
          type="button"
          className="transaction-card__btn transaction-card__btn--delete"
          onClick={handleDelete}
        >
          <MdDelete aria-hidden />
          Delete
        </button>
      </div>
    </article>
  )
}
