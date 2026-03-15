import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import SettingsPage from '@/pages/SettingsPage'
import SessionPage from '@/pages/SessionPage'
import SplittingPage from '@/pages/SplittingPage'
import PaymentPage from '@/pages/PaymentPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/nastaveni" element={<SettingsPage />} />
          <Route path="/ucet/:id" element={<SessionPage />} />
          <Route path="/ucet/:id/rozdeleni" element={<SplittingPage />} />
          <Route path="/ucet/:id/platba/:participantId" element={<PaymentPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
