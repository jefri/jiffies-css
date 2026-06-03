# Jiffies CSS — Design System (aspirational spec)

This is the **aspirational design-level specification** for Jiffies CSS: how the
library *should* work, researched and internally coherent — the target the
implementation builds toward. It is written for a **contributor** building or
extending the library.

It is not a consumer guide and not a rationale essay. For *why* the model is
shaped this way, read [PHILOSOPHY.md](PHILOSOPHY.md); for *how to install and use*
the library, read [README.md](README.md). This document states the ideal once and
cross-links those siblings rather than restating them.

> **Implementation status is never asserted here.** Where the ideal differs from
> the shipped CSS, the gap is a tracked item in
> [docs/developer/TASKS.md](docs/developer/TASKS.md), not an edit in this doc.

---

## 1 Purpose & Scope

### 1.1 Role vs PHILOSOPHY / README

`design_system.md` is the aspirational design-level spec — the ideal. Each section
answers one question: **"what should this part of the system be, in detail?"**

The three contributor- and consumer-facing documents divide cleanly:

| Document | Question it answers | Audience |
|---|---|---|
| **`design_system.md`** (this doc) | *What* should each part be, in detail? | Contributor (builds/extends) |
| **[PHILOSOPHY.md](PHILOSOPHY.md)** | *Why* is the model shaped this way? | Reader of rationale |
| **[README.md](README.md)** | *How* do I install and use it? | Consumer |

The contract between them:

- This doc **applies** PHILOSOPHY's three-tier variable model
  (Intent → Derivation → Application) and its classless/semantic conventions to
  concrete foundations and components. It does **not** re-explain the model; it
  links to PHILOSOPHY (§3.1, §3.4).
- This doc gives the contributor-facing detail behind README's consumer-facing
  responsive table, override-token list, and fonts. It does **not** duplicate
  README's install/usage material; it links to it.
- Implementation status — what currently ships versus what is still aspirational —
  is **never** asserted here. It lives in [TASKS.md](docs/developer/TASKS.md). A
  reader who wants "is this built yet?" goes to TASKS.md; a reader who wants "what
  is this supposed to be?" stays here.

### 1.2 Progress tracking via TASKS.md anchors

This document carries a **stable section-numbering scheme**. TASKS.md references
those numbers (`Ref §4.1`) as the link between an implementation task and the
spec section it builds toward. The contract:

- **Section numbers are stable identifiers.** A `§`-reference in TASKS.md must
  always resolve to a real heading here. This is verified mechanically by
  `test/design-system-anchors.test.mjs`.
- **Renumbering a section is a breaking change.** It requires a matching edit to
  every TASKS.md reference in the same change.
- **Adding a component appends a new `§4.x`.** It never renumbers an existing one,
  so historical references stay valid.
- This stable-anchor scheme is the agreed substitute for a separate conformance
  document; TASKS.md is the single progress tracker.

---

## 2 Foundations

The foundations are the **Intent tier** (§3.1): a small set of `:root` dials that
drive everything downstream. Each subsection states the ideal value system and
cites the decision or prior art it rests on. Where the ideal differs from shipped
CSS, the divergence is a tracked gap in [TASKS.md](docs/developer/TASKS.md), never
an assertion of current state here.

### 2.1 Breakpoints

A **6-step, min-width (mobile-first) ladder**, `xs`–`4k`:

| Step | `min-width` | `--base-viewport-width` | `--base-font-size` | `--base-line-height` |
|---|---|---|---|---|
| `xs` | 0 (default) | 100% | 12px | 16px |
| `sm` | 425px | 425px | 14px | 18px |
| `md` | 768px | 768px | 16px | 20px |
| `lg` | 1024px | 920px | 18px | 24px |
| `xl` | 1440px | 1130px | 20px | 28px |
| `4k` | 2560px | 2170px | 24px | 32px |

Each step resets the content-clamp width and the per-breakpoint type size; the
`md`+ steps also set the `main`/`aside` split (`--base-main-width`,
`--base-aside-width`). This replaces the legacy 4-step **max-width** set
(500/1000/1500/2000) that the 2023 doc carried; the min-width ladder is the v2
baseline.

*Grounded in:* [`v2-design-system.md`](docs/research/v2-design-system.md) (Sizing
notes) and the responsive table in [README.md](README.md#responsive); the
per-breakpoint font sizes landed in commit `a2cf930` and are guarded by
`test/responsive-fonts.test.mjs`.

> **Spec gap:** the responsive table's target column counts (`--content-columns`
> 1·1·1·2·2·4) are the ideal; `sizing.css` currently ramps to 2 at `xl` and 3 at
> `4k`. Tracked in [TASKS.md](docs/developer/TASKS.md).

### 2.2 Typography

Heading sizes follow a **major-third modular scale**, `--font-scale: 1.25`, over
the native CSS `pow()` engine:

```
font-size = calc(1rem * pow(var(--font-scale), 7 - n))   /* n = 1…6 for h1…h6 */
```

So `h1` ≈ 3.05rem and the ladder steps down by a constant ratio to `h6` ≈ 1rem.
`--small-font-size` is `calc(--base-font-size / --font-scale)`. The single dial is
`--font-scale`; changing it re-tunes the whole hierarchy.

Five font roles, each an Intent override that falls back to a base face:
`--body-`, `--header-`, `--label-`, `--nav-`, `--monospace-font-family`, resolving
`var(--brand-<role>-font-family, var(--base-<role>-font-family))`. Default faces:
Body **Poppins**, Text Header **Libre Baskerville**, App Header **Roboto**, Tables
**Trebuchet MS**, Code **JetBrains Mono**.

*Grounded in:* decision record **DR-3** in
[`v2-decisions.md`](docs/research/v2-decisions.md) (1.25 lands in the
evidence-backed 1.2–1.333 band; keeps the one-line `pow()`), and the
modular-scale / Open Props prior art DR-3 cites (Tim Brown, *More Meaningful
Typography*). The golden-ratio `--phi-*` ladder was a **README** claim, removed in
`a2cf930`; it never appeared in this file and is not part of the ideal.

### 2.3 Color

Colors are stored as **parts, not values** — luminance, chroma, hue — and
assembled at the use site with `oklch()`. The theming contract targets **one brand
hue per page**: `--brand-hue` drives `--brand-primary-color: oklch(L C H)`, and the
complementary, accent, and state colors derive from that single hue. Fine control
is still available by overriding an Application final directly (§3.1).

- **Dark mode flips parts, not colors.** `prefers-color-scheme: dark` lowers
  `--base-luminance` (95% → 30%) and `--brand-luminance` (95% → 58%); the whole
  palette recomputes from the same hue/chroma.
- **State hues** are single-hue dials: `--blue-hue` (info), `--green-hue`
  (success/`ins`), `--amber-hue` (warning/`mark`), `--red-hue` (error/`del`).
- **Interactive states** derive in the Derivation tier (§3.1) via `color-mix`:
  `--_color-hover`/`--_color-focus` mix toward white, `--_color-active` toward
  black. `--_fn-color` is the parts-based entry point a component reads to build
  its `oklch()` from local `--luminance`/`--chroma`/`--color-hue`.

*Grounded in:* [PHILOSOPHY.md](PHILOSOPHY.md) (single-brand-hue scope; invariants
like contrast live in Derivation), decision record **DR-2** in
[`v2-decisions.md`](docs/research/v2-decisions.md) (why the derivation
intermediates stay per-element and lazy), and the Material / Cloudscape token
foundations cited as inspirations in [README.md](README.md#inspiration).

### 2.4 Spacing & Sizing

One atom, everything derived. `--base-size: 8px` is the spacing unit; density is a
single `:root` switch — `.compact` → 4px, `.loose` → 16px — that rescales the
entire app.

A t-shirt scale derives from the atom:

| Token | Value |
|---|---|
| `--size-xsmall` | `--base-size / 4` |
| `--size-small` | `--base-size / 2` |
| `--size-base` | `--base-size` |
| `--size-medium` | `--base-size * 2` |
| `--size-large` | `--base-size * 3` |
| `--size-xlarge` | `--base-size * 4` |

The box model is border-box with `--base-border-size` = `--base-size / 4`; block
rhythm uses `--spacing-block-vertical` (base) and `--spacing-block-horizontal`
(medium).

*Grounded in:* the Sizing/Density section of [README.md](README.md#sizing) and the
[`v2-design-system.md`](docs/research/v2-design-system.md) Sizing notes
("one base, everything derived").

### 2.5 Motion & Iconography

**Motion** is a single token triple: `--transition-time` (0.2s),
`--transition-function` (`ease-in-out`), and the composed `--transition`.
`prefers-reduced-motion: reduce` collapses `--transition-time` to `0s`, reinforced
by the reset layer's `reduce-motion` rules — belt and suspenders.

**Iconography** ships as inline data-URI SVGs in the theme so no asset fetch is
needed: `--icon-chevron` (a stroked chevron) backs the accordion/nav disclosure
affordance. Icon sources are Feather Icons and Heroicons.

*Grounded in:* [`v2/theme/animation.css`](v2/theme/animation.css),
[`v2/theme/icons.css`](v2/theme/icons.css), and the Motion token list in
[README.md](README.md#motion).

> **Spec gap:** README sketches a richer motion vocabulary — named durations
> (`--motion-duration-snap`/`-shake`/`-draw`) and curves (`--motion-curve-*`) —
> beyond the shipped single `--transition*`. The expanded set is the ideal; the
> current triple is the floor. Tracked in [TASKS.md](docs/developer/TASKS.md).

---

## 3 Architecture

*Filled in Step 3.*

### 3.1 Variable model

*Filled in Step 3.*

### 3.2 Naming grammar

*Filled in Step 3.*

### 3.3 @layer order

*Filled in Step 3.*

### 3.4 Selector & nesting conventions

*Filled in Step 3.*

---

## 4 Components

*Filled in Step 4. Each `§4.x` is the contract its `component-*` task in
[TASKS.md](docs/developer/TASKS.md) implements against.*

### 4.1 Buttons

*Filled in Step 4.*

### 4.2 Forms

*Filled in Step 4.*

### 4.3 Form switch

*Filled in Step 4.*

### 4.4 Tables

*Filled in Step 4.*

### 4.5 Accordion

*Filled in Step 4.*

### 4.6 Tabs

*Filled in Step 4.*

### 4.7 Modal

*Filled in Step 4.*

### 4.8 Property sheet

*Filled in Step 4.*

### 4.9 Progress

*Filled in Step 4.*

### 4.10 Form group

*Filled in Step 4.*

---

## 5 Patterns

*Filled in Step 5.*
