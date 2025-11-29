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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ArrowRight,
  UploadSimple,
  X,
  CheckCircle,
  Sparkle,
  Warning,
  Info,
  Plus,
  Trash,
} from '@phosphor-icons/react'
import { createMasterIPO, launchMasterIPO } from '@/api/masterIPO'
import type { CreateMasterIPOPayload, Collaborator } from '@/types'
import { DEFAULT_MOVER_ADVANTAGE } from '@/types'
import { toast } from 'sonner'

const WIZARD_STEPS = [
  { label: 'Master Details', description: 'Track metadata and rights' },
  { label: 'Share Config', description: 'NFT supply and revenue splits' },
  { label: 'Preview', description: 'Review and launch' },
]

export function CreateMasterIPOPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [launching, setLaunching] = useState(false)
  const [launchProgress, setLaunchProgress] = useState(0)
  const [launchComplete, setLaunchComplete] = useState(false)
  const [launchedMasterIPOId, setLaunchedMasterIPOId] = useState<string>('')

  const [formData, setFormData] = useState<Partial<CreateMasterIPOPayload>>({
    title: '',
    description: '',
    coverImageUrl: '',
    audioPreviewUrl: '',
    totalNFTSupply: 10000,
    nftHolderRevenueSharePercent: 40,
    artistRetainedPercent: 60,
    pricePerNFT: 0.05,
    currency: 'ETH',
    blockchain: 'ethereum',
    rightsConfirmed: false,
    collaborators: [],
  })

  const updateField = <K extends keyof CreateMasterIPOPayload>(
    field: K,
    value: CreateMasterIPOPayload[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-calculate artist retained percent when NFT holder percent changes
    if (field === 'nftHolderRevenueSharePercent') {
      const collaboratorTotal = (formData.collaborators || []).reduce(
        (sum, c) => sum + c.revenueSharePercent,
        0
      )
      setFormData((prev) => ({
        ...prev,
        artistRetainedPercent: 100 - (value as number) - collaboratorTotal,
      }))
    }
  }

  const addCollaborator = () => {
    setFormData((prev) => ({
      ...prev,
      collaborators: [
        ...(prev.collaborators || []),
        { name: '', role: '', revenueSharePercent: 0 },
      ],
    }))
  }

  const updateCollaborator = (index: number, updates: Partial<Omit<Collaborator, 'id'>>) => {
    setFormData((prev) => {
      const collaborators = [...(prev.collaborators || [])]
      collaborators[index] = { ...collaborators[index], ...updates }
      
      // Recalculate artist retained percent
      const collaboratorTotal = collaborators.reduce((sum, c) => sum + c.revenueSharePercent, 0)
      const artistRetained = 100 - (prev.nftHolderRevenueSharePercent || 0) - collaboratorTotal
      
      return { ...prev, collaborators, artistRetainedPercent: artistRetained }
    })
  }

  const removeCollaborator = (index: number) => {
    setFormData((prev) => {
      const collaborators = (prev.collaborators || []).filter((_, i) => i !== index)
      const collaboratorTotal = collaborators.reduce((sum, c) => sum + c.revenueSharePercent, 0)
      const artistRetained = 100 - (prev.nftHolderRevenueSharePercent || 0) - collaboratorTotal
      return { ...prev, collaborators, artistRetainedPercent: artistRetained }
    })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.description && formData.rightsConfirmed
      case 1:
        return (
          formData.totalNFTSupply &&
          formData.totalNFTSupply >= 1 &&
          formData.totalNFTSupply <= 1000000 &&
          formData.nftHolderRevenueSharePercent !== undefined &&
          (formData.artistRetainedPercent || 0) >= 0
        )
      case 2:
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

  const handleLaunch = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setLaunching(true)
    setLaunchProgress(0)

    const progressInterval = setInterval(() => {
      setLaunchProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 15
      })
    }, 300)

    try {
      const created = await createMasterIPO(
        formData as CreateMasterIPOPayload,
        'user_001',
        'Alex Rivera'
      )
      
      const launched = await launchMasterIPO(created.id)

      clearInterval(progressInterval)
      setLaunchProgress(100)
      setLaunchedMasterIPOId(launched.id)
      setLaunchComplete(true)

      toast.success('Master IPO launched successfully!', {
        description: 'Your NFTs are now available for purchase.',
      })
    } catch (error) {
      clearInterval(progressInterval)
      toast.error('Failed to launch Master IPO')
      setLaunching(false)
    }
  }

  const simulateCoverUpload = () => {
    updateField(
      'coverImageUrl',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'
    )
    toast.success('Cover image uploaded')
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create Master IPO</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Launch an NFT offering for your music master
            </p>
          </div>
          {currentStep === 0 && !launching && !launchComplete && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/artist')} className="gap-2">
              <X size={18} />
              Cancel
            </Button>
          )}
        </div>

        {/* Step Indicator */}
        {!launchComplete && <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} />}

        {/* Main Content */}
        <Card className="border-border/60">
          <CardContent className="p-5 sm:p-6 md:p-8">
            {/* Step 1: Master Details */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1">Master Details</h2>
                  <p className="text-muted-foreground text-sm">
                    Enter information about your music master
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Master Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Midnight Sessions"
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your master, its story, and what makes it special..."
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-2">
                    <Label>Cover Artwork</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      {formData.coverImageUrl ? (
                        <div className="space-y-4">
                          <img
                            src={formData.coverImageUrl}
                            alt="Cover"
                            className="w-full max-w-xs mx-auto rounded-lg"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => updateField('coverImageUrl', '')}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 py-4">
                          <UploadSimple size={32} className="mx-auto text-muted-foreground" />
                          <Button variant="secondary" size="sm" onClick={simulateCoverUpload}>
                            Upload Cover
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Recommended: 1000x1000px, JPG or PNG
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Collaborators */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Collaborators (Optional)</Label>
                      <Button variant="outline" size="sm" onClick={addCollaborator} className="gap-1">
                        <Plus size={14} />
                        Add Collaborator
                      </Button>
                    </div>
                    {(formData.collaborators || []).map((collab, index) => (
                      <div key={index} className="flex gap-3 items-start bg-muted/30 p-3 rounded-lg">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Name"
                            value={collab.name}
                            onChange={(e) => updateCollaborator(index, { name: e.target.value })}
                          />
                          <Input
                            placeholder="Role (e.g., Producer)"
                            value={collab.role}
                            onChange={(e) => updateCollaborator(index, { role: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20"
                            placeholder="%"
                            value={collab.revenueSharePercent || ''}
                            onChange={(e) =>
                              updateCollaborator(index, {
                                revenueSharePercent: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCollaborator(index)}
                          >
                            <Trash size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Rights Confirmation */}
                  <div className="flex items-start space-x-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                    <Checkbox
                      id="rights"
                      checked={formData.rightsConfirmed}
                      onCheckedChange={(checked) => updateField('rightsConfirmed', checked === true)}
                    />
                    <div className="space-y-1">
                      <label htmlFor="rights" className="font-medium text-sm cursor-pointer">
                        I confirm I own or have rights to this master *
                      </label>
                      <p className="text-xs text-muted-foreground">
                        By checking this box, you confirm that you own or have the legal rights to
                        sell shares of this master recording.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Share Configuration */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1">Share Configuration</h2>
                  <p className="text-muted-foreground text-sm">
                    Configure NFT supply and revenue distribution
                  </p>
                </div>

                <div className="space-y-6">
                  {/* NFT Supply */}
                  <div className="space-y-2">
                    <Label htmlFor="supply">Total NFT Supply *</Label>
                    <Input
                      id="supply"
                      type="number"
                      min={1}
                      max={1000000}
                      value={formData.totalNFTSupply}
                      onChange={(e) => updateField('totalNFTSupply', parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Between 1 and 1,000,000 NFTs. More NFTs = more fractional ownership available.
                    </p>
                  </div>

                  {/* Price per NFT */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per NFT</Label>
                    <div className="flex gap-2">
                      <Input
                        id="price"
                        type="number"
                        step="0.001"
                        value={formData.pricePerNFT}
                        onChange={(e) => updateField('pricePerNFT', parseFloat(e.target.value) || 0)}
                        className="flex-1"
                      />
                      <Select
                        value={formData.currency}
                        onValueChange={(value: 'ETH' | 'SOL' | 'USD') => updateField('currency', value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="SOL">SOL</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Blockchain */}
                  <div className="space-y-2">
                    <Label>Blockchain</Label>
                    <Select
                      value={formData.blockchain}
                      onValueChange={(value: 'ethereum' | 'solana') => updateField('blockchain', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="solana">Solana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Revenue Share */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>NFT Holder Revenue Share</Label>
                      <span className="text-2xl font-bold text-accent">
                        {formData.nftHolderRevenueSharePercent}%
                      </span>
                    </div>
                    <Slider
                      min={10}
                      max={80}
                      step={5}
                      value={[formData.nftHolderRevenueSharePercent || 40]}
                      onValueChange={(value) => updateField('nftHolderRevenueSharePercent', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentage of master revenue distributed to NFT holders as dividends.
                    </p>
                  </div>

                  {/* Revenue Split Summary */}
                  <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                    <h4 className="font-semibold">Revenue Split Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>NFT Holders (Dividends)</span>
                        <Badge variant="secondary">{formData.nftHolderRevenueSharePercent}%</Badge>
                      </div>
                      {(formData.collaborators || []).map((collab, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {collab.name || `Collaborator ${i + 1}`} ({collab.role || 'TBD'})
                          </span>
                          <Badge variant="outline">{collab.revenueSharePercent}%</Badge>
                        </div>
                      ))}
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Artist Retained</span>
                        <Badge>{formData.artistRetainedPercent}%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
            {currentStep === 2 && !launching && !launchComplete && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1">Review & Launch</h2>
                  <p className="text-muted-foreground text-sm">
                    Review your Master IPO details before launching
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-muted/40 rounded-lg p-4 sm:p-6 space-y-4">
                  {formData.coverImageUrl && (
                    <img
                      src={formData.coverImageUrl}
                      alt="Cover"
                      className="w-32 h-32 rounded-lg object-cover mx-auto"
                    />
                  )}
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{formData.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{formData.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total NFT Supply</p>
                      <p className="font-semibold">{formData.totalNFTSupply?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price per NFT</p>
                      <p className="font-semibold">
                        {formData.pricePerNFT} {formData.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Blockchain</p>
                      <p className="font-semibold capitalize">{formData.blockchain}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Holder Revenue Share</p>
                      <p className="font-semibold">{formData.nftHolderRevenueSharePercent}%</p>
                    </div>
                  </div>
                </div>

                {/* Mover Advantage Explanation */}
                <Alert className="bg-accent/5 border-accent/20">
                  <Info size={18} className="text-accent" />
                  <AlertDescription className="text-sm">
                    <strong>Mover Advantage:</strong> Early buyers benefit from resale royalties.
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>1st minter: {DEFAULT_MOVER_ADVANTAGE.firstMinterPercent}% of each resale</li>
                      <li>2nd minter: {DEFAULT_MOVER_ADVANTAGE.secondMinterPercent}% of each resale</li>
                      <li>3rd minter: {DEFAULT_MOVER_ADVANTAGE.thirdMinterPercent}% of each resale</li>
                      <li>4th+ minters: {DEFAULT_MOVER_ADVANTAGE.fourthPlusMinterPercent}% of each resale</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Disclaimer */}
                <Alert variant="default" className="bg-warning/5 border-warning/30">
                  <Warning size={18} className="text-warning" />
                  <AlertDescription className="text-sm text-warning-foreground">
                    <strong>Important:</strong> This is not legal or financial advice. Please consult
                    with legal and financial professionals before launching a Master IPO. By
                    proceeding, you confirm you understand the implications.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Launching State */}
            {launching && !launchComplete && (
              <div className="space-y-6 py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <Sparkle size={40} weight="fill" className="text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">Launching Master IPO</h3>
                    <p className="text-muted-foreground text-sm">
                      Deploying smart contracts and preparing NFTs...
                    </p>
                  </div>
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <Progress value={launchProgress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">{launchProgress}% complete</p>
                </div>
              </div>
            )}

            {/* Launch Complete */}
            {launchComplete && (
              <div className="space-y-6 py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                    <CheckCircle size={48} weight="fill" className="text-accent" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">Master IPO Launched!</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Your NFTs are now available for purchase
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate(`/master-ipo/${launchedMasterIPOId}`)} size="lg">
                    View Master IPO
                  </Button>
                  <Button onClick={() => navigate('/artist')} variant="secondary" size="lg">
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {!launching && !launchComplete && (
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
              <Button onClick={handleLaunch} disabled={!canProceed()} size="lg" className="gap-2">
                <Sparkle size={20} />
                Launch Master IPO
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
