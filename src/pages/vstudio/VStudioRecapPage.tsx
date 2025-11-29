import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  VideoCamera,
  CheckCircle,
  Users,
  Clock,
  ChartPie,
  TrendUp,
  Sparkle,
  ArrowRight,
  Trophy,
} from '@phosphor-icons/react'
import { getRecapBySessionId } from '@/api/vstudio'
import type { SessionRecap } from '@/types'

export function VStudioRecapPage() {
  const { id } = useParams<{ id: string }>()
  const [recap, setRecap] = useState<SessionRecap | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRecap() {
      if (!id) return
      try {
        const data = await getRecapBySessionId(id)
        setRecap(data)
      } catch (error) {
        console.error('Failed to load recap:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRecap()
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (!recap) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <VideoCamera size={64} className="mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Recap Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The session recap you're looking for doesn't exist yet.
          </p>
          <Link to="/artist">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
            <CheckCircle size={40} weight="fill" className="text-accent" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{recap.sessionTitle}</h1>
            <p className="text-muted-foreground mt-2">by {recap.artistName}</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Session Complete
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/60">
            <CardContent className="p-4 text-center">
              <Clock size={24} className="mx-auto text-accent mb-2" />
              <p className="text-2xl font-bold">{formatDuration(recap.duration)}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 text-center">
              <Users size={24} className="mx-auto text-secondary mb-2" />
              <p className="text-2xl font-bold">{recap.totalViewers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Viewers</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 text-center">
              <TrendUp size={24} className="mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{recap.peakViewers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Peak Viewers</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 text-center">
              <ChartPie size={24} className="mx-auto text-warning mb-2" />
              <p className="text-2xl font-bold">{recap.decisionPoints.length}</p>
              <p className="text-xs text-muted-foreground">Decisions Made</p>
            </CardContent>
          </Card>
        </div>

        {/* Decision Point Results */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartPie size={24} className="text-accent" />
              Decision Results
            </CardTitle>
            <CardDescription>
              How fans shaped the final master
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {recap.decisionPoints.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No decision points were completed during this session.
              </p>
            ) : (
              recap.decisionPoints.map((dp, index) => (
                <div key={dp.id} className="space-y-3">
                  {index > 0 && <Separator />}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{dp.question}</p>
                      <p className="text-sm text-muted-foreground">
                        {dp.totalVotes.toLocaleString()} total votes
                      </p>
                    </div>
                    <Badge className="bg-accent/20 text-accent-foreground flex items-center gap-1">
                      <Trophy size={14} />
                      {dp.winningOption}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {dp.optionResults.map((opt) => (
                      <div key={opt.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={opt.label === dp.winningOption ? 'font-semibold' : ''}>
                            {opt.label}
                          </span>
                          <span className="text-muted-foreground">
                            {opt.percentage}% ({opt.votes} votes)
                          </span>
                        </div>
                        <Progress
                          value={opt.percentage}
                          className={`h-2 ${opt.label === dp.winningOption ? '' : 'opacity-60'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Key Moments */}
        {recap.keyMoments.length > 0 && (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkle size={24} className="text-warning" />
                Key Moments
              </CardTitle>
              <CardDescription>
                Highlights from the session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recap.keyMoments.map((moment, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="w-16 text-center flex-shrink-0">
                      <span className="text-sm font-mono text-muted-foreground">
                        {Math.floor(moment.timestamp / 60)}:{(moment.timestamp % 60)
                          .toString()
                          .padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            moment.type === 'MILESTONE'
                              ? 'border-accent text-accent'
                              : moment.type === 'HIGHLIGHT'
                              ? 'border-warning text-warning'
                              : ''
                          }
                        >
                          {moment.type}
                        </Badge>
                      </div>
                      <p className="mt-1">{moment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Status */}
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {recap.finalMasterLocked ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <CheckCircle size={28} weight="fill" className="text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">Final Master Locked</p>
                      <p className="text-sm text-muted-foreground">
                        The master has been finalized based on fan decisions
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <VideoCamera size={28} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">Master In Progress</p>
                      <p className="text-sm text-muted-foreground">
                        The master is still being finalized
                      </p>
                    </div>
                  </>
                )}
              </div>
              {recap.masterIPOLaunched && recap.masterIPOId && (
                <Link to={`/master-ipo/${recap.masterIPOId}`}>
                  <Button className="gap-2">
                    View Master IPO
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!recap.masterIPOLaunched && recap.finalMasterLocked && (
            <Link to="/master-ipo/create">
              <Button size="lg" className="gap-2">
                <Sparkle size={20} />
                Launch Master IPO
              </Button>
            </Link>
          )}
          <Link to="/artist">
            <Button variant="outline" size="lg">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}
