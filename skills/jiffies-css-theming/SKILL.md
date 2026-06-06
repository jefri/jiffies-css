---
name: jiffies-css-theming
description: Use when creating, modifying, or debugging a jiffies-css theme — setting brand colors, fonts, spacing, border-radius, shadows, or any design tokens. Apply when asked to add a new theme, customize an existing theme, or understand why a theme variable is not having the expected effect.
---

# jiffies-css Theming

## Overview

A jiffies-css theme is a single `:root[data-theme="name"] {}` block containing only CSS custom property declarations. No element selectors. No media queries. No rules. One block, variables only.

The system derives all colors from one brand seed using the Material 3 tonal palette model with OKLCH. You do not specify individual component colors — you set Intent tokens and the derivation engine propagates them.

## The Three-Tier Model

Themes override variables at three levels of effort. Start at Tier 1. Add tiers only when you need more control.

### Tier 1: color identity

```css
:root[data-theme="ocean"] {
  --brand-color: oklch(55% 0.14 215deg);
}
```

This single line drives all five Material 3 tonal palettes and every semantic color role in the system. Hue angle is the primary tuning dial: 0=red, 30=amber, 120=green, 215=blue-cyan, 300=purple.

### Tier 2: spatial and typographic character

```css
:root[data-theme="ocean"] {
  --brand-color: oklch(55% 0.14 215deg);

  /* Spatial rhythm */
  --base-size: 8px;           /* 4px = compact, 16px = loose */
  --font-scale: 1.25;         /* 1.125 = flat, 1.333 = dramatic */
  --border-radius-container: 0.5rem;
  --border-radius-item: 0.25rem;
  --border-radius-inline: 0.125rem;

  /* Typefaces */
  --brand-body-font-family: "Inter", sans-serif;
  --brand-header-font-family: "Inter", sans-serif;
  --brand-nav-font-family: "Inter", sans-serif;
  --brand-monospace-font-family: "JetBrains Mono", monospace;
}
```

### Tier 3: complete visual skin

Override semantic role tokens when the derivation engine's output does not match your design intent. These are the full list of Intent tokens:

**Semantic color roles** (OKLCH values):
- `--color-primary` / `--color-on-primary`
- `--color-primary-container` / `--color-on-primary-container`
- `--color-secondary` / `--color-on-secondary`
- `--color-secondary-container` / `--color-on-secondary-container`
- `--color-tertiary` / `--color-on-tertiary`
- `--color-tertiary-container` / `--color-on-tertiary-container`
- `--color-error` / `--color-on-error`
- `--color-surface` / `--color-on-surface`
- `--color-surface-variant` / `--color-on-surface-variant`
- `--color-outline` / `--color-outline-variant`

**Elevation and borders**:
- `--card-shadow` — box-shadow value for `<article>` (elevated card)
- `--card-border` — border shorthand for card perimeter
- `--card-inner-border` — border between card header/main/footer
- `--base-border-size`, `--base-border-style`, `--base-border-color`

**Layout**:
- `--grid-gap` — gap between grid cells
- `--content-columns` — default column count (override per breakpoint)

**Motion**:
- `--motion-duration-snap: 115ms`
- `--motion-duration-shake: 165ms`
- `--motion-duration-draw: 250ms`
- `--motion-smooth`, `--motion-sticky`, `--motion-draw` — easing curves

**Typography fine-tuning**:
- `--heading-font-weight`, `--base-font-weight`, `--label-font-weight`
- `--form-label-font-weight`, `--table-font-family`
- `--label-letter-spacing`, `--nav-text-transform`

**Interactive depth**:
- `--button-shadow-active` — box-shadow on pressed state

## Complete Theme Example

```css
/* ocean.css — Tier 2 theme */
:root[data-theme="ocean"] {
  --brand-color: oklch(55% 0.14 215deg);

  --base-size: 8px;
  --font-scale: 1.25;
  --border-radius-container: 0.75rem;
  --border-radius-item: 0.375rem;
  --border-radius-inline: 0.125rem;

  --brand-body-font-family: "Inter", system-ui, sans-serif;
  --brand-header-font-family: "Playfair Display", Georgia, serif;
  --brand-nav-font-family: "Inter", system-ui, sans-serif;
  --brand-monospace-font-family: "JetBrains Mono", monospace;
}
```

## Applying a Theme

```html
<html data-theme="ocean">
```

or at the component level:

```html
<section data-theme="ocean">
  <!-- everything inside uses ocean tokens -->
</section>
```

## OKLCH Quick Reference

All color values must use `oklch()`. The three channels are:
- **L** (lightness): 0–100%, where 0=black, 100=white
- **C** (chroma): 0–0.4, where 0=gray, 0.4=maximally saturated, but not uniform. Different hues have different ranges of acceptable chroma.
- **H** (hue): 0–360deg angle

| Color family | Approximate hue |
|---|---|
| Red | 30deg |
| Orange | 55deg |
| Amber/Gold | 80deg |
| Yellow-Green | 130deg |
| Green | 145deg |
| Teal | 185deg |
| Blue-Cyan | 215deg |
| Blue | 250deg |
| Indigo | 275deg |
| Purple | 300deg |
| Magenta | 330deg |
| Pink-Red | 10deg |

A good brand color for a mid-tone interactive palette: L=50–60%, C=0.12–0.20.

## Common Mistakes

- Using `hsl()` or `rgb()` — all color tokens must be `oklch()`.
- Adding element selectors inside the theme block — themes contain only custom property declarations.
- Overriding component variables like `--_button-fill` directly — these are private (`--_` prefix) and belong to the derivation engine; override the Intent token instead.
- Setting `--color-primary` to a hex value — the derivation engine expects OKLCH for relative color math to work.
- Creating a Tier 3 override for a color role when changing `--brand-color` hue would achieve the same effect — start at Tier 1.
- Writing separate light/dark rules in the theme — dark mode is handled by the framework's role reassignment; only provide one theme block.
- Adding `prefers-color-scheme` media queries — the framework already handles OS dark mode; your theme block applies to both modes automatically.
