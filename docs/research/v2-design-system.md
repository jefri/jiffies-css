# Jiffies CSS v2 — Design System Notes

Read-through of the `v2/` tree, `README.md`, and `index.html`. Bundle files ignored.
These are notes for discussion, not conclusions.

## What this thing is

A **classless full-page reset**. You write semantic HTML, you get a styled page.
No `.btn`, no `.card`. The element *is* the component. Classes only appear at the
edges: `.fluid`, `.secondary`, `.contrast`, `.outline`, `.flex`, `.grid`.

`[A semantic HTML] -> [jiffies] -> [styled page, zero authored classes]`

The selling point in the README: "Components via relationships of semantic
elements." A card is not `.card`. A card is `article > {header, main, footer}`.
A nav is `nav > ol`. A breadcrumb is `ol.breadcrumbs`. The DOM shape carries the
meaning; ARIA roles select between modalities (tablist, switch, button).

## The cascade-layer spine

`v2/index.css` declares the order once, up front:

```
@layer reset, layout, content, component, utility, user, theme;
```

Then imports each file *into* a named layer. Two things worth flagging now,
before we discuss:

1. **`theme` is declared last** in the layer list, which means theme variables
   win specificity-wars against everything. But layers don't matter for custom
   properties the way they do for real properties — a `--var` resolves by normal
   cascade, layer-last just guarantees `:root` theme tokens are not clobbered by
   a stray component-layer `:root`. `[worth a question: was theme-last intentional?]`
2. **`fns` layer is imported but never declared** in the `@layer` statement on
   line 1. `@import "./functions.css" layer(fns)`. An undeclared layer still
   works (it appends after the declared ones, before un-layered), but it sits
   *after* `theme`. `[flag for discussion]`
3. **`layout` layer is declared but its import is commented out.** `content`
   currently carries the page-level layout (`containers.css`). So the spine has
   a reserved slot with nothing in it.

## The variable architecture — three tiers

This is the most interesting pattern in the repo and the one I want to talk
through. `design_system.md` names three tiers; the code half-implements them.

```
[brand/base tokens]  ->  [* function intermediates]  ->  [component finals]
   :root                      * { --fn-* }                  el { --x: ... }
```

- **Tier 1 — Source tokens** (`theme/*.css`, in `:root`): `--brand-hue`,
  `--base-luminance`, `--base-size`, `--base-font-size`. Raw dials.
- **Tier 2 — Functions/intermediates** (`functions.css`, in `* {}`): computed
  values that every element re-derives. `--fn-color` builds an `oklch()` from
  parts; `--color-hover` is a `color-mix`; `--fn-border` assembles a shorthand
  from `--fn-border-color/style/size`. Living on `*` means every element gets a
  fresh copy that resolves against its own nearer variables. That is deliberate
  and clever and also a performance question. `[flag]`
- **Tier 3 — Finals** (component files): each block sets local `--font-size-base`,
  `--color-header`, etc., then immediately consumes them. The indirection lets a
  user override one knob without touching the rule.

### The naming scheme is documented but not yet followed

`design_system.md` specifies:
- Theme: `--{source}_{variant}-{state}_{unit}` (underscores)
- Finals: `--{property}-{source}-{variant}-{state}` (hyphens)

The actual v2 code uses hyphens everywhere (`--brand-primary-color`,
`--color-header`, `--font-size-base`). The underscore convention from the doc is
**not** in the code. Either the doc is stale or the code is unfinished.
`[flag — which is the source of truth?]`

## Color: oklch + hwb + color-mix, parts not values

Colors are never stored whole. They are stored as **parts** — luminance, chroma,
hue — and assembled at use site:

```css
--brand-primary-color: oklch(var(--brand-luminance) var(--brand-chroma) var(--brand-hue));
```

Dark mode flips *parts*, not colors: `prefers-color-scheme: dark` just lowers
`--base-luminance` to 30% and `--brand-luminance` to 58%. The whole palette
recomputes. Hover/focus/active are `color-mix` toward white/black. This is the
Material-tokens / Cloudscape influence cited in the README.

`functions.css` `--fn-color` reads `--luminance`/`--chroma`/`--color-hue` with
fallbacks — but I do not see those consumed yet by v2 components. The function
exists ahead of its callers. `[flag — dead code or scaffolding?]`

## Sizing: one base, everything derived; φ in the README only

- `--base-size: 8px` is the spacing atom. `.compact` -> 4px, `.loose` -> 16px,
  set on `:root` as a class. Everything (`--size-small`, `--size-large`,
  `--spacing-block-*`) is `calc()` off that one number.
- Type scale is **1.125 (minor second)** via `pow(var(--font-scale), 7 - h-level)`.
  Native CSS `pow()`. Heading size is a pure function of heading level.
- The README advertises a **golden-ratio (φ) constant ladder** (`--phi`,
  `--phi-square`, etc.). Those constants are **not in the v2 theme files.** v2
  went with the 1.125 modular scale instead. `[flag — README describes a path
  not taken, or not-yet-taken]`
- Breakpoints in `sizing.css` are width-clamps, not font swaps: each breakpoint
  mostly resets `--base-viewport-width` and the main/aside split. `--base-font-size`
  only bumps at lg (1024 -> 18px). The README's per-breakpoint font ladder
  (12/14/16/18/20/24) is **not** what the code does. `[flag — third doc/code gap]`

## Layout: flex column page, order-swap for aside

`containers.css` is the spine of page layout:
- Root is `body` *or* `body > #root` (vanilla page vs React mount). One selector,
  `body:not(:has(> #root)), body > #root`. `:has()` doing real work.
- Page is `flex-column`, `min-height: 100vh`, `main` flex-grows.
- header/main/footer get centered to `--base-viewport-width` unless `.fluid`.
- When an `aside` exists, layout becomes `row wrap` and children are ordered with
  `--layout-*-order` variables. At <768 the aside drops below; at >=768 it moves
  up beside main. CSS `order` + flex-wrap, no grid. `[A header / main / aside /
  footer reflow driven entirely by order vars]`
- `header/footer:has(> nav)` get the brand background — the README's "page-end"
  concept. So a header is only a brand bar *if* it contains a nav.

## Components present vs promised

README promises: Card, Accordion, Tab, Modal, Navigation, Breadcrumb, Progress,
Property Sheet, Form group.

Actually imported in `v2/component/component.css`:
- **card.css** — active. `article > {header,main,footer}`, inner borders,
  `columns: var(--content-columns)` for multi-column body.
- **navigation.css** — active. Two modes: `aside > nav` (sticky TOC, scrollable,
  hover-indent) and everything-else nav (flex row, space-between).
- **breadcrumb.css** — active but tiny. `ol.breadcrumbs li::before { content: "→" }`.

Commented out / not yet ported: accordion, tabs, form, form-extended,
form-switch, table, property, modal, form-grid. The README and `index.html`
demo **all** of these (the demo has working tabs via `accessibility.js` and
styled forms), but the **v2 CSS for them does not exist yet.** v2 is a
**migration in progress** — the demo page is running ahead of the v2 stylesheet.
`[this is the big one for discussion: v2 is partial]`

`index.html` loads `./v2/index.css`. So right now the demo page shows v2 for
reset/type/card/nav and falls back to unstyled-ish for forms/tabs/tables.

## Content layer details worth noting

- Block elements (`p, ul, ol, blockquote, table…`) share one rule that sets a
  cluster of local `--*-base` vars then consumes them. **Bug smell:** the rule
  sets `--color-text-base` / `--font-family-body` but then reads
  `--text-color-base` / `--font-family-body-base` (transposed / mismatched
  names). Several declarations reference variables that are never defined.
  `[flag — likely real bug, confirm]`
- `:last-child { margin-bottom: 0 }` via `:where()` for zero-specificity. Clean.
- `pre:not(:has(> code.hljs))` — special-cases highlight.js blocks. Vestige of
  the syntax-highlight integration that is commented out in index.html.
- Links are styled by *unsetting* decoration on hover rather than adding it.

## Reset layer

Vendored **sanitize.css v13.0.0**, split into `sanitize / forms / assets /
typography / reduce-motion`. Wrapped in `:where()` throughout = zero specificity,
so author rules always win. This is the foundation the README's "Reset" section
describes. `reduce-motion` zeroes transitions; the `theme/animation.css` token
also collapses `--transition-time` to 0s under the same query — belt and
suspenders.

## Open questions to bring to the discussion

1. **v2 scope** — is v2 meant to reach feature-parity with v1/the demo, or is it
   a deliberate slimmer rewrite? Which components are next?
2. **Doc vs code drift** — README + `design_system.md` describe φ scale,
   per-breakpoint fonts, underscore variable naming. None are in v2 code. Update
   the docs, or is the code unfinished against them?
3. **`functions.css` on `*`** — intentional perf tradeoff, or should those move
   to `:root` / specific elements?
4. **The undefined-variable cluster in `typography-block.css`** — bug or
   intentional placeholder?
5. **`fns` undeclared layer** ordering — intentional?
6. **The empty `layout` layer** — what is meant to live there vs `content`?
