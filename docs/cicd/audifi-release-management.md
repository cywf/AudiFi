# AudiFi Release Management

## Overview

This document describes the release management strategy for the AudiFi platform, including versioning, changelog generation, and release workflows.

## Versioning Strategy

### Semantic Versioning

AudiFi follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └── Bug fixes, security patches (backward-compatible)
  │     │
  │     └──────── New features (backward-compatible)
  │
  └────────────── Breaking changes
```

**Examples:**
- `1.0.0` → Initial production release
- `1.1.0` → New V Studio feature added
- `1.1.1` → Bug fix in V Studio
- `2.0.0` → Breaking API change for Master IPO

### Pre-release Versions

| Tag | Purpose | Example |
|-----|---------|---------|
| `-alpha.N` | Early testing | `2.0.0-alpha.1` |
| `-beta.N` | Feature complete, testing | `2.0.0-beta.1` |
| `-rc.N` | Release candidate | `2.0.0-rc.1` |

## Release Types

### 1. Standard Release

**Trigger:** Tag `vX.Y.Z` on `main` branch

**Process:**
1. Merge `develop` → `main` via PR
2. Create git tag `vX.Y.Z`
3. GitHub Release created automatically
4. Production deployment triggered

### 2. Hotfix Release

**Trigger:** Tag `vX.Y.Z` from `hotfix/*` branch

**Process:**
1. Create `hotfix/description` from `main`
2. Apply fix
3. Create PR to `main`
4. After merge, tag with incremented patch version
5. Cherry-pick to `develop`

### 3. Pre-release

**Trigger:** Tag `vX.Y.Z-<type>.N` on `develop`

**Process:**
1. Create tag on `develop`
2. GitHub Pre-release created
3. Staging deployment for testing

## Git Tag Strategy

### Creating Tags

```bash
# Standard release
git checkout main
git pull origin main
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3

# Pre-release
git checkout develop
git tag -a v2.0.0-beta.1 -m "Beta release v2.0.0-beta.1"
git push origin v2.0.0-beta.1
```

### Tag Naming Convention

| Pattern | Description | Environment |
|---------|-------------|-------------|
| `vX.Y.Z` | Production release | Production |
| `vX.Y.Z-alpha.N` | Alpha release | Staging |
| `vX.Y.Z-beta.N` | Beta release | Staging |
| `vX.Y.Z-rc.N` | Release candidate | Staging |

## GitHub Releases

### Automatic Release Creation

When a tag is pushed, a GitHub Release is created:

```yaml
# .github/workflows/release.yml

name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate Changelog
        id: changelog
        uses: orhun/git-cliff-action@v3
        with:
          config: cliff.toml
          args: --latest --strip all

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.content }}
          draft: false
          prerelease: ${{ contains(github.ref, '-') }}
```

### Release Notes Structure

```markdown
## What's Changed

### 🚀 Features
- Added V Studio real-time collaboration (#123)
- Implemented Artist Coin staking (#124)

### 🐛 Bug Fixes
- Fixed Master IPO share calculation (#125)
- Resolved WebSocket reconnection issue (#126)

### 🔒 Security
- Updated vulnerable dependencies (#127)

### 📚 Documentation
- Added API documentation (#128)

**Full Changelog**: https://github.com/cywf/AudiFi/compare/v1.1.0...v1.2.0
```

## Changelog Generation

### Conventional Commits

AudiFi uses [Conventional Commits](https://www.conventionalcommits.org/) for automatic changelog generation:

| Prefix | Description | Changelog Section |
|--------|-------------|-------------------|
| `feat:` | New feature | 🚀 Features |
| `fix:` | Bug fix | 🐛 Bug Fixes |
| `docs:` | Documentation | 📚 Documentation |
| `style:` | Formatting | (hidden) |
| `refactor:` | Code refactoring | 🔧 Refactoring |
| `perf:` | Performance | ⚡ Performance |
| `test:` | Tests | 🧪 Tests |
| `chore:` | Maintenance | 📦 Chores |
| `security:` | Security fix | 🔒 Security |

### Commit Examples

```bash
# Feature
git commit -m "feat(vstudio): add real-time cursor sharing"

# Bug fix
git commit -m "fix(ipo): correct dividend calculation formula"

# Breaking change
git commit -m "feat(api)!: change authentication to JWT"

# With scope and body
git commit -m "feat(master): implement IPFS metadata storage

This change adds support for storing track metadata on IPFS,
enabling decentralized access to artist content.

Closes #42"
```

### Git Cliff Configuration

Create `cliff.toml` for changelog generation:

```toml
[changelog]
header = """
# Changelog\n
"""
body = """
{% if version %}\
    ## [{{ version }}] - {{ timestamp | date(format="%Y-%m-%d") }}
{% else %}\
    ## [Unreleased]
{% endif %}\
{% for group, commits in commits | group_by(attribute="group") %}
    ### {{ group | upper_first }}
    {% for commit in commits %}
        - {{ commit.message | upper_first }}\
    {% endfor %}
{% endfor %}\n
"""
footer = ""
trim = true

[git]
conventional_commits = true
filter_unconventional = true
split_commits = false
commit_parsers = [
    { message = "^feat", group = "🚀 Features" },
    { message = "^fix", group = "🐛 Bug Fixes" },
    { message = "^doc", group = "📚 Documentation" },
    { message = "^perf", group = "⚡ Performance" },
    { message = "^refactor", group = "🔧 Refactoring" },
    { message = "^style", skip = true },
    { message = "^test", group = "🧪 Tests" },
    { message = "^chore", group = "📦 Chores" },
    { message = "^security", group = "🔒 Security" },
]
filter_commits = false
tag_pattern = "v[0-9].*"
```

## Release Workflow

### Release Checklist

```markdown
## Release v1.2.3 Checklist

### Pre-Release
- [ ] All PRs for this release are merged to `develop`
- [ ] Staging environment tested and verified
- [ ] Security scans pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (or using auto-generation)

### Release
- [ ] Create PR from `develop` to `main`
- [ ] PR reviewed and approved
- [ ] Merge PR to `main`
- [ ] Create and push tag `v1.2.3`
- [ ] Verify GitHub Release created

### Post-Release
- [ ] Production deployment successful
- [ ] Smoke test production environment
- [ ] Announce release (if applicable)
- [ ] Close milestone (if applicable)
```

## Deployment Triggers

### Tag-to-Environment Mapping

| Tag Pattern | Environment | Action |
|-------------|-------------|--------|
| `v*.*.*` (no pre-release) | Production | Auto-deploy |
| `v*.*.*-beta.*` | Staging | Auto-deploy |
| `v*.*.*-rc.*` | Staging | Auto-deploy |
| `v*.*.*-alpha.*` | Staging | Manual deploy |

### Workflow Configuration

```yaml
deploy-production:
  if: |
    github.ref_type == 'tag' && 
    startsWith(github.ref_name, 'v') && 
    !contains(github.ref_name, '-')
  # Only runs for production tags (no pre-release suffix)
```

## Rollback Process

### Immediate Rollback

```bash
# Find previous working version
git tag -l 'v*' --sort=-v:refname | head -5

# Option 1: Redeploy previous tag
# Re-run the release workflow for previous tag

# Option 2: Revert and release
git checkout main
git revert <bad-commit>
git commit -m "revert: Revert v1.2.3 changes"
git tag v1.2.4
git push origin main v1.2.4
```

### Rollback Documentation

Document each rollback:

```markdown
## Rollback: v1.2.3 → v1.2.2

**Date:** 2025-11-29
**Reason:** Critical bug in payment processing
**Duration:** 15 minutes
**Impact:** 0 transactions affected

### Timeline
- 14:00 UTC: v1.2.3 deployed
- 14:10 UTC: Bug reported
- 14:12 UTC: Rollback initiated
- 14:15 UTC: v1.2.2 redeployed
- 14:20 UTC: Issue confirmed resolved

### Root Cause
Payment API endpoint returned incorrect status code.

### Prevention
- Add integration test for payment flow
- Improve staging test coverage
```

## Monitoring Releases

### Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| Deployment frequency | Releases per week | 2-5 |
| Lead time | PR merge to production | < 1 hour |
| Change failure rate | Rollbacks per release | < 5% |
| MTTR | Time to recover | < 30 min |

### Release Notifications

Configure notifications in workflow:

```yaml
- name: Notify Release
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: "🚀 AudiFi ${{ github.ref_name }} deployed to production!"
    fields: repo,commit,workflow
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

### DO

- ✅ Use conventional commit messages
- ✅ Test thoroughly on staging before production
- ✅ Write descriptive release notes
- ✅ Tag from clean `main` branch
- ✅ Keep releases small and frequent

### DON'T

- ❌ Skip staging testing
- ❌ Release on Fridays without on-call coverage
- ❌ Include unrelated changes in releases
- ❌ Delete tags after pushing

---

*This document is part of the AudiFi CI/CD documentation.*
