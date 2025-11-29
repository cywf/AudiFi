# AudiFi Observability & Network Monitoring

## Overview

This document defines the observability strategy for AudiFi's network infrastructure, covering metrics collection, logging, alerting, and dashboards.

---

## Observability Stack

### Recommended Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| **Metrics** | Prometheus | Time-series metrics collection |
| **Visualization** | Grafana | Dashboards and exploration |
| **Logging** | Loki or ELK | Log aggregation and search |
| **Alerting** | Alertmanager + PagerDuty | Incident notification |
| **Tracing** | OpenTelemetry + Jaeger | Distributed tracing |
| **Uptime** | Better Uptime / Pingdom | External availability |

### Alternative: SaaS Options

| Service | Use Case |
|---------|----------|
| **Datadog** | All-in-one observability |
| **New Relic** | APM + infrastructure |
| **Grafana Cloud** | Managed Prometheus/Loki |
| **Sentry** | Error tracking + performance |

---

## Metrics Collection

### Infrastructure Metrics

| Metric | Source | Purpose |
|--------|--------|---------|
| CPU usage | Node Exporter | Resource monitoring |
| Memory usage | Node Exporter | Resource monitoring |
| Disk I/O | Node Exporter | Storage performance |
| Network I/O | Node Exporter | Bandwidth monitoring |
| Container stats | cAdvisor | Container resources |

### Application Metrics

#### HTTP/API Metrics

```prometheus
# Request count by endpoint and status
http_requests_total{method="GET", path="/v1/tracks", status="200"}

# Request latency histogram
http_request_duration_seconds_bucket{le="0.1"}
http_request_duration_seconds_bucket{le="0.5"}
http_request_duration_seconds_bucket{le="1.0"}

# Active requests
http_requests_in_flight

# Request size
http_request_size_bytes_sum
```

#### WebSocket Metrics

```prometheus
# Active connections
ws_connections_active{session_id="abc123", role="viewer"}

# Total connections (counter)
ws_connections_total{status="connected"}
ws_connections_total{status="disconnected"}

# Messages per second
ws_messages_sent_total
ws_messages_received_total

# Connection duration histogram
ws_connection_duration_seconds_bucket{le="60"}
ws_connection_duration_seconds_bucket{le="300"}
ws_connection_duration_seconds_bucket{le="3600"}

# Errors
ws_errors_total{type="auth_failed"}
ws_errors_total{type="rate_limited"}
ws_errors_total{type="timeout"}
```

#### Database Metrics

```prometheus
# Connection pool
db_connections_active
db_connections_idle
db_connections_waiting

# Query performance
db_query_duration_seconds_bucket{operation="select", table="tracks"}
db_query_duration_seconds_bucket{operation="insert", table="users"}

# Errors
db_errors_total{type="connection_timeout"}
db_errors_total{type="deadlock"}
```

#### External Service Metrics

```prometheus
# Stripe API
stripe_api_requests_total{endpoint="checkout_session", status="success"}
stripe_api_requests_total{endpoint="checkout_session", status="error"}
stripe_api_latency_seconds

# Blockchain RPC
rpc_requests_total{network="ethereum", method="eth_call"}
rpc_latency_seconds{network="base"}
rpc_errors_total{network="ethereum", error="timeout"}

# Email
email_sent_total{type="magic_link", status="success"}
email_sent_total{type="magic_link", status="failed"}
```

---

## Prometheus Configuration

### `prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - /etc/prometheus/rules/*.yml

scrape_configs:
  # Caddy (Reverse Proxy)
  - job_name: 'caddy'
    static_configs:
      - targets: ['caddy:2019']
    metrics_path: /metrics

  # API Server
  - job_name: 'api-server'
    static_configs:
      - targets: ['api-server:9090']
    metrics_path: /metrics

  # WebSocket Server
  - job_name: 'ws-server'
    static_configs:
      - targets: ['ws-server:9091']
    metrics_path: /metrics

  # Worker
  - job_name: 'worker'
    static_configs:
      - targets: ['worker:9092']
    metrics_path: /metrics

  # PostgreSQL Exporter
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Node Exporter (Host metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

---

## Logging Strategy

### Log Levels

| Level | Use Case | Retention |
|-------|----------|-----------|
| ERROR | Application errors, exceptions | 90 days |
| WARN | Degraded performance, retries | 30 days |
| INFO | Request/response, business events | 14 days |
| DEBUG | Detailed diagnostics | 3 days (staging only) |

### Structured Log Format

```json
{
  "timestamp": "2024-11-01T12:00:00.000Z",
  "level": "info",
  "service": "api-server",
  "requestId": "req_abc123",
  "userId": "user_456",
  "method": "POST",
  "path": "/v1/tracks",
  "statusCode": 201,
  "duration_ms": 245,
  "message": "Track created successfully"
}
```

### Log Sources

| Source | Log Type | Format |
|--------|----------|--------|
| Caddy | Access logs | JSON |
| API Server | Application logs | JSON |
| WS Server | Connection/message logs | JSON |
| Worker | Job execution logs | JSON |
| PostgreSQL | Query logs | Text |
| Redis | Command logs | Text |

### PII Handling

**DO NOT LOG:**
- Passwords or tokens
- Full credit card numbers
- Personal addresses
- Email contents

**MASK OR REDACT:**
- Email addresses (show domain only)
- Wallet addresses (truncate)
- Phone numbers (last 4 digits)

```typescript
// Example masking
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  return `${name[0]}***@${domain}`;
};
// user@example.com → u***@example.com
```

---

## Alerting Rules

### Critical Alerts (Page Immediately)

```yaml
groups:
  - name: critical
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) 
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High 5xx error rate ({{ $value | humanizePercentage }})"

      # API Down
      - alert: APIDown
        expr: up{job="api-server"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "API server is down"

      # WebSocket server down
      - alert: WebSocketDown
        expr: up{job="ws-server"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "WebSocket server is down"

      # Database connection failure
      - alert: DatabaseDown
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL database is down"
```

### Warning Alerts (Notify, No Page)

```yaml
  - name: warnings
    rules:
      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, 
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
          ) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P95 latency exceeds 2 seconds"

      # Low disk space
      - alert: LowDiskSpace
        expr: |
          (node_filesystem_avail_bytes{mountpoint="/"} 
           / node_filesystem_size_bytes{mountpoint="/"}) < 0.2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Disk space below 20%"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) 
          / node_memory_MemTotal_bytes > 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Memory usage above 85%"

      # WebSocket connection spike
      - alert: WebSocketConnectionSpike
        expr: |
          rate(ws_connections_total[5m]) > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Unusual WebSocket connection rate"

      # Stripe webhook failures
      - alert: StripeWebhookFailures
        expr: |
          sum(rate(stripe_webhook_errors_total[5m])) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Stripe webhooks failing"
```

### Informational Alerts

```yaml
  - name: info
    rules:
      # New deployment
      - alert: DeploymentDetected
        expr: |
          changes(process_start_time_seconds{job="api-server"}[5m]) > 0
        labels:
          severity: info
        annotations:
          summary: "New API server deployment detected"

      # V Studio session started
      - alert: VStudioSessionActive
        expr: |
          ws_connections_active{session_id=~".+"} > 100
        labels:
          severity: info
        annotations:
          summary: "V Studio session with 100+ viewers"
```

---

## Dashboards

### Overview Dashboard

**Panels:**
1. **Service Health** - Up/down status for all services
2. **Request Rate** - Total requests per second
3. **Error Rate** - 4xx and 5xx rates
4. **Latency** - P50, P95, P99 latencies
5. **Active Users** - Currently active sessions
6. **Resource Usage** - CPU, Memory, Disk

### API Dashboard

**Panels:**
1. **Requests by Endpoint** - Top 10 endpoints by volume
2. **Response Time by Endpoint** - Latency heatmap
3. **Error Rate by Endpoint** - Error percentage
4. **Status Code Distribution** - 2xx, 3xx, 4xx, 5xx
5. **Request Size** - Average request/response size

### WebSocket Dashboard

**Panels:**
1. **Active Connections** - Current connections by role
2. **Connection Rate** - New connections per minute
3. **Disconnection Reasons** - Error types
4. **Message Rate** - Messages sent/received per second
5. **Session Distribution** - Connections per session
6. **Connection Duration** - Average session length

### V Studio Dashboard

**Panels:**
1. **Active Sessions** - Currently live sessions
2. **Viewers per Session** - Viewer counts
3. **Message Volume** - Chat messages per minute
4. **Poll Activity** - Votes cast
5. **Chat Platforms** - Messages by source (Twitch, YouTube, etc.)
6. **Peak Concurrency** - Maximum simultaneous viewers

### Database Dashboard

**Panels:**
1. **Connections** - Active, idle, waiting
2. **Query Rate** - Queries per second
3. **Query Latency** - Average query time
4. **Slow Queries** - Queries > 1 second
5. **Table Sizes** - Storage by table
6. **Index Usage** - Hit rates

### External Services Dashboard

**Panels:**
1. **Stripe Status** - API success rate
2. **RPC Latency** - Blockchain RPC response times
3. **Email Delivery** - Success/failure rates
4. **OAuth Logins** - Success by provider
5. **External API Errors** - Failures by service

---

## Uptime Monitoring

### External Checks

| Check | URL | Interval | Alert Threshold |
|-------|-----|----------|-----------------|
| Landing Page | `https://audifi.io` | 1 min | 2 failures |
| App | `https://app.audifi.io` | 1 min | 2 failures |
| API Health | `https://api.audifi.io/health` | 30 sec | 2 failures |
| SSL Expiry | `https://api.audifi.io` | 1 day | 14 days |

### Health Check Endpoint

```typescript
// GET /health
app.get('/health', async (req, res) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      rpc: await checkRpc()
    }
  };

  const allHealthy = Object.values(checks.checks)
    .every(c => c.status === 'healthy');

  res.status(allHealthy ? 200 : 503).json(checks);
});

// Response example
{
  "status": "healthy",
  "timestamp": "2024-11-01T12:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": { "status": "healthy", "latency_ms": 5 },
    "redis": { "status": "healthy", "latency_ms": 1 },
    "rpc": { "status": "healthy", "latency_ms": 45 }
  }
}
```

---

## Log Aggregation

### Loki Configuration

```yaml
# loki-config.yml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s
```

### Promtail Configuration

```yaml
# promtail-config.yml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: containers
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
```

---

## Tracing (OpenTelemetry)

### Instrumentation Example

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('audifi-api');

app.get('/v1/tracks/:id', async (req, res) => {
  const span = tracer.startSpan('getTrack');
  
  try {
    span.setAttribute('track.id', req.params.id);
    
    // Database query
    const dbSpan = tracer.startSpan('db.query', { parent: span });
    const track = await db.track.findUnique({ where: { id: req.params.id } });
    dbSpan.end();
    
    res.json(track);
  } finally {
    span.end();
  }
});
```

### Key Traces to Capture

| Operation | Spans |
|-----------|-------|
| API Request | HTTP → Auth → Handler → DB → Response |
| WebSocket Message | Receive → Auth → Process → Broadcast |
| Stripe Webhook | Receive → Verify → Process → DB Update |
| Blockchain Call | Request → RPC → Parse → Cache Update |

---

## Retention Policies

| Data Type | Retention | Storage Estimate |
|-----------|-----------|------------------|
| Metrics (raw) | 15 days | ~1 GB |
| Metrics (downsampled) | 1 year | ~5 GB |
| Logs (ERROR/WARN) | 90 days | ~10 GB |
| Logs (INFO) | 14 days | ~20 GB |
| Traces | 7 days | ~5 GB |
| Uptime history | 1 year | ~100 MB |

---

## Runbook References

### High Error Rate

1. Check Grafana error dashboard for affected endpoints
2. Review recent deployments
3. Check database and Redis connectivity
4. Review error logs in Loki
5. Scale services if load-related
6. Rollback if deployment-related

### High Latency

1. Check database query times
2. Review external API latencies (Stripe, RPC)
3. Check for connection pool exhaustion
4. Review slow query logs
5. Scale database resources if needed

### WebSocket Connection Issues

1. Check WS server health and memory
2. Review connection error types
3. Check Redis Pub/Sub health
4. Review client-side reconnection behavior
5. Scale WS server replicas if needed

---

## Summary

### Quick Reference

| Need | Tool | Location |
|------|------|----------|
| See current metrics | Grafana | `http://grafana:3000` |
| Search logs | Loki/Grafana | `http://grafana:3000/explore` |
| View traces | Jaeger | `http://jaeger:16686` |
| Check uptime | Better Uptime | External dashboard |
| View alerts | Alertmanager | `http://alertmanager:9093` |

### Key Contacts

| Alert Severity | Notification |
|----------------|--------------|
| Critical | PagerDuty → On-call |
| Warning | Slack #audifi-alerts |
| Info | Slack #audifi-monitoring |

---

## Related Documents

- [Network Topology](./audifi-network-topology.md)
- [Security Alignment](./audifi-security-alignment.md)
- [External Integrations](./audifi-external-integrations.md)
