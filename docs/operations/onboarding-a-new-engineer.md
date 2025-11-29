# Onboarding a New Engineer

> Getting started with AudiFi development

## Overview

This guide walks new engineers through setting up their development environment and understanding the AudiFi codebase.

---

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **npm** | 9+ | Package manager |
| **Git** | 2.30+ | Version control |
| **VS Code** | Latest | Recommended editor |

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Hero
- GitLens

### Accounts Needed

| Account | Purpose | How to Get |
|---------|---------|------------|
| GitHub | Repository access | Request from team lead |
| Vercel | Frontend deployment | Team invite |
| Figma | Design specs | Team invite |

---

## Repository Setup

### 1. Clone the Repository

```bash
git clone https://github.com/cywf/AudiFi.git
cd AudiFi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Verify Setup

- Open `http://localhost:5173` in your browser
- You should see the landing page
- Navigate to `/dashboard` to see the mock dashboard

---

## Project Structure

```
AudiFi/
├── docs/                    # Documentation (you're here!)
├── src/
│   ├── api/                # Mock API layer
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Layout components
│   │   └── [feature]/     # Feature-specific components
│   ├── constants/          # App configuration
│   ├── lib/               # Utilities and stubs
│   ├── pages/             # Route pages
│   ├── types/             # TypeScript definitions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── public/                 # Static assets
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

---

## Development Workflow

### Branch Strategy

```
main                    # Production-ready code
├── feature/xyz        # New features
├── fix/abc            # Bug fixes
└── docs/xyz           # Documentation updates
```

### Creating a Feature

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make changes...

# Commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/your-feature-name
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructure
- `test:` - Tests
- `chore:` - Maintenance

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Check TypeScript |

---

## Understanding the Codebase

### Start Here

1. **Read the docs** - Start with [What is AudiFi?](../intro/what-is-audifi.md)
2. **Explore types** - `src/types/index.ts` defines core data models
3. **Understand pages** - Each file in `src/pages/` is a route
4. **Review components** - See how UI is composed

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Routing configuration |
| `src/types/index.ts` | TypeScript interfaces |
| `src/constants/index.ts` | App configuration |
| `src/api/*.ts` | Mock API implementations |
| `src/lib/utils.ts` | Utility functions |

### Mock APIs

The app currently uses mock APIs with localStorage:

```typescript
// Example: src/api/tracks.ts
export async function getTracksForCurrentUser(): Promise<Track[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks()
      resolve(tracks.filter(t => t.artistId === 'user_001'))
    }, 400) // Simulated latency
  })
}
```

---

## Documentation Roadmap

Read these documents in order:

### Week 1: Concepts

1. [What is AudiFi?](../intro/what-is-audifi.md)
2. [Core Concepts](../intro/core-concepts.md)
3. [Master IPO](../concepts/master-ipo.md)
4. [V Studio](../concepts/vstudio.md)

### Week 2: Architecture

1. [Architecture Overview](../architecture/overview.md)
2. [Frontend Architecture](../architecture/frontend.md)
3. [Token Model](../concepts/token-model.md)

### Week 3: Operations

1. [Deploying a New Version](./deploying-a-new-version.md)
2. [Style Guide](../documentation/audifi-style-guide.md)

---

## First Week Checklist

- [ ] Clone repository and install dependencies
- [ ] Run development server successfully
- [ ] Read intro documentation
- [ ] Explore the codebase structure
- [ ] Make a small change (typo fix, comment)
- [ ] Create your first PR
- [ ] Set up editor with recommended extensions
- [ ] Join team communication channels

---

## Getting Help

### Questions?

1. Check the documentation first
2. Search existing issues on GitHub
3. Ask in team chat
4. Pair with a senior engineer

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill
```

**Module not found:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

**TypeScript errors:**
```bash
# Check types
npm run type-check
```

---

## Next Steps

After completing onboarding:

1. Pick up a "good first issue" from GitHub
2. Review open PRs to understand current work
3. Attend team standups
4. Set up your local environment for backend (when available)

---

## Related Documents

- [Architecture Overview](../architecture/overview.md)
- [Frontend Architecture](../architecture/frontend.md)
- [Deploying a New Version](./deploying-a-new-version.md)
- [Style Guide](../documentation/audifi-style-guide.md)

---

*This document is part of the AudiFi documentation. For questions or contributions, see the [Documentation Guide](../documentation/audifi-style-guide.md).*
