import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MdDashboard,
  MdReceiptLong,
  MdAddCircle,
  MdAccountBalanceWallet,
  MdAnalytics,
} from 'react-icons/md'
import { BsSun, BsMoon } from 'react-icons/bs'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: MdDashboard, end: false },
  { to: '/transactions', label: 'Transactions', shortLabel: 'Txns', icon: MdReceiptLong, end: true },
  { to: '/transactions/new', label: 'Add Transaction', shortLabel: 'Add', icon: MdAddCircle, end: false },
  { to: '/budget', label: 'Budget', shortLabel: 'Budget', icon: MdAccountBalanceWallet, end: false },
  { to: '/analytics', label: 'Analytics', shortLabel: 'Stats', icon: MdAnalytics, end: false },
]

function NavLinks({ className, linkClassName, showShortLabels }) {
  const location = useLocation()

  return (
    <>
      {navItems.map(({ to, label, shortLabel, icon: Icon, end }) => {
        const transactionsActive =
          to === '/transactions' &&
          (location.pathname === '/transactions' ||
            location.pathname.startsWith('/transactions/edit'))

        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => {
              const active =
                to === '/transactions' ? transactionsActive : isActive
              return [linkClassName, active ? 'nav-link--active' : '']
                .filter(Boolean)
                .join(' ')
            }}
          >
            <Icon className="nav-link__icon" aria-hidden />
            <span className={className}>
              {showShortLabels ? shortLabel : label}
            </span>
          </NavLink>
        )
      })}
    </>
  )
}

export default function AppLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Main navigation">
        <div className="app-sidebar__brand">
          <span className="app-sidebar__logo" aria-hidden>
            ◆
          </span>
          <span className="app-sidebar__title">Finance</span>
        </div>
        <nav className="app-sidebar__nav">
          <NavLinks
            className="app-sidebar__label"
            linkClassName="nav-link nav-link--sidebar"
          />
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={toggleTheme}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', borderRadius: '8px', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {theme === 'dark' ? <BsSun size={20} /> : <BsMoon size={20} />}
            <span style={{ fontWeight: 500 }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      <motion.main
        className="app-main"
        initial={{ opacity: 0.96 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Outlet />
      </motion.main>

      <nav className="app-bottom-nav" aria-label="Mobile navigation">
        <NavLinks
          className="app-bottom-nav__label"
          linkClassName="nav-link nav-link--bottom"
          showShortLabels
        />
        <button 
          onClick={toggleTheme}
          className="nav-link nav-link--bottom"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
        >
          {theme === 'dark' ? <BsSun className="nav-link__icon" /> : <BsMoon className="nav-link__icon" />}
        </button>
      </nav>
    </div>
  )
}
