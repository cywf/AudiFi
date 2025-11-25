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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        
        <div className="relative">
          <header className="border-b border-border bg-card/30 backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary rounded-lg p-2">
                    <MusicNote size={24} weight="fill" className="text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold">NFT Tracks</span>
                </div>

                <div className="flex items-center gap-4">
                  <Link to="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="ghost">Pricing</Button>
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Dream it.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Mint it.
                </span>{' '}
                Get paid on every resale.
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The first platform built for independent artists to mint their music as NFTs, 
                retain full ownership, and earn perpetual royalties on every single resale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link to="/tracks/new">
                  <Button size="lg" className="gap-2 text-lg px-8">
                    Launch Your First NFT Track
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground pt-8">
                <div className="flex items-center gap-2">
                  <CheckBadge />
                  <span>No upfront costs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckBadge />
                  <span>Keep 100% ownership</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckBadge />
                  <span>Lifetime royalties</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to succeed as an independent artist
          </h2>
          <p className="text-muted-foreground text-lg">
            Built for musicians, by musicians. No blockchain knowledge required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="mb-4 text-accent">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-12 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to take control of your music career?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join the independent artist revolution. Start minting today.
          </p>
          <Link to="/tracks/new">
            <Button size="lg" className="gap-2 text-lg px-8">
              Create Your First NFT Track
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
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
    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-accent" />
    </div>
  )
}
