# jiffies-css

Post-Modern CSS Full-Page Reset

Write semantic HTML, get a styled page.

[Demo Page](https://jefri.github.io/jiffies-css)

## Usage

Install from npm:

```sh
npm i @davidsouther/jiffies-css
```

Or pull the stylesheet straight from a CDN:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@davidsouther/jiffies-css/dist/index.css"
/>
```

Then write semantic HTML. Jiffies styles base elements, derives components from
the relationships between them, and reads ARIA roles to select between
modalities. The single dial for color is `--brand-color`; set it once and the
whole scheme derives. See [design_system.md](design_system.md) for the full
token surface and [PHILOSOPHY.md](PHILOSOPHY.md) for the rationale.

## Principles

- Beautiful styles for semantic base elements
- Components via relationships of semantic elements
- Aria roles for selecting between component modalities
- Express DOM states in visual style
- User configuration via CSS Variables
- User extension with targeted layers
- Opinionated tables, whitespace, & nav
- Responsive typography & container layouts; flexbox & css grid native utilities
- Pure-CSS advanced components, including Accordions, Tabs, Cards, Tables, Forms, and more.
- Accessible & Responsive

## Inspiration

- [Pico.css](http://picocss.com)
- [Primitive UI](https://taniarascia.github.io/primitive/)
- [Skeleton](http://getskeleton.com/)
- [Cloudscape foundations](https://cloudscape.design/foundation/)
- [Material design tokens](https://m3.material.io/foundations/design-tokens/overview)

## Support floor (Chrome 119 / Safari 16.4 / Firefox 128, mid-2024 Baseline)

The engine is built on a recent slice of the platform. These are the load-bearing
features it actually uses; the support floor is set by the latest of them
(approximately Chrome 119, Safari 16.4, Firefox 128 — a mid-2024 Baseline):

- [oklch()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) — every color is assembled here from parts.
- [relative color syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors) — `oklch(from var(--brand-color) <L> <C> h)` derives every palette from the one seed.
- [@property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) — registers the toe tokens (`--_l-*`) with a typed numeric value.
- [color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) — state layers (hover/active) mix a role with its surface.
- [:has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) — selects a parent by what it contains (page-ends, breadcrumbs).
- [:is() / :where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:is) — group variants; `:where()` keeps reset/defaults at zero specificity.
- [@layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) — the cascade order that makes the token contract win.
- [pow()](https://developer.mozilla.org/en-US/docs/Web/CSS/pow) — the modular type scale is one `calc()`.

## Fonts

- Body: Poppins
- Text Header: Libre Baskerville
- App Header: Roboto
- Tables: Trebuchet MS
- Code: JetBrains Mono

## Layers

Jiffies stacks its styles in `@layer`s, each with one job:

- `fns` — the Derivation engine (`* { --_fn-* }`). Derivations cost no paint until
  a property reads one, but the `@property`-registered toe tokens (`--_l-*`) do
  carry a computed numeric value on every element, so the tier carries its
  per-element declaration footprint even where it goes unread.
- `reset` — browser normalize (vendored sanitize.css at zero specificity).
- `layout` — page-level structure (container clamp, page-ends, aside reflow).
- `content` — semantic element styles (typography, tables, links).
- `component` — DOM + ARIA components.
- `utility` — class-based helpers (`.flex`, `.grid`).
- `user` — untouched layer reserved for your overrides.
- `theme` — `:root` Intent tokens; declared last so the token contract wins.

The exact declared order — and why `theme` is last and `fns` first — is owned by
[design_system.md › @layer order](design_system.md#layer-order). That section is
the single authority; this list is only the concept.

## Reset

- Sanitize.css
- Reduced Motion
- Content `p`, `figure`
- Containers `body (> #root) > { main, header, footer, aside }(.fluid)`
- Overflow `scrolling` `figure(.scroll-{x,y})`
- Block Typography `html` `hgroup` `h1` `h2` `h3` `h4` `h5` `h6` `p` `ul` `ol` `blockquote` `textarea`
- Inline Typography `a[.secondary,.contrast]` `abbr` `strong` `b` `em` `i` `cite` `del` `ins` `kbd` `mark` `s` `small` `sub` `sub` `u`
- Buttons `button` `a[role=button]` `input[type={button,submit,reset]`
- Forms `label` `input` `select` `textarea` `label` `fieldset` `legend`
  - `\[aria-invalid]` `\[disabled]` `\[readonly]`
- Toggles `input\[type={checkbox,radio}]\[role=switch]`
- Extended Forms input` `\[type={color,date,file,search}]
- Tables `table` `thead` `tbody` `tfoot` `tr` `th` `td`

## Components

- Card & Panel `{article, section} > {main, header, footer}`
- Alerts `aside\[data-variant+role]`, `\[role=alert]`, `\[role=status]`
  - `\[role=alert]` + `\[data-variant=warning|error]`
  - `\[role=status]` + `\[data-variant=info|success|neutral]`
- Chips `small\[data-variant=warning|error|info|success|neutral]`
- Accordion `details > summary`
- Tab `details \[role=tablist] summary\[role=tab]`
- Modal `dialog`
- Navigation `nav > ol`
  - Breadcrumb `span:has(nav > ol) nav > ol`
- Progress `progress`
- Property Sheet `dl, dt, dd`
- Form group `fieldset\[role=group]`

## Edge-classes & utilities

A class is sanctioned only when an element cannot carry the intent from its shape
or ARIA. That criterion — not a fixed enumeration — is what admits a class.

- **Edge-classes** ride on a component to add intent its shape can't express:
  `.secondary`, `.contrast`, `.outline`.
- **Utilities** are a separate category — standalone helpers, not component
  variants: `.fluid` (full-bleed opt-out of the content clamp), `.compact` /
  `.loose` (density), `.round`, and `figure.scroll-x` / `figure.scroll-y`
  (overflow), plus the layout helpers `.flex` and `.grid`.

See [design_system.md](design_system.md) for the canonical census and the
per-component edge-class lists.

## Layout

- Loading `\[aria-busy=true]`
- Tooltip `\[data-tooltip][data-direction]`
- Flex `.flex` `.row` `.inline` `.flex-{0-4}` `.justify-{around, between, center}` `.align-{baseline, center, stretch, end}`
- Grid `.grid` with the `--grid-column-count` dial

## Customizing

Two kinds of override, two different places to put them.

**Structural rule overrides go in `@layer user`.** The `user` layer is reserved for
your rules and sits above the library layers, so you win on specificity without
fighting it:

```css
@layer user {
  /* a one-off rule the library does not ship */
  article.callout {
    border-inline-start: var(--size-small) solid var(--color-primary);
    padding-inline-start: var(--size-medium);
  }
}
```

**Token retuning should be UNLAYERED or in `:root`.** Do **not** retune tokens
inside `@layer user`. The declared order is
`@layer fns, reset, layout, content, component, utility, user, theme` — `user`
sits **below** `theme`, so for a conflicting `:root` token a declaration in
`@layer theme` wins over the same token set in `@layer user`. Set the seed (and any
other Intent token) unlayered, where an unlayered declaration outranks every layer:

```css
/* unlayered :root — outranks all @layers, including theme */
:root {
  --brand-color: oklch(0.55 0.15 270);
}
```

That one dial re-derives the whole scheme. See
[design_system.md › @layer order](design_system.md#layer-order) for why `theme` is
last and what that means for token conflicts.

**Dark mode** follows the OS via `prefers-color-scheme`; each role reassigns to a
different tone of the same palette. A manual `[data-theme]` toggle is **not** built
in — OS-driven theming is the current, intentional behavior.

## Themes

Four example themes ship with Jiffies CSS. Apply one by setting `data-theme` on `<html>`:

```html
<html data-theme="canvas">
```

| Theme | Character |
|---|---|
| `canvas` | Default. Poppins body, Libre Baskerville headers, soft corners, M3 elevation. |
| `bento` | Editorial grid. Inter throughout, tight tile geometry, surface-variant card fills. |
| `paper` | Print edge. Sharp corners, hairline ink borders, no shadows, no motion. |
| `neumorphism` | Soft extruded geometry. Paired light/dark shadows on a mid-gray plane; no flat borders. |

To build your own theme, see [docs/themes.md](docs/themes.md). The short version: every
visual decision the built-in themes make is a CSS variable override in a single
`:root { … }` or `:root[data-theme="name"] { … }` block — no element selectors required.

## Theming

Override variables.

- Color (`color`)
- Density
  - Spacing (`spacing`)
- Typography (`font`)
  - Iconography
- Motion

### Sizing

`--base-size` (spacing unit, 8px default; `.compact` = 4px, `.loose` = 16px)
`--spacing-block-horizontal`, `--spacing-block-vertical`

### Typography

- `--font-scale: 1.25` (major third)
- `--base-font-size` — responsive base; see the breakpoint table above
- `--base-font-weight` — body weight (normal)
- `--body-font-family`, `--header-font-family`, `--label-font-family`, `--nav-font-family`, `--monospace-font-family`
- `--brand-body-font-family`, `--brand-header-font-family` — Intent-tier overrides; set these to apply custom fonts

- `--spacing` Unitless spacing multiplier for margins and paddings. 1 = comfortable, .5 = compact
  - `--spacing-block-horizontal`, `--spacing-block-vertical` Modify vertical and horizontal density separately
- `--border-radius-container` .5rem
- `--border-radius-item` .25rem
  - `--border-radius-button`
  - `--border-radius-input`
- `--border-radius-inline` .125rem
  - `--border-radius-badge`

### Color

One seed drives the whole scheme. Set `--brand-color` and every role derives from
it via Material 3's generative model, approximated in pure CSS with `oklch()`.

Seed:

- `--brand-color` — the source color; the five key palettes and all roles derive
  from it.

Semantic role tokens (read by components, never raw tones). Each surface or fill
role ships an `--color-on-*` pair carrying a contrast-safe foreground:

- `--color-primary` / `--color-on-primary` (+ `-container` / `-on-container`)
- `--color-secondary` / `--color-on-secondary` (+ `-container` / `-on-container`)
- `--color-tertiary` / `--color-on-tertiary` (+ `-container` / `-on-container`)
- `--color-error` / `--color-on-error` (+ `-container` / `-on-container`)
- `--color-surface` / `--color-on-surface`, `--color-surface-variant` / `--color-on-surface-variant`
- `--color-background` / `--color-on-background`
- `--color-outline` / `--color-outline-variant`

State roles (project extensions, dialed by hue): info (`--blue-hue`), success
(`--green-hue`), warning (`--amber-hue`); error is the built-in fixed red.

Dark mode reassigns each role to a different tone of the same palette; it does not
re-derive. See [design_system.md › Color](design_system.md#color) for the full
Roles table, the tonal-palette machinery, and the contrast guarantee.

### Motion

- `--motion-duration-snap` 115MS
- `--motion-duration-shake` 165MS
- `--motion-duration-draw` 250MS
- `--motion-curve-smooth` (0.00, 0.00, 0.00, 1.00)
- `--motion-curve-sticky` (1.00, 0.00, 0.83, 1.00)
- `--motion-curve-draw` (0.84, 0.00, 0.16, 1.00)
