# AudiFi V Studio Real-Time Connectivity

## Overview

This document defines the real-time connectivity architecture for AudiFi's V Studio feature. V Studio enables artists to host interactive live sessions with fans, featuring real-time polls, votes, chat aggregation, and producer controls.

---

## Core Principles

### AudiFi's Role in Streaming

**Critical Clarification:** AudiFi does NOT host RTMP streams or the base livestream video.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARTIST STREAMING SETUP                           │
│                                                                         │
│  ┌─────────┐     ┌────────────┐     ┌─────────────────────────────────┐│
│  │   OBS   │────▶│  Restream  │────▶│  Twitch | YouTube | TikTok     ││
│  │Streamlabs│    │   or       │     │  (Native Streaming Platforms)  ││
│  └─────────┘     │   Direct   │     └─────────────────────────────────┘│
│                  └────────────┘                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                │ Stream Embed URL
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          AUDIFI V STUDIO                                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     V Studio Web UI                              │   │
│  │  ┌────────────────────────┐    ┌────────────────────────────┐   │   │
│  │  │   Embedded Stream      │    │   Interaction Panel        │   │   │
│  │  │   (iframe/player)      │    │   • Polls & Voting         │   │   │
│  │  │                        │    │   • Chat Aggregation       │   │   │
│  │  │                        │    │   • Fan Reactions          │   │   │
│  │  │                        │    │   • Token-Gated Content    │   │   │
│  │  └────────────────────────┘    └────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                     │
│                                   │ WebSocket / SSE                     │
│                                   ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  AudiFi Real-Time Backend                        │   │
│  │            (Polls, Votes, Session State, Chat Routing)           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Real-Time Technology Stack

### Primary: WebSockets

**Protocol:** WebSocket Secure (WSS)  
**Use Case:** Bidirectional real-time communication

**Advantages:**
- Low latency (sub-100ms)
- Bidirectional messaging
- Connection state management
- Wide browser support

### Secondary: Server-Sent Events (SSE)

**Protocol:** HTTPS with `text/event-stream`  
**Use Case:** Broadcast-only channels (fallback)

**Advantages:**
- Simple HTTP-based
- Auto-reconnection
- Works through some proxies that block WebSocket

---

## WebSocket Endpoint Design

### Primary Endpoint

```
wss://api.audifi.io/v1/vstudio/ws
```

**Alternative (Dedicated Subdomain):**
```
wss://studio.audifi.io/ws
```

### Connection Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `sessionId` | query/path | V Studio session identifier |
| `role` | query | `artist` \| `producer` \| `viewer` |

**Example Connection URLs:**
```
wss://api.audifi.io/v1/vstudio/ws?sessionId=abc123&role=viewer
wss://api.audifi.io/v1/vstudio/ws/abc123?role=artist
```

---

## Authentication for Real-Time Connections

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     WEBSOCKET AUTHENTICATION FLOW                        │
└──────────────────────────────────────────────────────────────────────────┘

1. Client authenticates via REST API
   POST https://api.audifi.io/v1/auth/login
   → Returns: { token: "jwt...", user: {...} }

2. Client requests WebSocket ticket (short-lived)
   POST https://api.audifi.io/v1/vstudio/ticket
   Authorization: Bearer <jwt>
   Body: { sessionId: "abc123", role: "viewer" }
   → Returns: { ticket: "short-lived-ticket-xyz", expiresIn: 30 }

3. Client connects to WebSocket with ticket
   wss://api.audifi.io/v1/vstudio/ws?ticket=short-lived-ticket-xyz

4. Server validates ticket and establishes connection
   → Ticket is single-use and expires in 30 seconds
```

### Authentication Methods

| Method | Security | Use Case |
|--------|----------|----------|
| **Ticket (Recommended)** | High | Short-lived token in query param |
| Authorization Header | High | If client supports headers on WS |
| Secure Cookie | Medium | Same-origin patterns |

### Role-Based Access

| Role | Permissions |
|------|-------------|
| `artist` | Full control: start/end session, create polls, view all data |
| `producer` | Manage polls, moderate chat, view analytics |
| `viewer` | Vote, react, send messages (if allowed), view content |
| `token_holder` | Viewer + access to gated content (verified on-chain) |

---

## Message Protocol

### Message Format (JSON)

```typescript
interface WebSocketMessage {
  type: MessageType;
  payload: unknown;
  timestamp: number;       // Unix timestamp (ms)
  requestId?: string;      // For request-response patterns
}

type MessageType =
  // Session management
  | 'session.join'
  | 'session.leave'
  | 'session.state'
  | 'session.end'
  // Polls and voting
  | 'poll.create'
  | 'poll.update'
  | 'poll.end'
  | 'poll.vote'
  | 'poll.results'
  // Chat and reactions
  | 'chat.message'
  | 'chat.aggregate'      // Messages from external platforms
  | 'reaction.send'
  | 'reaction.burst'      // Aggregated reactions
  // Viewer interactions
  | 'tip.send'
  | 'tip.received'
  // System
  | 'error'
  | 'ping'
  | 'pong';
```

### Example Messages

**Join Session:**
```json
{
  "type": "session.join",
  "payload": {
    "sessionId": "abc123",
    "role": "viewer",
    "userId": "user_456"
  },
  "timestamp": 1699123456789
}
```

**Create Poll (Artist/Producer):**
```json
{
  "type": "poll.create",
  "payload": {
    "question": "Which song should I play next?",
    "options": ["Track A", "Track B", "Track C"],
    "duration": 60,
    "allowMultiple": false
  },
  "timestamp": 1699123456789
}
```

**Vote on Poll:**
```json
{
  "type": "poll.vote",
  "payload": {
    "pollId": "poll_789",
    "optionIndex": 1
  },
  "timestamp": 1699123456789
}
```

**Chat Aggregation (From External Platforms):**
```json
{
  "type": "chat.aggregate",
  "payload": {
    "messages": [
      { "platform": "twitch", "username": "user1", "text": "🔥🔥🔥" },
      { "platform": "youtube", "username": "user2", "text": "Love this!" },
      { "platform": "discord", "username": "user3", "text": "Play more!" }
    ]
  },
  "timestamp": 1699123456789
}
```

---

## External Platform Integration

### Chat Aggregation Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL PLATFORMS                               │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │  Twitch  │        │  YouTube │        │  Discord │
   │  API/IRC │        │  API     │        │  API     │
   └────┬─────┘        └────┬─────┘        └────┬─────┘
        │                   │                   │
        └─────────────┬─────┴─────────────┬─────┘
                      │                   │
                      ▼                   ▼
         ┌────────────────────────────────────────────┐
         │         Chat Ingestion Workers             │
         │      (Normalize to Common Format)          │
         └────────────────────┬───────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────────┐
         │              Redis Pub/Sub                 │
         │        Channel: vstudio:{sessionId}        │
         └────────────────────┬───────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────────┐
         │           WebSocket Server                 │
         │    (Broadcast to Connected Clients)        │
         └────────────────────────────────────────────┘
```

### Platform Connection Details

| Platform | Connection Type | API/Protocol |
|----------|-----------------|--------------|
| Twitch | IRC over WebSocket | `wss://irc-ws.chat.twitch.tv` |
| YouTube Live | Polling API | HTTPS REST API |
| TikTok | WebSocket | `wss://webcast.tiktok.com` |
| Discord | Bot Gateway | `wss://gateway.discord.gg` |

### Normalized Chat Message Format

```typescript
interface NormalizedChatMessage {
  id: string;
  platform: 'twitch' | 'youtube' | 'tiktok' | 'discord' | 'audifi';
  username: string;
  displayName?: string;
  text: string;
  badges?: string[];        // Platform-specific badges
  isSubscriber?: boolean;
  isModerator?: boolean;
  timestamp: number;
}
```

---

## Message Broker Layer

### Redis Pub/Sub Configuration

**Purpose:**
- Route events between chat ingestion workers
- Connect V Studio session service with WebSocket servers
- Enable horizontal scaling of WebSocket servers

**Channel Naming:**
```
vstudio:session:{sessionId}:events    # All session events
vstudio:session:{sessionId}:chat      # Chat messages only
vstudio:session:{sessionId}:polls     # Poll events
vstudio:global:announcements          # System-wide announcements
```

### Event Flow

```typescript
// Worker publishes chat message
redis.publish(`vstudio:session:${sessionId}:chat`, JSON.stringify({
  type: 'chat.message',
  payload: normalizedMessage
}));

// WebSocket server subscribes to session
redis.subscribe(`vstudio:session:${sessionId}:*`);
redis.on('message', (channel, message) => {
  // Broadcast to connected clients in this session
  broadcastToSession(sessionId, JSON.parse(message));
});
```

---

## Connection Management

### Heartbeat / Keep-Alive

```
Client                          Server
   │                               │
   │──── ping ────────────────────▶│
   │                               │
   │◀───────────────────── pong ───│
   │                               │
   │ (every 30 seconds)            │
```

**Configuration:**
- Ping interval: 30 seconds
- Pong timeout: 10 seconds
- Max missed pongs: 2 (disconnect after)

### Reconnection Strategy (Client-Side)

```typescript
const reconnectConfig = {
  initialDelay: 1000,      // 1 second
  maxDelay: 30000,         // 30 seconds max
  factor: 2,               // Exponential backoff
  maxRetries: 10,          // Give up after 10 attempts
  jitter: 0.3              // Add randomness to prevent thundering herd
};
```

---

## Rate Limiting

### Per-Connection Limits

| Message Type | Rate Limit | Window |
|--------------|------------|--------|
| `chat.message` | 5 messages | 10 seconds |
| `poll.vote` | 1 vote | per poll |
| `reaction.send` | 10 reactions | 10 seconds |
| Any message | 50 messages | 60 seconds |

### Session-Level Limits

| Limit | Value |
|-------|-------|
| Max viewers per session | 10,000 |
| Max concurrent sessions per artist | 1 |
| Max message size | 4 KB |

---

## Server-Sent Events (Fallback)

### SSE Endpoint

```
GET https://api.audifi.io/v1/vstudio/sse/{sessionId}
Authorization: Bearer <token>
Accept: text/event-stream
```

### SSE Event Format

```
event: poll.update
data: {"pollId":"poll_123","results":[42,58]}
id: 1699123456789

event: chat.aggregate
data: {"messages":[...]}
id: 1699123456790

event: session.state
data: {"viewerCount":1250,"activePoll":"poll_123"}
id: 1699123456791
```

### SSE Limitations

| Feature | WebSocket | SSE |
|---------|-----------|-----|
| Bidirectional | ✅ Yes | ❌ No (server → client only) |
| Send messages | ✅ Direct | Requires REST API call |
| Voting | ✅ Direct | Requires REST API call |
| Connection overhead | Lower | Higher (HTTP headers) |

---

## Session State Management

### Session Data Model

```typescript
interface VStudioSession {
  id: string;
  artistId: string;
  status: 'scheduled' | 'live' | 'ended';
  
  // Stream info (from external platform)
  streamUrl?: string;
  streamPlatform?: 'twitch' | 'youtube' | 'tiktok';
  
  // Connected clients
  viewerCount: number;
  producerIds: string[];
  
  // Active features
  activePoll?: Poll;
  chatEnabled: boolean;
  reactionsEnabled: boolean;
  
  // Token gating
  requiredTokens?: {
    contractAddress: string;
    minBalance: number;
  };
  
  // Timestamps
  scheduledStart?: Date;
  actualStart?: Date;
  endedAt?: Date;
}
```

### State Synchronization

New clients receive full state on connection:

```json
{
  "type": "session.state",
  "payload": {
    "sessionId": "abc123",
    "status": "live",
    "viewerCount": 1250,
    "activePoll": {
      "id": "poll_789",
      "question": "Which song next?",
      "options": ["Track A", "Track B"],
      "results": [425, 312],
      "endsAt": 1699123500000
    },
    "chatEnabled": true,
    "reactionsEnabled": true
  },
  "timestamp": 1699123456789
}
```

---

## Error Handling

### Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 4000 | Invalid ticket | Authentication failed |
| 4001 | Session not found | Session ID doesn't exist |
| 4002 | Session ended | Session has concluded |
| 4003 | Rate limited | Too many messages |
| 4004 | Forbidden | Role doesn't allow action |
| 4005 | Token gate failed | User doesn't hold required tokens |

### Error Message Format

```json
{
  "type": "error",
  "payload": {
    "code": 4003,
    "message": "Rate limited",
    "retryAfter": 10
  },
  "timestamp": 1699123456789
}
```

---

## Monitoring & Observability

### Key Metrics

| Metric | Description |
|--------|-------------|
| `ws_connections_total` | Total active WebSocket connections |
| `ws_connections_by_session` | Connections per session ID |
| `ws_messages_sent_total` | Messages sent to clients |
| `ws_messages_received_total` | Messages received from clients |
| `ws_errors_total` | Connection/message errors |
| `ws_latency_ms` | Message delivery latency |

### Logging

```json
{
  "level": "info",
  "event": "ws_connection",
  "sessionId": "abc123",
  "userId": "user_456",
  "role": "viewer",
  "timestamp": "2024-11-01T12:00:00Z"
}
```

---

## Summary

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary Protocol | WebSocket (WSS) | Bidirectional real-time |
| Fallback | SSE | Broadcast-only |
| Message Broker | Redis Pub/Sub | Event routing, scaling |
| Authentication | Short-lived ticket | Secure WS connections |
| Chat Aggregation | Platform APIs | Twitch, YouTube, Discord, TikTok |

V Studio provides the **interaction layer** on top of existing streaming platforms, focusing on:
- ✅ Polls and voting
- ✅ Chat aggregation from multiple platforms
- ✅ Fan reactions and engagement metrics
- ✅ Token-gated access for special content
- ❌ Video streaming (handled by external platforms)

---

## Related Documents

- [Network Topology](./audifi-network-topology.md)
- [External Integrations](./audifi-external-integrations.md)
- [Security Alignment](./audifi-security-alignment.md)
