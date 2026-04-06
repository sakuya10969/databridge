# Design System — DataBridge

Design system for a business data import & report generation SaaS.
Light-based, clean, professional interface with high information density.

---

## Overview

Light-themed interface built for enterprise business workflows.
Clean lines, low visual noise, high information density.
White base with brand blue accents for trust and clarity.

---

## Colors

### Core Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2665fd` | CTAs, active states, key interactive elements |
| Secondary | `#475569` | Supporting UI, chips, secondary actions |
| Surface | `#ffffff` | Page backgrounds, card backgrounds |
| On-surface | `#0f172a` | Primary text on light backgrounds |
| Error | `#dc2626` | Validation errors, destructive actions |

### Extended Palette

| Token | Value | Usage |
|-------|-------|-------|
| Surface-page | `#f8fafc` | Page background (subtle gray) |
| Surface-elevated | `#ffffff` | Cards, modals, popovers |
| Border | `#e2e8f0` | Card / table / input borders |
| Border-subtle | `#f1f5f9` | Section dividers, subtle boundaries |
| Primary-hover | `#1d4ed8` | Primary button hover |
| Primary-muted | `rgba(38, 101, 253, 0.08)` | Active nav background, selected row |
| Success | `#16a34a` | Completed status, success notifications |
| Warning | `#d97706` | Warning status, caution indicators |
| Text-secondary | `#64748b` | Secondary text, placeholders |
| Text-disabled | `#94a3b8` | Disabled state text |

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

Light, subtle shadows to create depth hierarchy.

| Level | Style | Usage |
|-------|-------|-------|
| Level 0 | Border only | Inline cards, tables |
| Level 1 | `0 1px 3px rgba(0,0,0,0.08)` | Cards, dropdowns |
| Level 2 | `0 4px 24px rgba(0,0,0,0.12)` | Modals, dialogs |
| Ring | `0 0 0 3px rgba(38,101,253,0.15)` | Focus rings |

---

## Components

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Primary | `#2665fd` | `#ffffff` | none | Main CTAs (import, save, generate) |
| Secondary | `#ffffff` | `#0f172a` | `#e2e8f0` | Secondary actions (cancel, back) |
| Ghost | transparent | `#64748b` | none | In-table actions, navigation |
| Destructive | `#dc2626` | `#ffffff` | none | Delete, destructive operations |
| Disabled | `#f1f5f9` | `#94a3b8` | none | Disabled state |

- border-radius: 8px
- padding: 8px 16px (default) / 6px 12px (small)
- Hover: darken background + subtle transition (150ms ease)
- Focus: Primary focus ring

### Inputs

- background: `#ffffff`
- border: 1px solid `#e2e8f0`
- border-radius: 8px
- padding: 10px 12px
- text: `#0f172a`
- placeholder: `#94a3b8`
- Focus: border-color `#2665fd` + focus ring
- Error: border-color `#dc2626`

### Cards

- background: `#ffffff`
- border: 1px solid `#e2e8f0`
- border-radius: 12px
- padding: 24px
- shadow: Level 1
- Hover (when clickable): border-color `#2665fd`, shadow slightly stronger

### Tables

- Header background: `#f8fafc`
- Header text: `#64748b` (Label style, uppercase)
- Row background: `#ffffff`
- Row hover: `rgba(38, 101, 253, 0.04)`
- Row border: 1px solid `#f1f5f9`
- Cell text: `#0f172a` (Body-small)
- Selected row: `rgba(38, 101, 253, 0.08)` background

### Badges / Status

| Status | Background | Text | Usage |
|--------|-----------|------|-------|
| Completed | `#f0fdf4` | `#16a34a` | Completed jobs |
| In Progress | `#eff6ff` | `#2665fd` | Processing jobs |
| Failed | `#fef2f2` | `#dc2626` | Failed jobs |
| Warning | `#fffbeb` | `#d97706` | Warnings, needs attention |
| Pending | `#f8fafc` | `#64748b` | Queued, waiting |

- border-radius: 6px
- padding: 2px 8px
- font: Label (12px, medium)

### Sidebar Navigation

- background: `#ffffff`
- border-right: 1px solid `#e2e8f0`
- item padding: 10px 16px
- Active: `rgba(38, 101, 253, 0.08)` background + `#2665fd` text + 2px left border `#2665fd`
- Inactive: `#64748b` text
- Hover: `#f8fafc` background

### Dialogs / Modals

- overlay: `rgba(0, 0, 0, 0.4)` + backdrop-blur 4px
- background: `#ffffff`
- border: 1px solid `#e2e8f0`
- border-radius: 16px
- shadow: Level 2
- padding: 24px

### Toast Notifications

- background: `#ffffff`
- border: 1px solid `#e2e8f0`
- border-radius: 8px
- shadow: Level 1
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
- Maintain 4.5:1+ contrast ratio for all text
- Always use color + text label for status (never color alone)
- Keep tables high-density for scannability
- Provide illustration/icon + description + CTA for empty states
- Use white cards on the subtle gray page background for depth

### Don'ts

- Don't mix rounded and sharp corners in the same view
- Don't overuse Primary color for decoration
- Don't stack borders (e.g. card containing a bordered table)
- Don't nest cards more than 2 levels deep
- Don't use pure black (`#000000`) for text — use `#0f172a` instead

---

## Accessibility

- Target WCAG AA for all text (4.5:1 normal text / 3:1 large text)
- Always show focus indicators on interactive elements
- Add `aria-label` to icon-only buttons
- Convey status with text labels, not color alone
- Support full keyboard navigation across all views
