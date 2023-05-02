# jiffies-css

Post-Modern CSS Full-Page Reset

[Demo Page](https://jefri.github.io/jiffies-css)

## Principles

- Beautiful styles for semantic base elements
- Components via relationships of semantic elements
- Aria roles for selecting between component modalities
- Express DOM states in visual style
- User configuration via CSS Variables
- User extension with targeted layers
- Opinionated tables, whitespace, & nav
- Responsive typography & container layouts; flexbox & css grid native utilities
- Pure-CSS Accordions, Tabs
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

- `reset` Base browser resets.
- `theme` Define root variables.
- `layout` Base semantic layout features.
- `content` Styles for built-in browser elements.
- `components` Opinionated, robust components
- `utility` Class-based helper utilities.
- `user` Untouched layer for users to override all properties.

## Reset

- Sanitize.css
- Reduced Motion
- Content
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
- Accordion `details { @nest summary }`
- Tab `details \[role=tablist] summary\[role=tab]`
- Modal `dialog`
- Navigation `nav > ol`
  - Breadcrumb `span:has(nav > ol) nav > ol`
- Progress `progress`
- Property Sheet `dl, dt, dd`
- Form group `fieldset\[role=group]`

## Layout

- Loading `\[aria-busy=true]`
- Tooltip `\[data-tooltip][data-direction]`
- Flex `.flex` `.row` `.inline` `.flex-{0-4}` `.justify-{around, between, center}` `.align-{baseline, center, stretch, end}`
- Grid

## Accessibility

## Responsive

| Size | Breakpoint | Viewport | Columns | base |
| ---- | ---------- | -------- | ------- | ---- |
| xs   | 0          |          | 1       | 12px |
| sm   | 510px      | 425px    | 1       | 14px |
| md   | 768px      | 700px    | 1       | 16px |
| lg   | 1024px     | 920px    | 2       | 18px |
| xl   | 1440px     | 1130px   | 2       | 20px |
| 4k   | 2560px     | 2170px   | 4       | 24px |

## Selectors

### component

### element

### state

## Theming

Override variables.

- Color (`color`)
- Density
  - Spacing (`spacing`)
- Typography (`font`)
  - Iconography
- Motion

<!-- --{color, sizing, box}-{} -->
<!-- --{component: accordian, card, form, link}[-{state: inactive, hover, disabled, focused, validation, error}][-{variant: }] -->

### Constants

`--phi-quart: 6.854`
`--phi-cube: 4.236`
`--phi-square: 2.618`
`--phi-3-2: 2.058`
`--phi: 1.618`
`--phi-half: 1.272`
`--phi-zero: 1`
`--phi-root: 0.786`

### Sizing

`--sizing-base` (responsive)
`--sizing-
`--spacing-block`

### Typography

- `--font-size: --sizing-base`: (1rem), `--font-height: calc(var(--phi) * 1em)`
  - `--font-size-heading-title` `--phi-cube` \<h1>
  - `--font-size-heading-container` `--phi-square` \<h2>
  - `--font-size-heading-section` `--phi-3-2` \<h3>
  - `--font-size-body` `--phi-zero` \<p>
  - `--font-size-figure` `--phi-half` \<figure> \<figcaption>
- `--font-weight` 400 Normal
  - `--font-weight-heavy` 700 Bold
  - `--font-weight-light` 300 Light
- `--font-family` Poppins

  - `--font-family-heading` Jet-Brains Mono
  - `--font-family-monospace` Libre Baskerville
  - `--font-family-table` Trebuchet

- `--spacing` Unitless spacing multiplier for margins and paddings. 1 = comfortable, .5 = compact
  - `--spacing-block-horizontal`, `--spacing-block-vertical` Modify vertical and horizontal density separately
- `--border-radius-container` .5rem
- `--border-radius-item` .25rem
  - `--border-radius-button`
  - `--border-radius-input`
- `--border-radius-inline` .125rem
  - `--border-radius-badge`

### Color

Full colors

- `--white`
- `--black`

Color part variables

- `--primary-luminance`
- `--primary-chroma`
- `--color-primary-hue`
- `--color-form-base`
  - `--color-form-invalid`
  - `--color-form-disabled`
  - `--color-form-required`

Color Functions

- `--color`

### Motion

- `--motion-duration-snap` 115MS
- `--motion-duration-shake` 165MS
- `--motion-duration-draw` 250MS
- `--motion-curve-smooth` (0.00, 0.00, 0.00, 1.00)
- `--motion-curve-sticky` (1.00, 0.00, 0.83, 1.00)
- `--motion-curve-draw` (0.84, 0.00, 0.16, 1.00)
