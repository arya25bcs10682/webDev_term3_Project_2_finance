import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import { FinanceProvider } from './context/FinanceContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import AppLayout from './components/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import AddTransaction from './pages/AddTransaction.jsx'
import EditTransaction from './pages/EditTransaction.jsx'
import Budget from './pages/Budget.jsx'
import Analytics from './pages/Analytics.jsx'

// Separate component so useLocation works inside BrowserRouter
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/new" element={<AddTransaction />} />
          <Route path="/transactions/edit/:id" element={<EditTransaction />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <FinanceProvider>
        <BrowserRouter>
          <AnimatedRoutes />
          <ToastContainer position="top-right" theme="colored" />
        </BrowserRouter>
      </FinanceProvider>
    </ThemeProvider>
  </StrictMode>,
)
