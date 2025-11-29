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
  CurrencyEth,
  Storefront,
  VideoCamera,
  Coins,
  TrendUp,
  Users,
} from '@phosphor-icons/react'
import { NavBar } from '@/components/layout/NavBar'

export function LandingPage() {
  const features = [
    {
      icon: <MusicNote size={32} weight="duotone" />,
      title: 'Master IPO',
      description: 'Launch an IPO for your music master. Fans buy NFT shares and become stakeholders in your success.',
    },
    {
      icon: <VideoCamera size={32} weight="duotone" />,
      title: 'V Studio',
      description: 'Bring fans into your creative process with live production sessions where they vote on decisions.',
    },
    {
      icon: <TrendUp size={32} weight="duotone" />,
      title: 'Mover Advantage',
      description: 'Early supporters earn 10/5/3/1% on every resale. Reward believers, not just listeners.',
    },
    {
      icon: <Coins size={32} weight="duotone" />,
      title: 'Dividends',
      description: 'NFT holders receive automatic dividend payouts when your master generates revenue.',
    },
    {
      icon: <Users size={32} weight="duotone" />,
      title: 'Artist Coin',
      description: 'Create your own social token for fan engagement, gated content, and community rewards.',
    },
    {
      icon: <Wallet size={32} weight="duotone" />,
      title: 'Web3 Native',
      description: 'Connect your wallet, mint NFTs, and receive payments in crypto or fiat. Your choice.',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/8 pointer-events-none" />
        
        <div className="relative">
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
            <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Launch a{' '}
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                  Master IPO.
                </span>{' '}
                Own your music. Share the success.
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                AudiFi lets artists sell NFT shares of their music masters, bring fans into the creative process 
                with V Studio, and distribute dividends automatically through smart contracts.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link to="/master-ipo/create" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base font-semibold px-8 h-12">
                    Create Master IPO
                    <ArrowRight size={20} weight="bold" />
                  </Button>
                </Link>
                <Link to="/discover" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base font-semibold px-8 h-12">
                    Discover Masters
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm pt-6">
                <div className="flex items-center gap-2">
                  <CheckBadge />
                  <span className="text-muted-foreground">NFT Ownership</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckBadge />
                  <span className="text-muted-foreground">Automatic Dividends</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckBadge />
                  <span className="text-muted-foreground">Mover Advantage Royalties</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            The complete platform for music ownership
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Master IPOs, V Studio sessions, Artist Coins, and dividend contracts—all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/60 hover:border-accent/60 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
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

        <div className="text-center mt-10 md:mt-12">
          <Link to="/how-it-works">
            <Button variant="outline" size="lg" className="gap-2 border-border/60 hover:bg-accent/10 hover:border-accent/40">
              See How It Works
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 bg-gradient-to-b from-background to-card/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <Storefront size={36} weight="duotone" className="text-accent" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Discover Master IPOs
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse the marketplace to invest in music from independent artists. 
            Become a stakeholder, earn dividends, and benefit from Mover Advantage royalties.
          </p>
          <Link to="/marketplace/masters">
            <Button size="lg" variant="secondary" className="gap-2 text-base font-semibold px-8 h-12 mt-4">
              <Storefront size={20} weight="duotone" />
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 rounded-2xl p-8 sm:p-10 md:p-12 text-center space-y-4 md:space-y-6 border border-primary/20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Ready to take control of your music career?
          </h2>
          <p className="text-base sm:text-lg text-foreground/80 max-w-xl mx-auto">
            Join independent artists who are building real fan communities and earning what they deserve.
          </p>
          <Link to="/master-ipo/create">
            <Button size="lg" className="gap-2 text-base font-semibold px-8 h-12 mt-2">
              Create Your First Master IPO
              <ArrowRight size={20} weight="bold" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-12 mt-8 bg-card/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
            <p>© 2024 AudiFi. Empowering independent artists.</p>
            <div className="flex flex-wrap justify-center gap-8">
              <a href="#" className="hover:text-foreground transition-colors hover:underline underline-offset-4">Docs</a>
              <a href="#" className="hover:text-foreground transition-colors hover:underline underline-offset-4">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors hover:underline underline-offset-4">Privacy</a>
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
