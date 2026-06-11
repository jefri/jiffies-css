# Variable Hierarchy: From One to Dozens

This maps the current jiffies-css variable surface to three effort tiers,
identifies what each tier controls, and flags where current themes are forced
into element-selector workarounds because a tier-3 token is missing.

---

## Tier 1 — One variable: new color identity

**`--brand-color: oklch(L% C H)`**

This single oklch value seeds the entire M3 tonal engine in `functions.css`.
From it, the engine derives five tonal palettes (primary, secondary, tertiary,
neutral, neutral-variant) each at 14 lightness steps, plus the fixed error/info/
success/warning palettes. All semantic roles in `theme/colors.css` resolve from
these derived tones.

Result: change the hue from 255 (blue) to 30 (amber) and every surface, button,
link, badge, and state chip shifts together, light and dark mode included. The
palette stays perceptually uniform because the engine operates in oklch.

**What a tier-1 theme file looks like:**
```css
:root { --brand-color: oklch(55% 0.18 30deg); }  /* amber */
```

One line. Complete color rebranding.

---

## Tier 2 — A few variables: spatial and typographic character

These ~9 variables control how the design feels dimensionally: tight or airy,
serif or grotesque, sharp or soft.

### Spacing density (1 variable)

| Variable | Default | Effect |
|---|---|---|
| `--base-size` | `8px` | Drives the full t-shirt scale: xsmall (2px) → small (4px) → base (8px) → medium (16px) → large (24px) → xlarge (32px). All padding, margin, gap, and block rhythm derive from this single atom. |

Alternatives: `--base-size: 4px` (compact density), `--base-size: 16px` (loose density). Both are already supported via `.compact` / `.loose` class shims, but they could equally be theme-level overrides.

### Type scale ratio (1 variable)

| Variable | Default | Effect |
|---|---|---|
| `--font-scale` | `1.25` (major third) | All six heading sizes derive from `base-font-size × font-scale^(7-n)`. Changing the ratio to 1.125 (major second) flattens the hierarchy; 1.414 (augmented fourth) dramatizes it. |

### Geometry language (3 variables)

| Variable | Default | Controls |
|---|---|---|
| `--border-radius-container` | `0.5rem` | Cards, modals, panels |
| `--border-radius-item` | `0.25rem` | Buttons, inputs, badges (via their role aliases) |
| `--border-radius-inline` | `0.125rem` | Small chrome: chips, progress bars |

The current themes show the range: canvas (`0.5rem/0.25rem`) → bento (`8px/4px`) → paper (`2px/1px`) → neumorphism (`1rem/0.75rem`). These three variables express the entire corner-softness language.

### Typographic voice (up to 4 variables)

| Variable | Default | Role |
|---|---|---|
| `--brand-body-font-family` | Poppins | Body copy, paragraph text |
| `--brand-header-font-family` | Libre Baskerville | h1–h6 |
| `--brand-nav-font-family` | Roboto | Navigation links |
| `--brand-monospace-font-family` | JetBrains Mono | `code`, `pre`, `kbd` |

These sit in front of the named defaults and the system stack fallback, so
a theme that sets only `--brand-body-font-family` and `--brand-header-font-family`
is complete; the others fall through to sensible defaults.

**What a tier-2 theme file looks like:**
```css
:root[data-theme="editorial"] {
  --brand-color: oklch(45% 0.14 170deg);   /* teal brand */
  --base-size: 10px;                        /* slightly airier */
  --font-scale: 1.333;                      /* perfect fourth — more dramatic headings */
  --border-radius-container: 0;             /* sharp geometry */
  --border-radius-item: 0;
  --brand-header-font-family: "Playfair Display";
  --brand-body-font-family: "Source Serif 4";
}
```

Nine variables. Distinct spatial and typographic identity.

---

## Tier 3 — A few dozen variables: complete visual skin

These variables control surface treatment, depth, motion personality, and fine
typographic tuning. They go beyond character into full visual identity.

### Surface treatment (currently partially missing from the token API)

| Variable | Status | Controls |
|---|---|---|
| `--card-background-color` | exists (bridge alias to `--color-surface`) | Card fill |
| `--page-background-color` | exists (bridge alias to `--color-background`) | Page fill |
| `--color-surface` | exists, overridable | Base surface — neumorphism overrides this directly to `#e0e0e0` |
| **`--card-shadow`** | **missing** | The elevation shadow on `article`. Currently hardcoded as `0 1px 2px ... / 0 2px 6px ...` in `card.css`. Paper and neumorphism need element rules to override it. |
| **`--card-border`** | **missing** | The flat-panel border on `section`. Aliases `--base-border` but themes can't yet suppress or replace it via a token. |

### Border personality (3–4 variables)

| Variable | Default | Controls |
|---|---|---|
| `--base-border-size` | `--size-xsmall` (2px) | Border width everywhere |
| `--base-border-style` | `solid` | Can be `dashed`, `dotted`, `none` |
| `--base-border-color` | `--color-outline` | All structural borders |
| `--base-border` | composed shorthand | The composed triple read by most components |

A theme expressing "no structural borders, shadow only" needs only `--base-border-style: none` — but currently has no token for the card elevation that replaces borders as the depth cue.

### Motion personality (5 variables)

All already tokenized in `theme/animation.css`:

| Variable | Default | Controls |
|---|---|---|
| `--motion-duration-snap` | `115ms` | Hover/focus state flips |
| `--motion-duration-shake` | `165ms` | Attention nudges |
| `--motion-duration-draw` | `250ms` | Accordion/drawer reveals |
| `--motion-curve-smooth` | `cubic-bezier(0.4,0,0.2,1)` | Standard transitions |
| `--motion-curve-sticky` | `cubic-bezier(0.5,0,0.1,1)` | Lingering reveals |

A "snappy" theme sets all durations to 75ms. A "slow editorial" theme sets draw to 600ms with a custom curve. Paper disables motion via `transition: none` in element rules; a `--motion-duration-draw: 0s` override in the token layer would be cleaner.

### Fine typographic tuning

| Variable | Status | Controls |
|---|---|---|
| `--base-font-weight` | declared (`normal`), underused | Body weight; headings are hardcoded to their UA default |
| **`--heading-font-weight`** | **missing** | h1–h6 weight (bold/700 is implicit from UA, not a token) |
| **`--label-letter-spacing`** | **missing** | All-caps labels, button text tracking |
| **`--nav-text-transform`** | **missing** | Uppercase nav links (common in certain design languages) |

### Layout density

| Variable | Status | Controls |
|---|---|---|
| **`--grid-gap`** | **missing** | Default gap between `.grid` children. Bento tightens this via an element rule (`[data-theme="bento"] .grid { gap: var(--size-small) }`). A token here would eliminate that workaround. |
| `--content-columns` | exists (responsive) | Multi-column flow inside card `main` |

---

## The Zen Garden Test: where current themes break it

The four existing themes (canvas, bento, paper, neumorphism) all have an
`@layer user` block containing element-selector rules. That block exists because
certain visual decisions aren't yet expressed as tokens that the base CSS reads.
Each element rule in `@layer user` identifies a missing tier-3 token:

| Theme | `@layer user` rule | Missing token |
|---|---|---|
| bento | `article { background: surface-variant }` | `--card-background-color` already exists but bento needs a "tile fill" alias |
| bento | `.grid { gap: size-small }` | `--grid-gap` |
| paper | `article { box-shadow: none; border: 1px solid outline-variant }` | `--card-shadow`, `--card-border` |
| paper | `transition: none` | Theme-level motion off: `--transition-time: 0s` would suffice |
| neumorphism | `article { box-shadow: 6px 6px 12px ... }` | `--card-shadow` |
| neumorphism | `button:active { box-shadow: inset ... }` | `--button-shadow-active` |
| neumorphism | `border-color: transparent` | `--base-border-style: none` or a `--card-border: none` token |

Closing these gaps reduces each theme to pure variable overrides and eliminates
all element selectors from theme files entirely. That is the complete Zen Garden
model: a theme is only a `:root[data-theme="name"] { ... }` block with no structural rules.

---

## Summary: the full tier table

| Tier | Variables | What changes |
|---|---|---|
| 1 | 1 (`--brand-color`) | Entire color identity |
| 2 | ~9 (`--base-size`, `--font-scale`, 3 radius, 4 font-family) | Density, type scale, geometry, typographic voice |
| 3 | ~20–30 (surface, shadow, border, motion, fine type) | Full visual skin — depth model, motion personality, editorial detail |

A Zen Garden theme at tier-3 completeness is ~30–40 variable declarations in a single
`:root[data-theme="name"]` block. No element selectors. No structural rules.
Swap the theme, the page transforms.
