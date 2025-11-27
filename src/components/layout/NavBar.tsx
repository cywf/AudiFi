import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MusicNote, User } from '@phosphor-icons/react'

export function NavBar() {
  return (
    <header className="border-b border-border/30 bg-card/40 backdrop-blur-md sticky top-0 z-50 shadow-sm shadow-border/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="bg-primary rounded-lg p-2">
              <MusicNote size={24} weight="fill" className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">NFT Tracks</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link to="/how-it-works">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex hover:bg-accent/10 hover:text-accent-foreground">
                How It Works
              </Button>
            </Link>
            <Link to="/why-nft-tracks">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex hover:bg-accent/10 hover:text-accent-foreground">
                Why NFT Tracks
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex hover:bg-accent/10 hover:text-accent-foreground">
                Dashboard
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="hover:bg-accent/10 hover:text-accent-foreground">
                Pricing
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="hover:bg-accent/10 hover:text-accent-foreground">
                <User size={18} weight="duotone" />
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
