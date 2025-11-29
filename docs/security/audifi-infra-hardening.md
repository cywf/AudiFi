# AudiFi Infrastructure Hardening Guide

**Document Version**: 1.0  
**Date**: 2025-01-15  
**Status**: Design Specification

---

## Executive Summary

This document defines the infrastructure security baseline for AudiFi, covering Ubuntu 24.04 LTS server hardening, container security, network configuration, and deployment practices.

---

## 1. Current State Assessment

### 1.1 Repository Infrastructure Assets

| Asset | Status | Notes |
|-------|--------|-------|
| Dockerfiles | ❌ Missing | No container configuration |
| docker-compose | ❌ Missing | No orchestration |
| CI/CD Workflows | ❌ Missing | Only dependabot.yml exists |
| Deployment Scripts | ❌ Missing | No deployment automation |
| Environment Config | ❌ Missing | No .env.example |

### 1.2 Required Infrastructure per Specification

- Ubuntu 24.04 LTS servers
- Containerized backend services
- Network segmentation (API / DB / Internal)
- CI/CD pipelines for frontend (Vercel/Fly.io) and backend

---

## 2. Ubuntu 24.04 LTS Server Hardening

### 2.1 Initial Server Setup

```bash
#!/bin/bash
# /opt/audifi/scripts/server-hardening.sh
# Run as root on fresh Ubuntu 24.04 LTS install

set -euo pipefail

echo "=== AudiFi Server Hardening Script ==="

# Update system
apt-get update && apt-get upgrade -y

# Install essential security packages
apt-get install -y \
  ufw \
  fail2ban \
  unattended-upgrades \
  apt-listchanges \
  needrestart \
  auditd \
  audispd-plugins \
  aide

# Configure automatic security updates
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

systemctl enable unattended-upgrades
systemctl start unattended-upgrades
```

### 2.2 SSH Hardening

```bash
# /etc/ssh/sshd_config.d/99-audifi-hardening.conf

# Disable password authentication
PasswordAuthentication no
ChallengeResponseAuthentication no

# Disable root login
PermitRootLogin no

# Use SSH key authentication only
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

# Limit authentication attempts
MaxAuthTries 3
MaxSessions 3

# Session timeout
ClientAliveInterval 300
ClientAliveCountMax 2

# Disable unused features
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no

# Use strong ciphers only
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org

# Restrict to specific users/groups
AllowGroups audifi-admins

# Logging
LogLevel VERBOSE
```

### 2.3 Firewall Configuration

```bash
#!/bin/bash
# UFW firewall configuration

# Reset to defaults
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# SSH (restrict to bastion/VPN if possible)
ufw allow from 10.0.0.0/8 to any port 22 proto tcp

# HTTP/HTTPS (for API servers only)
ufw allow 80/tcp
ufw allow 443/tcp

# Internal services (adjust based on network topology)
# Database (internal only)
ufw allow from 10.0.1.0/24 to any port 5432 proto tcp
# Redis (internal only)
ufw allow from 10.0.1.0/24 to any port 6379 proto tcp

# Enable firewall
ufw --force enable
ufw status verbose
```

### 2.4 Fail2ban Configuration

```ini
# /etc/fail2ban/jail.local

[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
banaction = ufw

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[audifi-api]
enabled = true
port = http,https
logpath = /var/log/audifi/api-access.log
maxretry = 10
findtime = 60
bantime = 3600

[audifi-auth]
enabled = true
port = http,https
logpath = /var/log/audifi/auth.log
maxretry = 5
findtime = 300
bantime = 7200
```

### 2.5 System Audit Configuration

```bash
# /etc/audit/rules.d/audifi.rules

# Monitor authentication
-w /etc/passwd -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k sudoers

# Monitor SSH config
-w /etc/ssh/sshd_config -p wa -k sshd_config

# Monitor Docker
-w /usr/bin/docker -p x -k docker
-w /var/lib/docker -p wa -k docker
-w /etc/docker -p wa -k docker

# Monitor AudiFi application
-w /opt/audifi -p wa -k audifi

# Network configuration changes
-w /etc/hosts -p wa -k hosts
-w /etc/network/ -p wa -k network
```

---

## 3. Container Security

### 3.1 Base Dockerfile Template

```dockerfile
# Dockerfile.base
# AudiFi secure base image

FROM node:22-alpine AS base

# Security: Run as non-root user
RUN addgroup -g 1001 audifi && \
    adduser -D -u 1001 -G audifi audifi

# Security: Remove unnecessary packages
RUN apk --no-cache add dumb-init && \
    rm -rf /var/cache/apk/*

# Security: Set working directory with proper permissions
WORKDIR /app
RUN chown -R audifi:audifi /app

# Don't run as root
USER audifi

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
```

### 3.2 Backend Service Dockerfile

```dockerfile
# Dockerfile.backend
# AudiFi Backend Service

# Build stage
FROM node:22-alpine AS builder

WORKDIR /build

# Copy package files first (cache layer)
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy source code
COPY --chown=1001:1001 src/ ./src/
COPY --chown=1001:1001 tsconfig.json ./

# Build
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 audifi && \
    adduser -D -u 1001 -G audifi audifi

# Security: Install dumb-init for proper signal handling
RUN apk --no-cache add dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder --chown=audifi:audifi /build/dist ./dist
COPY --from=builder --chown=audifi:audifi /build/node_modules ./node_modules
COPY --from=builder --chown=audifi:audifi /build/package.json ./

# Security: Run as non-root
USER audifi

# Security: Read-only filesystem support
# Writable directories handled via volumes

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Expose port (non-privileged)
EXPOSE 3000

# Use dumb-init as entrypoint
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
```

### 3.3 Docker Compose Configuration

```yaml
# docker-compose.yml
# AudiFi Production Stack

version: "3.9"

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: audifi-api
    restart: unless-stopped
    user: "1001:1001"
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    volumes:
      - type: tmpfs
        target: /app/tmp
        tmpfs:
          size: 50m
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env.production
    ports:
      - "127.0.0.1:3000:3000"  # Only localhost
    networks:
      - api-network
      - db-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  database:
    image: postgres:16-alpine
    container_name: audifi-db
    restart: unless-stopped
    user: "999:999"
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /run/postgresql:noexec,nosuid,size=10m
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
      - POSTGRES_DB=audifi
    secrets:
      - db_password
    networks:
      - db-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d audifi"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: audifi-redis
    restart: unless-stopped
    user: "999:999"
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - api-network
    healthcheck:
      test: ["CMD", "redis-cli", "--pass", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  api-network:
    driver: bridge
    internal: false
  db-network:
    driver: bridge
    internal: true  # No external access

volumes:
  db-data:
  redis-data:

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 3.4 Container Runtime Hardening

```bash
# /etc/docker/daemon.json
{
  "icc": false,
  "userns-remap": "default",
  "no-new-privileges": true,
  "seccomp-profile": "/etc/docker/seccomp-default.json",
  "live-restore": true,
  "userland-proxy": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65536,
      "Soft": 65536
    }
  }
}
```

### 3.5 Seccomp Profile

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "names": [
        "accept", "accept4", "access", "arch_prctl", "bind", "brk",
        "capget", "capset", "chdir", "chmod", "chown", "clock_getres",
        "clock_gettime", "clone", "close", "connect", "dup", "dup2",
        "dup3", "epoll_create", "epoll_create1", "epoll_ctl", "epoll_pwait",
        "epoll_wait", "eventfd", "eventfd2", "execve", "exit", "exit_group",
        "faccessat", "faccessat2", "fadvise64", "fallocate", "fchdir",
        "fchmod", "fchmodat", "fchown", "fchownat", "fcntl", "fdatasync",
        "fgetxattr", "flistxattr", "flock", "fork", "fsetxattr", "fstat",
        "fstatfs", "fsync", "ftruncate", "futex", "getcwd", "getdents",
        "getdents64", "getegid", "geteuid", "getgid", "getgroups",
        "getpeername", "getpgid", "getpgrp", "getpid", "getppid",
        "getpriority", "getrandom", "getresgid", "getresuid", "getrlimit",
        "getrusage", "getsid", "getsockname", "getsockopt", "gettid",
        "gettimeofday", "getuid", "getxattr", "inotify_add_watch",
        "inotify_init", "inotify_init1", "inotify_rm_watch", "ioctl",
        "kill", "lgetxattr", "listen", "llistxattr", "lseek", "lstat",
        "madvise", "memfd_create", "mincore", "mkdir", "mkdirat", "mlock",
        "mlock2", "mlockall", "mmap", "mprotect", "mremap", "msgctl",
        "msgget", "msgrcv", "msgsnd", "msync", "munlock", "munlockall",
        "munmap", "nanosleep", "newfstatat", "open", "openat", "pause",
        "pipe", "pipe2", "poll", "ppoll", "prctl", "pread64",
        "preadv", "prlimit64", "pselect6", "pwrite64", "pwritev", "read",
        "readahead", "readlink", "readlinkat", "readv", "recvfrom",
        "recvmmsg", "recvmsg", "rename", "renameat", "renameat2", "restart_syscall",
        "rmdir", "rt_sigaction", "rt_sigpending", "rt_sigprocmask",
        "rt_sigqueueinfo", "rt_sigreturn", "rt_sigsuspend", "rt_sigtimedwait",
        "rt_tgsigqueueinfo", "sched_getaffinity", "sched_getattr",
        "sched_getparam", "sched_get_priority_max", "sched_get_priority_min",
        "sched_getscheduler", "sched_rr_get_interval", "sched_setaffinity",
        "sched_setattr", "sched_setparam", "sched_setscheduler", "sched_yield",
        "seccomp", "select", "semctl", "semget", "semop", "semtimedop",
        "sendfile", "sendmmsg", "sendmsg", "sendto", "setfsgid", "setfsuid",
        "setgid", "setgroups", "setitimer", "setpgid", "setpriority",
        "setregid", "setresgid", "setresuid", "setreuid", "setrlimit",
        "set_robust_list", "setsid", "setsockopt", "set_tid_address",
        "setuid", "shutdown", "sigaltstack", "signalfd", "signalfd4",
        "socket", "socketpair", "splice", "stat", "statfs", "statx",
        "symlink", "symlinkat", "sync", "sync_file_range", "sysinfo",
        "tee", "tgkill", "time", "timer_create", "timer_delete",
        "timerfd_create", "timerfd_gettime", "timerfd_settime",
        "timer_getoverrun", "timer_gettime", "timer_settime", "times",
        "tkill", "truncate", "ugetrlimit", "umask", "uname", "unlink",
        "unlinkat", "utime", "utimensat", "utimes", "vfork", "vmsplice",
        "wait4", "waitid", "waitpid", "write", "writev"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

---

## 4. Network Security

### 4.1 Network Topology

```
                      ┌──────────────────────────────────────────────────┐
                      │                    Internet                       │
                      └──────────────────────────────────────────────────┘
                                            │
                                            ▼
                      ┌──────────────────────────────────────────────────┐
                      │           Load Balancer / WAF                     │
                      │        (Cloudflare / AWS ALB)                     │
                      └──────────────────────────────────────────────────┘
                                            │
                         ╔══════════════════╪══════════════════╗
                         ║         DMZ / Public Zone           ║
                         ║            10.0.0.0/24              ║
                         ╚══════════════════╪══════════════════╝
                                            │
                      ┌──────────────────────────────────────────────────┐
                      │              API Gateway / Nginx                  │
                      │               10.0.0.10                          │
                      └──────────────────────────────────────────────────┘
                                            │
                         ╔══════════════════╪══════════════════╗
                         ║       Application Zone              ║
                         ║           10.0.1.0/24               ║
                         ╠══════════════════════════════════════╣
                         ║  ┌─────────┐  ┌─────────┐           ║
                         ║  │ API-1   │  │ API-2   │           ║
                         ║  │10.0.1.10│  │10.0.1.11│           ║
                         ║  └─────────┘  └─────────┘           ║
                         ╚══════════════════╪══════════════════╝
                                            │
                         ╔══════════════════╪══════════════════╗
                         ║         Data Zone (Internal)        ║
                         ║            10.0.2.0/24              ║
                         ╠══════════════════════════════════════╣
                         ║  ┌─────────┐  ┌─────────┐           ║
                         ║  │Postgres │  │ Redis   │           ║
                         ║  │10.0.2.10│  │10.0.2.11│           ║
                         ║  └─────────┘  └─────────┘           ║
                         ╚═════════════════════════════════════╝
```

### 4.2 Network Policies (Kubernetes/Docker)

```yaml
# network-policy-api.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: audifi
spec:
  podSelector:
    matchLabels:
      app: audifi-api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: audifi-db
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: audifi-redis
      ports:
        - protocol: TCP
          port: 6379
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
```

---

## 5. Secrets Management

### 5.1 Environment Variables Template

```bash
# .env.example
# AudiFi Environment Configuration
# Copy to .env.production and fill in values

# Application
NODE_ENV=production
PORT=3000
APP_URL=https://audifi.io

# Database (use secrets manager in production)
DATABASE_URL=postgresql://user:CHANGE_ME@db:5432/audifi

# Redis
REDIS_URL=redis://:CHANGE_ME@redis:6379

# Authentication
JWT_SECRET=CHANGE_ME_256_BIT_RANDOM
MAGIC_LINK_SECRET=CHANGE_ME_256_BIT_RANDOM

# External Services
STRIPE_SECRET_KEY=sk_live_CHANGE_ME
STRIPE_WEBHOOK_SECRET=whsec_CHANGE_ME
SENDGRID_API_KEY=SG.CHANGE_ME

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# Web3
WEB3_PROVIDER_URL=https://eth-mainnet.g.alchemy.com/v2/CHANGE_ME
CONTRACT_MASTER_ADDRESS=0x...
CONTRACT_DIVIDEND_ADDRESS=0x...

# Monitoring
SENTRY_DSN=
WAZUH_AGENT_KEY=
```

### 5.2 Secrets Management Best Practices

```yaml
# Using Docker Secrets
services:
  api:
    secrets:
      - db_password
      - jwt_secret
      - stripe_secret
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password
      - JWT_SECRET_FILE=/run/secrets/jwt_secret

secrets:
  db_password:
    external: true  # Managed outside compose
  jwt_secret:
    external: true
  stripe_secret:
    external: true
```

---

## 6. Logging Configuration

### 6.1 Syslog/Journald Configuration

```bash
# /etc/rsyslog.d/50-audifi.conf

# AudiFi application logs
if $programname == 'audifi-api' then /var/log/audifi/api.log
if $programname == 'audifi-api' and $syslogseverity <= 4 then /var/log/audifi/api-error.log
& stop

# Docker container logs
if $programname startswith 'audifi-' then /var/log/audifi/containers.log
& stop
```

### 6.2 Log Rotation

```
# /etc/logrotate.d/audifi
/var/log/audifi/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 audifi audifi
    sharedscripts
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}
```

---

## 7. Security Baseline Checklist

### 7.1 Ubuntu 24.04 LTS Server

- [ ] Automatic security updates enabled
- [ ] SSH hardened (keys only, no root, strong ciphers)
- [ ] Firewall configured (UFW)
- [ ] Fail2ban installed and configured
- [ ] Audit logging enabled (auditd)
- [ ] Unnecessary services disabled
- [ ] Time synchronization configured (NTP/chrony)

### 7.2 Container Security

- [ ] Using minimal base images (Alpine)
- [ ] Running as non-root user
- [ ] Read-only root filesystem
- [ ] No new privileges
- [ ] Capabilities dropped
- [ ] Resource limits defined
- [ ] Health checks configured
- [ ] Seccomp profile applied

### 7.3 Network Security

- [ ] Network segmentation implemented
- [ ] Only necessary ports exposed
- [ ] Internal services not publicly accessible
- [ ] TLS 1.3 for all external connections
- [ ] WAF/DDoS protection in place

### 7.4 Secrets Management

- [ ] No secrets in code or version control
- [ ] Environment variables for configuration
- [ ] Secret rotation policy defined
- [ ] Access to secrets logged

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-15 | Security-Agent | Initial specification |

---

*This document should be reviewed and updated as infrastructure evolves.*
