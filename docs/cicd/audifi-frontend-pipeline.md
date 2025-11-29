# AudiFi Frontend Pipeline

## Overview

The frontend pipeline handles continuous integration and deployment for the AudiFi React application, which powers:

- **Master IPO UIs** - Initial Public Offering interfaces for music masters
- **V Studio Dashboards** - Artist, Producer, and Viewer interfaces
- **Portfolio & Analytics Views** - Investment tracking and performance metrics

## Pipeline Location

```
.github/workflows/frontend.yml
```

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 19.x |
| Language | TypeScript | ~5.7.2 |
| Build Tool | Vite | ^6.4.1 |
| Styling | Tailwind CSS | ^4.1.11 |
| Linting | ESLint | ^9.28.0 |
| Deployment | Vercel | Latest |

## Trigger Conditions

The frontend pipeline runs when changes are detected in:

| Path Pattern | Description |
|--------------|-------------|
| `src/**` | Source code changes |
| `public/**` | Static assets |
| `package.json` | Dependencies |
| `package-lock.json` | Lock file |
| `vite.config.ts` | Build configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Styling configuration |
| `index.html` | Entry HTML file |

## Pipeline Jobs

### 1. Build & Lint

**Runs on:** All triggers (PRs and pushes)

**Steps:**
1. Checkout repository
2. Setup Node.js v20 with npm caching
3. Install dependencies (`npm ci`)
4. Run ESLint (`npm run lint`)
5. Build application (`npm run build`)
6. Upload build artifacts

**Success Criteria:**
- No ESLint errors (warnings allowed)
- Build completes without errors
- Artifacts are uploaded

### 2. Deploy Preview (PR Only)

**Runs on:** Pull requests to `main` or `develop`

**Steps:**
1. Install Vercel CLI
2. Pull Vercel environment configuration
3. Build with preview settings
4. Deploy to Vercel preview environment
5. Post preview URL as PR comment

**Output:**
- Unique preview URL for each PR
- Automatic comment with deployment link

### 3. Deploy Staging

**Runs on:** Push to `develop` branch

**Environment:** `staging`

**URL:** `https://staging.audifi.io`

**Steps:**
1. Install Vercel CLI
2. Build with staging configuration
3. Deploy to staging environment
4. Generate job summary

### 4. Deploy Production

**Runs on:** Push to `main` branch

**Environment:** `production`

**URL:** `https://audifi.io`

**Steps:**
1. Install Vercel CLI
2. Build with production configuration
3. Deploy to production environment
4. Generate job summary

## Environment Configuration

### Preview Environment

```yaml
environment:
  name: preview
  url: <dynamic-preview-url>
```

- No protection rules
- Automatic cleanup when PR closes
- Uses development API endpoints

### Staging Environment

```yaml
environment:
  name: staging
  url: https://staging.audifi.io
```

Environment variables:
- `VITE_APP_ENV=staging`
- `VITE_API_URL` → Staging API

### Production Environment

```yaml
environment:
  name: production
  url: https://audifi.io
```

Environment variables:
- `VITE_APP_ENV=production`
- `VITE_API_URL` → Production API

## Required Secrets

Configure these secrets in GitHub repository settings:

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel authentication token | All deployments |
| `VERCEL_ORG_ID` | Vercel organization ID | All deployments |
| `VERCEL_PROJECT_ID` | Vercel project ID | All deployments |
| `STAGING_API_URL` | Staging backend URL | Staging deploy |
| `PRODUCTION_API_URL` | Production backend URL | Production deploy |

### Obtaining Vercel Credentials

1. **VERCEL_TOKEN:**
   ```bash
   # Visit: https://vercel.com/account/tokens
   # Create a new token with appropriate scope
   ```

2. **VERCEL_ORG_ID & VERCEL_PROJECT_ID:**
   ```bash
   # Install Vercel CLI locally
   npm i -g vercel
   
   # Link your project
   vercel link
   
   # Find IDs in .vercel/project.json
   cat .vercel/project.json
   ```

## Preview URL Behavior

When a PR is created or updated:

1. The build job runs first
2. If successful, preview deployment starts
3. A unique URL is generated (e.g., `audifi-xyz123.vercel.app`)
4. A comment is posted to the PR with the preview URL
5. Each push to the PR updates the preview

**Example PR Comment:**
```
🚀 Preview Deployment Ready!

📱 Preview URL: https://audifi-pr-42-xyz123.vercel.app

_This preview will be updated when you push new changes._
```

## Failure Handling

### Lint Failures

- Job fails immediately
- Must fix ESLint errors before merge
- Warnings are acceptable (noted in output)

### Build Failures

- Job fails and blocks PR merge
- Review build output for errors
- Common issues:
  - TypeScript type errors
  - Missing dependencies
  - Invalid imports

### Deployment Failures

- Deployment step fails
- Previous deployment remains active
- Check Vercel dashboard for details
- Review `vercel` CLI output in logs

## Local Development

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Deployment Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy preview from local
vercel

# Deploy production from local (use with caution)
vercel --prod
```

## Workflow Customization

### Adding Tests

Uncomment the test job in `frontend.yml`:

```yaml
test:
  name: Run Tests
  runs-on: ubuntu-latest
  needs: build
  
  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm run test
```

### Switching to Fly.io

Replace Vercel steps with Fly.io:

```yaml
- name: Install Fly CLI
  uses: superfly/flyctl-actions/setup-flyctl@master

- name: Deploy to Fly.io
  run: flyctl deploy --remote-only
  env:
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Monitoring & Visibility

### Job Summaries

Each deployment generates a summary:

```markdown
## 🚀 Production Deployment Complete

**Branch:** `main`
**Environment:** Production
**URL:** https://audifi.io

**Commit:** `abc123def456...`

### Deployed Services
- ✅ Master IPO UIs
- ✅ V Studio Dashboards
- ✅ Portfolio & Analytics Views
```

### Artifacts

Build artifacts are uploaded and available for 7 days:
- `dist/` - Built application files
- Can be downloaded for debugging

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `VERCEL_TOKEN` error | Missing or invalid token | Check secret configuration |
| Build timeout | Large bundle size | Optimize imports, code splitting |
| Cache miss | Changed dependencies | Normal behavior, CI will install fresh |
| Preview not updating | GitHub cache | Re-run workflow manually |

### Debug Commands

```bash
# Check workflow syntax
gh workflow view frontend.yml

# View recent runs
gh run list --workflow=frontend.yml

# View run logs
gh run view <run-id> --log
```

---

*This document is part of the AudiFi CI/CD documentation.*
