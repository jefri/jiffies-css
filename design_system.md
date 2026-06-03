# Jiffies CSS — Design System

This is the design specification for Jiffies CSS. Each section defines one part
of the system in detail: the tokens it sets, the rules it derives, and the
selectors that apply them. It is written for a contributor building or extending
the library, or a consumer looking for details without reading the code.

For installation and usage, see [README.md](README.md); for the rationale behind
the model, see [PHILOSOPHY.md](PHILOSOPHY.md).

---

## Foundations

The foundations are the **Intent tier** : properties set in `:root` that
drive the rest of the design. Each subsection defines one value system and the
prior art it rests on.

### Breakpoints

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
`--base-aside-width`). The ladder is min-width, not max-width: styles layer on as
the viewport grows, rather than a desktop baseline that is stripped away for
smaller screens.

The responsive table's target column counts drive `--content-columns`
(1·1·1·2·2·4) across the steps.

*Grounded in:* the mobile-first, min-width approach — Ethan Marcotte's
[*Responsive Web Design*](https://alistapart.com/article/responsive-web-design/)
(A List Apart, 2010), which introduced media-query-based responsive layout, and
Luke Wroblewski's [*Mobile First*](https://mobile-first.abookapart.com/)
(A Book Apart, 2011); see MDN's
[media-query guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Media_queries)
for the min-width technique.

### Typography

Heading sizes follow a **major-third modular scale**, `--font-scale: 1.25`, over
the native CSS `pow()` engine:

```
font-size = calc(1rem * pow(var(--font-scale), 7 - n))   /* n = 1…6 for h1…h6 */
```

So `h1` = `1.25^6` ≈ 3.81rem (≈ 61px at a 16px root) and the ladder steps down by
a constant 1.25 ratio to `h6` = `1.25^1` = 1.25rem (≈ 20px, just above body text).
`--small-font-size` is `calc(--base-font-size / --font-scale)`. The single dial is
`--font-scale`; changing it re-tunes the whole hierarchy.

Five font roles, each an Intent override that falls back to a base face:
`--body-`, `--header-`, `--label-`, `--nav-`, `--monospace-font-family`, resolving
`var(--brand-<role>-font-family, var(--base-<role>-font-family))`. Default faces:
Body **Poppins**, Text Header **Libre Baskerville**, App Header **Roboto**, Tables
**Trebuchet MS**, Code **JetBrains Mono**.

*Grounded in:* modular scales — Tim Brown,
[*More Meaningful Typography*](https://alistapart.com/article/more-meaningful-typography/)
(A List Apart, 2011); the common 1.2–1.333 ratio band, with the major third
(1.25) inside it — [Utopia](https://utopia.fyi/blog/css-modular-scales/); and the
native [`pow()`](https://developer.mozilla.org/en-US/docs/Web/CSS/pow) math
function (Baseline 2023), which lets the whole scale be one `calc()`.

### Color

Colors are stored as **parts, not values** — luminance, chroma, hue — and
assembled at the use site with `oklch()`. The theming contract targets **one brand
hue per page**: `--brand-hue` drives `--brand-primary-color: oklch(L C H)`, and the
complementary, accent, and state colors derive from that single hue. Fine control
is still available by overriding an Application final directly.

- **Dark mode flips parts, not colors.** `prefers-color-scheme: dark` lowers
  `--base-luminance` (95% → 30%) and `--brand-luminance` (95% → 58%); the whole
  palette recomputes from the same hue/chroma.
- **State hues** are single-hue dials: `--blue-hue` (info), `--green-hue`
  (success/`ins`), `--amber-hue` (warning/`mark`), `--red-hue` (error/`del`).
- **Interactive states** derive in the Derivation tier  via `color-mix`:
  `--_color-hover`/`--_color-focus` mix toward white, `--_color-active` toward
  black. `--_fn-color` is the parts-based entry point a component reads to build
  its `oklch()` from local `--luminance`/`--chroma`/`--color-hue`.

*Grounded in:* [OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
(Evil Martians) and Lea Verou's
[LCH colors in CSS](https://lea.verou.me/blog/2020/04/lch-colors-in-css-what-why-and-how/)
for the parts-based, perceptually uniform model — because OKLCH separates
lightness from hue and chroma, dropping lightness alone yields a dark theme;
[Material 3 dynamic color](https://m3.material.io/styles/color/system/how-the-system-works)
and [Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)
for deriving a full scale from a single hue; and
[`color-mix()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
for the toward-white/black state derivations.

### Spacing & Sizing

One atom, everything derived. `--base-size: 8px` is the spacing unit; density is a
single `:root` switch — `.compact` → 4px, `.loose` → 16px — that rescales the
entire component, page, or app.

A t-shirt scale derives from the atom:

| Token | Value |
|---|---|
| `--size-xsmall` | `--base-size / 4` |
| `--size-small` | `--base-size / 2` |
| `--size-base` | `--base-size` |
| `--size-medium` | `--base-size * 2` |
| `--size-large` | `--base-size * 3` |
| `--size-xlarge` | `--base-size * 4` |

The box model is border-box with `--base-border-size` = `--size-xsmall`; block
rhythm uses `--spacing-block-vertical` (base) and `--spacing-block-horizontal`
(medium).

*Grounded in:* the 8-point grid — Material Design's
[8dp spacing grid](https://m2.material.io/design/layout/spacing-methods.html) and
Elliot Dahl's
[Intro to the 8-Point Grid System](https://medium.com/built-to-adapt/intro-to-the-8-point-grid-system-d2573cde8632)
("one base, everything derived").

### Motion & Iconography

**Motion** is a single token triple: `--transition-time` (0.2s),
`--transition-function` (`ease-in-out`), and the composed `--transition`.
`prefers-reduced-motion: reduce` collapses `--transition-time` to `0s`, reinforced
by the reset layer's `reduce-motion` rules — belt and suspenders.

**Iconography** ships as inline data-URI SVGs in the theme so no asset fetch is
needed: `--icon-chevron` (a stroked chevron) backs the accordion/nav disclosure
affordance.

*Grounded in:*
[`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
(MDN; satisfies WCAG technique
[C39](https://www.w3.org/WAI/WCAG21/Techniques/css/C39)); icons from
[Feather](https://github.com/feathericons/feather) (Cole Bemis, MIT);
the inline
[data-URI SVG](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data)
technique, which trades a network request for a small inline payload and so suits
icon-sized assets.

---

## Architecture

How the pieces are organized: the variable tiers , how they are named, how the stylesheet layers stack , and how selectors express
component shape.

### Variable model

Every custom property lives in one of three tiers, a gradient of meaning from
author intent to rendered property:

| Tier | Lives on | Answers | Example |
|---|---|---|---|
| **Intent** | `:root` (public API) | "how will this be used?" | `--brand-hue`, `--base-size`, `--font-scale` |
| **Derivation** | `*` (private engine) | connects intent to outcome, re-derived per element | `--_fn-color`, `--_color-hover` |
| **Application** | the element's own rule | "what does this change?" | `--color-header`, `--font-size-base` |

Overriding an **Intent** token is coarse control: it moves everything downstream.
Overriding an **Application** final is fine control: one property on one element.
The **Derivation** tier sits between them on the universal selector `*`, so it
re-derives per element and stays lazy — a derivation costs nothing until something
reads it. Invariants that must always hold (contrast floors, the relationship
between a base color and its hover/active states) live here rather than in Intent,
so a consumer tuning the public dials cannot override them away. See
[PHILOSOPHY.md](PHILOSOPHY.md) for the full rationale.

*Grounded in:* the tiered design-token pattern (global/primitive →
semantic/alias → component) — Nathan Curtis,
[Naming Tokens in Design Systems](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676)
(EightShapes). Jiffies' twist is the middle tier: instead of static alias tokens,
the Derivation engine lives on `*` and re-computes per element.

### Naming grammar

Names are **kebab-case, category/element-first**. Tier is not encoded with
mid-name underscores.

- **Intent and Application** tokens are plain kebab-case: `--brand-hue`,
  `--base-font-size`, `--color-header`, `--margin-card-vertical`.
- **Derivation** intermediates carry a leading **`--_`** — Lea Verou's
  pseudo-private prefix — so a reader knows the value is part of the engine, not a
  dial to override: `--_fn-color`, `--_color-hover`, `--_fn-border`.

**Decision D1 — Derivation prefix = `--_`.** The leading underscore is a naming
convention only (CSS enforces no privacy); it signals "internal, do not override."
No major design system encodes tier via a mid-name underscore.

*Grounded in:* Lea Verou,
[Custom properties with defaults: 3+1 strategies](https://lea.verou.me/blog/2021/10/custom-properties-with-defaults/),
which names the leading-underscore "pseudo-private custom property" convention,
and Nathan Curtis,
[Naming Tokens in Design Systems](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676),
on category-first token names.

### @layer order

This section is the **single authority for the specific `@layer` order**:

```
@layer fns, reset, layout, content, component, utility, user, theme;
```

| Layer | Role |
|---|---|
| `fns` | Derivation engine (`* { --_fn-* }`) — declared first, defined before any consumer; lazy, so it costs nothing until read |
| `reset` | Browser normalize (vendored sanitize.css, wrapped in `:where()` for zero specificity) |
| `layout` | Page-level structure (container, page-end) |
| `content` | Semantic element styles (typography, tables, links) |
| `component` | DOM + ARIA components (§4) |
| `utility` | Class-based helpers (`.flex`, `.grid`) |
| `user` | Untouched layer reserved for consumer overrides |
| `theme` | `:root` Intent tokens — declared **last** |

Two sub-questions are settled:

- **(a) `theme` last is intentional.** Custom properties are ordinary properties,
  so they participate in the cascade like any other. Declaring `theme` last therefore makes its `:root` token
  declarations win against any conflicting `:root` rule in an earlier layer,
  protecting the token contract. (Layers do not affect inheritance; this is purely
  about which declaration wins.)
- **(b) `fns` stays a separate layer, declared first.** The Derivation tier lives
  on `*` and is distinct from `theme`'s `:root` Intent tier; it is not merged into
  `theme`, and it must be defined before any consumer reads it.

*Grounded in:* [`@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
(MDN) and [CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/):
for normal declarations, the declaration whose cascade layer is last wins;
the first `@layer` statement fixes the order.

### Selector & nesting conventions

Components are built from patterns of DOM nodes: one component is one nested
selector tree whose shape matches the subtree it styles.

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
and one file per component, with the `@layer` order  doing the assembly.

*Grounded in:* MDN —
[`:where()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:where) (always 0
specificity), [`:is()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:is)
(takes the specificity of its most specific argument),
[`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) (the relational
"parent" selector), and the
[child combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/Child_combinator).

---

## Components

Each entry is the **contract** for one component. A component is a DOM shape plus
an ARIA contract, never a class. Some necessary edge-classes add subtle additional intent: `.secondary`, `.contrast`, `.outline`. Each component description uses one format:

- **DOM shape** — the element tree / nesting the rule targets.
- **ARIA** — roles/attributes that select modalities or states.
- **Tokens** — the Application finals  it consumes.
- **States** — the interactive/ARIA states it styles.
- **Edge-classes** — sanctioned classes, if any.

### Buttons


- **DOM shape:** `button, a[role=button], input[type=button|submit|reset]`
- **ARIA:** `[role=button]` promotes a link to a button; `[aria-disabled]`, `[aria-busy]` allow for disabled states and loading spinners in buttons.
- **Tokens:** `--_fn-color` (built from local `--color`/`--luminance`/`--chroma`),
  `--_color-hover`/`--_color-focus`/`--_color-active`, `--label-font-family`,
  `--font-size-base`, `--border-radius-button`, `--size-small`/`--size-base`
  (padding)
- **States:** `:hover`, `:focus-visible`, `:active`, `[disabled]`/`[aria-disabled]`,
  `[aria-busy]`
- **Edge-classes:** `.secondary`, `.contrast`, `.outline`

### Forms

Form controls share a border/radius/focus language; validity and
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

### Form switch

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

### Tables

Opinionated tables with zebra striping and a type face separate from body or code text.

- **DOM shape:** `table > thead, tbody, tfoot > tr > th, td`
- **ARIA:** `[aria-sort]` on sortable `th`; `scope` on header cells
- **Tokens:** `--table-font-family` (Trebuchet MS), `--table-row-even-color`/
  `--table-row-odd-color`, `--_fn-border`, `--spacing-block-vertical`/
  `--spacing-block-horizontal` (cell padding)
- **States:** `tr:nth-child(even|odd)`, `th[aria-sort]`, `tr:hover`
- **Edge-classes:** `.compact`, `.loose` to change cell padding. 

### Accordion

Pure-CSS disclosure using native `details`; the chevron is the theme icon.

- **DOM shape:** `details > summary` (+ flow content sibling)
- **ARIA:** native `details[open]` carries expansion state (exposed as
  `aria-expanded` on `summary`)
- **Tokens:** `--icon-chevron` (disclosure marker), `--transition` (rotation),
  `--spacing-block-vertical`/`--spacing-block-horizontal`, `--_fn-border`
- **States:** `[open]`, `summary:hover`, `summary:focus-visible`
- **Edge-classes:** none

### Tabs

A tablist whose selected state is driven entirely accessibly. 

- **DOM shape:** `[role=tablist] > [role=tab]` paired with `[role=tabpanel]`
  (commonly inside a `section`)
- **ARIA:** `[role=tab]`, `[role=tabpanel]`, `[aria-selected]`, `[aria-controls]`,
  `[tabpanel][hidden]`
- **Tokens:** `--color-accent` (active-tab indicator), `--_color-hover`,
  `--label-font-family`, `--_fn-border` (tablist baseline)
- **States:** `[aria-selected=true]`, `:hover`, `:focus-visible`
- **Edge-classes:** none

### Modal

Native `dialog`; the reset gives the base, the component styles the surface and
backdrop.

- **DOM shape:** `dialog` (often `dialog > article`, reusing the card surface)
- **ARIA:** native `dialog[open]`, `[aria-modal]`, `[aria-labelledby]`
- **Tokens:** `--card-background-color` (surface), `--border-radius-container`,
  `--modal-backdrop-color`, `--spacing-block-vertical`/`--spacing-block-horizontal`
- **States:** `[open]`, `::backdrop`
- **Edge-classes:** none

### Property sheet

A `dl` rendered as aligned label/value rows; shares the table striping language.

- **DOM shape:** `dl > dt, dd`
- **ARIA:** none beyond the native `dl` term/definition association
- **Tokens:** `--label-font-family` (terms), `--table-row-even-color`/
  `--table-row-odd-color`, `--size-small`/`--size-base` (row spacing)
- **States:** `dt`/`dd` row pairing, `:hover` row
- **Edge-classes:** none

### Progress

A styled native `progress`, both determinate and indeterminate in line and round.

- **DOM shape:** `progress` (`progress[value]` determinate; valueless =
  indeterminate)
- **ARIA:** native `progress` role; `[aria-label]` for context
- **Tokens:** `--_fn-color` (value fill), `--progress-track-color`,
  `--border-radius-inline`, `--base-line-height` (bar height basis)
- **States:** `[value]` (determinate) vs indeterminate; `::-webkit-progress-value`/
  `::-moz-progress-bar`
- **Edge-classes:** `.round`

### Form group

A `fieldset[role=group]` that joins adjacent controls into one segmented row,
flattening interior borders and radii.

- **DOM shape:** `fieldset[role=group] > :is(button, input, select)`
- **ARIA:** `[role=group]`; `[aria-label]` names the joined set
- **Tokens:** `--border-radius-input`, `--_fn-border`, `--size-base` (gap collapse)
- **States:** `:first-child`/`:last-child` (outer radius), `:focus-within`
  (raise the focused member)
- **Edge-classes:** none

---

## Patterns

Patterns are compositions of components and semantic elements into recurring
page structures.

### Card & Panel

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

### Navigation

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

### Breadcrumb

A trail rendered from a nav list with a separator glyph. It is **classless**: the
`Breadcrumb` ARIA label selects it, not a class, so it stays within the §4 closed
edge-class list.

- **DOM shape:** `nav[aria-label="Breadcrumb"] > ol > li`
- **ARIA:** `nav[aria-label="Breadcrumb"]`, `[aria-current=page]` on the last crumb
- **Tokens:** `--breadcrumb-marker` (`"→"`), `--nav-item-spacing-horizontal`
- **States:** `li::before` separator (omit the first item)
- **Edge-classes:** none

### Page layout & page-ends

The page spine: a flex-column root that centers content to the responsive clamp,
turns header/footer into brand "page-ends" when they contain a nav, and reflows an
optional `aside` by `order`. It belongs to the `layout` layer.

- **DOM shape:** `body:not(:has(> #root)), body > #root` then
  `& > :is(header, main, footer, aside)`
- **ARIA:** structural only (sectioning landmarks)
- **Tokens:** `--page-background-color`, `--base-viewport-width` (content clamp),
  `--base-main-width`/`--base-aside-width`, `--layout-header-order`/`-main-order`/
  `-aside-order`/`-footer-order`, `--page-end-border`,
  `--background-color-page-end-brand-primary`
- **States:** `:is(header, footer):has(> nav)` (brand page-end);
  `:has(> aside)` (row-wrap reflow); responsive `order` swap at `md`
- **Edge-classes:** none — `.fluid` (full-bleed opt-out of the content clamp) is a
  layout utility, not a component variant
