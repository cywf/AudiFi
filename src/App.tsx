import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { LandingPage } from '@/pages/LandingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CreateTrackPage } from '@/pages/CreateTrackPage'
import { TrackDetailPage } from '@/pages/TrackDetailPage'
import { PricingPage } from '@/pages/PricingPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { HowItWorksPage } from '@/pages/HowItWorksPage'
import { WhyNFTTracksPage } from '@/pages/WhyNFTTracksPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SignupPage } from '@/pages/SignupPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/why-nft-tracks" element={<WhyNFTTracksPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tracks/new" element={<CreateTrackPage />} />
        <Route path="/tracks/:id" element={<TrackDetailPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App