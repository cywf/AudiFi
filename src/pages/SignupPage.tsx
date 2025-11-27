import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { MusicNote, EnvelopeSimple, Lock, User, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import type { UserProfile } from '@/types'

export function SignupPage() {
  const navigate = useNavigate()
  const [, setUserProfile] = useKV<UserProfile>('user-profile', {
    displayName: '',
    bio: '',
    avatarUrl: '',
    socialMedia: { instagram: '', twitter: '', tiktok: '', youtube: '' },
    musicPlatforms: { spotify: '', appleMusic: '', soundcloud: '', bandcamp: '' },
    twoFactorEnabled: false
  })

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const validateForm = (): string | null => {
    if (!formData.displayName.trim()) return 'Artist name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email address'
    if (formData.password.length < 8) return 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match'
    if (!acceptTerms) return 'You must accept the terms and conditions'
    return null
  }

  const handleCreateAccount = async () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }

    setIsCreating(true)

    setTimeout(() => {
      setUserProfile({
        displayName: formData.displayName,
        bio: '',
        avatarUrl: '',
        socialMedia: { instagram: '', twitter: '', tiktok: '', youtube: '' },
        musicPlatforms: { spotify: '', appleMusic: '', soundcloud: '', bandcamp: '' },
        twoFactorEnabled: false
      })

      toast.success('Account created successfully!')
      setIsCreating(false)
      navigate('/dashboard')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity mb-4">
            <div className="bg-primary rounded-lg p-3">
              <MusicNote size={32} weight="fill" className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">NFT Tracks</span>
          </Link>
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground">
            Start minting your music as NFTs and earn perpetual royalties
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Join thousands of independent artists taking control of their music
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name" className="flex items-center gap-2">
                  <User size={16} weight="duotone" />
                  Artist Name *
                </Label>
                <Input
                  id="display-name"
                  placeholder="Your stage name or band name"
                  value={formData.displayName}
                  onChange={handleInputChange('displayName')}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <EnvelopeSimple size={16} weight="duotone" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="artist@example.com"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock size={16} weight="duotone" />
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="flex items-center gap-2">
                  <CheckCircle size={16} weight="duotone" />
                  Confirm Password *
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  disabled={isCreating}
                />
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  disabled={isCreating}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{' '}
                  <Link to="/terms" className="text-accent hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            <Button 
              onClick={handleCreateAccount} 
              className="w-full" 
              size="lg"
              disabled={isCreating}
            >
              {isCreating ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link to="/login" className="block">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          By creating an account, you're joining a community of artists who believe in owning their music and earning fair royalties.
        </p>
      </div>
    </div>
  )
}
