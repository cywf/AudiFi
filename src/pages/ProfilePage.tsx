import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NavBar } from '@/components/layout/NavBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Camera, 
  InstagramLogo, 
  TwitterLogo, 
  TiktokLogo,
  YoutubeLogo,
  SpotifyLogo,
  ApplePodcastsLogo,
  SoundcloudLogo,
  Shield,
  CheckCircle,
  Warning
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { TwoFactorSetup } from '@/components/profile/TwoFactorSetup'
import { SocialMediaLinks } from '@/components/profile/SocialMediaLinks'
import { MusicPlatformLinks } from '@/components/profile/MusicPlatformLinks'
import type { UserProfile } from '@/types'

export function ProfilePage() {
  const [userProfile, setUserProfile] = useKV<UserProfile>('user-profile', {
    displayName: '',
    bio: '',
    avatarUrl: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      tiktok: '',
      youtube: ''
    },
    musicPlatforms: {
      spotify: '',
      appleMusic: '',
      soundcloud: '',
      bandcamp: ''
    },
    twoFactorEnabled: false
  })

  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const getDefaultProfile = (): UserProfile => ({
    displayName: '',
    bio: '',
    avatarUrl: '',
    socialMedia: { instagram: '', twitter: '', tiktok: '', youtube: '' },
    musicPlatforms: { spotify: '', appleMusic: '', soundcloud: '', bandcamp: '' },
    twoFactorEnabled: false
  })

  const updateProfile = (updater: (current: UserProfile) => Partial<UserProfile>) => {
    setUserProfile(current => {
      const base = current || getDefaultProfile()
      return { ...base, ...updater(base) }
    })
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setUserProfile(current => {
        const base = current || {
          displayName: '',
          bio: '',
          avatarUrl: '',
          socialMedia: { instagram: '', twitter: '', tiktok: '', youtube: '' },
          musicPlatforms: { spotify: '', appleMusic: '', soundcloud: '', bandcamp: '' },
          twoFactorEnabled: false
        }
        return {
          ...base,
          avatarUrl: reader.result as string
        }
      })
      setIsUploading(false)
      toast.success('Profile picture updated')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Profile saved successfully')
    }, 800)
  }

  const getInitials = () => {
    if (!userProfile?.displayName) return 'U'
    return userProfile.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  if (!userProfile) return null

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your artist profile and account settings</p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={24} weight="duotone" className="text-primary" />
                Artist Profile
              </CardTitle>
              <CardDescription>
                This information will be displayed on your artist page and track listings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userProfile.avatarUrl} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-accent text-accent-foreground rounded-full p-2 cursor-pointer hover:scale-110 transition-transform shadow-lg"
                  >
                    <Camera size={16} weight="bold" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a profile picture. Recommended size: 400x400px. Max 5MB.
                  </p>
                  {isUploading && (
                    <p className="text-sm text-accent">Uploading...</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name *</Label>
                  <Input
                    id="display-name"
                    placeholder="Enter your artist name"
                    value={userProfile.displayName}
                    onChange={(e) => updateProfile(() => ({ displayName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Artist Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell your story... What's your musical journey? What inspires your sound?"
                    className="min-h-32 resize-none"
                    value={userProfile.bio}
                    onChange={(e) => updateProfile(() => ({ bio: e.target.value }))}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {userProfile.bio.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving || !userProfile.displayName}>
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <SocialMediaLinks 
            socialMedia={userProfile.socialMedia}
            onUpdate={(socialMedia) => updateProfile(() => ({ socialMedia }))}
          />

          <MusicPlatformLinks
            musicPlatforms={userProfile.musicPlatforms}
            onUpdate={(musicPlatforms) => updateProfile(() => ({ musicPlatforms }))}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={24} weight="duotone" className="text-primary" />
                Two-Factor Authentication
                {userProfile.twoFactorEnabled && (
                  <Badge variant="default" className="bg-secondary ml-2">
                    <CheckCircle size={14} weight="fill" className="mr-1" />
                    Enabled
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account with 2FA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!userProfile.twoFactorEnabled && (
                <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg mb-6">
                  <Warning size={20} weight="fill" className="text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-warning-foreground">
                      2FA is not enabled on your account
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Protect your account and NFTs by enabling two-factor authentication
                    </p>
                  </div>
                </div>
              )}
              
              <TwoFactorSetup
                isEnabled={userProfile.twoFactorEnabled}
                onToggle={(enabled) => updateProfile(() => ({ twoFactorEnabled: enabled }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
