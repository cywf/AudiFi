import { useState, useEffect, useCallback } from 'react'
import type { VStudioSession, DecisionPoint } from '@/types'
import { getSessionById, submitVote, startDecisionPoint, endDecisionPoint } from '@/api/vstudio'

interface UseVStudioSessionOptions {
  sessionId: string
  isArtist?: boolean
}

interface UseVStudioSessionReturn {
  session: VStudioSession | null
  loading: boolean
  error: string | null
  activeDecisionPoint: DecisionPoint | null
  // Actions
  vote: (decisionPointId: string, optionId: string) => Promise<void>
  startPoll: (decisionPointId: string) => Promise<void>
  endPoll: (decisionPointId: string) => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Hook for managing V Studio session state and interactions.
 * 
 * TODO: Replace with real-time WebSocket connection when backend is ready.
 * Currently uses polling to simulate real-time updates.
 */
export function useVStudioSession({
  sessionId,
  isArtist = false,
}: UseVStudioSessionOptions): UseVStudioSessionReturn {
  const [session, setSession] = useState<VStudioSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    try {
      const data = await getSessionById(sessionId)
      if (data) {
        setSession(data)
        setError(null)
      } else {
        setError('Session not found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchSession()

    // TODO: Replace with WebSocket connection for real-time updates
    // Polling every 3 seconds as a placeholder
    const pollInterval = setInterval(fetchSession, 3000)
    return () => clearInterval(pollInterval)
  }, [fetchSession])

  const activeDecisionPoint =
    session?.decisionPoints.find((dp) => dp.status === 'ACTIVE') || null

  const vote = async (decisionPointId: string, optionId: string) => {
    try {
      await submitVote(sessionId, decisionPointId, optionId)
      await fetchSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote')
      throw err
    }
  }

  const startPoll = async (decisionPointId: string) => {
    if (!isArtist) {
      throw new Error('Only artists can start polls')
    }
    try {
      await startDecisionPoint(sessionId, decisionPointId)
      await fetchSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start poll')
      throw err
    }
  }

  const endPoll = async (decisionPointId: string) => {
    if (!isArtist) {
      throw new Error('Only artists can end polls')
    }
    try {
      await endDecisionPoint(sessionId, decisionPointId)
      await fetchSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end poll')
      throw err
    }
  }

  return {
    session,
    loading,
    error,
    activeDecisionPoint,
    vote,
    startPoll,
    endPoll,
    refresh: fetchSession,
  }
}

interface UseDecisionPointCountdownReturn {
  secondsRemaining: number
  progress: number
  isExpired: boolean
}

/**
 * Hook for managing decision point countdown timers.
 */
export function useDecisionPointCountdown(
  decisionPoint: DecisionPoint | null
): UseDecisionPointCountdownReturn {
  const [secondsRemaining, setSecondsRemaining] = useState(0)

  useEffect(() => {
    if (!decisionPoint || decisionPoint.status !== 'ACTIVE' || !decisionPoint.startedAt) {
      setSecondsRemaining(0)
      return
    }

    const startTime = new Date(decisionPoint.startedAt).getTime()
    const endTime = startTime + decisionPoint.durationSeconds * 1000

    const updateCountdown = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))
      setSecondsRemaining(remaining)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [decisionPoint])

  const duration = decisionPoint?.durationSeconds || 0
  const progress = duration > 0 ? ((duration - secondsRemaining) / duration) * 100 : 0
  const isExpired = secondsRemaining === 0

  return { secondsRemaining, progress, isExpired }
}
