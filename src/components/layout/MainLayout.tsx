import { Link, useLocation } from 'react-router-dom'
import { House, ChartBar, CreditCard, Gear, MusicNote } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: House },
    { label: 'Pricing', path: '/pricing', icon: CreditCard },
    { label: 'Settings', path: '/settings', icon: Gear },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-primary rounded-lg p-2">
                <MusicNote size={24} weight="fill" className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">NFT Tracks</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'gap-2',
                        isActive && 'bg-secondary/20 text-secondary'
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
                        isActive && 'bg-secondary/20 text-secondary'
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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-border mt-20 py-8">
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
