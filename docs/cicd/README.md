# AudiFi CI/CD Documentation

## Overview

This directory contains comprehensive documentation for the AudiFi Continuous Integration and Continuous Deployment (CI/CD) infrastructure.

## Quick Start

### Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

### Deployment Triggers

| Branch | Action | Environment |
|--------|--------|-------------|
| PR to `develop`/`main` | Build + Lint | Preview |
| Push to `develop` | Auto-deploy | Staging |
| Push to `main` | Auto-deploy | Production |

## Workflows

| Workflow | File | Purpose |
|----------|------|---------|
| Frontend CI/CD | `.github/workflows/frontend.yml` | Build, lint, and deploy frontend |
| Backend CI/CD | `.github/workflows/backend.yml` | Build, test, and deploy backend containers |
| Security Scans | `.github/workflows/security.yml` | Vulnerability and compliance scanning |
| Dependabot | `.github/dependabot.yml` | Automated dependency updates |

## Documentation Index

### Core Documents

| Document | Description |
|----------|-------------|
| [CI/CD Audit](audifi-cicd-audit.md) | Current state assessment and gap analysis |
| [CI/CD Strategy](audifi-cicd-strategy.md) | Branching model and environment strategy |

### Pipeline Documents

| Document | Description |
|----------|-------------|
| [Frontend Pipeline](audifi-frontend-pipeline.md) | Frontend build and deployment details |
| [Backend Pipeline](audifi-backend-pipeline.md) | Container build and server deployment |
| [Database Migrations](audifi-db-migrations.md) | Schema migration workflow |

### Operations Documents

| Document | Description |
|----------|-------------|
| [Security Checks](audifi-security-checks.md) | Security scanning and compliance |
| [Release Management](audifi-release-management.md) | Versioning and release process |
| [Secrets & Config](audifi-secrets-and-config.md) | Environment variables and secrets |
| [Agent Interfaces](audifi-cicd-interfaces.md) | Integration with other agents |

## Environments

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Preview   │────▶│   Staging   │────▶│ Production  │
│  (PR Only)  │     │  (develop)  │     │   (main)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

| Environment | Frontend URL | Backend URL | Trigger |
|-------------|--------------|-------------|---------|
| Preview | `*.vercel.app` | N/A | PR creation |
| Staging | `staging.audifi.io` | `api-staging.audifi.io` | Push to develop |
| Production | `audifi.io` | `api.audifi.io` | Push to main |

## Required Secrets

Before deployment, configure these GitHub Secrets:

### Repository Secrets
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `DEPLOY_SSH_KEY` - SSH key for server access
- `DEPLOY_USER` - SSH username

### Environment-Specific
- `STAGING_HOST` / `PRODUCTION_HOST` - Server addresses
- `STAGING_DATABASE_URL` / `PRODUCTION_DATABASE_URL` - Database connections

See [Secrets & Config](audifi-secrets-and-config.md) for complete list.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Deployment | Vercel (frontend), Docker (backend) |
| CI/CD | GitHub Actions |
| Registry | GitHub Container Registry (GHCR) |

## Current Limitations / TODOs

### Active
- ✅ Frontend CI/CD workflow configured
- ✅ Backend CI/CD workflow template ready
- ✅ Security scanning configured
- ✅ ESLint configuration added

### Pending
- ⏳ Backend codebase not yet present
- ⏳ Test suite not yet configured (Vitest recommended)
- ⏳ Database migration tooling not yet selected
- ⏳ E2E testing not yet configured (Playwright recommended)
- ⏳ Vercel project not yet linked
- ⏳ GitHub Environments not yet configured

## Getting Help

1. Check the relevant documentation file
2. Review workflow logs in GitHub Actions
3. Consult the [Agent Interfaces](audifi-cicd-interfaces.md) for cross-agent issues
4. Create an issue in the repository for bugs

## Contributing

When updating CI/CD infrastructure:

1. Create a feature branch
2. Update workflow files
3. Update relevant documentation
4. Test in staging before production
5. Create PR with clear description

---

*Maintained by the CI-CD-AGENT for AudiFi*
