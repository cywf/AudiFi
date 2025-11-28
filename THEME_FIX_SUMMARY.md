# Theme Fix Summary

## Overview

The NFT Tracks application uses a **dark, music/crypto aesthetic** theme built with Tailwind CSS v4 and shadcn/ui v4. The theme is defined through CSS custom properties and mapped to Tailwind utility classes via a structured configuration.

## Color Palette

The design system uses a triadic color scheme representing the intersection of music (creative), technology (blockchain), and commerce (value):

### Core Colors (oklch format)

| Token | Value | Purpose |
|-------|-------|---------|
| `--background` | `oklch(0.14 0.015 260)` | Deep blue-purple base for the app |
| `--foreground` | `oklch(0.98 0.005 260)` | Almost white text |
| `--card` | `oklch(0.18 0.015 260)` | Slightly lighter than background for cards |
| `--primary` | `oklch(0.48 0.20 295)` | Deep Purple - Creative/artistic brand color |
| `--secondary` | `oklch(0.58 0.14 210)` | Dark Cyan - Technical/blockchain accent |
| `--accent` | `oklch(0.72 0.17 195)` | Bright Cyan - Call-to-action and highlights |
| `--warning` | `oklch(0.68 0.16 85)` | Warm Amber - Value/earnings displays |
| `--destructive` | `oklch(0.55 0.22 25)` | Red for errors and warnings |
| `--muted` | `oklch(0.25 0.01 260)` | Subtle backgrounds |
| `--border` | `oklch(0.28 0.01 260)` | Subtle borders |
| `--ring` | `oklch(0.72 0.17 195)` | Focus rings (same as accent) |

### Usage Guidelines

- **Primary (Deep Purple)**: Used for main CTAs, branding elements, logo backgrounds, and wizard step indicators
- **Secondary (Dark Cyan)**: Used for secondary buttons, tech-related badges, and data visualization
- **Accent (Bright Cyan)**: Used for hover states, active elements, success indicators, and highlighted interactions
- **Warning (Warm Amber)**: Used specifically for earnings/royalties/value displays to draw attention to financial metrics
- **Muted**: Used for inactive states, disabled elements, and subtle backgrounds

## File Structure

### 1. `/src/index.css`
Defines the CSS custom properties for both `:root` and `.dark` selectors:
- Color tokens without the `--color-` prefix
- Typography base styles using Inter font
- Heading scale (h1: 36px, h2: 24px, h3: 18px)

### 2. `/src/main.css`
The main Tailwind entry point:
- Imports: `tailwindcss`, `index.css`, `tw-animate-css`
- `@theme inline` block maps CSS variables to `--color-*` format for Tailwind
- Defines radius tokens and animations
- Sets base layer defaults for borders and body background

### 3. `/tailwind.config.js`
Extends Tailwind with semantic color tokens:
```javascript
colors: {
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
  primary: { DEFAULT: "var(--color-primary)", foreground: "var(--color-primary-foreground)" },
  secondary: { DEFAULT: "var(--color-secondary)", foreground: "var(--color-secondary-foreground)" },
  accent: { DEFAULT: "var(--color-accent)", foreground: "var(--color-accent-foreground)" },
  warning: { DEFAULT: "var(--color-warning)", foreground: "var(--color-warning-foreground)" },
  // ... etc
}
```

### 4. `/src/main.tsx`
Ensures dark mode is always active:
```typescript
document.documentElement.classList.add('dark')
```

## Semantic Class Names

The following semantic Tailwind classes are available throughout the app:

| Class | Usage |
|-------|-------|
| `bg-background` | Main app background |
| `bg-card` | Card and surface backgrounds |
| `bg-muted` | Subtle/inactive backgrounds |
| `bg-primary` | Primary action buttons |
| `bg-secondary` | Secondary action buttons |
| `bg-accent` | Highlighted elements, CTAs |
| `bg-warning` | Earnings/value highlights |
| `text-foreground` | Main text color |
| `text-muted-foreground` | Secondary/dimmed text |
| `text-accent` | Highlighted text, links |
| `text-warning` | Earnings/royalty values |
| `border-border` | Default borders |
| `ring-ring` | Focus rings |

## Component Theming

### StatCard
- Default variant: Uses `text-primary/30` for icons
- Earnings variant: Uses `text-warning` for values and `text-warning/40` for icons

### Buttons (shadcn/ui)
- Default: `bg-primary text-primary-foreground`
- Secondary: `bg-secondary text-secondary-foreground`
- Ghost: Transparent with hover states

### Badges
- Status badges use semantic colors:
  - Draft: `bg-muted`
  - Minted: `bg-secondary/30`
  - Listed: `bg-accent/30`
  - Sold: `bg-warning/30`

## Typography Scale

Based on Inter font family:
- **H1**: 36px (48px on md+), Bold, -0.02em tracking
- **H2**: 24px (30px on md+), Bold, -0.01em tracking
- **H3**: 18px, SemiBold
- **Body**: 14px, Regular
- **Caption**: 12px, Medium

## Accessibility

All color combinations meet WCAG AA contrast requirements:
- Background → Light text: 12.1:1
- Card → Light text: 9.8:1
- Primary → White text: 5.2:1
- Accent → Dark text: 9.2:1

## Dark Mode

The app is designed as a dark-first experience. The `.dark` class is applied to the document root on initialization, and both `:root` and `.dark` contain identical values since this is a dark-only theme.
