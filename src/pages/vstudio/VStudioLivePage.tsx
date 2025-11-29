import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  VideoCamera,
  Play,
  Stop,
  ChartPie,
  CheckCircle,
  Clock,
  Users,
  Lock,
  ChatCircle,
  ArrowRight,
  Warning,
} from '@phosphor-icons/react'
import { useVStudioSession, useDecisionPointCountdown } from '@/hooks/useVStudioSession'
import { useGatingStatus } from '@/hooks/useGating'
import { goLive, endSession, endDecisionPoint, startDecisionPoint } from '@/api/vstudio'
import type { DecisionPoint } from '@/types'
import { toast } from 'sonner'

export function VStudioLivePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isArtist] = useState(true) // TODO: Replace with actual user role from auth context when backend is ready

  const { session, loading, error, activeDecisionPoint, refresh } = useVStudioSession({
    sessionId: id || '',
    isArtist,
  })

  const gatingStatus = useGatingStatus(session?.gating)

  const handleGoLive = async () => {
    if (!session) return
    try {
      await goLive(session.id)
      await refresh()
      toast.success('Session is now LIVE!')
    } catch (err) {
      toast.error('Failed to start session')
    }
  }

  const handleEndSession = async () => {
    if (!session) return
    try {
      await endSession(session.id)
      toast.success('Session ended')
      navigate(`/vstudio/recap/${session.id}`)
    } catch (err) {
      toast.error('Failed to end session')
    }
  }

  const handleStartPoll = async (dpId: string) => {
    if (!session) return
    try {
      await startDecisionPoint(session.id, dpId)
      await refresh()
      toast.success('Poll started!')
    } catch (err) {
      toast.error('Failed to start poll')
    }
  }

  const handleEndPoll = async (dpId: string) => {
    if (!session) return
    try {
      await endDecisionPoint(session.id, dpId)
      await refresh()
      toast.success('Poll ended')
    } catch (err) {
      toast.error('Failed to end poll')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (error || !session) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <VideoCamera size={64} className="mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'Unable to load session'}</p>
          <Link to="/artist">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const isLive = session.status === 'LIVE'
  const pendingPolls = session.decisionPoints.filter((dp) => dp.status === 'PENDING')
  const completedPolls = session.decisionPoints.filter((dp) => dp.status === 'COMPLETED')

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <VideoCamera size={28} weight="duotone" className="text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{session.title}</h1>
                <Badge
                  variant={isLive ? 'default' : 'secondary'}
                  className={isLive ? 'bg-red-500/20 text-red-400 animate-pulse' : ''}
                >
                  {session.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">by {session.artistName}</p>
            </div>
          </div>

          {isArtist && (
            <div className="flex gap-2">
              {!isLive && session.status !== 'COMPLETED' && (
                <Button onClick={handleGoLive} className="gap-2 bg-red-500 hover:bg-red-600">
                  <Play size={18} weight="fill" />
                  Go Live
                </Button>
              )}
              {isLive && (
                <Button onClick={handleEndSession} variant="destructive" className="gap-2">
                  <Stop size={18} weight="fill" />
                  End Session
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Gating Alert */}
        {!gatingStatus.hasAccess && (
          <Alert variant="default" className="bg-warning/10 border-warning/30">
            <Lock size={18} className="text-warning" />
            <AlertDescription>
              <strong>Access Required:</strong> {gatingStatus.missingRequirements?.join(', ')}
              {gatingStatus.ctaType && (
                <Button variant="link" className="ml-2 p-0 h-auto">
                  {gatingStatus.ctaType === 'BUY_NFT' && 'Buy NFT'}
                  {gatingStatus.ctaType === 'BUY_COIN' && 'Get Artist Coins'}
                  {gatingStatus.ctaType === 'SUBSCRIBE' && 'Subscribe'}
                  {gatingStatus.ctaType === 'CONNECT_WALLET' && 'Connect Wallet'}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Placeholder */}
            <Card className="border-border/60 overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {isLive ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                    </div>
                    <p className="text-lg font-semibold">Live Stream</p>
                    <p className="text-sm text-muted-foreground">
                      Stream player will be integrated here
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <VideoCamera size={64} className="mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {session.status === 'COMPLETED'
                        ? 'Session has ended'
                        : 'Stream will appear when session goes live'}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Active Decision Point */}
            {activeDecisionPoint && (
              <ActivePollCard
                decisionPoint={activeDecisionPoint}
                isArtist={isArtist}
                onEndPoll={() => handleEndPoll(activeDecisionPoint.id)}
                onVote={async (optionId) => {
                  // TODO: Implement voting
                  toast.info('Voting will be implemented with backend')
                }}
              />
            )}

            {/* Completed Polls */}
            {completedPolls.length > 0 && (
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle size={20} className="text-secondary" />
                    Completed Decisions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedPolls.map((dp) => (
                    <div
                      key={dp.id}
                      className="p-3 bg-muted/30 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{dp.question}</p>
                        <p className="text-sm text-muted-foreground">
                          Result: <strong className="text-accent">{dp.result}</strong>
                        </p>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat Placeholder */}
            <Card className="border-border/60 h-[400px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChatCircle size={20} />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ChatCircle size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Chat integration coming soon</p>
                  <p className="text-xs mt-1">Will aggregate from multiple platforms</p>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Decision Points (Artist Only) */}
            {isArtist && pendingPolls.length > 0 && (
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock size={20} />
                    Upcoming Decisions
                  </CardTitle>
                  <CardDescription>Start polls when you're ready</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingPolls.map((dp) => (
                    <div
                      key={dp.id}
                      className="p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="capitalize">
                          {dp.type.toLowerCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {dp.durationSeconds}s
                        </span>
                      </div>
                      <p className="text-sm mb-2">{dp.question || 'No question set'}</p>
                      {isLive && (
                        <Button
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => handleStartPoll(dp.id)}
                          disabled={!!activeDecisionPoint}
                        >
                          <Play size={14} />
                          Start Poll
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Session Info */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={isLive ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Decision Points</span>
                  <span>{session.decisionPoints.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span>{completedPolls.length}</span>
                </div>
                {session.masterInProgress && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground">Working on:</span>
                      <p className="font-medium mt-1">{session.masterInProgress.title}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Active Poll Card Component
function ActivePollCard({
  decisionPoint,
  isArtist,
  onEndPoll,
  onVote,
}: {
  decisionPoint: DecisionPoint
  isArtist: boolean
  onEndPoll: () => void
  onVote: (optionId: string) => void
}) {
  const { secondsRemaining, progress, isExpired } = useDecisionPointCountdown(decisionPoint)
  const totalVotes = decisionPoint.options.reduce((sum, o) => sum + o.votes, 0)

  return (
    <Card className="border-accent/40 bg-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChartPie size={24} className="text-accent" />
            Active Poll
          </CardTitle>
          {isArtist && (
            <Button size="sm" variant="outline" onClick={onEndPoll}>
              End Poll
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">{decisionPoint.question}</h3>

        {/* Timer */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Time Remaining</span>
            <span className={secondsRemaining < 10 ? 'text-destructive font-bold' : ''}>
              {secondsRemaining}s
            </span>
          </div>
          <Progress value={100 - progress} className="h-2" />
        </div>

        {/* Options */}
        <div className="space-y-2">
          {decisionPoint.options.map((option) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
            return (
              <button
                key={option.id}
                onClick={() => onVote(option.id)}
                className="w-full p-3 bg-background rounded-lg border border-border hover:border-accent/40 transition-colors text-left"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {option.votes} vote{option.votes !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Total votes: {totalVotes}
        </p>
      </CardContent>
    </Card>
  )
}
