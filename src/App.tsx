import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

// Landing & Marketing
import { LandingPage } from '@/pages/LandingPage'
import { HowItWorksPage } from '@/pages/HowItWorksPage'
import { WhyAudiFiPage } from '@/pages/WhyAudiFiPage'
import { PricingPage } from '@/pages/PricingPage'

// Auth
import { SignupPage } from '@/pages/SignupPage'

// Artist Dashboard
import { ArtistDashboardPage } from '@/pages/artist/ArtistDashboardPage'
import { ArtistMastersPage } from '@/pages/artist/ArtistMastersPage'
import { ArtistRevenueAnalyticsPage } from '@/pages/artist/ArtistRevenueAnalyticsPage'

// Master IPO
import { CreateMasterIPOPage } from '@/pages/master-ipo/CreateMasterIPOPage'
import { MasterIPODetailPage } from '@/pages/master-ipo/MasterIPODetailPage'
import { MasterIPOMarketplacePage } from '@/pages/master-ipo/MasterIPOMarketplacePage'

// V Studio
import { VStudioSessionSetupPage } from '@/pages/vstudio/VStudioSessionSetupPage'
import { VStudioLivePage } from '@/pages/vstudio/VStudioLivePage'
import { VStudioRecapPage } from '@/pages/vstudio/VStudioRecapPage'

// Fan Portal
import { FanPortalPage } from '@/pages/fan/FanPortalPage'
import { FanPortfolioPage } from '@/pages/fan/FanPortfolioPage'
import { FanDividendsPage } from '@/pages/fan/FanDividendsPage'

// Legacy routes (backwards compatibility)
import { DashboardPage } from '@/pages/DashboardPage'
import { CreateTrackPage } from '@/pages/CreateTrackPage'
import { TrackDetailPage } from '@/pages/TrackDetailPage'
import { MarketplacePage } from '@/pages/MarketplacePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing & Marketing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/why-audifi" element={<WhyAudiFiPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        
        {/* Auth */}
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Artist Dashboard */}
        <Route path="/artist" element={<ArtistDashboardPage />} />
        <Route path="/artist/masters" element={<ArtistMastersPage />} />
        <Route path="/artist/revenue" element={<ArtistRevenueAnalyticsPage />} />
        
        {/* Master IPO */}
        <Route path="/master-ipo/create" element={<CreateMasterIPOPage />} />
        <Route path="/master-ipo/:id" element={<MasterIPODetailPage />} />
        <Route path="/marketplace/masters" element={<MasterIPOMarketplacePage />} />
        
        {/* V Studio */}
        <Route path="/vstudio/setup" element={<VStudioSessionSetupPage />} />
        <Route path="/vstudio/session/:id" element={<VStudioLivePage />} />
        <Route path="/vstudio/recap/:id" element={<VStudioRecapPage />} />
        
        {/* Fan Portal */}
        <Route path="/discover" element={<FanPortalPage />} />
        <Route path="/portfolio" element={<FanPortfolioPage />} />
        <Route path="/dividends" element={<FanDividendsPage />} />
        
        {/* Legacy routes - backwards compatibility */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tracks/new" element={<CreateTrackPage />} />
        <Route path="/tracks/:id" element={<TrackDetailPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Legacy redirect */}
        <Route path="/why-nft-tracks" element={<Navigate to="/why-audifi" replace />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App