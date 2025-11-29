# Frontend Architecture

> React/TypeScript Frontend for the AudiFi Platform

## Overview

The AudiFi frontend is a single-page application (SPA) built with React and TypeScript. It currently operates with mock APIs and is designed for seamless integration with future backend services.

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React | 19 |
| **Language** | TypeScript | 5.x |
| **Routing** | React Router | 7.x |
| **Styling** | Tailwind CSS | 4.x |
| **Components** | shadcn/ui | 4.x |
| **Icons** | Phosphor Icons | - |
| **Notifications** | Sonner | - |
| **Build Tool** | Vite | - |

---

## Project Structure

```
src/
├── api/                        # Mock API layer
│   ├── user.ts                # User data operations
│   ├── tracks.ts              # Track CRUD operations
│   ├── subscription.ts        # Subscription/pricing data
│   └── marketplace.ts         # Marketplace listings and purchases
│
├── components/                 # React components
│   ├── layout/                # Layout components
│   │   ├── MainLayout.tsx     # Main app layout with navigation
│   │   └── NavBar.tsx         # Landing page navigation
│   ├── dashboard/             # Dashboard-specific components
│   │   └── StatCard.tsx       # Stats display with variants
│   ├── tracks/                # Track-related components
│   │   ├── TrackCard.tsx      # Track display card
│   │   ├── MarketplaceTrackCard.tsx
│   │   ├── MarketplaceFilters.tsx
│   │   └── PurchaseModal.tsx
│   ├── pricing/               # Pricing components
│   │   └── PricingTierCard.tsx
│   ├── wizard/                # Wizard/form components
│   │   └── StepIndicator.tsx
│   ├── profile/               # Profile components
│   │   ├── SocialMediaLinks.tsx
│   │   ├── MusicPlatformLinks.tsx
│   │   └── TwoFactorSetup.tsx
│   └── ui/                    # shadcn/ui components
│       └── [various]
│
├── constants/                  # App constants
│   └── index.ts               # Genres, moods, config
│
├── lib/                       # Utilities and stubs
│   ├── wallet.ts              # Wallet connection stub
│   ├── payments.ts            # Payment stub
│   └── utils.ts               # Utility functions
│
├── pages/                     # Route pages
│   ├── LandingPage.tsx        # Home page
│   ├── DashboardPage.tsx      # Artist dashboard
│   ├── CreateTrackPage.tsx    # Track creation wizard
│   ├── TrackDetailPage.tsx    # Individual track view
│   ├── MarketplacePage.tsx    # NFT marketplace
│   ├── PricingPage.tsx        # Subscription tiers
│   ├── SettingsPage.tsx       # Account settings
│   ├── ProfilePage.tsx        # Artist profile
│   ├── SignupPage.tsx         # Account creation
│   ├── HowItWorksPage.tsx     # Educational content
│   └── WhyNFTTracksPage.tsx   # Value proposition
│
├── types/                     # TypeScript types
│   └── index.ts               # Core type definitions
│
├── App.tsx                    # Root app with routing
├── index.css                  # CSS variables
├── main.css                   # Tailwind imports
└── main.tsx                   # App entry point
```

---

## Routing Model

### Route Structure

```
ROUTES
══════

PUBLIC ROUTES
├── /                          # Landing page
├── /signup                    # Account creation
├── /how-it-works             # Educational page
├── /why-nft-tracks           # Value proposition
├── /pricing                   # Subscription tiers
└── /marketplace              # Browse marketplace

AUTHENTICATED ROUTES (simulated)
├── /dashboard                 # Artist dashboard
├── /tracks/new               # Create track wizard
├── /tracks/:id               # Track detail
├── /profile                   # Profile management
└── /settings                  # Account settings
```

### Router Configuration

```tsx
// App.tsx - Simplified routing structure
<BrowserRouter>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
    <Route path="/tracks/new" element={<MainLayout><CreateTrackPage /></MainLayout>} />
    <Route path="/tracks/:id" element={<MainLayout><TrackDetailPage /></MainLayout>} />
    <Route path="/marketplace" element={<MainLayout><MarketplacePage /></MainLayout>} />
    {/* ... additional routes */}
  </Routes>
</BrowserRouter>
```

---

## Component Patterns

### Layout Components

**MainLayout** wraps authenticated pages:

```tsx
// components/layout/MainLayout.tsx
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header>{/* Navigation */}</header>
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer>{/* Footer */}</footer>
    </div>
  )
}
```

### Page Components

Pages follow a consistent pattern:

```tsx
// pages/DashboardPage.tsx
export function DashboardPage() {
  const [data, setData] = useState<DataType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />
  if (!data) return <ErrorState />

  return (
    <div className="space-y-8">
      <PageHeader />
      <MainContent data={data} />
    </div>
  )
}
```

### Shared Components

Components are built with shadcn/ui and extended:

| Component | Purpose |
|-----------|---------|
| `StatCard` | Dashboard metrics with variants |
| `TrackCard` | Track display in grids |
| `StepIndicator` | Wizard progress |
| `PricingTierCard` | Subscription comparison |

---

## State Management

### Current Approach (Mock)

```
STATE MANAGEMENT (CURRENT)
══════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Component State (useState)                                        │
│   ├── Page-level loading/error states                              │
│   ├── Form inputs                                                   │
│   └── UI toggles                                                    │
│                                                                     │
│   Local Storage (via mock APIs)                                     │
│   ├── User data                                                     │
│   ├── Track data                                                    │
│   └── Marketplace data                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Future Approach (Production)

```
STATE MANAGEMENT (PLANNED)
══════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Server State (React Query / SWR)                                  │
│   ├── API data fetching                                            │
│   ├── Cache management                                              │
│   └── Optimistic updates                                            │
│                                                                     │
│   Global State (Zustand or Redux)                                   │
│   ├── Auth state                                                    │
│   ├── Wallet connection                                             │
│   └── Real-time subscriptions                                       │
│                                                                     │
│   Local State (useState)                                            │
│   ├── Form inputs                                                   │
│   └── UI toggles                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## API Integration

### Current Mock APIs

```tsx
// api/tracks.ts - Mock API example
export async function getTracksForCurrentUser(): Promise<Track[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks()
      resolve(tracks.filter(t => t.artistId === 'user_001'))
    }, 400)  // Simulated latency
  })
}
```

### Future Real APIs

```tsx
// api/tracks.ts - Production API (future)
export async function getTracksForCurrentUser(): Promise<Track[]> {
  const response = await fetch('/api/v1/tracks', {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  })
  if (!response.ok) throw new ApiError(response)
  return response.json()
}
```

---

## Styling System

### CSS Architecture

```
STYLING LAYERS
══════════════

1. index.css
   └── CSS custom properties (colors, radii)
   └── Base typography

2. main.css
   └── Tailwind directives (@tailwind base, components, utilities)
   └── Theme variable mapping
   └── Custom animations

3. tailwind.config.js
   └── Theme extensions
   └── Plugin configuration

4. Component files
   └── Tailwind utility classes
   └── cn() for conditional classes
```

### Design Tokens

```css
/* index.css - Core tokens */
:root {
  --background: oklch(0.14 0.015 260);
  --foreground: oklch(0.98 0.005 260);
  --primary: oklch(0.48 0.20 295);
  --secondary: oklch(0.58 0.14 210);
  --accent: oklch(0.72 0.17 195);
  --warning: oklch(0.68 0.16 85);
  /* ... */
}
```

### Component Styling

```tsx
// Using cn() for conditional classes
import { cn } from '@/lib/utils'

<Button
  className={cn(
    'base-classes',
    isActive && 'active-classes',
    variant === 'secondary' && 'secondary-classes'
  )}
>
```

---

## Form Handling

### Track Creation Wizard

The wizard uses multi-step form state:

```tsx
// pages/CreateTrackPage.tsx (simplified)
function CreateTrackPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CreateTrackPayload>({
    title: '',
    description: '',
    genre: '',
    // ...
  })

  const updateField = (field: keyof CreateTrackPayload, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <StepIndicator currentStep={step} />
      {step === 1 && <TrackDetailsStep data={formData} onUpdate={updateField} />}
      {step === 2 && <ArtworkStep data={formData} onUpdate={updateField} />}
      {step === 3 && <EconomicsStep data={formData} onUpdate={updateField} />}
      {step === 4 && <ReviewStep data={formData} onSubmit={handleSubmit} />}
    </>
  )
}
```

---

## Real-Time Features (Planned)

### V Studio WebSocket Integration

```tsx
// hooks/useVStudioSession.ts (future)
function useVStudioSession(sessionId: string) {
  const [session, setSession] = useState<VStudioSession | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(`wss://api.audifi.io/vstudio/${sessionId}`)
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      setSession(prev => mergeUpdate(prev, update))
    }

    wsRef.current = ws
    return () => ws.close()
  }, [sessionId])

  const vote = (decisionId: string, choice: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'vote', decisionId, choice }))
  }

  return { session, vote }
}
```

---

## Build and Development

### Development Server

```bash
npm run dev
# Starts Vite dev server at http://localhost:5173
```

### Production Build

```bash
npm run build
# Outputs to dist/ directory
```

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [font files]
└── [static assets]
```

---

## Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Root component with routing |
| `main.tsx` | Entry point, theme setup |
| `index.css` | CSS custom properties |
| `main.css` | Tailwind configuration |
| `types/index.ts` | TypeScript interfaces |
| `constants/index.ts` | App configuration |

---

## Future Enhancements

| Enhancement | Priority | Status |
|-------------|----------|--------|
| React Query integration | High | 🔄 PLANNED |
| Wallet connection (wagmi) | High | 🔄 PLANNED |
| Server-side rendering | Medium | 💡 EXPERIMENTAL |
| PWA support | Low | 💡 EXPERIMENTAL |
| i18n | Medium | 🔄 PLANNED |

---

## Related Documents

- [Architecture Overview](./overview.md)
- [Backend Architecture](./backend.md)
- [Operations: Onboarding](../operations/onboarding-a-new-engineer.md)
- [Style Guide](../documentation/audifi-style-guide.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
