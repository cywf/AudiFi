# V Studio Rehearsal Runbook

> End-to-end testing guide for V Studio functionality

## Overview

This runbook guides QA and DevOps through a complete V Studio rehearsal, testing all roles and functionality before production release.

> **Status:** 🔄 PLANNED - V Studio is in development.

---

## Prerequisites

### Environment

- [ ] Staging environment deployed
- [ ] Test accounts created for each role
- [ ] Test master uploaded
- [ ] WebSocket connectivity verified

### Test Accounts

| Role | Account | Notes |
|------|---------|-------|
| Artist | artist@test.audifi.io | Has test master |
| Producer | producer@test.audifi.io | Verified producer badge |
| Viewer 1 | viewer1@test.audifi.io | NFT holder |
| Viewer 2 | viewer2@test.audifi.io | Public access |
| Admin | admin@test.audifi.io | Platform admin |

---

## Rehearsal Scenario

```
TEST SCENARIO: "Electric Dreams" V Studio Session
═════════════════════════════════════════════════

Artist: TestArtist
Track: "Electric Dreams" (near-final mix)

Decision Points:
1. Hook Selection (A vs B)
2. Bridge Length (8 bars vs 16 bars)
3. Cover Artwork (3 options)

Access: Public viewing, NFT holders can vote

Duration: 2 hours
```

---

## Phase 1: Session Setup (Artist)

### 1.1 Login as Artist

- [ ] Login to staging as artist@test.audifi.io
- [ ] Verify dashboard loads
- [ ] Confirm test master is visible

### 1.2 Create V Studio Session

- [ ] Navigate to test master
- [ ] Click "Launch V Studio Session"
- [ ] Configure session:
  - [ ] Session name: "Electric Dreams V Studio"
  - [ ] Access type: Public view, NFT vote
  - [ ] Duration: 2 hours
  - [ ] Scheduled start: Now

### 1.3 Add Decision Points

Add the following decisions:

**Decision 1: Hook Selection**
- [ ] Title: "Which hook version?"
- [ ] Type: Audio selection
- [ ] Options: Hook A, Hook B
- [ ] Voting: NFT holders only

**Decision 2: Bridge Length**
- [ ] Title: "Bridge length preference?"
- [ ] Type: Multiple choice
- [ ] Options: 8 bars, 16 bars
- [ ] Voting: NFT holders only

**Decision 3: Cover Artwork**
- [ ] Title: "Cover artwork choice?"
- [ ] Type: Image selection
- [ ] Options: Artwork 1, 2, 3
- [ ] Voting: All participants

### 1.4 Launch Session

- [ ] Review session configuration
- [ ] Click "Go Live"
- [ ] Verify session status changes to "Active"
- [ ] Note session URL for other testers

---

## Phase 2: Producer Participation

### 2.1 Login as Producer

- [ ] Login to staging as producer@test.audifi.io
- [ ] Navigate to active V Studio session

### 2.2 Join Session

- [ ] Join session successfully
- [ ] Verify producer badge displayed
- [ ] Confirm can see all decision points

### 2.3 Submit Contribution

- [ ] Navigate to Hook Selection decision
- [ ] Click "Submit Alternative"
- [ ] Upload alternative hook audio
- [ ] Add description: "Producer remix version"
- [ ] Submit contribution
- [ ] Verify contribution appears in decision

### 2.4 Interact

- [ ] Post comment on session
- [ ] Vote on artwork (if eligible)
- [ ] Verify real-time updates working

---

## Phase 3: Viewer with NFT (Voting)

### 3.1 Login as NFT Holder

- [ ] Login as viewer1@test.audifi.io
- [ ] Verify NFT holdings displayed
- [ ] Navigate to V Studio session

### 3.2 Join and Vote

- [ ] Join session successfully
- [ ] Verify voting buttons available for gated decisions
- [ ] Cast vote on Hook Selection: Vote A
- [ ] Cast vote on Bridge Length: Vote 16 bars
- [ ] Cast vote on Artwork: Vote Option 2

### 3.3 Verify Real-Time

- [ ] Watch vote counts update in real-time
- [ ] Verify vote confirmation message
- [ ] Check vote is recorded in session state

---

## Phase 4: Public Viewer (Limited Access)

### 4.1 Login as Public User

- [ ] Login as viewer2@test.audifi.io
- [ ] Verify no NFT holdings
- [ ] Navigate to V Studio session

### 4.2 Test Access Restrictions

- [ ] Verify can view session
- [ ] Verify can see audio previews
- [ ] Verify CANNOT vote on gated decisions (Hook, Bridge)
- [ ] Verify CAN vote on public decision (Artwork)

### 4.3 Test Upgrade Path

- [ ] Click "Get NFT to Vote"
- [ ] Verify redirect to marketplace or IPO page

---

## Phase 5: Artist Controls

### 5.1 Monitor Session

- [ ] As artist, view participant count
- [ ] Review vote tallies
- [ ] Check producer contributions

### 5.2 Close Decision

- [ ] Close Hook Selection decision
- [ ] Verify "Closed" status displayed
- [ ] Select winning option (based on votes or artist choice)
- [ ] Verify decision marked as "Finalized"

### 5.3 Accept/Reject Contribution

- [ ] Review producer's alternative hook
- [ ] Accept or reject contribution
- [ ] Verify producer notified

---

## Phase 6: Session Completion

### 6.1 Close All Decisions

- [ ] Close remaining open decisions
- [ ] Finalize all winners
- [ ] Review session summary

### 6.2 Lock Master

- [ ] Click "Lock Master"
- [ ] Confirm final selections
- [ ] Verify master status changes to "LOCKED"
- [ ] Verify V Studio session status changes to "COMPLETE"

### 6.3 Master IPO Flow

- [ ] Verify "Launch IPO" button appears
- [ ] Click to configure IPO
- [ ] Verify V Studio session linked in IPO config

---

## Verification Checklist

### Real-Time Functionality

- [ ] WebSocket connects successfully
- [ ] Vote updates appear for all users
- [ ] Participant count updates
- [ ] Chat messages appear instantly
- [ ] Decision closures reflected immediately

### Access Control

- [ ] Public users can view, not vote on gated
- [ ] NFT holders can vote on all decisions
- [ ] Producer can submit contributions
- [ ] Only artist can close decisions
- [ ] Only artist can lock master

### Data Integrity

- [ ] Votes are counted correctly
- [ ] One vote per user per decision
- [ ] Vote changes recorded properly
- [ ] Final results match tallies

### Edge Cases

- [ ] Late joiner sees correct state
- [ ] Reconnection restores state
- [ ] Vote during close handled gracefully
- [ ] Duplicate submissions prevented

---

## Common Issues

| Issue | Resolution |
|-------|------------|
| WebSocket won't connect | Check ws.staging.audifi.io, verify token |
| Vote not counted | Check user eligibility, verify NFT holdings |
| Decision won't close | Check artist permissions, verify session active |
| Master won't lock | Ensure all decisions finalized |

---

## Post-Rehearsal

### Documentation

- [ ] Record any bugs found
- [ ] Note performance observations
- [ ] Document unexpected behaviors

### Cleanup

- [ ] Delete test session (if needed)
- [ ] Reset test accounts
- [ ] Clear test data from staging

### Sign-Off

- [ ] QA approval
- [ ] DevOps approval
- [ ] Ready for production

---

## Related Documents

- [V Studio Concepts](../concepts/vstudio.md)
- [Master IPO](../concepts/master-ipo.md)
- [Deploying a New Version](./deploying-a-new-version.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
