import { SpotifyLogo, ApplePodcastsLogo, SoundcloudLogo, MusicNotes } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MusicPlatformLinksProps {
  musicPlatforms: {
    spotify: string
    appleMusic: string
    soundcloud: string
    bandcamp: string
  }
  onUpdate: (musicPlatforms: MusicPlatformLinksProps['musicPlatforms']) => void
}

export function MusicPlatformLinks({ musicPlatforms, onUpdate }: MusicPlatformLinksProps) {
  const handleChange = (platform: keyof MusicPlatformLinksProps['musicPlatforms'], value: string) => {
    onUpdate({
      ...musicPlatforms,
      [platform]: value
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MusicNotes size={24} weight="duotone" className="text-primary" />
          Music Platforms
        </CardTitle>
        <CardDescription>
          Link to your existing music on streaming platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="spotify" className="flex items-center gap-2">
              <SpotifyLogo size={16} weight="duotone" />
              Spotify
            </Label>
            <Input
              id="spotify"
              placeholder="Artist profile URL"
              value={musicPlatforms.spotify}
              onChange={(e) => handleChange('spotify', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apple-music" className="flex items-center gap-2">
              <ApplePodcastsLogo size={16} weight="duotone" />
              Apple Music
            </Label>
            <Input
              id="apple-music"
              placeholder="Artist profile URL"
              value={musicPlatforms.appleMusic}
              onChange={(e) => handleChange('appleMusic', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="soundcloud" className="flex items-center gap-2">
              <SoundcloudLogo size={16} weight="duotone" />
              SoundCloud
            </Label>
            <Input
              id="soundcloud"
              placeholder="Profile URL"
              value={musicPlatforms.soundcloud}
              onChange={(e) => handleChange('soundcloud', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bandcamp" className="flex items-center gap-2">
              <MusicNotes size={16} weight="duotone" />
              Bandcamp
            </Label>
            <Input
              id="bandcamp"
              placeholder="Artist page URL"
              value={musicPlatforms.bandcamp}
              onChange={(e) => handleChange('bandcamp', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
