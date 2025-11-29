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
  Infinity as InfinityIcon,
  TreeStructure
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { NavBar } from '@/components/layout/NavBar'

export function WhyNFTTracksPage() {
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
      title: 'Keep Your Fair Share',
      description: 'Artists set their own prices and keep 90% of every primary sale. No middlemen taking unfair cuts of your hard work.',
    },
    {
      icon: <InfinityIcon size={32} weight="duotone" className="text-accent" />,
      title: '10% Perpetual Royalties',
      description: 'Every time your NFT track resells, you automatically receive 10% of the sale price. Forever. No exceptions. Encoded in the smart contract.',
    },
    {
      icon: <TrendUp size={32} weight="duotone" className="text-accent" />,
      title: 'Growing Asset Value',
      description: 'As your career grows, so does the value of your early tracks. Collectors profit, but so do you—on every single resale.',
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
                  NFT Tracks
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The music industry is broken. Artists create all the value but see the smallest share. 
                NFT Tracks fixes this with blockchain-enforced fairness—putting power back in artists' hands.
              </p>
            </motion.div>

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

              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/40 backdrop-blur-sm">
                  <CardContent className="p-8 sm:p-10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/20 shrink-0">
                        <ChartLineUp size={40} weight="duotone" className="text-destructive" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">The Numbers Don't Lie</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          An artist needs <span className="text-foreground font-semibold">over 1 million streams</span> to earn what they could make from selling just <span className="text-foreground font-semibold">20-30 NFT tracks</span>. 
                          And with NFTs, every future resale keeps paying you—streams stop the moment the song ends.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-24"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">The NFT Tracks Solution</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Smart contracts enforce fairness automatically. No lawyers, no negotiations, no tricks.
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

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
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
                    How the 10% Royalty Works
                  </h2>
                  
                  <div className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p>
                      Every NFT track you create includes a <span className="text-accent font-semibold">smart contract</span> with a <span className="text-accent font-semibold">10% royalty fee</span> embedded directly in the code. 
                      This isn't a policy or a promise—it's mathematically enforced by the blockchain.
                    </p>
                    
                    <div className="bg-background/60 rounded-xl p-6 border border-accent/20">
                      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Coins size={24} className="text-accent" />
                        Here's What Happens:
                      </h3>
                      <ol className="space-y-3 text-base">
                        <li className="flex gap-3">
                          <span className="text-accent font-semibold shrink-0">1.</span>
                          <span>You mint your track for free and set an initial price (e.g., $100)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-accent font-semibold shrink-0">2.</span>
                          <span>A collector buys it—you receive $90 instantly (10% platform fee on primary sale)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-accent font-semibold shrink-0">3.</span>
                          <span>That collector later resells it for $500—you automatically receive $50 (10% royalty)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-accent font-semibold shrink-0">4.</span>
                          <span>The new owner resells it for $2,000—you receive $200 (10% royalty)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-accent font-semibold shrink-0">5.</span>
                          <span className="text-accent font-semibold">This continues forever, on every resale, automatically</span>
                        </li>
                      </ol>
                    </div>

                    <p>
                      In this example, that one track has already earned you <span className="text-accent font-semibold">$340</span> total—and it will keep earning as long as people value your work. 
                      Compare that to streaming, where those same listeners might have earned you <span className="text-foreground font-semibold">$0.15 total</span>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

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
                      <ChartLineUp size={44} weight="duotone" className="text-primary" />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
                    Track-Level ROI Changes Everything
                  </h2>
                  
                  <div className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <p>
                      In traditional music, artists think about ROI across their entire catalog. A hit single subsidizes the rest of the album. 
                      <span className="text-foreground font-semibold"> With NFT Tracks, each song is its own investment.</span>
                    </p>

                    <div className="grid sm:grid-cols-2 gap-6 my-8">
                      <div className="bg-background/60 rounded-xl p-6 border border-destructive/30">
                        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                          <MusicNote size={20} className="text-destructive" />
                          Old Model: Album ROI
                        </h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-destructive mt-1">✕</span>
                            <span>Need multiple tracks to justify costs</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-destructive mt-1">✕</span>
                            <span>Value diluted across weak tracks</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-destructive mt-1">✕</span>
                            <span>Hits subsidize everything else</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-destructive mt-1">✕</span>
                            <span>Revenue stops after initial sales period</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-background/60 rounded-xl p-6 border border-accent/30">
                        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                          <MusicNote size={20} className="text-accent" />
                          New Model: Track ROI
                        </h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-accent mt-1">✓</span>
                            <span>Each track stands on its own merit</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-accent mt-1">✓</span>
                            <span>Quality over quantity strategy</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-accent mt-1">✓</span>
                            <span>Every track can be a revenue asset</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-accent mt-1">✓</span>
                            <span>Perpetual income from resales</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <p>
                      This means you can release <span className="text-foreground font-semibold">one amazing track</span> and focus all your marketing energy on making it valuable. 
                      You don't need to fill out an album with filler. Every song you create can be a <span className="text-accent font-semibold">long-term income asset</span>.
                    </p>

                    <div className="bg-primary/10 rounded-xl p-6 border border-primary/30 mt-8">
                      <p className="text-foreground font-semibold text-xl text-center">
                        "Your best track from 2024 could still be paying you in 2034."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 border-primary/30 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <CardContent className="relative p-8 sm:p-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Ready to Build Your Music Legacy?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join independent artists who are taking control of their careers and building real, lasting wealth from their music.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/tracks/new">
                      <Button size="lg" className="gap-2 w-full sm:w-auto text-base font-semibold px-8 h-12">
                        Mint Your First Track
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
            <p>© 2024 NFT Tracks. Empowering independent artists.</p>
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
