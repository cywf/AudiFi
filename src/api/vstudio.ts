import type {
  VStudioSession,
  CreateVStudioSessionPayload,
  DecisionPoint,
  SessionRecap,
  VStudioSessionStatus,
} from '@/types'

const SESSIONS_STORAGE_KEY = 'audifi.vstudioSessions'
const RECAPS_STORAGE_KEY = 'audifi.sessionRecaps'

const mockSessions: VStudioSession[] = [
  {
    id: 'session_001',
    title: 'Making "Summer Vibes" - Live Production',
    description: 'Join me as I finalize the production on my upcoming summer EP. Your votes will shape the final mix!',
    artistId: 'user_001',
    artistName: 'Alex Rivera',
    masterInProgress: {
      id: 'master_ipo_002',
      title: 'Summer Vibes EP',
      coverImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    },
    scheduledStartTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'SCHEDULED',
    gating: {
      type: 'OPEN',
    },
    decisionPoints: [
      {
        id: 'dp_001',
        sessionId: 'session_001',
        type: 'POLL',
        question: 'Which synth sound should we use for the lead?',
        options: [
          { id: 'opt_1', label: 'Warm Analog', votes: 0 },
          { id: 'opt_2', label: 'Bright Digital', votes: 0 },
          { id: 'opt_3', label: 'Lo-Fi Tape', votes: 0 },
        ],
        durationSeconds: 60,
        status: 'PENDING',
        gating: { type: 'OPEN' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'dp_002',
        sessionId: 'session_001',
        type: 'SLIDER',
        question: 'How much reverb on the vocals? (0-100%)',
        options: [
          { id: 'opt_slider', label: 'Reverb Amount', votes: 0 },
        ],
        durationSeconds: 45,
        status: 'PENDING',
        gating: { type: 'NFT', requirements: { nftMasterIPOId: 'master_ipo_001', nftMinAmount: 1 } },
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockRecaps: SessionRecap[] = [
  {
    id: 'recap_001',
    sessionId: 'session_past_001',
    sessionTitle: 'Creating "Midnight Pulse" - Live Session',
    artistName: 'Alex Rivera',
    duration: 120,
    totalViewers: 1250,
    peakViewers: 890,
    decisionPoints: [
      {
        id: 'dpr_001',
        question: 'Which drum pattern should we use?',
        winningOption: 'Punchy 808s',
        totalVotes: 456,
        optionResults: [
          { label: 'Punchy 808s', votes: 234, percentage: 51.3 },
          { label: 'Classic House', votes: 156, percentage: 34.2 },
          { label: 'Breakbeat', votes: 66, percentage: 14.5 },
        ],
      },
    ],
    keyMoments: [
      { timestamp: 1200, description: 'First poll: Drum pattern selection', type: 'DECISION' },
      { timestamp: 3600, description: 'Vocal recording take 3 - The one!', type: 'HIGHLIGHT' },
      { timestamp: 6800, description: 'Final Master Lock achieved', type: 'MILESTONE' },
    ],
    finalMasterLocked: true,
    masterIPOLaunched: true,
    masterIPOId: 'master_ipo_001',
    createdAt: new Date('2024-11-01').toISOString(),
  },
]

function getStoredSessions(): VStudioSession[] {
  const stored = localStorage.getItem(SESSIONS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(mockSessions))
  return mockSessions
}

function saveSessions(sessions: VStudioSession[]): void {
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
}

function getStoredRecaps(): SessionRecap[] {
  const stored = localStorage.getItem(RECAPS_STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(RECAPS_STORAGE_KEY, JSON.stringify(mockRecaps))
  return mockRecaps
}

function saveRecaps(recaps: SessionRecap[]): void {
  localStorage.setItem(RECAPS_STORAGE_KEY, JSON.stringify(recaps))
}

// Session CRUD operations

export async function getSessionsForArtist(artistId: string): Promise<VStudioSession[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sessions = getStoredSessions()
      resolve(sessions.filter((s) => s.artistId === artistId))
    }, 400)
  })
}

export async function getSessionById(id: string): Promise<VStudioSession | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sessions = getStoredSessions()
      resolve(sessions.find((s) => s.id === id) || null)
    }, 300)
  })
}

export async function getUpcomingSessions(): Promise<VStudioSession[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sessions = getStoredSessions()
      const now = new Date()
      resolve(
        sessions.filter(
          (s) =>
            (s.status === 'SCHEDULED' || s.status === 'LIVE') &&
            (!s.scheduledStartTime || new Date(s.scheduledStartTime) >= now)
        )
      )
    }, 400)
  })
}

export async function getLiveSessions(): Promise<VStudioSession[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sessions = getStoredSessions()
      resolve(sessions.filter((s) => s.status === 'LIVE'))
    }, 300)
  })
}

export async function createSession(
  payload: CreateVStudioSessionPayload,
  artistId: string,
  artistName: string
): Promise<VStudioSession> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sessions = getStoredSessions()
      const sessionId = `session_${Date.now()}`

      const newSession: VStudioSession = {
        id: sessionId,
        ...payload,
        artistId,
        artistName,
        status: 'DRAFT',
        decisionPoints: payload.decisionPoints.map((dp, i) => ({
          ...dp,
          id: `dp_${sessionId}_${i}`,
          sessionId,
          createdAt: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      sessions.push(newSession)
      saveSessions(sessions)
      resolve(newSession)
    }, 500)
  })
}

export async function updateSessionStatus(
  id: string,
  status: VStudioSessionStatus
): Promise<VStudioSession> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const sessions = getStoredSessions()
      const index = sessions.findIndex((s) => s.id === id)
      if (index === -1) {
        reject(new Error('Session not found'))
        return
      }

      const updated: VStudioSession = {
        ...sessions[index],
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'LIVE' ? { actualStartTime: new Date().toISOString() } : {}),
        ...(status === 'COMPLETED' ? { endTime: new Date().toISOString() } : {}),
      }

      sessions[index] = updated
      saveSessions(sessions)
      resolve(updated)
    }, 500)
  })
}

export async function goLive(id: string): Promise<VStudioSession> {
  return updateSessionStatus(id, 'LIVE')
}

export async function endSession(id: string): Promise<VStudioSession> {
  return updateSessionStatus(id, 'COMPLETED')
}

// Decision Point operations

export async function startDecisionPoint(
  sessionId: string,
  decisionPointId: string
): Promise<DecisionPoint> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const sessions = getStoredSessions()
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId)
      if (sessionIndex === -1) {
        reject(new Error('Session not found'))
        return
      }

      const session = sessions[sessionIndex]
      const dpIndex = session.decisionPoints.findIndex((dp) => dp.id === decisionPointId)
      if (dpIndex === -1) {
        reject(new Error('Decision point not found'))
        return
      }

      const updatedDP: DecisionPoint = {
        ...session.decisionPoints[dpIndex],
        status: 'ACTIVE',
        startedAt: new Date().toISOString(),
      }

      sessions[sessionIndex].decisionPoints[dpIndex] = updatedDP
      saveSessions(sessions)
      resolve(updatedDP)
    }, 300)
  })
}

export async function submitVote(
  sessionId: string,
  decisionPointId: string,
  optionId: string
): Promise<DecisionPoint> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const sessions = getStoredSessions()
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId)
      if (sessionIndex === -1) {
        reject(new Error('Session not found'))
        return
      }

      const session = sessions[sessionIndex]
      const dpIndex = session.decisionPoints.findIndex((dp) => dp.id === decisionPointId)
      if (dpIndex === -1) {
        reject(new Error('Decision point not found'))
        return
      }

      const dp = session.decisionPoints[dpIndex]
      const optionIndex = dp.options.findIndex((o) => o.id === optionId)
      if (optionIndex === -1) {
        reject(new Error('Option not found'))
        return
      }

      dp.options[optionIndex].votes += 1
      sessions[sessionIndex].decisionPoints[dpIndex] = dp
      saveSessions(sessions)
      resolve(dp)
    }, 200)
  })
}

export async function endDecisionPoint(
  sessionId: string,
  decisionPointId: string
): Promise<DecisionPoint> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const sessions = getStoredSessions()
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId)
      if (sessionIndex === -1) {
        reject(new Error('Session not found'))
        return
      }

      const session = sessions[sessionIndex]
      const dpIndex = session.decisionPoints.findIndex((dp) => dp.id === decisionPointId)
      if (dpIndex === -1) {
        reject(new Error('Decision point not found'))
        return
      }

      const dp = session.decisionPoints[dpIndex]
      const winningOption = dp.options.reduce((a, b) => (a.votes > b.votes ? a : b))

      const updatedDP: DecisionPoint = {
        ...dp,
        status: 'COMPLETED',
        result: winningOption.label,
        endedAt: new Date().toISOString(),
      }

      sessions[sessionIndex].decisionPoints[dpIndex] = updatedDP
      saveSessions(sessions)
      resolve(updatedDP)
    }, 300)
  })
}

// Session Recap operations

export async function getRecapBySessionId(sessionId: string): Promise<SessionRecap | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recaps = getStoredRecaps()
      resolve(recaps.find((r) => r.sessionId === sessionId) || null)
    }, 300)
  })
}

export async function getRecapsForArtist(artistName: string): Promise<SessionRecap[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recaps = getStoredRecaps()
      resolve(recaps.filter((r) => r.artistName === artistName))
    }, 400)
  })
}

export async function createSessionRecap(
  session: VStudioSession,
  additionalData: {
    totalViewers: number
    peakViewers: number
    keyMoments: SessionRecap['keyMoments']
    finalMasterLocked: boolean
    masterIPOLaunched: boolean
    masterIPOId?: string
  }
): Promise<SessionRecap> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recaps = getStoredRecaps()

      const duration = session.actualStartTime && session.endTime
        ? Math.round(
            (new Date(session.endTime).getTime() - new Date(session.actualStartTime).getTime()) /
              60000
          )
        : 0

      const newRecap: SessionRecap = {
        id: `recap_${Date.now()}`,
        sessionId: session.id,
        sessionTitle: session.title,
        artistName: session.artistName,
        duration,
        ...additionalData,
        decisionPoints: session.decisionPoints
          .filter((dp) => dp.status === 'COMPLETED')
          .map((dp) => {
            const totalVotes = dp.options.reduce((sum, o) => sum + o.votes, 0)
            return {
              id: dp.id,
              question: dp.question,
              winningOption: dp.result || 'N/A',
              totalVotes,
              optionResults: dp.options.map((o) => ({
                label: o.label,
                votes: o.votes,
                percentage: totalVotes > 0 ? Math.round((o.votes / totalVotes) * 1000) / 10 : 0,
              })),
            }
          }),
        createdAt: new Date().toISOString(),
      }

      recaps.push(newRecap)
      saveRecaps(recaps)
      resolve(newRecap)
    }, 500)
  })
}
