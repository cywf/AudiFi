import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MusicNote,
  TrendUp,
  CurrencyCircleDollar,
  Percent,
  Scales,
  ChartLineUp,
  Coins,
  ArrowRight,
  HandCoins,
  Infinity,
  TreeStructure,
  VideoCamera,
  Users,
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { NavBar } from '@/components/layout/NavBar'

export function WhyAudiFiPage() {
  const challenges = [
    {
      icon: <Percent size={32} weight="duotone" className="text-destructive" />,
      title: 'Unfair Revenue Splits',
      description: 'Traditional streaming pays artists only $0.003-$0.005 per stream. Labels and distributors take 70-90% of revenue, leaving artists with pennies.',
    },
    {
      icon: <Scales size={32} weight="duotone" className="text-destructive" />,
      title: 'No Secondary Market Rights',
      description: 'When physical albums or merchandise resell, artists see nothing. The value created by their work enriches everyone except them.',
    },
    {
      icon: <HandCoins size={32} weight="duotone" className="text-destructive" />,
      title: 'Delayed Payments',
      description: "Artists wait months for royalty statements. Complex accounting makes it nearly impossible to verify what they're actually owed.",
    },
  ]

  const solution = [
    {
      icon: <CurrencyCircleDollar size={32} weight="duotone" className="text-accent" />,
      title: 'Master IPO',
      description: 'Launch an IPO for your music master. Sell NFT shares to fans who become stakeholders in your success, receiving dividends from streaming and sales.',
    },
    {
      icon: <Infinity size={32} weight="duotone" className="text-accent" />,
      title: 'Mover Advantage',
      description: 'Early supporters earn more. First minter gets 10%, second gets 5%, third gets 3%, 4th+ gets 1% on every resale. Forever.',
    },
    {
      icon: <TrendUp size={32} weight="duotone" className="text-accent" />,
      title: 'Artist Coin & Dividends',
      description: 'Create your own Artist Coin for fan engagement. NFT holders receive automatic dividend payouts when your music generates revenue.',
    },
  ]

  const vstudioFeatures = [
    {
      icon: <VideoCamera size={24} weight="duotone" />,
      title: 'Live Production Sessions',
      description: 'Stream your creative process and let fans participate in real-time decision making.',
    },
    {
      icon: <Users size={24} weight="duotone" />,
      title: 'Fan Voting',
      description: 'Let your community vote on production choices—synths, drums, arrangements—shaping the final master.',
    },
    {
      icon: <MusicNote size={24} weight="duotone" />,
      title: 'Final Master Lock',
      description: 'When the session ends, lock in the final master and launch your IPO directly to participants.',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-accent/15 pointer-events-none" />
        
        <div className="relative">
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-20"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Why Independent Artists Need{' '}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  AudiFi
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The music industry is broken. Artists create all the value but see the smallest share. 
                AudiFi fixes this with Master IPOs, V Studio, and blockchain-enforced fairness.
              </p>
            </motion.div>

            {/* Problem Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-24"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Problem with Traditional Music</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Independent artists face systemic barriers to earning fair compensation for their work.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
                {challenges.map((challenge) => (
                  <motion.div key={challenge.title} variants={itemVariants}>
                    <Card className="bg-card/60 border-destructive/30 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 h-full">
                      <CardHeader>
                        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-destructive/15 mb-4">
                          {challenge.icon}
                        </div>
                        <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {challenge.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Solution Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-24"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">The AudiFi Solution</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Smart contracts enforce fairness automatically. Master IPOs give fans ownership. V Studio brings them into the creative process.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {solution.map((item) => (
                  <motion.div key={item.title} variants={itemVariants}>
                    <Card className="bg-card/60 border-accent/30 backdrop-blur-sm hover:bg-card/80 hover:border-accent/50 transition-all duration-300 h-full">
                      <CardHeader>
                        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-accent/15 mb-4">
                          {item.icon}
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* V Studio Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-24"
            >
              <Card className="bg-gradient-to-br from-secondary/10 via-primary/5 to-accent/10 border-secondary/40 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-8 sm:p-12">
                  <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary/20">
                      <VideoCamera size={44} weight="duotone" className="text-secondary" />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
                    V Studio: Fan-Powered Creation
                  </h2>
                  
                  <div className="max-w-3xl mx-auto">
                    <p className="text-lg text-muted-foreground text-center mb-8">
                      Turn your production process into a collaborative experience. 
                      Fans don't just listen—they help create the music they'll own.
                    </p>
                    
                    <div className="grid sm:grid-cols-3 gap-6">
                      {vstudioFeatures.map((feature) => (
                        <div key={feature.title} className="text-center p-4 bg-background/40 rounded-xl">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/20 mx-auto mb-3">
                            {feature.icon}
                          </div>
                          <h3 className="font-semibold mb-2">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mover Advantage Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-24"
            >
              <Card className="bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 border-accent/40 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-8 sm:p-12">
                  <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/20">
                      <TreeStructure size={44} weight="duotone" className="text-accent" />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
                    Mover Advantage: Reward Early Believers
                  </h2>
                  
                  <div className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p className="text-center">
                      Early supporters take risks on artists before they blow up. 
                      <span className="text-accent font-semibold"> Mover Advantage rewards that faith.</span>
                    </p>
                    
                    <div className="grid grid-cols-4 gap-4 text-center my-8">
                      <div className="p-4 bg-accent/10 rounded-xl">
                        <p className="text-3xl font-bold text-accent">10%</p>
                        <p className="text-sm">1st Minter</p>
                      </div>
                      <div className="p-4 bg-secondary/10 rounded-xl">
                        <p className="text-3xl font-bold text-secondary">5%</p>
                        <p className="text-sm">2nd Minter</p>
                      </div>
                      <div className="p-4 bg-primary/10 rounded-xl">
                        <p className="text-3xl font-bold text-primary">3%</p>
                        <p className="text-sm">3rd Minter</p>
                      </div>
                      <div className="p-4 bg-muted rounded-xl">
                        <p className="text-3xl font-bold">1%</p>
                        <p className="text-sm">4th+ Minters</p>
                      </div>
                    </div>

                    <p className="text-center">
                      When any NFT resells, <span className="font-semibold text-foreground">81% goes to the seller</span> and 
                      the remaining <span className="text-accent font-semibold">19% is distributed to early minters</span> based on their position.
                      Forever.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dividend Contract Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-24"
            >
              <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5 border-primary/40 backdrop-blur-sm">
                <CardContent className="p-8 sm:p-12">
                  <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20">
                      <Coins size={44} weight="duotone" className="text-primary" />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
                    Dividends: Share Your Success
                  </h2>
                  
                  <div className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p className="text-center">
                      When you launch a Master IPO, you set the percentage of revenue that goes to NFT holders.
                      <span className="text-primary font-semibold"> Every time your master earns money, holders earn too.</span>
                    </p>

                    <div className="bg-background/60 rounded-xl p-6 border border-primary/20">
                      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <ChartLineUp size={24} className="text-primary" />
                        How It Works:
                      </h3>
                      <ol className="space-y-3 text-base">
                        <li className="flex gap-3">
                          <span className="text-primary font-semibold shrink-0">1.</span>
                          <span>You set NFT holder revenue share (e.g., 40%)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-primary font-semibold shrink-0">2.</span>
                          <span>Your master earns from streaming, sync licensing, etc.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-primary font-semibold shrink-0">3.</span>
                          <span>40% of that revenue goes to the Dividend Contract</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-primary font-semibold shrink-0">4.</span>
                          <span>NFT holders claim their proportional share automatically</span>
                        </li>
                      </ol>
                    </div>

                    <p className="text-center">
                      Fans aren't just supporters—they're <span className="text-primary font-semibold">stakeholders</span> in your music.
                      Their success is tied to yours.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 border-primary/30 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <CardContent className="relative p-8 sm:p-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Ready to Build Your Music Empire?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join independent artists who are taking control of their careers, building real fan communities, and earning what they deserve.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/master-ipo/create">
                      <Button size="lg" className="gap-2 w-full sm:w-auto text-base font-semibold px-8 h-12">
                        Create Master IPO
                        <ArrowRight size={20} weight="bold" />
                      </Button>
                    </Link>
                    <Link to="/how-it-works">
                      <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base font-semibold px-8 h-12">
                        See How It Works
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>
      </div>

      <footer className="border-t border-border/60 py-12 bg-card/20">
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
