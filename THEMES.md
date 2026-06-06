# Jiffies CSS — Authoring Themes

A Jiffies CSS theme is a single `:root[data-theme="name"] {}` block that
overrides CSS custom properties. No element selectors or structural rules are needed.

This guide covers the three effort tiers and all public variables available to
theme authors.

---

## Applying a Theme

Set `data-theme` on the root element:

```html
<html data-theme="bento">
```

Switch at runtime:

```js
document.documentElement.dataset.theme = "paper";
```

Built-in values: `canvas`, `bento`, `paper`, `neumorphism`. Any custom name
you define in a theme file works the same way.

---

## Theme File Structure

A theme file belongs in `@layer theme`. Using this layer ensures the
`[data-theme]` attribute selector (specificity 0,1,1) beats a bare `:root`
(0,1,0) declaration from the default Intent tokens, and that custom themes
can override the built-in ones.

```css
@layer theme {
  :root[data-theme="mytheme"] {
    /* your variable overrides */
  }
}
```

Dark mode overrides go in a media block inside the same `@layer theme`:

```css
@layer theme {
  :root[data-theme="mytheme"] {
    --color-surface: #f5f5f5;
  }

  @media (prefers-color-scheme: dark) {
    :root[data-theme="mytheme"] {
      --color-surface: #1a1a1a;
    }
  }
}
```

---

## Tier 1 — One Variable: Color Identity

The entire color scheme derives from a single seed:

| Variable | Type | Default | Effect |
|---|---|---|---|
| `--brand-color` | `oklch()` | `oklch(55% 0.18 255deg)` | Seeds all five M3 tonal palettes and all semantic role tokens. |

Change the hue from 255 (blue) to 30 (amber) and every surface, button, link,
badge, chip, and state indicator shifts together, in both light and dark mode.
The palettes stay perceptually uniform because the engine operates in oklch.

```css
@layer theme {
  :root[data-theme="amber"] {
    --brand-color: oklch(55% 0.18 30deg);
  }
}
```

One line. Complete color rebranding.

---

## Tier 2 — ~9 Variables: Spatial and Typographic Character

These variables control how the design feels dimensionally: tight or airy,
serif or grotesque, sharp or soft.

### Spacing Density

| Variable | Default | Effect |
|---|---|---|
| `--base-size` | `8px` | The single spacing atom. Drives the full t-shirt scale: xsmall (÷4), small (÷2), base, medium (×2), large (×3), xlarge (×4). All padding, margin, gap, and block rhythm derive from this. |

Examples: `4px` (compact), `10px` (slightly airier), `16px` (open).

### Type Scale Ratio

| Variable | Default | Effect |
|---|---|---|
| `--font-scale` | `1.25` (major third) | All six heading sizes derive from `base-font-size × font-scale^(7-n)`. `1.125` (major second) flattens the hierarchy; `1.414` (augmented fourth) dramatizes it. |

### Geometry Language

| Variable | Default | Controls |
|---|---|---|
| `--border-radius-container` | `0.5rem` | Cards, modals, panels |
| `--border-radius-item` | `0.25rem` | Buttons, inputs, badges |
| `--border-radius-inline` | `0.125rem` | Small chrome: chips, progress bars |

The role aliases `--border-radius-button` and `--border-radius-input` default to
`--border-radius-item`; override them individually for finer control.

### Typographic Voice

| Variable | Default | Role |
|---|---|---|
| `--brand-body-font-family` | Poppins | Body copy and paragraph text |
| `--brand-header-font-family` | Libre Baskerville | h1–h6 |
| `--brand-nav-font-family` | Roboto | Navigation links |
| `--brand-monospace-font-family` | JetBrains Mono | `code`, `pre`, `kbd` |

These override the named defaults and fall through to the system stack if
the web font is unavailable. A theme that sets only two of the four is valid;
the others resolve to their defaults.

```css
@layer theme {
  :root[data-theme="editorial"] {
    --brand-color: oklch(45% 0.14 170deg);
    --base-size: 10px;
    --font-scale: 1.333;
    --border-radius-container: 0;
    --border-radius-item: 0;
    --brand-header-font-family: "Playfair Display";
    --brand-body-font-family: "Source Serif 4";
  }
}
```

Nine variables. Distinct spatial and typographic identity.

---

## Tier 3 — ~30 Variables: Complete Visual Skin

These variables control surface treatment, depth model, motion personality,
and fine typographic tuning.

### Semantic Color Roles

The M3 derivation engine computes semantic role tokens from `--brand-color`.
Override individual roles for fine control without touching the seed:

| Variable | Light-mode default | Dark-mode default |
|---|---|---|
| `--color-primary` | tone 40 of primary palette | tone 80 |
| `--color-on-primary` | tone 100 | tone 20 |
| `--color-primary-container` | tone 90 | tone 30 |
| `--color-on-primary-container` | tone 10 | tone 90 |
| `--color-secondary` | tone 40 of secondary palette | tone 80 |
| `--color-on-secondary` | tone 100 | tone 20 |
| `--color-secondary-container` | tone 90 | tone 30 |
| `--color-on-secondary-container` | tone 10 | tone 90 |
| `--color-tertiary` | tone 40 of tertiary palette | tone 80 |
| `--color-on-tertiary` | tone 100 | tone 20 |
| `--color-surface` | tone 98 of neutral palette | tone 6 |
| `--color-on-surface` | tone 10 | tone 90 |
| `--color-surface-variant` | tone 90 of neutral-variant | tone 30 |
| `--color-on-surface-variant` | tone 30 | tone 80 |
| `--color-background` | tone 98 of neutral | tone 6 |
| `--color-on-background` | tone 10 | tone 90 |
| `--color-outline` | tone 50 of neutral-variant | tone 60 |
| `--color-outline-variant` | tone 80 | tone 30 |

Overriding a role bypasses the derivation for that one outcome. The contrast
guarantee (M3 tone-distance pairing) no longer applies to an overridden pair —
run `test/computed/contrast.test.mjs` against your brand hue to verify.

Surface aliases consumed by specific components:

| Variable | Default | Consumer |
|---|---|---|
| `--page-background-color` | `var(--color-background)` | `body` background |
| `--card-background-color` | `var(--color-surface)` | `article` background |
| `--card-color` | `var(--color-on-surface)` | `article` text |

### Elevation and Borders

| Variable | Default | Effect |
|---|---|---|
| `--card-shadow` | M3 resting elevation (two `color-mix()` shadows) | `article` box-shadow |
| `--card-border` | `none` | `article` border (flat themes supply a hairline here) |
| `--card-inner-border` | `var(--base-border)` | Divider between card header/main/footer |
| `--base-border-size` | `var(--size-xsmall)` = 2px | Border width everywhere |
| `--base-border-style` | `solid` | Border style everywhere (`none` removes all structural borders) |
| `--base-border-color` | `var(--color-outline)` | Border color everywhere |
| `--page-end-border` | `var(--base-border)` | `body > header` / `body > footer` border |

To switch from shadow-based elevation to border-based elevation (as `paper` does):

```css
--card-shadow: none;
--card-border: 1px solid var(--color-outline-variant);
```

### Layout Density

| Variable | Default | Effect |
|---|---|---|
| `--grid-gap` | `var(--size-base)` = 8px | Gap between `.grid` children |
| `--content-columns` | responsive (1–4) | Multi-column flow inside card `main` |

### Motion Personality

| Variable | Default | Effect |
|---|---|---|
| `--motion-duration-snap` | `115ms` | Hover/focus state flips |
| `--motion-duration-shake` | `165ms` | Attention nudges (invalid input) |
| `--motion-duration-draw` | `250ms` | Accordion/drawer reveals |
| `--motion-curve-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |
| `--motion-curve-sticky` | `cubic-bezier(0.5, 0, 0.1, 1)` | Lingering reveals |
| `--motion-curve-draw` | `cubic-bezier(0.2, 0, 0, 1)` | Emphasized long-tail reveals |

A zero-motion theme (like `paper`): set all three durations to `0s`.
A snappy theme: set snap and shake to `75ms`.

### Fine Typographic Tuning

| Variable | Default | Effect |
|---|---|---|
| `--heading-font-weight` | `700` | h1–h6 weight |
| `--base-font-weight` | `normal` | Body paragraph weight |
| `--label-font-weight` | `500` | Button and UI label weight |
| `--form-label-font-weight` | `700` | Form field label weight |
| `--table-font-family` | `var(--body-font-family)` | Table cell typeface (canvas uses Trebuchet MS for a distinct tabular face) |
| `--label-letter-spacing` | `normal` | Letter spacing for button / UI labels |
| `--nav-text-transform` | `none` | Text transform for nav links (`uppercase` is common) |

### Interactive Depth

| Variable | Default | Effect |
|---|---|---|
| `--button-shadow-active` | `none` | Box-shadow on `button:active` (neumorphism uses deep inset shadows here) |

---

## The Zen Garden Test

A theme passes the Zen Garden test when it is a single `:root[data-theme="name"] { … }`
block with no element selectors and no structural rules. Removing the theme file
must revert the page to a valid (if plain) default state.

If you find yourself writing `[data-theme="mytheme"] article { … }` or
`[data-theme="mytheme"] button:hover { … }`, that is a signal: a variable
in the tier-3 table above is either missing from your override or not yet
published as a token. File an issue or submit a PR adding the missing token;
use the element-selector workaround until then, confined to `@layer user`
inside the theme file.

---

## Complete Tier-3 Example: Neumorphism

The neumorphism theme shows what a complete tier-3 skin looks like — one
continuous material, shadow-only depth, no flat borders, with a full dark-mode
block. All decisions are variable overrides; the element-selector rules for
buttons and inputs are workarounds for surface-to-element plumbing that the
bridge token layer now exposes cleanly via `--card-shadow`, `--card-border`,
and `--button-shadow-active`.

```css
@layer theme {
  :root[data-theme="neumorphism"] {
    /* Typographic voice */
    --brand-body-font-family: "Space Mono";
    --brand-header-font-family: "Space Mono";
    --brand-nav-font-family: "Space Mono";
    --brand-monospace-font-family: "JetBrains Mono";

    /* Geometry */
    --border-radius-container: 1.25rem;
    --border-radius-item: 0.875rem;
    --border-radius-button: 0.875rem;
    --border-radius-input: 0.875rem;

    /* Surface: mid-gray plane — one continuous material. */
    --color-surface: #e0e0e0;
    --color-on-surface: #2a2a2a;
    --color-background: #e0e0e0;
    --page-background-color: #e0e0e0;

    /* Remove flat borders — shadow defines every edge. */
    --base-border-color: transparent;
    --card-inner-border: none;

    /* Shadow vocabulary (private) */
    --_nmph-light: rgba(255, 255, 255, 0.85);
    --_nmph-dark: rgba(0, 0, 0, 0.18);
    --_nmph-outset:
      8px 8px 20px var(--_nmph-dark),
      -8px -8px 20px var(--_nmph-light);
    --_nmph-inset:
      inset 5px 5px 12px var(--_nmph-dark),
      inset -5px -5px 12px var(--_nmph-light);
    --_nmph-press:
      inset 6px 6px 16px var(--_nmph-dark),
      inset -6px -6px 16px var(--_nmph-light);

    /* Bridge tokens consumed by card.css and buttons.css */
    --card-shadow: var(--_nmph-outset);
    --card-border: none;
    --button-shadow-active: var(--_nmph-press);
  }

  @media (prefers-color-scheme: dark) {
    :root[data-theme="neumorphism"] {
      --color-surface: #2a2a2a;
      --color-on-surface: #e0e0e0;
      --color-background: #2a2a2a;
      --page-background-color: #2a2a2a;
      --_nmph-light: rgba(255, 255, 255, 0.07);
      --_nmph-dark: rgba(0, 0, 0, 0.55);
    }
  }
}
```

---

## Variable Reference Summary

| Tier | Variable count | What changes |
|---|---|---|
| 1 | 1 (`--brand-color`) | Entire color identity |
| 2 | ~9 (`--base-size`, `--font-scale`, 3 radius, 4 font-family) | Density, type scale, geometry, typographic voice |
| 3 | ~30 (color roles, surface, shadow, border, motion, fine type) | Full visual skin |

A complete tier-3 theme is 30–40 variable declarations in a single `:root[data-theme="name"]`
block. No element selectors. No structural rules. Swap the attribute, the page transforms.
