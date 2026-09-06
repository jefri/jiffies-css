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

| Step | `min-width` | `--base-viewport-width` | `--base-font-size` | `--base-line-height` | Text Columns | Typical Device |
|---|---|---|---|---|---|---|
| `xs` | 0 (default) | 100% | 12px | 16px | 1 | Phones |
| `sm` | 425px | 425px | 14px | 18px | 1 | Phablet |
| `md` | 768px | 768px | 16px | 20px | 1 | Tablet |
| `lg` | 1024px | 920px | 18px | 24px | 2 | Laptop |
| `xl` | 1440px | 1130px | 20px | 28px | 2 | Desktop |
| `4k` | 2560px | 2170px | 24px | 32px | 4 | UltraWide |


Each step resets the content-clamp width and the per-breakpoint type size; the
`md`+ steps also set the `main`/`aside` split (`--base-main-width`,
`--base-aside-width`). The ladder is min-width, not max-width: styles layer on as
the viewport grows, rather than a desktop baseline that is stripped away for
smaller screens.

The responsive table's target column counts drive `--content-columns`
(1·1·1·2·2·4) across the steps.

**Device profiles.** Each step targets a *class* of device, not a specific
model: `xs` is the baseline for small phones in portrait (≈320–424px); `sm`
covers large phones and phablets (and small phones in landscape); `md` is
tablets in portrait (the classic 768px); `lg` is tablets in landscape and small
laptops; `xl` is laptops and standard desktops; `4k` is large, ultra-wide, and
high-resolution displays. The names are tier labels, not hardware widths — `4k`
marks the largest tier (the 2560px WQHD width and up), not a literal 3840px
panel.

*Grounded in:* the mobile-first, min-width approach — Ethan Marcotte's
[*Responsive Web Design*](https://alistapart.com/article/responsive-web-design/)
(A List Apart, 2010), which introduced media-query-based responsive layout, and
Luke Wroblewski's [*Mobile First*](https://mobile-first.abookapart.com/)
(A Book Apart, 2011); see MDN's
[media-query guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Media_queries)
for the min-width technique. The 768px-tablet / 1024px-desktop split follows the
de-facto convention shared by the major CSS frameworks (Bootstrap, Tailwind).

### Typography

Heading sizes follow a **major-third modular scale**, `--font-scale: 1.25`, over
the native CSS `pow()` engine:

```
font-size = calc(var(--base-font-size) * pow(var(--font-scale), 7 - n))   /* n = 1…6 for h1…h6 */
```

The scale is anchored on the responsive `--base-font-size`, **not** a bare `1rem`,
so the whole hierarchy rides the breakpoint ladder *together*. At the `md` step
(16px base) `h1` = `1.25^6` ≈ 3.81 × 16px ≈ 61px and the ladder steps down by a
constant 1.25 ratio to `h6` = `1.25^1` = 1.25 × base (just above body text) at
every step. Anchoring on `1rem` instead would pin headings to the 16px root while
body grew to 24px at `4k`, inverting `h6` below the paragraph it titles.

The **`h1` = `1.25^6` ceiling is a deliberate editorial default**, not a derived
maximum: the exponent `6` (for the six heading levels `h1`…`h6`, via `7 − n`) caps
the scale at six steps above body, fixing `h1` at ≈ 3.81 × base. It is an editorial
choice about how loud the largest heading should be, pinned here so the ceiling is
intentional rather than incidental; a project wanting a taller or shorter top
heading retunes by changing `--font-scale` (the whole hierarchy moves with it),
since the level count is fixed by HTML's six heading elements.
`--small-font-size` is `calc(--base-font-size / --font-scale)` and shares the same
base. The single dial is `--font-scale`; changing it re-tunes the whole hierarchy.

The shipped theme exposes **five** font roles, each an Intent override that falls
back to a base face: `--body-`, `--header-`, `--label-`, `--nav-`,
`--monospace-font-family`, resolving
`var(--brand-<role>-font-family, var(--base-<role>-font-family))`. Default faces:
Body **Poppins**, Header **Libre Baskerville**, Label/Nav **Roboto**, Code
**JetBrains Mono**.

Two reconciliations with the code:

- **Tables are not a sixth theme role.** Tables read `--table-font-family`, a
  bridge token *introduced by the tables component*, not one of the five theme
  roles. It **defaults to `--body-font-family`**, and the `canvas` theme overrides
  it to **Trebuchet MS** for a distinct tabular face. There is deliberately no
  `--brand-table-font-family`: the table face is a direct component bridge token,
  not a brand-tier role, so the theme's role surface stays at five.
- **App-Header is not its own role.** The application header maps to the
  **label/nav (Roboto)** role rather than a distinct `--app-header-` face. There is
  no sixth "app header" font role; the App-Header surface reuses label/nav.

*Grounded in:* modular scales — Tim Brown,
[*More Meaningful Typography*](https://alistapart.com/article/more-meaningful-typography/)
(A List Apart, 2011); the common 1.2–1.333 ratio band, with the major third
(1.25) inside it — [Utopia](https://utopia.fyi/blog/css-modular-scales/); and the
native [`pow()`](https://developer.mozilla.org/en-US/docs/Web/CSS/pow) math
function (Baseline 2023), which lets the whole scale be one `calc()`.

### Color

Colors are stored as **parts, not values** — lightness, chroma, hue — and
assembled at the use site with `oklch()`. The theming contract targets **one
brand color per page**: `--brand-color` seeds the whole scheme, and every role —
primary, secondary, tertiary, the neutrals, and their container/text pairs —
derives from it. Fine control stays available by overriding a role token or an
Application final directly, or by setting local parts and reading `--_fn-color`,
the parts-based `oklch()` builder.

This is **Material 3's generative color model**, approximated in pure CSS via
OKLCH. M3 starts from a source color, derives five key colors, expands each into
a tonal palette, then assigns the tones to semantic roles. Jiffies does the same
with relative color syntax — `oklch(from var(--brand-color) <L> <C> h)` — so no
JavaScript ever touches a color value.

**Five key palettes, derived from one source.** Following M3's default
*TonalSpot* scheme, four palettes keep the source hue and take a fixed chroma per
role; the fifth rotates the hue. A sixth, **error**, is a fixed red and is *not*
derived from the source — as in M3.

| Palette | Prefix | Hue | Chroma | Role |
|---|---|---|---|---|
| Primary | `--_p-*` | source `h` | 0.130 | brand accent |
| Secondary | `--_s-*` | source `h` | 0.06 | muted accent |
| Tertiary | `--_t-*` | `h + 60` | 0.090 | contrasting accent |
| Neutral | `--_n-*` | source `h` | 0.008 | backgrounds, surfaces, text |
| Neutral variant | `--_nv-*` | source `h` | 0.016 | outlines, surface variants |
| Error | `--_e-*` | fixed (≈ 27) | tapered | error states |

Each palette is a **tonal ramp**: hue and chroma held constant while *tone*
sweeps from 0 (black) to 100 (white) at M3's stops
`0 10 20 30 40 50 60 70 80 90 95 98 99 100`. A tone is one `--_p-<tone>` (etc.) —
`--_p-40` is primary at tone 40, `--_n-98` the near-white neutral background.

**The inverse Oklab toe is the one move that matters.** M3 "tone" is CIE L\*;
CSS `oklch()` lightness is Oklab L. They are different curves — Oklab compresses
the dark end, so a naive `L = tone / 100` drifts dark through the midtones. Each
tone is therefore mapped through the **inverse Oklab toe** before it reaches
`oklch()`:

```
L = (Lr² + k1·Lr) / (k3·(Lr + k2))
k1 = 0.206,  k2 = 0.03,  k3 = (1 + k1) / (1 + k2) ≈ 1.170873   /* so L = 1 when Lr = 1 */
```

where `Lr = tone / 100`. This lands tone 40 at `L ≈ 0.482`, not `0.40`. The
constants and the per-tone lightness are evaluated once as Derivation tokens
(`--_k1`/`--_k2`/`--_k3`, then `--_l-40` = … ); change `--_k1` or `--_k2` and the
whole ramp re-derives. The correction is what makes the ramp track HCT rather
than merely *looking* OKLCH-flavored. (The standalone reference file writes these
without the `--_` prefix; integrated into Jiffies the engine intermediates carry
it, per [Naming grammar](#naming-grammar).)

**Roles, not steps.** Components read **semantic role tokens**, never raw tones.
Each role is a tone of a palette, and every surface or fill role ships with an
**`--color-on-*` pair** that carries a contrast-safe foreground. Dark mode does not
re-derive anything — it **reassigns** each role to a different tone of the same
palette:

| Role / on-pair | Light tones | Dark tones | Read by |
|---|---|---|---|
| `--color-primary` / `--color-on-primary` | `--_p-40` / `--_p-100` | `--_p-80` / `--_p-20` | filled button, focus ring, brand page-end (via `--background-color-page-end-brand-primary`) |
| `--color-primary-container` / `--color-on-primary-container` | `--_p-90` / `--_p-10` | `--_p-30` / `--_p-90` | tonal surfaces |
| `--color-secondary` / `--color-secondary-container` (+ `on-`) | `--_s-40` / `--_s-90` | `--_s-80` / `--_s-30` | muted accents, `.secondary` controls |
| `--color-tertiary` / `--color-tertiary-container` (+ `on-`) | `--_t-40` / `--_t-90` | `--_t-80` / `--_t-30` | contrasting accents |
| `--color-error` / `--color-error-container` (+ `on-`) | `--_e-40` / `--_e-90` | `--_e-80` / `--_e-30` | error fills and text |
| `--color-background` / `--color-on-background` | `--_n-98` / `--_n-10` | `--_n-10` / `--_n-90` | page base (`--page-background-color`) |
| `--color-surface` / `--color-on-surface` | `--_n-98` / `--_n-10` | `--_n-10` / `--_n-90` | card/panel/input surface (`--card-background-color`) |
| `--color-surface-variant` / `--color-on-surface-variant` | `--_nv-90` / `--_nv-30` | `--_nv-30` / `--_nv-80` | hovered/sunken surfaces |
| `--color-outline` / `--color-outline-variant` | `--_nv-50` / `--_nv-80` | `--_nv-60` / `--_nv-30` | input & focus border (`--_fn-border`), inner card border (`--card-inner-border`) |
| `--color-inverse-surface` / `--color-inverse-on-surface` / `--color-inverse-primary` | `--_n-20` / `--_n-95` / `--_p-80` | `--_n-90` / `--_n-20` / `--_p-40` | snackbars, scrims, hero title contrast |

`--color-primary` moving from `--_p-40` (light) to `--_p-80` (dark), surfaces moving
from the 98 end to the 10 end, and each `on-` partner flipping with it, is M3's
canonical light/dark mapping: the same roles, different tones. The six palettes
are theme-independent — every tone of every hue exists at all times — so a theme
switch is a remap, not a recompute.

**Dark mode is `prefers-color-scheme` (OS) only.** The dark remap is driven
entirely by the `@media (prefers-color-scheme: dark)` block — there is **no
built-in `[data-theme]` manual trigger**. This is intentional for the single-seed
model: one brand color drives one scheme that follows the OS preference. A consumer
wanting a manual toggle re-declares the dark role tones under their own selector
(e.g. `[data-theme="dark"]`).

**Contrast is by tone distance, not a warm-hue exception.** M3 pairs a role with
its `on-` foreground so the tone gap clears the contrast floor: a gap of 40 in
HCT tone is ≈ 3:1, a gap of 50 is ≈ 4.5:1. Because every role ships its `on-`
partner, a light fill always carries a dark foreground and a dark fill a light
one — there is no per-hue special case (the old "amber takes dark text" rule is
folded into the pairing).

**State colors are PROJECT EXTENSIONS, not M3-canonical.** Info, success, and
warning are **Jiffies extensions** — they are *not* part of the canonical M3 color
scheme (M3 ships only the core roles plus a fixed error). Each is a **fixed source
hue expanded into its own tonal palette and role pair** by the same toe + chroma
machinery, then mapped to container/`on-container` roles exactly like error. The
dials are `--blue-hue` (info), `--green-hue` (success / `ins`), `--amber-hue`
(warning / `mark`); error (`del`) is the built-in fixed red. Because they are
project extensions outside the M3 pairing guarantees, **each carries its own,
independent contrast obligation**: their role / `on-` pairs are subject to the same
CI contrast test as the core roles, and a consumer who retunes a state hue owns
re-verifying that pair — the M3 tone-distance argument does not automatically cover
them.

**`--brand-color`'s blast radius reaches prose.** Setting `--brand-color` no longer
only repaints buttons and surfaces — its blast radius now reaches **prose links and
marks** (`a`, `mark`, `ins`, `del` read through the role/state surface). This is a
**recorded coarse-control decision**: one dial deliberately moves the whole
read-content palette with the chrome, accepting that fine-grained per-element link or
mark color now requires overriding the relevant role or alias token rather than
sitting independent of the brand.

**Where this honestly diverges from M3.** (1) Key-color derivation uses fixed
OKLCH chroma per role — a translation of the TonalSpot variant; M3 also ships
Fidelity, Vibrant, Expressive, Neutral, and Monochrome variants with different
hue/chroma logic. (2) Chroma is held constant per ramp and left to the browser's
gamut mapping at the light/dark extremes, where M3 deliberately tapers it. (3)
Oklab hue ≠ CAM16 hue, so expect small hue drift in the blue–purple band — the
exact region HCT was built to fix. (4) Contrast is *approximate by construction*:
the toe lands tones near their CIE L\* targets, but the tones are not *corrected*
to hit the floor the way M3's contrast module does. CSS alone cannot run a
verification pass — but the test harness can, and does: `test/computed/contrast.test.mjs`
resolves every role / `on-` pair (and every load-bearing border vs. its surface)
to sRGB in Chromium and asserts the WCAG ratio (text ≥ 4.5:1, non-text ≥ 3:1)
across a spread of brand hues, so a pairing that drifts below the floor fails CI
rather than shipping. The system targets perceptual (OKLCH/APCA-flavored) tone
distance; the CI test is what makes a WCAG claim defensible for a given brand hue.

*Grounded in:* [Material 3 dynamic color](https://m3.material.io/styles/color/system/how-the-system-works)
for the generative model — one source color → five key colors → tonal palettes →
semantic roles, with the canonical light/dark tone assignments and `on-` pairing;
[Material Color Utilities](https://github.com/material-foundation/material-color-utilities)
for the reference algorithm (HCT, palettes, contrast, scheme), which this
approximates in CSS rather than reimplements; Björn Ottosson's
[Oklab](https://bottosson.github.io/posts/oklab/) for the toe — the
reference-lightness correction that aligns Oklab L with CIE L\*;
[OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
(Evil Martians) and Lea Verou's
[LCH colors in CSS](https://lea.verou.me/blog/2020/04/lch-colors-in-css-what-why-and-how/)
for the parts-based, perceptually uniform model; and
[relative color syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)
(`oklch(from …)`), which derives every palette from `--brand-color` with no JavaScript.

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

**Motion** ships a small named vocabulary: three durations —
`--motion-duration-snap` (115ms), `--motion-duration-shake` (165ms),
`--motion-duration-draw` (250ms) — and three curves — `--motion-curve-smooth`
(the Material standard `cubic-bezier(.4, 0, .2, 1)`), `--motion-curve-sticky`,
and `--motion-curve-draw` (emphasized decelerate). The composed `--transition`
(with `--transition-time` / `--transition-function`) is kept as a back-compat
alias resolving to `snap` + `smooth`. `prefers-reduced-motion: reduce` collapses
the durations to `0s`, reinforced by the reset layer's `reduce-motion` rules —
belt and suspenders.

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

Every custom property lives in one of four classifications, a gradient of meaning
from author intent to rendered property:

| Classification | Lives on | Answers | Example |
|---|---|---|---|
| **Intent** | `:root` (public API) | "how will this be used?" | `--brand-color`, `--base-size`, `--font-scale` |
| **Derivation** | `*` (private engine) | connects intent to outcome, re-derived per element | `--_fn-color`, `--_p-40` |
| **Public component alias** | `:root` or a component scope (public) | "which role does this component forward?" | `--color-form-base`, `--progress-track-color`, `--mark-background-color` |
| **Application** | the element's own rule | "what does this change?" | `--color-header`, `--font-size-base` |

Overriding an **Intent** token is coarse control: it moves everything downstream.
Overriding an **Application** final is fine control: one property on one element.
The **Derivation** tier sits between them on the universal selector `*`, so it
re-derives per element. It stays lazy for *paint* — the `oklch()`/`color-mix()`
math runs only when a property reads a token — though the `@property`-registered
toe tokens (`--_l-*`) do carry a computed numeric value on every element: no paint
cost until read, but a per-element computed-style footprint. The
per-element relationships that must re-derive at every local override (a base
color and its hover/active states, the toe that maps tone to lightness) live here
rather than in Intent, so tuning a public dial cannot break them.

The semantic **role / `on-` pairs** (`--color-primary` / `--color-on-primary`)
are role *defaults* on `:root`, deliberately reachable for fine control — a
consumer may retune one. Their contrast guarantee therefore does **not** rest on
tier placement; it rests on M3's canonical tone-distance pairing **and** on the
CI contrast test (`test/computed/contrast.test.mjs`), which is what actually
enforces the floor. A consumer who overrides a role owns re-verification: run the
test against their brand hue. See [PHILOSOPHY.md](PHILOSOPHY.md) for the rationale.

**Public component alias.** A fourth classification sits between Intent and
Application: a **scoped, static, intentionally-overridable role-forwarder**. It is
neither `--_`-private (it is meant to be overridden) nor part of the re-computing
Derivation engine (it does no `oklch()`/`color-mix()` math — it simply forwards a
role token to one component family, giving that family one named seam to retune).
It is static where Derivation re-derives per element, and component-public where an
Application final is element-local. The members are:

- **`--color-form-*`** (`--color-form-base`/`-invalid`/`-disabled`/`-required`) —
  the form-control border/state palette, scoped to `:root`/`fieldset` so a fieldset
  can retune its own controls.
- **`--progress-track-color`** — the progress bar's unfilled track.
- The **Application bridges** — `--mark-*` / `--ins-*` / `--del-*`
  (`--mark-background-color`, `--mark-color`, `--ins-color`, `--del-color`),
  `--page-background-color`, `--card-background-color`, and
  `--background-color-page-end-brand-primary` — each forwarding an M3 role to a
  specific element family (prose marks, the page base, the card surface, the brand
  page-end).

These ship **as-is** in code; they are documented as the alias tier rather than
renamed. They are the named override seams a consumer reaches for when a single
role is right everywhere except one component family.

*Grounded in:* the tiered design-token pattern (global/primitive →
semantic/alias → component) — Nathan Curtis,
[Naming Tokens in Design Systems](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676)
(EightShapes). Jiffies' twist is the middle tier: instead of static alias tokens,
the Derivation engine lives on `*` and re-computes per element.

### Naming grammar

Names are **kebab-case, category/element-first**. Tier is not encoded with
mid-name underscores.

- **Intent and public Application** tokens are plain kebab-case: `--brand-color`,
  `--base-font-size`, `--color-header`, `--margin-card-vertical`.
- **`--_`-prefixed** names are **private to their declaring scope** — Lea Verou's
  pseudo-private prefix — so a reader knows the value is internal to wherever it is
  declared, not a dial to override from outside: `--_fn-color`, `--_p-40`,
  `--_fn-border`.

**Decision D1 — `--_` = private to its declaring scope.** The leading underscore is
a naming convention only (CSS enforces no privacy); it signals "internal to this
scope, do not override from outside." It covers **two** kinds of internals, by the
same rule:

- **Engine intermediates** declared in the `@layer fns` Derivation tier on `*`
  (`--_fn-color`, `--_p-40`, `--_l-40`, `--_k1`): private to the engine, the global
  declaring scope.
- **Component-local Application finals** declared inside a single component's rule
  block (the component files use `--_`-prefixed locals heavily — a base color plus
  its computed hover/active states, a local geometry intermediate): private to that
  component's selector subtree, the local declaring scope.

The distinction that matters is not *tier* but *scope of declaration*: a `--_` name
is owned by whatever rule declares it and is not part of any public surface. This is
why the component layer's pervasive `--_` locals conform to the grammar without any
rename — they are correctly marked private to the component that declares them. No
major design system encodes tier via a mid-name underscore.

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
| `fns` | Derivation engine (`* { --_fn-* }`) — declared first, defined before any consumer; lazy for *paint* (the `oklch()`/`color-mix()` math runs only when a property reads a token), though the `@property`-registered `--_l-*` toe tokens carry a computed numeric value on every element — no paint cost until read, but a per-element computed-style footprint |
| `reset` | Browser normalize (vendored sanitize.css, wrapped in `:where()` for zero specificity) |
| `layout` | Page-level structure (container, page-end) |
| `content` | Semantic element styles (typography, tables, links) |
| `component` | DOM + ARIA components (see Components) |
| `utility` | Class-based helpers (`.flex`, `.grid`) |
| `user` | Untouched layer reserved for consumer overrides |
| `theme` | `:root` Intent tokens — declared **last** |

Four sub-questions are settled:

- **(a) `theme` last is intentional.** Custom properties are ordinary properties,
  so they participate in the cascade like any other. Declaring `theme` last therefore makes its `:root` token
  declarations win against any conflicting `:root` rule in an earlier layer,
  protecting the token contract. (Layers do not affect inheritance; this is purely
  about which declaration wins.)
- **(b) `fns` stays a separate layer, declared first.** The Derivation tier lives
  on `*` and is distinct from `theme`'s `:root` Intent tier; it is not merged into
  `theme`, and it must be defined before any consumer reads it.
- **(c) Imported sheets nest in the importing layer.** Each layer is assembled by a
  barrel that `@import`s its sub-sheets *inside* a layer assignment. The layer is
  fixed by **where the import is made**, not by import order: an `@import` written
  into the `component` layer puts that sheet in `component` regardless of when it is
  imported. So a sub-sheet's *cascade position is its enclosing layer*; the order of
  `@import` statements within one layer only breaks ties between sub-sheets that
  already share that layer. Import order is **not** itself the cascade order — the
  layer order (above) is.
- **(d) `@layer user` is for structural overrides, not token retuning.** Because
  `@layer user` is declared **before** `theme`, `theme` wins for any `:root` token
  conflict — a token re-declared inside `@layer user` would lose to the theme's
  `:root` declaration. Consumer **token** retuning therefore belongs **unlayered /
  in `:root`** (where it outranks any layered declaration), while `@layer user` is
  for **structural rule overrides** (selecting and restyling elements above the
  library layers without fighting specificity).

*Grounded in:* [`@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
(MDN) and [CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/):
for normal declarations, the declaration whose cascade layer is last wins;
the first `@layer` statement fixes the order; and an `@import` made within a layer
places the imported sheet into that layer.

### Reset & normalized content

The `reset` layer vendors **sanitize.css** (wrapped in `:where()` for zero
specificity) plus a reduced-motion pass; the `content` layer then gives semantic
elements their typographic defaults. Together they normalize and style:

- **Block typography** — `html`, `hgroup`, `h1`–`h6`, `p`, `ul`, `ol`,
  `blockquote`, `textarea`.
- **Inline typography** — `a` (`.secondary` / `.contrast`), `abbr`, `strong`, `b`,
  `em`, `i`, `cite`, `del`, `ins`, `kbd`, `mark`, `s`, `small`, `sub`, `sup`, `u`.
- **Containers & overflow** — `body (> #root) > :is(main, header, footer, aside)`
  (with `.fluid`), and `figure.scroll-x` / `figure.scroll-y` for overflowing
  figures.
- **Form controls** — `label`, `input`, `select`, `textarea`, `fieldset`,
  `legend`, with `[aria-invalid]` / `[disabled]` / `[readonly]` states, plus
  `input[type=checkbox|radio][role=switch]` toggles.
- **Tables** — `table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`.

Reduced motion (`prefers-reduced-motion: reduce`) collapses transition durations to
`0s`; `theme/animation.css` repeats the collapse, belt-and-suspenders.

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

### Scope of reach

Three consequences of styling bare elements are deliberate, and worth stating
plainly so consumers can plan around them.

- **Bare-element selectors restyle *all* matching content.** Because the content
  layer targets `p`, `a`, `table`, `ul`, and the rest by element, it restyles **every
  matching element on the page** — including **CMS output, third-party widgets, and
  embedded markup** the author did not write. This is by design: making semantic HTML
  look right without classes is the whole proposition. Reconciling foreign markup is
  declared the **construction layer's job** (normalize the markup, or wrap it). The
  escape hatch is the cascade itself: the reserved **`@layer user`** sits above the
  library layers (and below `theme`), so a consumer can scope an override or re-isolate
  a foreign subtree there without fighting specificity.
- **The blessed SPA mount id is `#root`.** The page spine keys off `#root`:
  `body > #root` is treated as the layout root for a single-page app mounted there.
  Other frameworks (and plain documents) fall to the **`body:not(:has(> #root))`**
  branch, which applies the same spine directly to `body`. A SPA that mounts under a
  different id should either rename its mount to `#root` or accept the
  `:not(:has(> #root))` branch.
- **Base line-height is a frozen px ladder, not a unitless ratio.**
  `--base-line-height` is set per breakpoint as an **absolute px value** (16/18/20/24/
  28/32px across `xs`…`4k`; see [Breakpoints](#breakpoints)), not a unitless
  multiplier of font size. A practical consequence: a smaller element such as `<small>`
  **rides the full base leading** — its line box keeps the breakpoint's px leading even
  though its font is smaller, rather than computing a tighter leading from its own
  reduced size.

---

## Components

Each entry is the **contract** for one component. A component is a DOM shape plus
an ARIA contract, never a class. Each component description uses one format:

- **DOM shape** — the element tree / nesting the rule targets.
- **ARIA** — roles/attributes that select modalities or states.
- **Tokens** — the Application finals  it consumes.
- **States** — the interactive/ARIA states it styles.
- **Edge-classes** — sanctioned classes, if any.

**Edge-classes: the sanctioning criterion.** Classes are not a closed list; they
are sanctioned by a **criterion**. A class is added **only when an element cannot
infer its intent from its shape or its ARIA** — when two presentations are both
valid for the same DOM shape and ARIA contract, and nothing in the markup
distinguishes them. The class names the choice; everything else is selected by shape
or role. The full census of sanctioned classes is:

- **Control variants** — `.secondary`, `.contrast`, `.outline` (a button or control
  whose fill role cannot be read from shape/ARIA alone).
- **Density utilities** — `.compact`, `.loose` (rescale the spacing atom for a
  subtree; cannot be inferred from shape).
- **Shape/flow utilities** — `.fluid` (opt out of the content clamp / full-bleed),
  `.round` (round progress and similar), `figure.scroll-x` / `figure.scroll-y`
  (scroll axis for an overflowing figure).
- **Layout utilities** — `.flex`, `.row`, `.inline`, `.flex-0`…`.flex-4`,
  `.justify-*`, `.align-*`, `.grid` (one-shot Flexbox/Grid composition the markup
  shape cannot encode).

Any class outside this census is out of contract.

### Buttons


- **DOM shape:** `button, a[role=button], input[type=button|submit|reset]`
- **ARIA:** `[role=button]` promotes a link to a button; `[aria-disabled]`, `[aria-busy]` allow for disabled states and loading spinners in buttons.
- **Tokens:** the role pair `--color-primary`/`--color-on-primary` (filled fill + label)
  with a `:hover`/`:active` state layer, and `--color-primary` for the
  `:focus-visible` ring; `.secondary` reads the tonal pair
  `--color-secondary-container`/`--color-on-secondary-container`; `.outline` reads
  `--color-outline` (border) + `--color-primary` (label). Plus `--label-font-family`,
  `--font-size-base`, `--border-radius-button`, `--button-border-style` (border
  style, defaults to `--base-border-style`), `--size-small`/`--size-base` (padding),
  `--_button-min-block-size` (fixed 24px floor guaranteeing the WCAG 2.5.8 AA
  minimum touch-target height regardless of breakpoint or density)
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
- **Tokens:** `--table-font-family` (defaults to `--body-font-family`; `canvas`
  overrides to Trebuchet MS), `--table-row-even-color`/
  `--table-row-odd-color`, `--_fn-border`, `--spacing-block-vertical`/
  `--spacing-block-horizontal` (cell padding)
- **States:** `tr:nth-child(even|odd)`, `th[aria-sort]`, `tr:hover`
- **Edge-classes:** `.compact`, `.loose` to change cell padding. 

### Accordion

Pure-CSS disclosure using native `details`; the chevron is the theme icon.

The custom chevron **replaces the native disclosure marker**: the UA `summary`
marker is removed (`list-style`/`::-webkit-details-marker`) and `--icon-chevron`
draws the affordance, which rotates on `[open]`. **State-announcement
consideration:** the expanded/collapsed state must still ride the native
`details`/`summary` semantics — `details[open]` is what assistive tech announces
(exposed as `aria-expanded` on `summary`). Because the visual marker is now purely
decorative CSS, it carries no state on its own; correctness depends on keeping the
native `details` element (not re-implementing disclosure on generic elements), so
the state stays announced even though the marker is custom.

- **DOM shape:** `details > summary` (+ flow content sibling)
- **ARIA:** native `details[open]` carries expansion state (exposed as
  `aria-expanded` on `summary`)
- **Tokens:** `--icon-chevron` (disclosure marker, replacing the native one),
  `--transition` (rotation),
  `--spacing-block-vertical`/`--spacing-block-horizontal`, `--_fn-border`
- **States:** `[open]`, `summary:hover`, `summary:focus-visible`
- **Edge-classes:** none

### Tabs

A tablist whose **selected state** the stylesheet reflects accessibly. Scope
matters here: CSS reflects *which tab is selected*, but the full ARIA Authoring
Practices keyboard model for a `tablist` — roving `tabindex`, arrow keys,
`Home`/`End`, `Tab` into the panel — is **not** something a stylesheet can supply.
Jiffies ships two selection paths, and operability differs between them:

- **No-JS path (pure CSS):** each `[role=tab]` wraps a visually-hidden radio in a
  shared `name` group; `:checked` drives the indicator and reveals the adjacent
  panel. Keyboard operation is the browser's **native radio-group** behaviour
  (arrow keys move and select within the group) — genuinely operable, though a
  screen reader announces the radio, not a full APG `tab`.
- **JS path:** the construction layer (`accessibility.js`) sets `[aria-selected]`
  and supplies the APG roving-tabindex/arrow-key model. This script is a **hard
  dependency** for the full `tab` keyboard contract; the stylesheet only paints the
  state it sets.

- **DOM shape:** `[role=tablist]` containing alternating `[role=tab]` +
  `[role=tabpanel]` pairs (commonly a `section`); each tab wraps a `label` (and,
  for the no-JS path, a grouped radio)
- **ARIA:** `[role=tab]`, `[role=tabpanel]`, and `[aria-selected]` (JS path);
  selection on the no-JS path is the radio's native `:checked`. `[hidden]` on an
  inactive panel is still honoured.
- **Tokens:** `--color-primary` (active-tab indicator), `--color-surface-variant`
  (hover), `--label-font-family`, `--card-inner-border` (tablist baseline)
- **States:** `[aria-selected=true]` / `:has(:checked)`, `:hover`, `:focus-visible`
- **Edge-classes:** none
- **Adapted from** the v1 jiffies-css `tabs.css`, re-tokenised to the v2 role surface.

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

### Alerts

A status banner. `aside` is the container; the ARIA role sets urgency and
`data-variant` selects the semantic color. Classless: intent rides the role and
the attribute, not a class.

- **DOM shape:** `aside[data-variant]` carrying `[role=alert]` or `[role=status]`
- **ARIA:** `[role=alert]` (assertive — `warning` / `error`) vs `[role=status]`
  (polite — `info` / `success` / `neutral`)
- **Tokens:** the state roles (`--color-error`/`--color-on-error` and the
  project-extension info/success/warning roles), `--border-radius-container`,
  `--card-inner-border`, `--spacing-block-vertical`/`--spacing-block-horizontal`
- **States:** `[role=alert]` + `[data-variant=warning|error]`; `[role=status]` +
  `[data-variant=info|success|neutral]`
- **Edge-classes:** none (`data-variant` is an attribute, not a class)

### Chips

A compact inline tag carrying a status color.

- **DOM shape:** `small[data-variant=warning|error|info|success|neutral]`
- **ARIA:** none beyond surrounding context
- **Tokens:** the matching state role pair, `--border-radius-badge`,
  `--size-xsmall`/`--size-small` (padding)
- **States:** one presentation per `data-variant`
- **Edge-classes:** none (`data-variant` is an attribute, not a class)

### Tooltip

A hover/focus label driven by data attributes, with no extra markup.

- **DOM shape:** any element with `[data-tooltip]`; `[data-direction]` picks the
  side
- **ARIA:** the label text rides `[data-tooltip]`; pair with `[aria-label]` /
  `[aria-describedby]` where the affordance must be announced to assistive tech
- **Tokens:** `--color-surface`/`--color-on-surface` (bubble), `--border-radius-item`,
  `--motion-duration-snap`, `--size-small` (padding)
- **States:** `:hover` / `:focus-visible` reveal;
  `[data-direction=top|right|bottom|left]` placement
- **Edge-classes:** none (`data-tooltip` / `data-direction` are attributes)

---

## Patterns

Patterns are compositions of components and semantic elements into recurring
page structures.

### Card & Panel

A surface with optional header/footer rails around a main body. `article` is the
elevated card; `section` is the flat panel.

- **DOM shape:** `:is(article, section) > :is(header, main, footer)` — a `header`
  or `footer` rail may carry a hero `figure` (see Hero)
- **ARIA:** none beyond the native sectioning roles
- **Tokens:** `--card-background-color`, `--card-shadow` (resting elevation) /
  `--card-shadow-active` (`article:hover` elevation, defaults to `--card-shadow`),
  `--card-border`, `--border-radius-card` (`--base-size`),
  `--margin-card-vertical` (`--size-large`), `--card-inner-border`,
  `--spacing-block-vertical`/`--spacing-block-horizontal` (rail padding),
  `--content-columns` (multi-column `main`)
- **States:** `& > header`/`& > footer` inner borders; `& > main:last-child`
  bottom padding; a hero `figure` in a rail bleeds past the rail padding and clips
  to `--border-radius-card`
- **Edge-classes:** none (`.fluid` is a layout utility, see Page layout & page-ends)
- **Nesting:** a card never surfaces a card. An `article`/`section` with an
  `article`/`section` ancestor gets the surface (background, radius, margin,
  border/shadow) only if it uses the rail shape above; a **bare** nested
  article/section (heading plus flow content, no rail) gets none of it. This
  matters because the rail shape is a deliberate authoring choice nobody
  produces by accident, while a bare nested section is exactly what a tool
  that compiles one `<section>` per heading (e.g. this project's own markdown
  pipeline) emits for every sub-heading — without the exclusion, a document
  three headings deep would stack a card inside a card inside a card,
  compounding margin/padding/border at every level. An unnested article or
  section is unaffected either way.

### Navigation

`nav > ol` in two modes selected by ancestor, not by class.

- **DOM shape:** `:is(header, footer) > nav > ol` (page-end bar) and
  `aside > nav > ol` (sticky table of contents)
- **ARIA:** `[aria-current]` marks the active link
- **Tokens:** `--header-nav-background-color`/`--header-nav-color`,
  `--nav-item-spacing-vertical`/`--nav-item-spacing-horizontal`, `--nav-font-family`,
  `--color-surface-variant`/`--color-primary`, `--toc-left-offset`, `--transition`
- **States:** `:is([aria-current], :hover, :focus)` (underline);
  `li:has(a:hover)` (background); aside TOC hover-indent
- **Edge-classes:** none

### Breadcrumb

A trail rendered from a nav list with a separator glyph. It is **classless**: the
`Breadcrumb` ARIA label selects it, not a class — its intent is fully inferable from
its ARIA contract, so the sanctioning criterion adds no class for it.

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
  `:is(header, footer):has(> figure)` (hero page-end, see Hero);
  `:has(> aside)` (row-wrap reflow); responsive `order` swap at `md`
- **Edge-classes:** none — `.fluid` (full-bleed opt-out of the content clamp) is a
  layout utility, not a component variant

### Hero

A banner image with an overlaid title. The hero is a `figure` holding an `img`
and a heading, placed inside a `header` or `footer` rail. It is **classless**:
the DOM shape selects it, and **its parent decides its scale** — inside a card
(`article`/`section`) it bleeds to the card edge and clips to
`--border-radius-card`; inside the page spine (`body > #root`) it is a full-bleed
page banner.

- **DOM shape:** `:is(header, footer) > figure > img` paired with a heading
  (`figure > :is(h1, h2, h3, h4, h5, h6)`); card vs. page is read from the
  `header`/`footer`'s parent — `:is(article, section)` (card) vs. the layout root
  (page)
- **ARIA:** structural only; the `img[alt]` carries the accessible name and the
  heading carries the visible title
- **Tokens:** `--border-radius-card` (card-hero corner clip), `--base-viewport-width`
  (page hero may opt out of the clamp via `.fluid`), `--header-font-family`,
  `--color-on-surface`/`--color-surface` (title contrast over the image)
- **States:** `:is(article, section) > :is(header, footer) > figure` (card-scoped,
  clipped); `(body > #root) > :is(header, footer) > figure` (page-scoped,
  full-bleed); heading positioned over the image
- **Edge-classes:** none — a full-bleed page hero reuses the `.fluid` utility (see
  Page layout & page-ends)
