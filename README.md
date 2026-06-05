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

## 2023 Standards

- [@nest](https://caniuse.com/?search=%40nest)
- [color-mix()](https://caniuse.com/?search=color-mix)
- [env()](<https://caniuse.com/?search=env()>) for user-defined (not user-agent) ([spec](https://drafts.csswg.org/css-env-1/#css-environment-variable))
- [:has](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
- [hwb](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb)

## Fonts

- Body: Poppins
- Text Header: Libre Baskerville
- App Header: Roboto
- Tables: Trebuchet MS
- Code: JetBrains Mono

## Layers

Jiffies stacks its styles in `@layer`s, each with one job:

- `fns` — the Derivation engine (`* { --_fn-* }`); lazy, costs nothing until read.
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
- Accordion `details { @nest summary }`
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
