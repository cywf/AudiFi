import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CreateTrackPage } from '@/pages/CreateTrackPage'
import { TrackDetailPage } from '@/pages/TrackDetailPage'
import { PricingPage } from '@/pages/PricingPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { HowItWorksPage } from '@/pages/HowItWorksPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tracks/new" element={<CreateTrackPage />} />
        <Route path="/tracks/:id" element={<TrackDetailPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App