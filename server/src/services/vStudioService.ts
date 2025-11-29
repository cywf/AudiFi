/**
 * V Studio Session Service
 * 
 * Handles:
 * - Session lifecycle (setup → live → decision lock → IPO launch → complete)
 * - Decision points and polls
 * - Eligibility checks (NFT/Artist Coin/subscription)
 * - Real-time interaction coordination
 * 
 * TODO: Integrate with:
 * - Streaming service (for live video)
 * - Chat service (for real-time interaction)
 * - WebSocket layer (for real-time updates)
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  VStudioSession,
  VStudioSessionStatus,
  VStudioEligibility,
  VStudioDecisionPoint,
  VStudioPollOption,
  VStudioVote,
  DecisionPointStatus,
  SubscriptionPlan
} from '../types/index.js';

// =============================================================================
// IN-MEMORY STORE (Replace with database in production)
// =============================================================================

const sessions: Map<string, VStudioSession> = new Map();
const decisionPoints: Map<string, VStudioDecisionPoint[]> = new Map(); // sessionId -> points
const votes: Map<string, VStudioVote[]> = new Map(); // decisionPointId -> votes

// Initialize with sample data for development
function initializeSampleData(): void {
  const sampleSession: VStudioSession = {
    id: 'session_sample_001',
    artistId: 'user_dev_001',
    masterId: 'master_sample_001',
    title: 'Midnight Pulse - Final Production Session',
    description: 'Join me as I finalize the mix and decide on the album artwork!',
    status: 'completed',
    scheduledStartTime: '2024-11-01T18:00:00Z',
    actualStartTime: '2024-11-01T18:05:00Z',
    endTime: '2024-11-01T20:30:00Z',
    eligibility: {
      requireNFTOwnership: false,
      requireArtistCoin: false,
      requireSubscription: false,
      isPublic: true,
    },
    linkedIpoId: 'ipo_sample_001',
    peakViewers: 1247,
    totalUniqueViewers: 3891,
    createdAt: '2024-10-25T00:00:00Z',
    updatedAt: '2024-11-01T20:30:00Z',
  };
  
  sessions.set(sampleSession.id, sampleSession);

  const sampleDecisionPoints: VStudioDecisionPoint[] = [
    {
      id: 'decision_001',
      sessionId: 'session_sample_001',
      question: 'Which album artwork should we use?',
      options: [
        { id: 'opt_001', text: 'Neon City', voteCount: 523, votePercentage: 42 },
        { id: 'opt_002', text: 'Midnight Pulse', voteCount: 721, votePercentage: 58 },
      ],
      status: 'finalized',
      openedAt: '2024-11-01T19:00:00Z',
      closedAt: '2024-11-01T19:15:00Z',
      winningOptionId: 'opt_002',
      totalVotes: 1244,
      createdAt: '2024-11-01T18:30:00Z',
      updatedAt: '2024-11-01T19:15:00Z',
    },
    {
      id: 'decision_002',
      sessionId: 'session_sample_001',
      question: 'How many NFTs should be in the initial offering?',
      options: [
        { id: 'opt_003', text: '1,000 NFTs', voteCount: 234, votePercentage: 21 },
        { id: 'opt_004', text: '5,000 NFTs', voteCount: 445, votePercentage: 40 },
        { id: 'opt_005', text: '10,000 NFTs', voteCount: 432, votePercentage: 39 },
      ],
      status: 'finalized',
      openedAt: '2024-11-01T20:00:00Z',
      closedAt: '2024-11-01T20:10:00Z',
      winningOptionId: 'opt_004',
      totalVotes: 1111,
      createdAt: '2024-11-01T19:30:00Z',
      updatedAt: '2024-11-01T20:10:00Z',
    },
  ];
  
  decisionPoints.set('session_sample_001', sampleDecisionPoints);
}

initializeSampleData();

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * Create a new V Studio session
 */
export async function createSession(data: {
  artistId: string;
  masterId?: string;
  title: string;
  description?: string;
  scheduledStartTime?: string;
  eligibility?: Partial<VStudioEligibility>;
}): Promise<VStudioSession> {
  const session: VStudioSession = {
    id: `session_${uuidv4()}`,
    artistId: data.artistId,
    masterId: data.masterId,
    title: data.title,
    description: data.description,
    status: 'setup',
    scheduledStartTime: data.scheduledStartTime,
    eligibility: {
      requireNFTOwnership: data.eligibility?.requireNFTOwnership || false,
      requiredNFTContractAddresses: data.eligibility?.requiredNFTContractAddresses,
      requireArtistCoin: data.eligibility?.requireArtistCoin || false,
      requiredArtistCoinAmount: data.eligibility?.requiredArtistCoinAmount,
      requireSubscription: data.eligibility?.requireSubscription || false,
      minimumSubscriptionTier: data.eligibility?.minimumSubscriptionTier,
      isPublic: data.eligibility?.isPublic ?? true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  sessions.set(session.id, session);
  decisionPoints.set(session.id, []);
  
  return session;
}

/**
 * Get a session by ID
 */
export async function getSessionById(id: string): Promise<VStudioSession | null> {
  return sessions.get(id) || null;
}

/**
 * Get sessions by artist
 */
export async function getSessionsByArtist(
  artistId: string,
  options?: {
    status?: VStudioSessionStatus;
    limit?: number;
    offset?: number;
  }
): Promise<VStudioSession[]> {
  let result = Array.from(sessions.values()).filter(
    (s) => s.artistId === artistId
  );

  if (options?.status) {
    result = result.filter((s) => s.status === options.status);
  }

  // Sort by creation date descending
  result.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const offset = options?.offset || 0;
  const limit = options?.limit || 20;
  
  return result.slice(offset, offset + limit);
}

/**
 * Get upcoming public sessions
 */
export async function getUpcomingSessions(
  limit: number = 10
): Promise<VStudioSession[]> {
  const now = new Date();
  
  return Array.from(sessions.values())
    .filter((s) => 
      s.eligibility.isPublic &&
      (s.status === 'scheduled' || s.status === 'live') &&
      (!s.scheduledStartTime || new Date(s.scheduledStartTime) >= now)
    )
    .sort((a, b) => {
      const aTime = a.scheduledStartTime ? new Date(a.scheduledStartTime).getTime() : 0;
      const bTime = b.scheduledStartTime ? new Date(b.scheduledStartTime).getTime() : 0;
      return aTime - bTime;
    })
    .slice(0, limit);
}

/**
 * Update session details
 */
export async function updateSession(
  id: string,
  updates: Partial<Pick<VStudioSession, 
    'title' | 'description' | 'scheduledStartTime' | 'eligibility'
  >>
): Promise<VStudioSession | null> {
  const session = sessions.get(id);
  
  if (!session) {
    return null;
  }

  if (session.status !== 'setup' && session.status !== 'scheduled') {
    throw new Error('Cannot update session after it has started');
  }

  const updatedSession: VStudioSession = {
    ...session,
    ...updates,
    eligibility: updates.eligibility 
      ? { ...session.eligibility, ...updates.eligibility }
      : session.eligibility,
    updatedAt: new Date().toISOString(),
  };

  sessions.set(id, updatedSession);
  
  return updatedSession;
}

/**
 * Transition session to a new status
 */
export async function transitionSession(
  id: string,
  newStatus: VStudioSessionStatus
): Promise<VStudioSession | null> {
  const session = sessions.get(id);
  
  if (!session) {
    return null;
  }

  // Validate state transitions
  const validTransitions: Record<VStudioSessionStatus, VStudioSessionStatus[]> = {
    setup: ['scheduled', 'live', 'canceled'],
    scheduled: ['live', 'canceled'],
    live: ['decision_lock', 'completed', 'canceled'],
    decision_lock: ['ipo_launching', 'completed', 'canceled'],
    ipo_launching: ['completed'],
    completed: [],
    canceled: [],
  };

  if (!validTransitions[session.status].includes(newStatus)) {
    throw new Error(`Invalid transition from ${session.status} to ${newStatus}`);
  }

  const updates: Partial<VStudioSession> = {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  // Set timestamps based on transition
  if (newStatus === 'live' && !session.actualStartTime) {
    updates.actualStartTime = new Date().toISOString();
  }
  
  if (newStatus === 'completed' || newStatus === 'canceled') {
    updates.endTime = new Date().toISOString();
  }

  const updatedSession: VStudioSession = {
    ...session,
    ...updates,
  };

  sessions.set(id, updatedSession);
  
  return updatedSession;
}

/**
 * Start a session (go live)
 */
export async function startSession(id: string): Promise<VStudioSession | null> {
  return transitionSession(id, 'live');
}

/**
 * End a session
 */
export async function endSession(id: string): Promise<VStudioSession | null> {
  return transitionSession(id, 'completed');
}

/**
 * Cancel a session
 */
export async function cancelSession(id: string): Promise<VStudioSession | null> {
  return transitionSession(id, 'canceled');
}

/**
 * Link an IPO to a session
 */
export async function linkIPO(
  sessionId: string,
  ipoId: string
): Promise<VStudioSession | null> {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  const updatedSession: VStudioSession = {
    ...session,
    linkedIpoId: ipoId,
    updatedAt: new Date().toISOString(),
  };

  sessions.set(sessionId, updatedSession);
  
  return updatedSession;
}

/**
 * Update viewer stats
 */
export async function updateViewerStats(
  sessionId: string,
  currentViewers: number
): Promise<VStudioSession | null> {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  const updatedSession: VStudioSession = {
    ...session,
    peakViewers: Math.max(session.peakViewers || 0, currentViewers),
    totalUniqueViewers: (session.totalUniqueViewers || 0) + 1, // Simplified
    updatedAt: new Date().toISOString(),
  };

  sessions.set(sessionId, updatedSession);
  
  return updatedSession;
}

// =============================================================================
// ELIGIBILITY CHECKING
// =============================================================================

/**
 * Check if a user is eligible to participate in a session
 * 
 * TODO: Implement actual on-chain checks for NFT and token ownership
 */
export async function checkEligibility(
  sessionId: string,
  userId: string,
  userSubscription?: SubscriptionPlan,
  _walletAddress?: string
): Promise<{
  eligible: boolean;
  reasons: string[];
}> {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return { eligible: false, reasons: ['Session not found'] };
  }

  // Public sessions are open to everyone
  if (session.eligibility.isPublic) {
    return { eligible: true, reasons: [] };
  }

  const reasons: string[] = [];

  // Check subscription requirement
  if (session.eligibility.requireSubscription) {
    const requiredTier = session.eligibility.minimumSubscriptionTier || 'FREE';
    const tierOrder: Record<SubscriptionPlan, number> = {
      FREE: 0,
      PRO: 1,
      ENTERPRISE: 2,
    };

    if (!userSubscription || tierOrder[userSubscription] < tierOrder[requiredTier]) {
      reasons.push(`Requires ${requiredTier} subscription or higher`);
    }
  }

  // Check NFT ownership requirement
  if (session.eligibility.requireNFTOwnership) {
    // TODO: Check actual NFT ownership on-chain
    // For now, assume not owned
    reasons.push('Requires ownership of specific NFTs');
  }

  // Check Artist Coin requirement
  if (session.eligibility.requireArtistCoin) {
    // TODO: Check actual token balance on-chain
    const requiredAmount = session.eligibility.requiredArtistCoinAmount || '0';
    reasons.push(`Requires holding at least ${requiredAmount} Artist Coins`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

// =============================================================================
// DECISION POINTS & POLLS
// =============================================================================

/**
 * Create a decision point for a session
 */
export async function createDecisionPoint(data: {
  sessionId: string;
  question: string;
  options: string[];
}): Promise<VStudioDecisionPoint> {
  const session = sessions.get(data.sessionId);
  
  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'live' && session.status !== 'decision_lock') {
    throw new Error('Can only create decision points during live sessions');
  }

  const pollOptions: VStudioPollOption[] = data.options.map((text, index) => ({
    id: `opt_${uuidv4().substring(0, 8)}_${index}`,
    text,
    voteCount: 0,
    votePercentage: 0,
  }));

  const decisionPoint: VStudioDecisionPoint = {
    id: `decision_${uuidv4()}`,
    sessionId: data.sessionId,
    question: data.question,
    options: pollOptions,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sessionPoints = decisionPoints.get(data.sessionId) || [];
  sessionPoints.push(decisionPoint);
  decisionPoints.set(data.sessionId, sessionPoints);

  votes.set(decisionPoint.id, []);

  return decisionPoint;
}

/**
 * Get decision points for a session
 */
export async function getDecisionPoints(sessionId: string): Promise<VStudioDecisionPoint[]> {
  return decisionPoints.get(sessionId) || [];
}

/**
 * Get a decision point by ID
 */
export async function getDecisionPointById(id: string): Promise<VStudioDecisionPoint | null> {
  for (const points of decisionPoints.values()) {
    const point = points.find((p) => p.id === id);
    if (point) {
      return point;
    }
  }
  return null;
}

/**
 * Open a decision point for voting
 */
export async function openDecisionPoint(id: string): Promise<VStudioDecisionPoint | null> {
  const point = await getDecisionPointById(id);
  
  if (!point) {
    return null;
  }

  if (point.status !== 'pending') {
    throw new Error('Decision point is not pending');
  }

  const updatedPoint: VStudioDecisionPoint = {
    ...point,
    status: 'open',
    openedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  updateDecisionPointInStore(updatedPoint);
  
  return updatedPoint;
}

/**
 * Close a decision point and calculate results
 */
export async function closeDecisionPoint(id: string): Promise<VStudioDecisionPoint | null> {
  const point = await getDecisionPointById(id);
  
  if (!point) {
    return null;
  }

  if (point.status !== 'open') {
    throw new Error('Decision point is not open');
  }

  const pointVotes = votes.get(id) || [];
  const totalVotes = pointVotes.length;

  // Calculate vote counts and percentages
  const updatedOptions = point.options.map((opt) => {
    const optionVotes = pointVotes.filter((v) => v.optionId === opt.id).length;
    return {
      ...opt,
      voteCount: optionVotes,
      votePercentage: totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0,
    };
  });

  // Find winning option
  const winningOption = updatedOptions.reduce((max, opt) => 
    opt.voteCount > max.voteCount ? opt : max
  , updatedOptions[0]);

  const updatedPoint: VStudioDecisionPoint = {
    ...point,
    options: updatedOptions,
    status: 'closed',
    closedAt: new Date().toISOString(),
    winningOptionId: winningOption.id,
    totalVotes,
    updatedAt: new Date().toISOString(),
  };

  updateDecisionPointInStore(updatedPoint);
  
  return updatedPoint;
}

/**
 * Finalize a decision point (lock results)
 */
export async function finalizeDecisionPoint(id: string): Promise<VStudioDecisionPoint | null> {
  const point = await getDecisionPointById(id);
  
  if (!point) {
    return null;
  }

  if (point.status !== 'closed') {
    throw new Error('Decision point must be closed before finalizing');
  }

  const updatedPoint: VStudioDecisionPoint = {
    ...point,
    status: 'finalized',
    updatedAt: new Date().toISOString(),
  };

  updateDecisionPointInStore(updatedPoint);
  
  return updatedPoint;
}

/**
 * Record a vote on a decision point
 */
export async function recordVote(data: {
  decisionPointId: string;
  optionId: string;
  userId: string;
  walletAddress?: string;
}): Promise<VStudioVote> {
  const point = await getDecisionPointById(data.decisionPointId);
  
  if (!point) {
    throw new Error('Decision point not found');
  }

  if (point.status !== 'open') {
    throw new Error('Decision point is not open for voting');
  }

  // Check if option exists
  const option = point.options.find((o) => o.id === data.optionId);
  if (!option) {
    throw new Error('Invalid option');
  }

  // Check if user already voted
  const pointVotes = votes.get(data.decisionPointId) || [];
  const existingVote = pointVotes.find((v) => v.userId === data.userId);
  
  if (existingVote) {
    throw new Error('User has already voted on this decision point');
  }

  // TODO: Check user eligibility for the session

  const vote: VStudioVote = {
    id: `vote_${uuidv4()}`,
    decisionPointId: data.decisionPointId,
    optionId: data.optionId,
    userId: data.userId,
    walletAddress: data.walletAddress,
    votedAt: new Date().toISOString(),
  };

  pointVotes.push(vote);
  votes.set(data.decisionPointId, pointVotes);

  return vote;
}

/**
 * Get votes for a decision point
 */
export async function getVotes(decisionPointId: string): Promise<VStudioVote[]> {
  return votes.get(decisionPointId) || [];
}

/**
 * Get vote statistics for a decision point
 */
export async function getVoteStats(decisionPointId: string): Promise<{
  totalVotes: number;
  optionBreakdown: Array<{
    optionId: string;
    optionText: string;
    voteCount: number;
    percentage: number;
  }>;
}> {
  const point = await getDecisionPointById(decisionPointId);
  
  if (!point) {
    throw new Error('Decision point not found');
  }

  const pointVotes = votes.get(decisionPointId) || [];
  const totalVotes = pointVotes.length;

  const optionBreakdown = point.options.map((opt) => {
    const optionVotes = pointVotes.filter((v) => v.optionId === opt.id).length;
    return {
      optionId: opt.id,
      optionText: opt.text,
      voteCount: optionVotes,
      percentage: totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0,
    };
  });

  return { totalVotes, optionBreakdown };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function updateDecisionPointInStore(updatedPoint: VStudioDecisionPoint): void {
  const sessionPoints = decisionPoints.get(updatedPoint.sessionId) || [];
  const pointIndex = sessionPoints.findIndex((p) => p.id === updatedPoint.id);
  
  if (pointIndex >= 0) {
    sessionPoints[pointIndex] = updatedPoint;
    decisionPoints.set(updatedPoint.sessionId, sessionPoints);
  }
}
