# Design System — DataBridge

Design system for a business data import & report generation SaaS.
Rich, polished dark UI with high information density and clean lines.

---

## Overview

Dark-themed, minimal interface built for professional business workflows.
Clean lines, low visual noise, high information density.
Balances trust and sophistication for enterprise SaaS.

---

## Colors

### Core Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2665fd` | CTAs, active states, key interactive elements |
| Secondary | `#475569` | Supporting UI, chips, secondary actions |
| Surface | `#0b1326` | Page backgrounds |
| On-surface | `#dae2fd` | Primary text on dark backgrounds |
| Error | `#ffb4ab` | Validation errors, destructive actions |

### Extended Palette

| Token | Value | Usage |
|-------|-------|-------|
| Surface-variant | `#111b33` | Card backgrounds, input field backgrounds |
| Surface-elevated | `#152040` | Hover states, dropdowns, modal backgrounds |
| Border | `#1e2d4d` | Card / table / input borders |
| Border-subtle | `#162038` | Section dividers, subtle boundaries |
| Primary-hover | `#4d83fd` | Primary button hover |
| Primary-muted | `rgba(38, 101, 253, 0.12)` | Active nav background, selected row highlight |
| Success | `#4ade80` | Completed status, success notifications |
| Warning | `#fbbf24` | Warning status, caution indicators |
| Text-secondary | `#8896b3` | Secondary text, placeholders |
| Text-disabled | `#4a5568` | Disabled state text |

---

## Typography

Font family: **Inter** (Google Fonts)

| Role | Weight | Size | Letter Spacing | Usage |
|------|--------|------|----------------|-------|
| Display | Semi-bold (600) | 28px | -0.02em | Page titles |
| Headline | Semi-bold (600) | 20px | -0.01em | Section headings |
| Title | Medium (500) | 16px | 0 | Card titles, dialog headings |
| Body | Regular (400) | 14px | 0 | Body text |
| Body-small | Regular (400) | 13px | 0 | Table cells, supplementary text |
| Label | Medium (500) | 12px | 0.06em | Section headers (uppercase), form labels |
| Caption | Regular (400) | 11px | 0.02em | Timestamps, metadata |

---

## Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| spacing-xs | 4px | Gap between icon and text |
| spacing-sm | 8px | Compact inner padding |
| spacing-md | 16px | Standard padding, card inner padding |
| spacing-lg | 24px | Section gap |
| spacing-xl | 32px | Page padding |
| spacing-2xl | 48px | Large section gap |

### Grid

- Sidebar width: 256px (fixed)
- Main content max-width: 1440px
- Content padding: 32px (desktop) / 16px (mobile)

---

## Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 6px | Chips, badges, small elements |
| radius-md | 8px | Buttons, input fields |
| radius-lg | 12px | Cards, dropdowns |
| radius-xl | 16px | Modals, main content area |

---

## Elevation & Depth

Flat design by default. Elevation is expressed through border and background contrast.
Box-shadow is used sparingly.

| Level | Style | Usage |
|-------|-------|-------|
| Level 0 | Border only | Cards, tables |
| Level 1 | `0 1px 3px rgba(0,0,0,0.3)` | Dropdowns, popovers |
| Level 2 | `0 4px 24px rgba(0,0,0,0.4)` | Modals, dialogs |
| Glow | `0 0 20px rgba(38,101,253,0.15)` | Focus rings, active element emphasis |

---

## Components

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Primary | `#2665fd` | `#ffffff` | none | Main CTAs (import, save, generate) |
| Secondary | transparent | `#dae2fd` | `#1e2d4d` | Secondary actions (cancel, back) |
| Ghost | transparent | `#8896b3` | none | In-table actions, navigation |
| Destructive | transparent | `#ffb4ab` | `#ffb4ab33` | Delete, destructive operations |
| Disabled | `#1e2d4d` | `#4a5568` | none | Disabled state |

- border-radius: 8px
- padding: 8px 16px (default) / 6px 12px (small)
- Hover: lighten background + subtle transition (150ms ease)
- Focus: Primary glow ring

### Inputs

- background: `#111b33`
- border: 1px solid `#1e2d4d`
- border-radius: 8px
- padding: 10px 12px
- text: `#dae2fd`
- placeholder: `#4a5568`
- Focus: border-color `#2665fd` + glow ring
- Error: border-color `#ffb4ab`

### Cards

- background: `#111b33`
- border: 1px solid `#1e2d4d`
- border-radius: 12px
- padding: 24px
- No elevation (separation via border and background contrast)
- Hover (when clickable): border-color `#2665fd40`

### Tables

- Header background: `#0d1730`
- Header text: `#8896b3` (Label style, uppercase)
- Row background: transparent
- Row hover: `rgba(38, 101, 253, 0.06)`
- Row border: 1px solid `#162038`
- Cell text: `#dae2fd` (Body-small)
- Selected row: `rgba(38, 101, 253, 0.12)` background

### Badges / Status

| Status | Background | Text | Usage |
|--------|-----------|------|-------|
| Completed | `rgba(74, 222, 128, 0.12)` | `#4ade80` | Completed jobs |
| In Progress | `rgba(38, 101, 253, 0.12)` | `#4d83fd` | Processing jobs |
| Failed | `rgba(255, 180, 171, 0.12)` | `#ffb4ab` | Failed jobs |
| Warning | `rgba(251, 191, 36, 0.12)` | `#fbbf24` | Warnings, needs attention |
| Pending | `rgba(136, 150, 179, 0.12)` | `#8896b3` | Queued, waiting |

- border-radius: 6px
- padding: 2px 8px
- font: Label (12px, medium)

### Sidebar Navigation

- background: `#0b1326` (same as Surface)
- item padding: 10px 16px
- Active: `rgba(38, 101, 253, 0.12)` background + `#2665fd` text + 2px left border `#2665fd`
- Inactive: `#8896b3` text
- Hover: `#111b33` background

### Dialogs / Modals

- overlay: `rgba(0, 0, 0, 0.6)` + backdrop-blur 4px
- background: `#111b33`
- border: 1px solid `#1e2d4d`
- border-radius: 16px
- shadow: Level 2
- padding: 24px

### Toast Notifications

- background: `#152040`
- border: 1px solid `#1e2d4d`
- border-radius: 8px
- left border: 3px solid (status color)

---

## Iconography

- Library: **Lucide React**
- Size: 16px (inline) / 20px (navigation) / 24px (empty state)
- Color: inherit from parent text color
- Stroke width: 1.5px (default)

---

## Motion & Transitions

| Property | Duration | Easing | Usage |
|----------|----------|--------|-------|
| Color / Background | 150ms | ease | Button hover, link hover |
| Transform | 200ms | ease-out | Dropdown expand, tooltips |
| Opacity | 200ms | ease-in-out | Modal show/hide, fade-in |
| Layout | 250ms | ease-in-out | Accordion, panel toggle |

---

## Do's and Don'ts

### Do's

- Use Primary (`#2665fd`) sparingly — only for the most important action
- Maintain 4:1+ contrast ratio for all text
- Always use color + text label for status (never color alone)
- Keep tables high-density for scannability
- Provide illustration/icon + description + CTA for empty states

### Don'ts

- Don't mix rounded and sharp corners in the same view
- Don't overuse Primary color for decoration
- Don't use `#0b1326` (Surface) as text color (insufficient contrast)
- Don't stack borders (e.g. card containing a bordered table)
- Don't nest cards more than 2 levels deep

---

## Accessibility

- Target WCAG AA for all text (4.5:1 normal text / 3:1 large text)
- Always show focus indicators on interactive elements
- Add `aria-label` to icon-only buttons
- Convey status with text labels, not color alone
- Support full keyboard navigation across all views
