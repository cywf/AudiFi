import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  VideoCamera,
  Plus,
  Trash,
  ChartPie,
  Sliders,
  ListNumbers,
  Calendar,
  ArrowRight,
  Lock,
} from '@phosphor-icons/react'
import { createSession } from '@/api/vstudio'
import type { CreateVStudioSessionPayload, DecisionPoint, DecisionPointType, SessionGating } from '@/types'
import { toast } from 'sonner'

export function VStudioSessionSetupPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<CreateVStudioSessionPayload>>({
    title: '',
    description: '',
    scheduledStartTime: '',
    gating: { type: 'OPEN' },
    decisionPoints: [],
  })

  const updateField = <K extends keyof CreateVStudioSessionPayload>(
    field: K,
    value: CreateVStudioSessionPayload[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addDecisionPoint = (type: DecisionPointType) => {
    const newDP: Omit<DecisionPoint, 'id' | 'sessionId' | 'createdAt' | 'startedAt' | 'endedAt'> = {
      type,
      question: '',
      options:
        type === 'SLIDER'
          ? [{ id: `opt_${Date.now()}`, label: 'Value', votes: 0 }]
          : [
              { id: `opt_${Date.now()}_1`, label: '', votes: 0 },
              { id: `opt_${Date.now()}_2`, label: '', votes: 0 },
            ],
      durationSeconds: 60,
      status: 'PENDING',
      gating: { type: 'OPEN' },
    }
    setFormData((prev) => ({
      ...prev,
      decisionPoints: [...(prev.decisionPoints || []), newDP],
    }))
  }

  const updateDecisionPoint = (
    index: number,
    updates: Partial<DecisionPoint>
  ) => {
    setFormData((prev) => {
      const dps = [...(prev.decisionPoints || [])]
      dps[index] = { ...dps[index], ...updates }
      return { ...prev, decisionPoints: dps }
    })
  }

  const addOptionToDP = (dpIndex: number) => {
    setFormData((prev) => {
      const dps = [...(prev.decisionPoints || [])]
      dps[dpIndex].options.push({
        id: `opt_${Date.now()}`,
        label: '',
        votes: 0,
      })
      return { ...prev, decisionPoints: dps }
    })
  }

  const updateOptionLabel = (dpIndex: number, optIndex: number, label: string) => {
    setFormData((prev) => {
      const dps = [...(prev.decisionPoints || [])]
      dps[dpIndex].options[optIndex].label = label
      return { ...prev, decisionPoints: dps }
    })
  }

  const removeOption = (dpIndex: number, optIndex: number) => {
    setFormData((prev) => {
      const dps = [...(prev.decisionPoints || [])]
      dps[dpIndex].options = dps[dpIndex].options.filter((_, i) => i !== optIndex)
      return { ...prev, decisionPoints: dps }
    })
  }

  const removeDecisionPoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      decisionPoints: (prev.decisionPoints || []).filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Please enter a session title')
      return
    }

    setSaving(true)
    try {
      const session = await createSession(
        formData as CreateVStudioSessionPayload,
        'user_001',
        'Alex Rivera'
      )
      toast.success('Session created!', {
        description: 'Your V Studio session has been saved.',
      })
      navigate(`/vstudio/session/${session.id}`)
    } catch (error) {
      toast.error('Failed to create session')
    } finally {
      setSaving(false)
    }
  }

  const getDecisionPointIcon = (type: DecisionPointType) => {
    switch (type) {
      case 'POLL':
        return <ChartPie size={20} />
      case 'SLIDER':
        return <Sliders size={20} />
      case 'RANKING':
        return <ListNumbers size={20} />
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <VideoCamera size={28} weight="duotone" className="text-accent" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">V Studio Session Setup</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Configure your live production session and decision points
            </p>
          </div>
        </div>

        {/* Session Details */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Basic information about your session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Making 'Summer Vibes' - Live Production"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what fans can expect from this session..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule" className="flex items-center gap-2">
                <Calendar size={16} />
                Scheduled Start Time
              </Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={formData.scheduledStartTime}
                onChange={(e) => updateField('scheduledStartTime', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Access Gating */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} />
              Access Gating
            </CardTitle>
            <CardDescription>Control who can join and participate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={formData.gating?.type}
              onValueChange={(value: SessionGating['type']) =>
                updateField('gating', { type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select access type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open to Everyone</SelectItem>
                <SelectItem value="NFT">NFT Holders Only</SelectItem>
                <SelectItem value="ARTIST_COIN">Artist Coin Holders Only</SelectItem>
                <SelectItem value="SUBSCRIPTION">Subscribers Only</SelectItem>
                <SelectItem value="COMBINED">Combined Requirements</SelectItem>
              </SelectContent>
            </Select>

            {formData.gating?.type !== 'OPEN' && (
              <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                <p>
                  <strong>Note:</strong> Gating configuration will require backend integration.
                  For now, this serves as a placeholder for access control settings.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decision Points */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Decision Points</CardTitle>
                <CardDescription>
                  Configure interactive moments where fans can vote
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Decision Point Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addDecisionPoint('POLL')}
                className="gap-2"
              >
                <ChartPie size={16} />
                Add Poll
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addDecisionPoint('SLIDER')}
                className="gap-2"
              >
                <Sliders size={16} />
                Add Slider
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addDecisionPoint('RANKING')}
                className="gap-2"
              >
                <ListNumbers size={16} />
                Add Ranking
              </Button>
            </div>

            <Separator />

            {/* Decision Point List */}
            {(formData.decisionPoints || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ChartPie size={48} className="mx-auto mb-3 opacity-50" />
                <p>No decision points yet. Add polls, sliders, or rankings above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(formData.decisionPoints || []).map((dp, dpIndex) => (
                  <div
                    key={dpIndex}
                    className="p-4 bg-muted/30 rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDecisionPointIcon(dp.type)}
                        <Badge variant="outline" className="capitalize">
                          {dp.type.toLowerCase()}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDecisionPoint(dpIndex)}
                      >
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        placeholder="e.g., Which synth sound should we use?"
                        value={dp.question}
                        onChange={(e) =>
                          updateDecisionPoint(dpIndex, { question: e.target.value })
                        }
                      />
                    </div>

                    {dp.type !== 'SLIDER' && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {dp.options.map((opt, optIndex) => (
                          <div key={opt.id} className="flex gap-2">
                            <Input
                              placeholder={`Option ${optIndex + 1}`}
                              value={opt.label}
                              onChange={(e) =>
                                updateOptionLabel(dpIndex, optIndex, e.target.value)
                              }
                            />
                            {dp.options.length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(dpIndex, optIndex)}
                              >
                                <Trash size={14} />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOptionToDP(dpIndex)}
                          className="gap-1"
                        >
                          <Plus size={14} />
                          Add Option
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Duration (seconds)</Label>
                        <Input
                          type="number"
                          min={10}
                          max={300}
                          value={dp.durationSeconds}
                          onChange={(e) =>
                            updateDecisionPoint(dpIndex, {
                              durationSeconds: parseInt(e.target.value) || 60,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gating</Label>
                        <Select
                          value={dp.gating.type}
                          onValueChange={(value: SessionGating['type']) =>
                            updateDecisionPoint(dpIndex, { gating: { type: value } })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="NFT">NFT Holders</SelectItem>
                            <SelectItem value="ARTIST_COIN">Coin Holders</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/artist')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? 'Saving...' : 'Save & Continue'}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
