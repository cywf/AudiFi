import { InstagramLogo, TwitterLogo, TiktokLogo, YoutubeLogo } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SocialMediaLinksProps {
  socialMedia: {
    instagram: string
    twitter: string
    tiktok: string
    youtube: string
  }
  onUpdate: (socialMedia: SocialMediaLinksProps['socialMedia']) => void
}

export function SocialMediaLinks({ socialMedia, onUpdate }: SocialMediaLinksProps) {
  const handleChange = (platform: keyof SocialMediaLinksProps['socialMedia'], value: string) => {
    onUpdate({
      ...socialMedia,
      [platform]: value
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InstagramLogo size={24} weight="duotone" className="text-primary" />
          Social Media
        </CardTitle>
        <CardDescription>
          Connect your social media profiles to build your artist presence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <InstagramLogo size={16} weight="duotone" />
              Instagram
            </Label>
            <Input
              id="instagram"
              placeholder="@yourusername"
              value={socialMedia.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <TwitterLogo size={16} weight="duotone" />
              Twitter / X
            </Label>
            <Input
              id="twitter"
              placeholder="@yourusername"
              value={socialMedia.twitter}
              onChange={(e) => handleChange('twitter', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktok" className="flex items-center gap-2">
              <TiktokLogo size={16} weight="duotone" />
              TikTok
            </Label>
            <Input
              id="tiktok"
              placeholder="@yourusername"
              value={socialMedia.tiktok}
              onChange={(e) => handleChange('tiktok', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube" className="flex items-center gap-2">
              <YoutubeLogo size={16} weight="duotone" />
              YouTube
            </Label>
            <Input
              id="youtube"
              placeholder="Channel URL or @handle"
              value={socialMedia.youtube}
              onChange={(e) => handleChange('youtube', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
