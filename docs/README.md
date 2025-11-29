# AudiFi Documentation

> The Platform Where Music Masters Meet Markets

Welcome to the AudiFi documentation. This is the canonical reference for understanding, building, and operating the AudiFi platform.

---

## Quick Links

| I want to... | Start here |
|--------------|------------|
| **Understand AudiFi** | [What is AudiFi?](./intro/what-is-audifi.md) |
| **Learn the concepts** | [Core Concepts](./intro/core-concepts.md) |
| **Set up development** | [Onboarding Guide](./operations/onboarding-a-new-engineer.md) |
| **Understand the architecture** | [Architecture Overview](./architecture/overview.md) |
| **Deploy changes** | [Deployment Guide](./operations/deploying-a-new-version.md) |
| **Report a security issue** | [Security Policy](/SECURITY.md) |

---

## Documentation by Audience

### 🎵 Artists, Producers, Partners

Understanding AudiFi's model and features:

- [What is AudiFi?](./intro/what-is-audifi.md) - Platform overview
- [Master IPO](./concepts/master-ipo.md) - How music ownership works
- [V Studio](./concepts/vstudio.md) - Interactive finishing environment
- [Mover Advantage](./concepts/mover-advantage.md) - Royalty structure

### 💻 Engineers

Building and maintaining the platform:

- [Onboarding Guide](./operations/onboarding-a-new-engineer.md) - Getting started
- [Architecture Overview](./architecture/overview.md) - System design
- [Frontend Architecture](./architecture/frontend.md) - React/TypeScript
- [Backend Architecture](./architecture/backend.md) - Services
- [API Overview](./api/overview.md) - Endpoints

### ⚙️ DevOps / SRE

Operating the platform:

- [Deploying](./operations/deploying-a-new-version.md) - Deployment procedures
- [Rolling Back](./operations/rolling-back-a-bad-deploy.md) - Rollback procedures
- [Incident Response](./operations/handling-incidents-and-outages.md) - Handling issues
- [CI/CD](./cicd/overview.md) - Pipeline overview
- [Infrastructure](./architecture/networking-and-infra.md) - Networking

### 🔐 Security

Security and compliance:

- [Security Overview](./architecture/security-overview.md) - Security architecture
- [Security Policy](/SECURITY.md) - Vulnerability reporting

### 📝 Contributors

Writing and maintaining documentation:

- [Style Guide](./documentation/audifi-style-guide.md) - Writing standards
- [Documentation Summary](./documentation/audifi-docs-summary.md) - Status and TODOs

---

## Documentation Structure

```
docs/
├── README.md               ← You are here
├── intro/                  # Getting started
│   ├── what-is-audifi.md
│   └── core-concepts.md
├── concepts/               # Core concepts
│   ├── master-ipo.md
│   ├── vstudio.md
│   ├── mover-advantage.md
│   ├── token-model.md
│   └── liquidity-and-staking.md
├── architecture/           # System architecture
│   ├── overview.md
│   ├── frontend.md
│   ├── backend.md
│   ├── database.md
│   ├── networking-and-infra.md
│   └── security-overview.md
├── api/                    # API reference
│   └── overview.md
├── operations/             # Runbooks & SOPs
│   ├── onboarding-a-new-engineer.md
│   ├── deploying-a-new-version.md
│   ├── rolling-back-a-bad-deploy.md
│   ├── handling-incidents-and-outages.md
│   └── vstudio-rehearsal-runbook.md
├── cicd/                   # CI/CD documentation
│   └── overview.md
├── security/               # Security documentation
│   └── overview.md
└── documentation/          # Meta-documentation
    ├── audifi-docs-audit.md
    ├── audifi-docs-ia.md
    ├── audifi-style-guide.md
    └── audifi-docs-summary.md
```

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Master IPO** | The process of offering fractional ownership in a music master |
| **V Studio** | Interactive environment for finishing tracks with community input |
| **Artist Coin** | Artist-specific ERC-20 token for ecosystem participation |
| **Mover Advantage** | Tiered royalty structure rewarding early supporters (10%/5%/3%/1%) |

[Full glossary →](./intro/core-concepts.md)

---

## Current Status

| Component | Status |
|-----------|--------|
| Frontend Application | ✅ Current (mock APIs) |
| Backend Services | 🔄 Planned |
| Smart Contracts | 🔄 Planned |
| V Studio | 🔄 Planned |
| Documentation | ✅ Current |

---

## Contributing to Documentation

1. Follow the [Style Guide](./documentation/audifi-style-guide.md)
2. Check [Documentation Summary](./documentation/audifi-docs-summary.md) for TODOs
3. Create a PR with your changes
4. Request review from documentation owner

---

## External Links

- [AudiFi Website](https://audifi.io)
- [GitHub Repository](https://github.com/cywf/AudiFi)

---

*For questions about documentation, see the [Style Guide](./documentation/audifi-style-guide.md) or create an issue.*
