# AudiFi Documentation Information Architecture

> **Status:** Approved Design  
> **Date:** 2024-12  
> **Purpose:** Define the structure and organization of AudiFi documentation

## Overview

This document defines the Information Architecture (IA) for AudiFi documentation. The structure serves two primary audiences:

1. **External/Product Understanding** - What AudiFi does and how it works conceptually
2. **Internal Engineering & Operations** - How to build, run, debug, and evolve the platform

---

## Directory Structure

```
docs/
├── README.md                           # [ALL] Entry point and navigation hub
│
├── intro/                              # Introduction & Overview
│   ├── what-is-audifi.md              # [ALL] High-level platform overview
│   └── core-concepts.md               # [ALL] Key concepts with links
│
├── concepts/                           # Core Concepts (Product-Level)
│   ├── master-ipo.md                  # [PRODUCT/INVESTOR] Master IPO model
│   ├── mover-advantage.md             # [PRODUCT/ARTIST] Royalty structure
│   ├── token-model.md                 # [TECHNICAL/INVESTOR] Token standards
│   ├── liquidity-and-staking.md       # [TECHNICAL/INVESTOR] Economics
│   └── vstudio.md                     # [PRODUCT/ARTIST] V Studio overview
│
├── architecture/                       # System Architecture
│   ├── overview.md                    # [ENGINEER] System architecture
│   ├── frontend.md                    # [ENGINEER] Frontend architecture
│   ├── backend.md                     # [ENGINEER] Backend services
│   ├── database.md                    # [ENGINEER] Data model & schema
│   ├── networking-and-infra.md        # [DEVOPS] Infrastructure
│   └── security-overview.md           # [ENGINEER/SECURITY] Security model
│
├── api/                                # API Documentation
│   ├── overview.md                    # [ENGINEER] API overview
│   └── openapi/                       # [ENGINEER] OpenAPI specs (future)
│       └── openapi.yaml
│
├── operations/                         # Operations & Runbooks
│   ├── deploying-a-new-version.md     # [DEVOPS] Deployment guide
│   ├── rolling-back-a-bad-deploy.md   # [DEVOPS] Rollback procedures
│   ├── onboarding-a-new-engineer.md   # [ENGINEER] Onboarding guide
│   ├── handling-incidents-and-outages.md # [DEVOPS/ON-CALL] Incident response
│   └── vstudio-rehearsal-runbook.md   # [QA/DEVOPS] V Studio testing
│
├── cicd/                               # CI/CD Documentation
│   └── overview.md                    # [DEVOPS] Pipeline overview
│
├── security/                           # Security Documentation
│   └── overview.md                    # [SECURITY] Security posture
│
└── documentation/                      # Meta-Documentation
    ├── audifi-docs-audit.md           # [INTERNAL] Documentation audit
    ├── audifi-docs-ia.md              # [INTERNAL] This document
    ├── audifi-style-guide.md          # [CONTRIBUTOR] Writing style
    └── audifi-docs-summary.md         # [INTERNAL] Summary & TODOs
```

---

## Audience Matrix

| Section | Primary Audience | Secondary Audience |
|---------|------------------|-------------------|
| `intro/` | All stakeholders | New team members |
| `concepts/` | Artists, Investors, Product | Engineers, Partners |
| `architecture/` | Engineers | DevOps, Security |
| `api/` | Engineers | Partners, Integration |
| `operations/` | DevOps, On-call | Engineers |
| `cicd/` | DevOps | Engineers |
| `security/` | Security, Compliance | All |
| `documentation/` | Doc Contributors | All |

---

## Detailed Section Descriptions

### `/docs/README.md`
**Purpose:** Central entry point for all documentation  
**Content:**
- Welcome message and platform description
- Quick links by audience (Artist, Engineer, DevOps, etc.)
- Navigation guide
- How to contribute to docs

---

### `/docs/intro/`

#### `what-is-audifi.md`
**Audience:** All stakeholders  
**Content:**
- One-paragraph executive summary
- The problem AudiFi solves
- High-level overview of Master IPO + V Studio + Artist Coin
- Key differentiators
- Link to deeper concept docs

#### `core-concepts.md`
**Audience:** All stakeholders  
**Content:**
- Glossary of key terms with brief definitions
- Links to detailed concept pages
- Visual relationship diagram (text-based)

---

### `/docs/concepts/`

#### `master-ipo.md`
**Audience:** Product, Artists, Investors  
**Content:**
- What is a "Master" in music context
- How AudiFi turns Masters into tradeable assets
- Lifecycle: Register → Configure → Mint → Distribute
- Master Contracts vs Dividend Contracts
- Technical notes (clearly marked for engineers)

#### `mover-advantage.md`
**Audience:** Artists, Investors  
**Content:**
- The 10% / 5% / 3% / 1% royalty structure
- How early minters benefit
- Artist incentive alignment
- Smart contract encoding (technical section)
- Market dynamics impact

#### `token-model.md`
**Audience:** Technical, Investors  
**Content:**
- ERC-2981: Royalty standard
- ERC-721C: Master-share NFTs
- ERC-1155C: Utility tokens and passes (planned)
- ERC-20 Artist Coin: Creation and lifecycle
- Token interaction diagrams

#### `liquidity-and-staking.md`
**Audience:** Technical, Investors  
**Content:**
- Liquidity pool mechanics
- Artist Coin and NFT liquidity
- Staking mechanics
- Dividend distribution
- Self-sustaining economics goal

#### `vstudio.md`
**Audience:** Artists, Producers, Viewers  
**Content:**
- V Studio purpose and workflow
- Roles: Artist, Producer, Viewer
- Decision points: hooks, arrangements, FX, artwork
- Voting and gating mechanisms
- Connection to Master IPO launch

---

### `/docs/architecture/`

#### `overview.md`
**Audience:** Engineers  
**Content:**
- High-level system diagram (text-based)
- Component overview: Frontend, Backend, Database, Contracts
- External integrations
- Data flow patterns

#### `frontend.md`
**Audience:** Frontend Engineers  
**Content:**
- Framework (React/Next.js) and structure
- Routing model
- Component patterns
- API consumption
- Real-time channels (WebSocket/SSE)
- Authentication handling

#### `backend.md`
**Audience:** Backend Engineers  
**Content:**
- Service architecture
- Service boundaries
- Smart contract integration layer
- On-chain vs off-chain logic separation

#### `database.md`
**Audience:** Engineers  
**Content:**
- Entity relationship model
- Key tables/collections
- On-chain vs off-chain fields
- Indexing strategy

#### `networking-and-infra.md`
**Audience:** DevOps, Engineers  
**Content:**
- Network topology
- Hosting strategy
- Domain and TLS configuration
- Real-time connectivity

#### `security-overview.md`
**Audience:** Security, Engineers  
**Content:**
- Authentication model
- Authorization patterns
- Smart contract risk surfaces
- Infrastructure hardening

---

### `/docs/api/`

#### `overview.md`
**Audience:** Engineers, Integration Partners  
**Content:**
- Authentication model
- API domains overview
- Request/response patterns
- Error handling
- Rate limiting

---

### `/docs/operations/`

#### `deploying-a-new-version.md`
**Audience:** DevOps  
**Content:**
- Pre-deployment checklist
- Deployment steps
- Verification procedures
- Rollback triggers

#### `rolling-back-a-bad-deploy.md`
**Audience:** DevOps, On-call  
**Content:**
- Rollback decision criteria
- Frontend rollback procedure
- Backend rollback procedure
- Database migration handling

#### `onboarding-a-new-engineer.md`
**Audience:** New Engineers  
**Content:**
- Prerequisites and tools
- Repository setup
- Local development
- Documentation roadmap
- First week checklist

#### `handling-incidents-and-outages.md`
**Audience:** On-call, DevOps  
**Content:**
- Incident classification
- Triage procedures
- Log and metric locations
- Communication protocols
- Post-incident review

#### `vstudio-rehearsal-runbook.md`
**Audience:** QA, DevOps  
**Content:**
- Test scenario setup
- Role-based testing
- Decision point verification
- Master IPO launch validation

---

### `/docs/cicd/`

#### `overview.md`
**Audience:** DevOps, Engineers  
**Content:**
- Pipeline architecture
- Workflow descriptions
- Branch strategy
- Environment management

---

### `/docs/security/`

#### `overview.md`
**Audience:** Security, All  
**Content:**
- Security posture summary
- Threat model overview
- Incident response pointers
- Compliance considerations

---

### `/docs/documentation/`

#### `audifi-docs-audit.md`
**Audience:** Internal  
**Content:** Current state of documentation

#### `audifi-docs-ia.md`
**Audience:** Internal  
**Content:** This document

#### `audifi-style-guide.md`
**Audience:** Contributors  
**Content:**
- Tone and voice
- Terminology guide
- Formatting standards
- File naming conventions

#### `audifi-docs-summary.md`
**Audience:** Internal  
**Content:**
- Documentation status overview
- Open TODOs
- Maintenance notes

---

## Implementation Priority

### Phase 1 - Foundation (Week 1)
1. `docs/README.md`
2. `docs/intro/what-is-audifi.md`
3. `docs/concepts/master-ipo.md`
4. `docs/concepts/vstudio.md`
5. `docs/documentation/audifi-style-guide.md`

### Phase 2 - Core Concepts (Week 2)
1. `docs/intro/core-concepts.md`
2. `docs/concepts/mover-advantage.md`
3. `docs/concepts/token-model.md`
4. `docs/concepts/liquidity-and-staking.md`

### Phase 3 - Architecture (Week 3)
1. `docs/architecture/overview.md`
2. `docs/architecture/frontend.md`
3. `docs/architecture/backend.md`
4. `docs/architecture/database.md`

### Phase 4 - Operations (Week 4)
1. `docs/operations/onboarding-a-new-engineer.md`
2. `docs/operations/deploying-a-new-version.md`
3. `docs/architecture/networking-and-infra.md`
4. `docs/architecture/security-overview.md`

### Phase 5 - Completion (Week 5+)
1. Remaining operations docs
2. API documentation
3. CI/CD documentation
4. Security documentation
5. Summary and polish

---

## Cross-Linking Strategy

### Link Patterns
- Each concept doc links to related architecture docs
- Each architecture doc links back to relevant concepts
- All docs link to the glossary in `core-concepts.md`
- Operations docs link to relevant architecture and security docs

### Navigation Aids
- `docs/README.md` serves as the central hub
- Each section has clear "Related Documents" section
- Use of `TODO`, `WIP`, `PLANNED` markers for incomplete sections

---

## Tooling Recommendations

### Current Approach
- Markdown files in `docs/` directory
- Read directly in GitHub

### Future Consideration
If static site generation is desired:
- **Recommended:** Docusaurus or Nextra
- Sidebar navigation maps directly to this IA
- Enables search, versioning, and custom components

---

*Last updated: 2024-12*
