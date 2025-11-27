import { Link, useLocation } from 'react-router-dom'
import { House, ChartBar, CreditCard, Gear, MusicNote, Article } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: House },
    { label: 'How It Works', path: '/how-it-works', icon: Article },
    { label: 'Why NFT Tracks', path: '/why-nft-tracks', icon: ChartBar },
    { label: 'Pricing', path: '/pricing', icon: CreditCard },
    { label: 'Settings', path: '/settings', icon: Gear },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/30 bg-card/40 backdrop-blur-md sticky top-0 z-50 shadow-sm shadow-border/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <div className="bg-primary rounded-lg p-2">
                <MusicNote size={24} weight="fill" className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">NFT Tracks</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'gap-2 px-4',
                        isActive 
                          ? 'bg-secondary/15 text-secondary-foreground font-semibold' 
                          : 'hover:bg-accent/10 hover:text-accent-foreground'
                      )}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            <div className="flex md:hidden items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="icon"
                      className={cn(
                        'h-9 w-9',
                        isActive 
                          ? 'bg-secondary/15 text-secondary-foreground' 
                          : 'hover:bg-accent/10 hover:text-accent-foreground'
                      )}
                    >
                      <Icon size={20} />
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-border/60 py-12 mt-auto bg-card/20">
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
