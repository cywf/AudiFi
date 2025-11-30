import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  MusicNote, 
  CloudArrowUp, 
  Palette, 
  Coins,
  CheckCircle,
  ArrowRight,
  CurrencyEth,
  ChartLine,
  Users,
  LockKey
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { NavBar } from '@/components/layout/NavBar'

export function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: 'Upload Your Track',
      description: 'Upload your original music track and cover artwork. Add metadata like genre, BPM, mood tags, and description.',
      icon: <MusicNote size={40} weight="duotone" className="text-primary" />,
      details: ['Audio file (MP3, WAV, FLAC)', 'High-quality artwork', 'Track metadata', 'Genre & mood tags']
    },
    {
      number: 2,
      title: 'Configure Release Details',
      description: 'Set your reserve price, royalty percentage, and release date. Decide if you want to allow secondary marketplace resales.',
      icon: <Coins size={40} weight="duotone" className="text-secondary" />,
      details: ['Set reserve price', 'Choose royalty % (0-25%)', 'Schedule release date', 'Enable resale options']
    },
    {
      number: 3,
      title: 'Mint as NFT',
      description: 'Your track is minted as a one-of-one NFT and stored permanently on IPFS. The blockchain ensures provable ownership.',
      icon: <CloudArrowUp size={40} weight="duotone" className="text-accent" />,
      details: ['IPFS permanent storage', 'Blockchain verification', 'Unique token ID', 'Immutable ownership']
    },
    {
      number: 4,
      title: 'List & Earn',
      description: 'Your NFT track is listed for sale. When it sells, you get paid. Every future resale earns you royalties automatically.',
      icon: <ChartLine size={40} weight="duotone" className="text-warning" />,
      details: ['Initial sale proceeds', 'Perpetual royalties', 'Real-time analytics', 'Automated payments']
    }
  ]

  const benefits = [
    {
      icon: <LockKey size={28} weight="duotone" />,
      title: '100% Ownership',
      description: 'You retain full ownership of your music. No labels, no middlemen, just you and your art.'
    },
    {
      icon: <CurrencyEth size={28} weight="duotone" />,
      title: 'Perpetual Royalties',
      description: 'Smart contracts ensure you get paid on every resale, forever. Never miss a royalty payment.'
    },
    {
      icon: <Users size={28} weight="duotone" />,
      title: 'Direct to Fans',
      description: 'Connect directly with collectors and fans. Build relationships without intermediaries.'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 pointer-events-none" />
        
        <div className="relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="max-w-4xl mx-auto text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  How It Works
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                  From upload to earnings in four simple steps. Turn your music into a valuable NFT asset and earn royalties forever.
                </p>
              </motion.div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-16 sm:space-y-24 mb-24"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className={`grid md:grid-cols-2 gap-8 lg:gap-12 items-center ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}>
                    <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                      <Card className="bg-card/60 border-border/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                        <CardContent className="p-8 sm:p-10">
                          <div className="flex items-center justify-center mb-6">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
                              <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/40">
                                {step.icon}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-lg">
                          {step.number}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">{step.title}</h2>
                      </div>
                      
                      <p className="text-lg text-muted-foreground mb-6">
                        {step.description}
                      </p>

                      <ul className="space-y-3">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle size={20} weight="fill" className="text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-foreground/90">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden md:flex justify-center my-8">
                      <ArrowRight size={32} weight="bold" className="text-muted-foreground/40" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mb-24"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose AudiFi?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  The modern way for independent artists to monetize their music and build lasting value.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                  >
                    <Card className="bg-card/60 border-border/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full">
                      <CardContent className="p-6 sm:p-8">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 mb-5">
                          <div className="text-accent">
                            {benefit.icon}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {benefit.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="relative"
            >
              <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-border/60 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <CardContent className="relative p-8 sm:p-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Mint Your First Track?</h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join thousands of independent artists who are taking control of their music careers. Start earning royalties forever.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/tracks/new">
                      <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                        Create Your First NFT Track
                        <ArrowRight size={20} weight="bold" />
                      </Button>
                    </Link>
                    <Link to="/pricing">
                      <Button size="lg" variant="outline" className="border-border/60 hover:bg-accent/10 w-full sm:w-auto">
                        View Pricing
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
