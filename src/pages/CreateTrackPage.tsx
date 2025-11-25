import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { StepIndicator } from '@/components/wizard/StepIndicator'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, UploadSimple, X, CheckCircle, Sparkle } from '@phosphor-icons/react'
import { createTrackDraft, simulateMint } from '@/api/tracks'
import type { CreateTrackPayload } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { GENRES, MOOD_TAGS, WIZARD_STEPS, APP_CONFIG } from '@/constants'

export function CreateTrackPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [minting, setMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [mintComplete, setMintComplete] = useState(false)
  const [mintedTrackId, setMintedTrackId] = useState<string>('')

  const [formData, setFormData] = useState<Partial<CreateTrackPayload>>({
    title: '',
    description: '',
    genre: '',
    bpm: undefined,
    moodTags: [],
    audioFileName: '',
    coverImageUrl: '',
    royaltyPercent: APP_CONFIG.defaultRoyaltyPercent,
    currentPrice: undefined,
    currency: 'ETH',
    allowSecondaryResale: true,
    releaseDate: '',
  })

  const updateField = <K extends keyof CreateTrackPayload>(
    field: K,
    value: CreateTrackPayload[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleMoodTag = (tag: string) => {
    const current = formData.moodTags || []
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag]
    updateField('moodTags', updated)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.genre && formData.audioFileName
      case 1:
        return true
      case 2:
        return formData.royaltyPercent !== undefined
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleMint = async () => {
    if (!formData.title || !formData.genre || !formData.audioFileName) {
      toast.error('Please fill in all required fields')
      return
    }

    setMinting(true)
    setMintProgress(0)

    const progressInterval = setInterval(() => {
      setMintProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const draft = await createTrackDraft(formData as CreateTrackPayload)
      const minted = await simulateMint(draft.id)
      
      clearInterval(progressInterval)
      setMintProgress(100)
      setMintedTrackId(minted.id)
      setMintComplete(true)
      
      toast.success('Track minted successfully!', {
        description: 'Your NFT is now on the blockchain.',
      })
    } catch (error) {
      clearInterval(progressInterval)
      toast.error('Failed to mint track')
      setMinting(false)
    }
  }

  const simulateFileUpload = (type: 'audio' | 'image') => {
    const fileName = type === 'audio' 
      ? `${formData.title || 'track'}_master.wav`
      : `${formData.title || 'track'}_cover.jpg`
    
    if (type === 'audio') {
      updateField('audioFileName', fileName)
    } else {
      updateField('coverImageUrl', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400')
    }
    
    toast.success(`${type === 'audio' ? 'Audio' : 'Image'} uploaded`, {
      description: fileName,
    })
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Create NFT Track</h1>
            <p className="text-muted-foreground mt-2">
              Mint your music as a one-of-one NFT
            </p>
          </div>
          {currentStep === 0 && (
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
              <X size={18} />
              Cancel
            </Button>
          )}
        </div>

        {!mintComplete && (
          <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} />
        )}

        <Card>
          <CardContent className="p-8">
            {currentStep === 0 && <Step1TrackDetails formData={formData} updateField={updateField} toggleMoodTag={toggleMoodTag} simulateFileUpload={simulateFileUpload} />}
            {currentStep === 1 && <Step2Artwork formData={formData} updateField={updateField} simulateFileUpload={simulateFileUpload} />}
            {currentStep === 2 && <Step3Economics formData={formData} updateField={updateField} />}
            {currentStep === 3 && !minting && !mintComplete && <Step4Review formData={formData} />}
            
            {minting && (
              <div className="space-y-6 py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <Sparkle size={40} weight="fill" className="text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Minting Your NFT</h3>
                    <p className="text-muted-foreground">
                      Uploading to IPFS and deploying to blockchain...
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress value={mintProgress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    {mintProgress}% complete
                  </p>
                </div>
              </div>
            )}

            {mintComplete && (
              <div className="space-y-6 py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                    <CheckCircle size={48} weight="fill" className="text-accent" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Mint Successful!</h3>
                    <p className="text-muted-foreground mb-4">
                      Your track has been minted as an NFT
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 max-w-md">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Token ID</span>
                        <span className="font-mono">{mintedTrackId}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className="bg-secondary/20 text-secondary">Minted</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate(`/tracks/${mintedTrackId}`)} size="lg">
                    View Track
                  </Button>
                  <Button onClick={() => navigate('/dashboard')} variant="secondary" size="lg">
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!minting && !mintComplete && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Button>

            {currentStep < WIZARD_STEPS.length - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                Next
                <ArrowRight size={18} />
              </Button>
            ) : (
              <Button onClick={handleMint} disabled={!canProceed()} size="lg" className="gap-2">
                <Sparkle size={20} />
                Mint NFT
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

function Step1TrackDetails({
  formData,
  updateField,
  toggleMoodTag,
  simulateFileUpload,
}: {
  formData: Partial<CreateTrackPayload>
  updateField: <K extends keyof CreateTrackPayload>(field: K, value: CreateTrackPayload[K]) => void
  toggleMoodTag: (tag: string) => void
  simulateFileUpload: (type: 'audio' | 'image') => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Track Details</h2>
        <p className="text-muted-foreground">Basic information about your track</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Track Title *</Label>
          <Input
            id="title"
            placeholder="Enter track title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre">Genre *</Label>
          <Select value={formData.genre} onValueChange={(value) => updateField('genre', value)}>
            <SelectTrigger id="genre">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bpm">BPM (optional)</Label>
          <Input
            id="bpm"
            type="number"
            placeholder="120"
            value={formData.bpm || ''}
            onChange={(e) => updateField('bpm', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label>Mood Tags (select up to 5)</Label>
          <div className="flex flex-wrap gap-2">
            {MOOD_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={formData.moodTags?.includes(tag) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all',
                  formData.moodTags?.includes(tag) && 'bg-accent text-accent-foreground'
                )}
                onClick={() => {
                  if (formData.moodTags?.includes(tag) || (formData.moodTags?.length || 0) < APP_CONFIG.maxMoodTags) {
                    toggleMoodTag(tag)
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your track..."
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Audio File *</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
            {formData.audioFileName ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-accent/20 flex items-center justify-center">
                    <CheckCircle size={24} weight="fill" className="text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{formData.audioFileName}</p>
                    <p className="text-xs text-muted-foreground">Audio file ready</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateField('audioFileName', '')}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadSimple size={32} className="mx-auto text-muted-foreground" />
                <div>
                  <Button
                    variant="secondary"
                    onClick={() => simulateFileUpload('audio')}
                  >
                    Upload Audio
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    WAV, MP3, FLAC • Max 100MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Step2Artwork({
  formData,
  updateField,
  simulateFileUpload,
}: {
  formData: Partial<CreateTrackPayload>
  updateField: <K extends keyof CreateTrackPayload>(field: K, value: CreateTrackPayload[K]) => void
  simulateFileUpload: (type: 'audio' | 'image') => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Artwork</h2>
        <p className="text-muted-foreground">Add a cover image for your NFT</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Cover Artwork (optional)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
            {formData.coverImageUrl ? (
              <div className="space-y-4">
                <img
                  src={formData.coverImageUrl}
                  alt="Cover"
                  className="w-full max-w-md mx-auto rounded-lg"
                />
                <Button
                  variant="secondary"
                  onClick={() => updateField('coverImageUrl', '')}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadSimple size={32} className="mx-auto text-muted-foreground" />
                <div>
                  <Button
                    variant="secondary"
                    onClick={() => simulateFileUpload('image')}
                  >
                    Upload Image
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG • Recommended: 1000x1000px
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          High-quality artwork helps your track stand out. Consider including your artist name or logo.
        </p>
      </div>
    </div>
  )
}

function Step3Economics({
  formData,
  updateField,
}: {
  formData: Partial<CreateTrackPayload>
  updateField: <K extends keyof CreateTrackPayload>(field: K, value: CreateTrackPayload[K]) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Economics & Release</h2>
        <p className="text-muted-foreground">Set pricing and royalty terms</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="releaseDate">Release Date (optional)</Label>
          <Input
            id="releaseDate"
            type="date"
            value={formData.releaseDate}
            onChange={(e) => updateField('releaseDate', e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="price">Initial Price (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.5"
              value={formData.currentPrice || ''}
              onChange={(e) => updateField('currentPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="flex-1"
            />
            <Select value={formData.currency} onValueChange={(value: 'ETH' | 'USD') => updateField('currency', value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="royalty">Royalty Percentage</Label>
            <span className="text-2xl font-bold text-accent">{formData.royaltyPercent}%</span>
          </div>
          <Slider
            id="royalty"
            min={0}
            max={25}
            step={1}
            value={[formData.royaltyPercent || APP_CONFIG.defaultRoyaltyPercent]}
            onValueChange={(value) => updateField('royaltyPercent', value[0])}
            className="py-4"
          />
          <p className="text-sm text-muted-foreground">
            You'll receive this percentage on every resale of your NFT, forever.
          </p>
        </div>

        <div className="flex items-center justify-between space-x-2 rounded-lg border border-border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="resale">Allow Secondary Market Resale</Label>
            <p className="text-sm text-muted-foreground">
              Let buyers resell on OpenSea and other marketplaces
            </p>
          </div>
          <Switch
            id="resale"
            checked={formData.allowSecondaryResale}
            onCheckedChange={(checked) => updateField('allowSecondaryResale', checked)}
          />
        </div>
      </div>
    </div>
  )
}

function Step4Review({ formData }: { formData: Partial<CreateTrackPayload> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
        <p className="text-muted-foreground">Double-check everything before minting</p>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Title</p>
            <p className="font-semibold text-lg">{formData.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Genre</p>
              <p className="font-medium">{formData.genre}</p>
            </div>
            {formData.bpm && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">BPM</p>
                <p className="font-medium">{formData.bpm}</p>
              </div>
            )}
          </div>

          {formData.moodTags && formData.moodTags.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Mood Tags</p>
              <div className="flex flex-wrap gap-2">
                {formData.moodTags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {formData.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{formData.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-1">Audio File</p>
            <p className="font-mono text-sm">{formData.audioFileName}</p>
          </div>

          {formData.currentPrice && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Initial Price</p>
              <p className="text-2xl font-bold text-accent">
                {formData.currentPrice} {formData.currency}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-1">Royalty Percentage</p>
            <p className="font-semibold">{formData.royaltyPercent}%</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Secondary Resale</p>
            <p className="font-medium">
              {formData.allowSecondaryResale ? 'Allowed' : 'Not allowed'}
            </p>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <p className="text-sm">
            <strong>Note:</strong> Once minted, this NFT cannot be modified. Ensure all details are correct before proceeding.
          </p>
        </div>
      </div>
    </div>
  )
}
