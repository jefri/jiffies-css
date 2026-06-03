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

How the pieces are organized: the variable tiers, how they are named, how the
stylesheet files stack, and how selectors express component shape. The variable
model and selector conventions are **owned by [PHILOSOPHY.md](PHILOSOPHY.md)**;
this section applies them and records the two project-specific rules PHILOSOPHY
leaves to the spec — the naming grammar (§3.2) and the canonical `@layer` order
(§3.3).

### 3.1 Variable model

Every custom property lives in one of three tiers, a gradient of meaning from
author intent to rendered property:

| Tier | Lives on | Answers | Example |
|---|---|---|---|
| **Intent** | `:root` (public API) | "how will this be used?" | `--brand-hue`, `--base-size`, `--font-scale` |
| **Derivation** | `*` (private engine) | connects intent to outcome, re-derived per element | `--_fn-color`, `--_color-hover` |
| **Application** | the element's own rule | "what does this change?" | `--color-header`, `--font-size-base` |

Overriding an **Intent** token is coarse control (moves everything downstream);
overriding an **Application** final is fine control (one property, one element).
The full treatment — blast radius, why invariants like contrast belong in
Derivation, laziness of the `*` tier — is in
[PHILOSOPHY.md](PHILOSOPHY.md#variable-model-intent--derivation--application) and
is not restated here.

*Grounded in:* [PHILOSOPHY.md](PHILOSOPHY.md) (owns the model),
[`v2-tasks.md`](docs/research/v2-tasks.md) §1.3, and the three-tier reading of the
code in [`v2-design-system.md`](docs/research/v2-design-system.md).

### 3.2 Naming grammar

Names are **kebab-case, category/element-first**. The legacy
`--{source}_{variant}-{state}_{unit}` grammar that encoded tier with mid-name
underscores is **dropped**.

- **Intent and Application** tokens are plain kebab-case: `--brand-hue`,
  `--base-font-size`, `--color-header`, `--margin-card-vertical`.
- **Derivation** intermediates carry a leading **`--_`** — Lea Verou's
  pseudo-private prefix — so a reader knows the value is part of the engine, not a
  dial to override: `--_fn-color`, `--_color-hover`, `--_fn-border`.

**Decision D1 — Derivation prefix = `--_`.** The derivation tier uses the
`--_` private prefix. This aligns with PHILOSOPHY (which already writes
`--_fn-color`) and with the surveyed practice that no design system encodes tier
via a mid-name underscore.

*Grounded in:* decision record **DR-1** in
[`v2-decisions.md`](docs/research/v2-decisions.md) (ACCEPTED: plain hyphens,
category-first; mark tier-2 intermediates private with `--_` per Verou) and
[PHILOSOPHY.md](PHILOSOPHY.md#variable-model-intent--derivation--application).

> **Spec gap:** shipped `v2/functions.css` declares the derivations **unprefixed**
> (`--fn-color`, `--color-hover`/`-focus`/`-active`, `--fn-merge`, `--fn-border`),
> and callers (`navigation.css`) read the unprefixed names. Renaming them to
> `--_` is tracked in [TASKS.md](docs/developer/TASKS.md).

### 3.3 @layer order

This section is the **single authority for the specific `@layer` order**. README
and PHILOSOPHY describe the layering *concept* (cascade order is reading order);
the exact sequence is fixed here:

```
@layer fns, reset, layout, content, component, utility, user, theme;
```

| Layer | Role |
|---|---|
| `fns` | Derivation engine (`* { --_fn-* }`) — declared first, defined before any consumer; lazy, so it costs nothing until read |
| `reset` | Browser normalize (vendored sanitize.css, wrapped in `:where()` for zero specificity) |
| `layout` | Page-level structure (container, page-end). Reserved slot today — see the `layout-layer` task |
| `content` | Semantic element styles (typography, tables, links) |
| `component` | DOM + ARIA components (§4) |
| `utility` | Class-based helpers (`.flex`, `.grid`) |
| `user` | Untouched layer reserved for consumer overrides |
| `theme` | `:root` Intent tokens — declared **last** |

Two sub-questions are settled:

- **(a) `theme` last is intentional.** Custom properties resolve by normal
  cascade regardless of layer, so layer-last does not change inheritance; it
  guarantees the `theme` `:root` token declarations win against any stray `:root`
  rule in an earlier layer, protecting the token contract. This matches the
  shipped order — no code gap for the `theme` position.
- **(b) `fns` stays a separate layer, declared first.** The Derivation tier lives
  on `*` and is distinct from `theme`'s `:root` Intent tier; it is not merged into
  `theme`. The shipped code already declares `fns` first.

The shipped `v2/index.css` already matches this order (`fns` first, `theme` last).
The one open structural item is the `layout` layer: its import targets a
not-yet-existing `layout/layout.css` while page layout lives in
`content/containers.css` — that is the existing `layout-layer` task, not a new gap.

*Grounded in:* [`v2-tasks.md`](docs/research/v2-tasks.md) §1.5 (add `fns` first),
the cascade-layer-spine analysis in
[`v2-design-system.md`](docs/research/v2-design-system.md) (the `theme`-last
rationale), and [`v2/index.css`](v2/index.css).

> **Spec gap:** README and PHILOSOPHY currently list their own layer orderings.
> Reducing those to the layering *concept* (leaving the canonical order to this
> §3.3) is tracked in [TASKS.md](docs/developer/TASKS.md).

### 3.4 Selector & nesting conventions

Components are built from patterns of DOM nodes: one component is one nested
selector tree whose shape matches the subtree it styles. The conventions —
summarized here, **owned by [PHILOSOPHY.md](PHILOSOPHY.md#selectors--nesting)**:

- **`& >`** child combinator for structural ownership, so a rule cannot leak into
  a nested instance of the same element.
- **`:is(…)`** to group equivalent variants; **`:where(…)`** for zero-specificity
  defaults that stay overridable (this is how the Intent tier remains the real
  control surface).
- **`:has(…)`** to select a parent by what it contains (`header:has(> nav)` is a
  page-end); **`:not(…)`** to carve exceptions.
- **attribute/role selectors** (`[role=tab]`, `[aria-current]`) to match the ARIA
  contract that selects between component modalities.

Two organizing rules: Application finals are declared at the top of the block that
consumes them and re-set in nested state blocks (state lives next to structure);
and one file per component, with the `@layer` order (§3.3) doing the assembly.

*Grounded in:* [PHILOSOPHY.md](PHILOSOPHY.md#selectors--nesting) (owns the
conventions) and the selector survey in
[`v2-design-system.md`](docs/research/v2-design-system.md).

---

## 4 Components

Each `§4.x` is the **contract** its `component-*` task in
[TASKS.md](docs/developer/TASKS.md) implements against. A component is a DOM shape
plus an ARIA contract (§3.4), never a class; the only sanctioned edge-classes are
the closed list `.secondary`, `.contrast`, `.outline`. Each entry uses one format:

- **DOM shape** — the element tree / nesting the rule targets.
- **ARIA** — roles/attributes that select modalities or states.
- **Tokens** — the Application finals (§3.1) it consumes.
- **States** — the interactive/ARIA states it styles.
- **Edge-classes** — sanctioned classes, if any.

Token names follow the §3.2 grammar; some are aspirational finals the component
introduces. Build status is in TASKS.md, never asserted here.

### 4.1 Buttons

The reference component — first consumer of the parts-based color engine
(`--_fn-color`). Proves the philosophy the rest follow.

- **DOM shape:** `button, a[role=button], input[type=button|submit|reset]`
- **ARIA:** `[role=button]` promotes a link; `[aria-disabled]`, `[aria-busy]`
- **Tokens:** `--_fn-color` (built from local `--color`/`--luminance`/`--chroma`),
  `--_color-hover`/`--_color-focus`/`--_color-active`, `--label-font-family`,
  `--font-size-base`, `--border-radius-button`, `--size-small`/`--size-base`
  (padding)
- **States:** `:hover`, `:focus-visible`, `:active`, `[disabled]`/`[aria-disabled]`,
  `[aria-busy]`
- **Edge-classes:** `.secondary`, `.contrast`, `.outline`

### 4.2 Forms

The largest component. Controls share a border/radius/focus language; validity and
editability are read from ARIA and native attributes, not classes.

- **DOM shape:** `label`, `input`, `select`, `textarea`, `fieldset`, `legend`
- **ARIA:** `[aria-invalid]`, `[aria-describedby]`, `[required]`, `[disabled]`,
  `[readonly]`
- **Tokens:** `--color-form-base`/`--color-form-invalid`/`--color-form-disabled`/
  `--color-form-required`, `--_fn-border`, `--border-radius-input`,
  `--label-font-family`, `--grid-column-count` (fieldset grid layout),
  `--size-small`/`--size-base` (padding)
- **States:** `:focus-visible`, `:placeholder-shown`, `[aria-invalid]`,
  `[disabled]`, `[readonly]`
- **Edge-classes:** none

### 4.3 Form switch

A pure-CSS toggle: a checkbox or radio painted as a sliding switch via
`appearance: none` and a `::before` knob.

- **DOM shape:** `input[type=checkbox][role=switch]`,
  `input[type=radio][role=switch]`
- **ARIA:** `[role=switch]`; checked state is native `:checked` (reflected as
  `aria-checked`)
- **Tokens:** `--_fn-color` (track/knob from brand), `--transition`,
  `--size-base`/`--size-medium` (track geometry), `--border-radius-input`
- **States:** `:checked`, `:focus-visible`, `[disabled]`
- **Edge-classes:** none

### 4.4 Tables

Opinionated tables with zebra striping and their own type face.

- **DOM shape:** `table > thead, tbody, tfoot > tr > th, td`
- **ARIA:** `[aria-sort]` on sortable `th`; `scope` on header cells
- **Tokens:** `--table-font-family` (Trebuchet MS), `--table-row-even-color`/
  `--table-row-odd-color`, `--_fn-border`, `--spacing-block-vertical`/
  `--spacing-block-horizontal` (cell padding)
- **States:** `tr:nth-child(even|odd)`, `th[aria-sort]`, `tr:hover`
- **Edge-classes:** none

### 4.5 Accordion

Pure-CSS disclosure using native `details`; the chevron is the theme icon.

- **DOM shape:** `details > summary` (+ flow content sibling)
- **ARIA:** native `details[open]` carries expansion state (exposed as
  `aria-expanded` on `summary`)
- **Tokens:** `--icon-chevron` (disclosure marker), `--transition` (rotation),
  `--spacing-block-vertical`/`--spacing-block-horizontal`, `--_fn-border`
- **States:** `[open]`, `summary:hover`, `summary:focus-visible`
- **Edge-classes:** none

### 4.6 Tabs

A tablist whose selected state is driven by `accessibility.js` — accessible tab
selection cannot be expressed in pure CSS, so this supersedes the README's
"pure-CSS tabs" framing.

- **DOM shape:** `[role=tablist] > [role=tab]` paired with `[role=tabpanel]`
  (commonly inside a `section`)
- **ARIA:** `[role=tab]`, `[role=tabpanel]`, `[aria-selected]`, `[aria-controls]`,
  `[tabpanel][hidden]`
- **Tokens:** `--color-accent` (active-tab indicator), `--_color-hover`,
  `--label-font-family`, `--_fn-border` (tablist baseline)
- **States:** `[aria-selected=true]`, `:hover`, `:focus-visible`
- **Edge-classes:** none

### 4.7 Modal

Native `dialog`; the reset gives the base, the component styles the surface and
backdrop.

- **DOM shape:** `dialog` (often `dialog > article`, reusing the card surface)
- **ARIA:** native `dialog[open]`, `[aria-modal]`, `[aria-labelledby]`
- **Tokens:** `--card-background-color` (surface), `--border-radius-container`,
  `--modal-backdrop-color`, `--spacing-block-vertical`/`--spacing-block-horizontal`
- **States:** `[open]`, `::backdrop`
- **Edge-classes:** none

### 4.8 Property sheet

A `dl` rendered as aligned label/value rows; shares the table striping language.

- **DOM shape:** `dl > dt, dd`
- **ARIA:** none beyond the native `dl` term/definition association
- **Tokens:** `--label-font-family` (terms), `--table-row-even-color`/
  `--table-row-odd-color`, `--size-small`/`--size-base` (row spacing)
- **States:** `dt`/`dd` row pairing, `:hover` row
- **Edge-classes:** none

### 4.9 Progress

The smallest component: a styled native `progress`, both determinate and
indeterminate.

- **DOM shape:** `progress` (`progress[value]` determinate; valueless =
  indeterminate)
- **ARIA:** native `progress` role; `[aria-label]` for context
- **Tokens:** `--_fn-color` (value fill), `--progress-track-color`,
  `--border-radius-inline`, `--base-line-height` (bar height basis)
- **States:** `[value]` (determinate) vs indeterminate; `::-webkit-progress-value`/
  `::-moz-progress-bar`
- **Edge-classes:** none

### 4.10 Form group

A `fieldset[role=group]` that joins adjacent controls into one segmented row,
flattening interior borders and radii.

- **DOM shape:** `fieldset[role=group] > :is(button, input, select)`
- **ARIA:** `[role=group]`; `[aria-label]` names the joined set
- **Tokens:** `--border-radius-input`, `--_fn-border`, `--size-base` (gap collapse)
- **States:** `:first-child`/`:last-child` (outer radius), `:focus-within`
  (raise the focused member)
- **Edge-classes:** none

---

## 5 Patterns

Patterns are compositions of components (§4) and semantic elements into recurring
page structures. They use the same contract template as §4. The card, navigation,
and breadcrumb patterns already ship; their entries state the **ideal** shape, and
where the shipped CSS diverges that is a tracked gap in
[TASKS.md](docs/developer/TASKS.md), consistent with the rest of this doc.

### 5.1 Card & Panel

A surface with optional header/footer rails around a main body. `article` is the
elevated card; `section` is the flat panel.

- **DOM shape:** `:is(article, section) > :is(header, main, footer)`
- **ARIA:** none beyond the native sectioning roles
- **Tokens:** `--card-background-color`, `--border-radius-card` (`--base-size`),
  `--margin-card-vertical` (`--size-large`), `--card-inner-border`,
  `--spacing-block-vertical`/`--spacing-block-horizontal` (rail padding),
  `--content-columns` (multi-column `main`)
- **States:** `& > header`/`& > footer` inner borders; `& > main:last-child`
  bottom padding
- **Edge-classes:** none (`.fluid` is a layout utility, see §5.4)

### 5.2 Navigation

`nav > ol` in two modes selected by ancestor, not by class.

- **DOM shape:** `:is(header, footer) > nav > ol` (page-end bar) and
  `aside > nav > ol` (sticky table of contents)
- **ARIA:** `[aria-current]` marks the active link
- **Tokens:** `--header-nav-background-color`/`--header-nav-color`,
  `--nav-item-spacing-vertical`/`--nav-item-spacing-horizontal`, `--nav-font-family`,
  `--_color-hover`/`--color-accent`, `--toc-left-offset`, `--transition`
- **States:** `:is([aria-current], :hover, :focus)` (underline);
  `li:has(a:hover)` (background); aside TOC hover-indent
- **Edge-classes:** none

### 5.3 Breadcrumb

A trail rendered from a nav list with a separator glyph.

- **DOM shape:** `ol.breadcrumbs > li` (within `nav`)
- **ARIA:** `nav[aria-label="Breadcrumb"]`, `[aria-current=page]` on the last crumb
- **Tokens:** `--breadcrumb-marker` (`"→"`), `--nav-item-spacing-horizontal`
- **States:** `li::before` separator (omit on the first item)
- **Edge-classes:** `.breadcrumbs` is the one structural hook this pattern needs

### 5.4 Page layout & page-ends

The page spine: a flex-column root that centers content to the responsive clamp,
turns header/footer into brand "page-ends" when they contain a nav, and reflows an
optional `aside` by `order`. This composite is aspirational in the `layout` layer
(§3.3); it ships today in `content/containers.css` — the `layout-layer` task is the
move.

- **DOM shape:** `body:not(:has(> #root)), body > #root` then
  `& > :is(header, main, footer, aside)`
- **ARIA:** structural only (sectioning landmarks)
- **Tokens:** `--page-background-color`, `--base-viewport-width` (content clamp),
  `--base-main-width`/`--base-aside-width`, `--layout-header-order`/`-main-order`/
  `-aside-order`/`-footer-order`, `--page-end-border`,
  `--background-color-page-end-brand-primary`
- **States:** `:is(header, footer):has(> nav)` (brand page-end);
  `:has(> aside)` (row-wrap reflow); responsive `order` swap at `md`
- **Edge-classes:** `.fluid` (full-bleed, opt out of the content clamp)
