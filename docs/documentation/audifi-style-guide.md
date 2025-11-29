# AudiFi Documentation Style Guide

> Standards for writing and formatting AudiFi documentation

## Overview

This guide ensures consistency across all AudiFi documentation. Follow these standards when creating or updating docs.

---

## Tone and Voice

### Be Clear

- Write in plain language
- Avoid jargon where possible
- Define technical terms when first used
- Use short sentences

### Be Direct

- Get to the point quickly
- Lead with the most important information
- Use active voice
- Avoid filler words

### Be Neutral

- Avoid marketing language ("revolutionary", "best-in-class")
- State facts objectively
- Acknowledge limitations and unknowns
- Use "Note:" for caveats, not apologetic language

### Examples

| ❌ Don't | ✅ Do |
|----------|-------|
| "AudiFi's revolutionary platform..." | "AudiFi enables artists to..." |
| "It's super easy to..." | "To do this, follow these steps..." |
| "We're sorry, but..." | "Note: This feature is not yet available." |

---

## Terminology

### Canonical Terms

Always use these exact terms:

| Term | Usage | Notes |
|------|-------|-------|
| **AudiFi** | Platform name | Not "Audifi" or "AUDIFI" |
| **Master IPO** | Core feature | Not "master IPO" or "IPO" alone |
| **V Studio** | Interactive environment | Not "V-Studio" or "VStudio" |
| **Artist Coin** | Artist token | Not "artist coin" or "ArtistCoin" |
| **Mover Advantage** | Royalty structure | Not "mover advantage" |

### Deprecated Terms

| ❌ Avoid | ✅ Use Instead |
|----------|---------------|
| NFT Tracks | AudiFi |
| master (as product) | music master |
| coins | tokens or Artist Coin |

### Technical Terms

Define on first use in each document:

> "**Master** - The original, final recording of a song from which all copies are made."

---

## Document Structure

### File Naming

Use kebab-case for all filenames:
- ✅ `master-ipo.md`
- ✅ `onboarding-a-new-engineer.md`
- ❌ `MasterIPO.md`
- ❌ `onboarding_new_engineer.md`

### Heading Hierarchy

```markdown
# Document Title (H1 - only one per document)

## Major Section (H2)

### Subsection (H3)

#### Minor Heading (H4 - use sparingly)
```

### Standard Document Layout

```markdown
# Title

> One-line description or tagline

## Overview

Brief introduction to the topic.

---

## Section 1

Content...

---

## Section 2

Content...

---

## Status

| Component | Status |
|-----------|--------|
| Feature A | ✅ CURRENT |
| Feature B | 🔄 PLANNED |

---

## Related Documents

- [Related Doc 1](./path.md)
- [Related Doc 2](./path.md)

---

*This document is part of the AudiFi documentation.*
```

---

## Formatting

### Text Formatting

| Element | Format | Example |
|---------|--------|---------|
| **Emphasis** | Bold | **important** |
| *Slight emphasis* | Italic | *note* |
| `Code` | Backticks | `function()` |
| File paths | Backticks | `src/api/tracks.ts` |
| Commands | Code block | `npm install` |
| UI elements | Bold | Click **Submit** |

### Code Blocks

Always include language hint:

```typescript
// TypeScript code
const example = "value"
```

```bash
# Shell commands
npm run dev
```

```sql
-- SQL queries
SELECT * FROM users;
```

### Tables

Use tables for structured information:

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
```

### Diagrams

Use ASCII diagrams for architecture:

```
┌─────────┐     ┌─────────┐
│ Service │────▶│ Service │
└─────────┘     └─────────┘
```

Characters to use:
- Box: `┌ ┐ └ ┘ │ ─`
- Arrows: `▶ ▼ ◀ ▲ ── ───▶`
- Connectors: `├ ┤ ┬ ┴ ┼`

---

## Status Indicators

Use these consistently across documents:

| Symbol | Meaning |
|--------|---------|
| ✅ CURRENT | Implemented and live |
| 🔄 PLANNED | Approved design, not yet implemented |
| 💡 EXPERIMENTAL | Early-stage, subject to change |
| ⚠️ DEPRECATED | Should not be used |
| ❌ REMOVED | No longer available |

---

## Links

### Internal Links

Use relative paths:

```markdown
[Related Doc](./other-doc.md)
[Parent Dir](../concepts/master-ipo.md)
```

### External Links

Include full URL:

```markdown
[Ethereum](https://ethereum.org)
```

### Anchor Links

Reference headings:

```markdown
[See Configuration](#configuration)
```

---

## Lists

### Bullet Lists

Use for unordered items:

```markdown
- Item one
- Item two
  - Nested item
- Item three
```

### Numbered Lists

Use for sequential steps:

```markdown
1. First step
2. Second step
3. Third step
```

### Checklists

Use for actionable items:

```markdown
- [ ] Pending task
- [x] Completed task
```

---

## Callouts

### Notes

```markdown
> **Note:** Additional information.
```

### Warnings

```markdown
> **⚠️ Warning:** Potential issue.
```

### Technical Notes

```markdown
> *This section contains implementation details for engineers.*
```

---

## Document Types

### Concept Docs

- Explain what something is
- Use non-technical language first
- Include technical notes section
- Link to implementation docs

### Architecture Docs

- Start with high-level diagram
- Explain components and relationships
- Include technology choices
- Link to concept docs

### Runbooks

- Step-by-step instructions
- Include prerequisites
- Use checklists
- Link to related procedures

### Reference Docs

- Quick lookup format
- Tables and lists
- Minimal prose
- Complete coverage

---

## Review Checklist

Before submitting documentation:

- [ ] Follows heading hierarchy
- [ ] Uses canonical terminology
- [ ] Code blocks have language hints
- [ ] Links work correctly
- [ ] Status section included
- [ ] Related documents listed
- [ ] Spelling and grammar checked
- [ ] No secrets or credentials

---

## Tools

### Recommended

- **VS Code** with Markdown Preview
- **Prettier** for formatting
- **markdownlint** for linting

### Optional

- **Grammarly** for writing assistance
- **Mermaid** for complex diagrams (future)

---

## Related Documents

- [Documentation Audit](./audifi-docs-audit.md)
- [Information Architecture](./audifi-docs-ia.md)
- [Documentation Summary](./audifi-docs-summary.md)

---

*This document is part of the AudiFi documentation.*
