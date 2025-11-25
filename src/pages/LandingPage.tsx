import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowRight, 
  MusicNote, 
  Lock, 
  ChartLine, 
  Wallet,
  CloudArrowUp,
  CurrencyEth
} from '@phosphor-icons/react'

export function LandingPage() {
  const features = [
    {
      icon: <MusicNote size={32} weight="duotone" />,
      title: 'Own Your Masters',
      description: 'Keep 100% ownership of your music. No labels, no middlemen, just you and your art.',
    },
    {
      icon: <CurrencyEth size={32} weight="duotone" />,
      title: 'Perpetual Royalties',
      description: 'Get paid on every resale, forever. Smart contracts ensure you never miss a royalty payment.',
    },
    {
      icon: <CloudArrowUp size={32} weight="duotone" />,
      title: 'IPFS Storage',
      description: 'Your tracks are stored permanently on the decentralized web, immune to censorship.',
    },
    {
      icon: <Lock size={32} weight="duotone" />,
      title: 'Blockchain Verified',
      description: 'Provable ownership and authenticity through immutable blockchain records.',
    },
    {
      icon: <ChartLine size={32} weight="duotone" />,
      title: 'Analytics Dashboard',
      description: 'Track your sales, royalties, and audience engagement in real-time.',
    },
    {
      icon: <Wallet size={32} weight="duotone" />,
      title: 'Easy Payments',
      description: 'Accept crypto via MetaMask or traditional payments through Stripe.',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8 pointer-events-none" />
        
        <div className="relative">
          <header className="border-b border-border/50 bg-card/40 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="bg-primary rounded-lg p-2">
                    <MusicNote size={24} weight="fill" className="text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold">NFT Tracks</span>
                </Link>

                <div className="flex items-center gap-2">
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Dashboard</Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="ghost" size="sm">Pricing</Button>
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
            <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Dream it.{' '}
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                  Mint it.
                </span>{' '}
                Get paid on every resale.
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The first platform built for independent artists to mint their music as NFTs, 
                retain full ownership, and earn perpetual royalties on every single resale.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link to="/tracks/new" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base font-semibold px-8 h-12">
                    Launch Your First NFT Track
                    <ArrowRight size={20} weight="bold" />
                  </Button>
                </Link>
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base font-semibold px-8 h-12">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm pt-6">
                <div className="flex items-center gap-2">
                  <CheckBadge />
                  <span className="text-muted-foreground">No upfront costs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckBadge />
                  <span className="text-muted-foreground">Keep 100% ownership</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckBadge />
                  <span className="text-muted-foreground">Lifetime royalties</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Everything you need to succeed as an independent artist
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Built for musicians, by musicians. No blockchain knowledge required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/60 hover:border-accent/60 hover:bg-card/80 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="mb-3 text-accent">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 rounded-2xl p-8 sm:p-10 md:p-12 text-center space-y-4 md:space-y-6 border border-primary/20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Ready to take control of your music career?
          </h2>
          <p className="text-base sm:text-lg text-foreground/80 max-w-xl mx-auto">
            Join the independent artist revolution. Start minting today.
          </p>
          <Link to="/tracks/new">
            <Button size="lg" className="gap-2 text-base font-semibold px-8 h-12 mt-2">
              Create Your First NFT Track
              <ArrowRight size={20} weight="bold" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 NFT Tracks. Empowering independent artists.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Docs</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function CheckBadge() {
  return (
    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
      <div className="w-2.5 h-2.5 rounded-full bg-accent" />
    </div>
  )
}
