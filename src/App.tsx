import { Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Resources } from './pages/Resources'
import { Marketplace } from './pages/Marketplace'
import { Accommodation } from './pages/Accommodation'
import { LostAndFound } from './pages/LostAndFound'
import { EventCalendar } from './pages/EventCalendar'
import { StudyGroupFinder } from './pages/StudyGroupFinder'
import { MedicalHelp } from './pages/MedicalHelp'
import { About } from './pages/About'
import { Admin } from './pages/Admin'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { Cart } from './components/Cart'
import { Layout } from './components/Layout'
import { AuthPage } from './pages/Auth'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Checkout } from './pages/Checkout'
import { PaymentSuccess } from './pages/PaymentSuccess'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/accommodation" element={<Accommodation />} />
          <Route path="/lost-found" element={<LostAndFound />} />
          <Route path="/events" element={<EventCalendar />} />
          <Route path="/study-groups" element={<StudyGroupFinder />} />
          <Route path="/medical-help" element={<MedicalHelp />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </div>
  )
}

