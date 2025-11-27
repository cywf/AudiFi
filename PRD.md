# NFT Tracks - Product Requirements Document

Empowering independent music artists to mint their tracks as one-of-one NFTs, retain ownership, and earn perpetual royalties on every resale.

**Experience Qualities**:
1. **Empowering** - Artists feel in control of their creative work and financial destiny, free from traditional label constraints
2. **Professional** - Interface conveys legitimacy and trustworthiness for handling valuable digital assets and real money
3. **Intuitive** - Complex blockchain concepts are abstracted into familiar music industry workflows

**Complexity Level**: Light Application (multiple features with basic state)
  - Multi-step track creation wizard with form validation, dashboard analytics, mocked blockchain integration, and simulated marketplace functionality

## Essential Features

### User Profile Management
- **Functionality**: Comprehensive artist profile page allowing artists to customize their identity with profile picture, bio, social media links (Instagram, Twitter/X, TikTok, YouTube), music platform profiles (Spotify, Apple Music, SoundCloud, Bandcamp), and security settings including two-factor authentication with Google Authenticator or similar apps
- **Purpose**: Give artists complete control over their public persona and account security, building credibility and trust with potential buyers while protecting valuable digital assets
- **Trigger**: Navigation link from navbar profile icon, settings page, or dashboard onboarding
- **Progression**: Upload profile picture → Enter artist name and bio → Link social media accounts → Connect music platforms → Set up 2FA → Save profile
- **Success criteria**: Profile data persists using useKV, image upload works with size validation, 2FA setup generates QR code and validates 6-digit codes, all social/platform links save correctly

### Account Creation & Signup
- **Functionality**: User-friendly signup flow collecting artist name, email, password with validation, terms acceptance, and automatic profile initialization
- **Purpose**: Streamline artist onboarding while ensuring security standards and legal compliance from the start
- **Trigger**: "Get Started" CTA on landing page, navbar signup link, or unauthenticated access attempt
- **Progression**: Enter artist details → Set secure password → Accept terms → Create account → Initialize profile → Redirect to dashboard
- **Success criteria**: Form validates all inputs, password strength enforced, profile created in persistence layer, smooth redirect to dashboard with welcome message

### Why NFT Tracks Page
- **Functionality**: Educational page explaining the problems independent artists face with traditional music monetization, the NFT Tracks solution with 10% perpetual royalties, and the shift to track-level ROI thinking
- **Purpose**: Help artists understand the fundamental value proposition of NFT minting versus traditional distribution, building conviction in the platform's fairness
- **Trigger**: Navigation link from main header, landing page exploration, or dashboard onboarding
- **Progression**: View artist challenges in traditional music → Understand NFT Tracks solution → Learn about 10% royalty smart contract mechanics → Grasp track-level ROI concept → CTA to mint first track
- **Success criteria**: Clear articulation of the problem space, concrete royalty calculation examples, comparison between old/new models, strong emotional resonance with artist pain points

### How It Works Page
- **Functionality**: Visual step-by-step guide showing the complete journey from upload to earnings, with animated illustrations and benefit highlights
- **Purpose**: Demystify the NFT minting process for artists unfamiliar with blockchain, building confidence and reducing onboarding friction
- **Trigger**: Navigation link from main header, landing page CTA, or dashboard onboarding prompt
- **Progression**: View hero introduction → See 4-step process with icons and details → Review benefits section → CTA to create first track or view pricing
- **Success criteria**: Clear visual communication of each step, benefits clearly articulated, smooth animations that guide attention, strong conversion CTAs

### Track Creation Wizard
- **Functionality**: Multi-step form collecting track details, artwork, release config, and economics (royalties/pricing)
- **Purpose**: Simplify the complex NFT minting process into digestible steps familiar to musicians releasing music
- **Trigger**: "Create New NFT Track" button from dashboard or landing page
- **Progression**: Select genre/BPM → Upload audio/artwork → Set release date/pricing → Review summary → Simulate mint → Success confirmation with token ID
- **Success criteria**: Artist can complete all steps, see preview of all data, receive simulated IPFS hash and token ID

### Artist Dashboard
- **Functionality**: Analytics overview showing tracks created, sales revenue, royalties earned, and track management table
- **Purpose**: Give artists visibility into their catalog performance and quick access to track management
- **Trigger**: Navigation link or post-login default view
- **Progression**: View summary stats → Browse track grid → Filter by status → Click track for details or create new
- **Success criteria**: Mock data displays correctly, navigation to track details works, create button accessible

### Track Detail Page
- **Functionality**: Complete track information display with artwork, metadata, ownership info, and purchase/listing actions
- **Purpose**: Serve as canonical page for a minted NFT track, viewable by artist and potential buyers
- **Trigger**: Click on track card from dashboard or direct URL navigation
- **Progression**: View track details → See ownership/pricing → Click buy/list action → Modal confirmation → Success state
- **Success criteria**: All track metadata renders, CTA buttons appropriate to user role, mock purchase flow completes

### Wallet Connection
- **Functionality**: Stub function simulating MetaMask connection, displaying mocked wallet address
- **Purpose**: Prepare UI flow for actual Web3 integration while allowing frontend testing
- **Trigger**: "Connect Wallet" button in settings
- **Progression**: Click connect → Simulated delay → Display mocked address → Persist in session
- **Success criteria**: Button shows loading state, address displays in truncated format (0x1234...ABCD)

### Subscription Management
- **Functionality**: Display free/pro tier comparison and simulate upgrade flow via Stripe placeholder
- **Purpose**: Enable monetization path and communicate value of pro features
- **Trigger**: Pricing page navigation or upgrade CTA in settings
- **Progression**: View tier comparison → Click upgrade → Simulate Stripe redirect → Show placeholder modal
- **Success criteria**: Pricing tiers clearly differentiated, CTAs trigger appropriate stub functions

## Edge Case Handling
- **Empty States**: Dashboard with no tracks shows encouraging empty state with "Create Your First Track" CTA
- **Form Validation**: Creation wizard validates required fields and shows inline errors before allowing progression
- **Network Simulation**: Mock API calls include artificial latency and loading states to mimic real async behavior
- **Incomplete Data**: Track details gracefully handle missing optional fields (BPM, mood tags, artwork)
- **Status Transitions**: Track status badges clearly communicate draft/minted/listed/sold states with appropriate colors

## Design Direction
The design should feel cutting-edge yet professional—a fusion of music production software (dark, focused, technical) and premium crypto platforms (modern, trustworthy, sleek). Favor a minimal interface with purposeful use of color to highlight key actions and data, letting the music artwork and track information take visual priority.

## Color Selection
Triadic color scheme - Using purple (creative/artistic), cyan (tech/blockchain), and amber (value/premium) to represent the intersection of music, technology, and commerce.

- **Primary Color**: Deep Purple (oklch(0.45 0.18 300)) - Represents creativity and artistry, used for primary CTAs and branding
- **Secondary Colors**: 
  - Dark Cyan (oklch(0.55 0.12 200)) - Technical/blockchain associations, used for data visualization and info states
  - Warm Amber (oklch(0.65 0.15 80)) - Highlights value/earnings, used for pricing and royalty displays
- **Accent Color**: Bright Cyan (oklch(0.75 0.15 200)) - Attention for active states, hover effects, and critical actions
- **Foreground/Background Pairings**:
  - Background (Dark Slate oklch(0.15 0.02 260)): Light text oklch(0.95 0.01 260) - Ratio 12.1:1 ✓
  - Card (Darker Slate oklch(0.20 0.02 260)): Light text oklch(0.95 0.01 260) - Ratio 9.8:1 ✓
  - Primary (Deep Purple oklch(0.45 0.18 300)): White text oklch(1 0 0) - Ratio 5.2:1 ✓
  - Secondary (Dark Cyan oklch(0.55 0.12 200)): White text oklch(1 0 0) - Ratio 6.8:1 ✓
  - Accent (Bright Cyan oklch(0.75 0.15 200)): Dark text oklch(0.15 0.02 260) - Ratio 9.2:1 ✓
  - Muted (Medium Gray oklch(0.35 0.01 260)): Light text oklch(0.95 0.01 260) - Ratio 6.4:1 ✓

## Font Selection
Typography should balance technical precision with creative expression—use Inter for its exceptional readability in data-heavy interfaces and its modern, neutral personality that won't compete with album artwork.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter Bold / 36px / -0.02em tracking / 1.1 line-height
  - H2 (Section Headers): Inter SemiBold / 24px / -0.01em tracking / 1.2 line-height
  - H3 (Card Titles): Inter SemiBold / 18px / normal tracking / 1.3 line-height
  - Body (Primary Text): Inter Regular / 14px / normal tracking / 1.5 line-height
  - Caption (Metadata): Inter Medium / 12px / 0.01em tracking / 1.4 line-height
  - Button Labels: Inter SemiBold / 14px / 0.005em tracking

## Animations
Animations should feel responsive and sophisticated, reinforcing the sense of a premium tool while never delaying user actions. Motion emphasizes state changes in the creation flow and provides satisfying feedback for financial actions.

- **Purposeful Meaning**: Use subtle scale and fade transitions to emphasize successful minting, sales, and wallet connections—moments of value creation deserve celebration
- **Hierarchy of Movement**:
  - Critical: Mint success animation, purchase confirmation (300-500ms with spring physics)
  - Important: Step transitions in wizard, card hovers, stat counter animations (200-300ms)
  - Supporting: Button states, input focus, dropdown reveals (100-200ms)

## Component Selection

- **Components**:
  - **Dialog**: For mint confirmation, purchase modals, and wallet connection flows
  - **Card**: Track cards, pricing tiers, stat displays, dashboard widgets
  - **Tabs**: For settings sections (profile/wallet/billing)
  - **Progress**: Step indicator in creation wizard, upload progress simulation
  - **Button**: Primary/secondary variants for CTAs, with loading states for async actions
  - **Input/Textarea**: Track details form with proper labels and validation states
  - **Select**: Genre selection, currency picker
  - **Slider**: Royalty percentage selector (0-25%)
  - **Badge**: Track status indicators (Draft/Minted/Listed/Sold)
  - **Separator**: Dividing dashboard sections
  - **Tooltip**: Explaining blockchain concepts and advanced options

- **Customizations**:
  - **TrackCard**: Custom component combining Card with artwork thumbnail, metadata, status badge, and action buttons
  - **StatCard**: Dashboard metric display with large number, label, and trend indicator
  - **StepIndicator**: Wizard navigation showing current/completed/upcoming steps
  - **WaveformPlaceholder**: Visual representation of audio file using colored bars
  - **WalletDisplay**: Truncated address with copy-to-clipboard functionality
  - **PricingTierCard**: Enhanced Card highlighting feature differences and CTAs

- **States**:
  - Buttons: Rest (solid primary), hover (slight scale + brightness increase), active (scale down slightly), disabled (muted with reduced opacity), loading (spinner replacing text)
  - Inputs: Default (subtle border), focus (accent border + ring), error (destructive border + message), success (secondary border + checkmark), disabled (muted background)
  - Cards: Default (dark background), hover (subtle border glow for interactive cards), selected (accent border)

- **Icon Selection**:
  - Music/Audio: MusicNote, Waveform, Play, Pause
  - Upload/Files: UploadSimple, File, Image, FolderOpen
  - Blockchain/Crypto: Wallet, CurrencyEth, Lock, CheckCircle
  - Actions: Plus, ArrowRight, X, PencilSimple, Eye
  - Navigation: House, ChartBar, Gear, CreditCard, User
  - Status: CheckCircle (minted), Tag (listed), ShoppingCart (sold), FileText (draft)

- **Spacing**: 
  - Container padding: p-6 (24px) on desktop, p-4 (16px) on mobile
  - Card gaps: gap-6 for dashboard grid, gap-4 within cards
  - Form fields: space-y-4 for field groups, mb-2 for labels
  - Section spacing: mt-12 between major sections, mt-8 for subsections

- **Mobile**:
  - Navigation: Collapse top nav to hamburger menu below 768px
  - Dashboard: Grid changes from 3 columns → 2 columns → 1 column at breakpoints
  - Creation Wizard: Full-screen modal approach on mobile with bottom navigation
  - Track Cards: Stack artwork above metadata on mobile, side-by-side on desktop
  - Pricing Tiers: Vertical stacking on mobile with sticky CTA footer
  - Tables: Convert to card layout with stacked rows on mobile
