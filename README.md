# jiffies-css

Post-Modern CSS Full-Page Reset

[Demo Page](https://jefri.github.io/jiffies-css)

## Principles

- Beautiful styles for semantic base elements
- Componentes via relationships of semantic elements
- Aria roles for selecting between component modalities
- User configuration via a limited number of CSS Variables
- User extension with targeted layers
- Opinionated tables, whitespace, & nav
- Responsive typography & container layouts; flexbox & css grid native utilities
- Pure-CSS Accordions, Tabs

## Inspiration

- [Pico.css](http://picocss.com)
- [Primitive UI](https://taniarascia.github.io/primitive/)
- [Skeleton](http://getskeleton.com/)

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

## Variables

- Create a “variable hierarchy tree”. At the `:root` level, document several “core” variables that dictate the broad behaviors of the app.
- `--font-size`
- `--font-family`
  - `--font-family-monospace`
  - `--font-family-heading`
- `--spacing`
  - `--spacing-block-horizontal`
  - `--spacing-block-vertical`
  - `--font-family-table`
- `--color-primary-hue`
- `-–color-accent-hue`
- `--color-form-base`
  - `--color-form-invalid`
  - `--color-form-disabled`
  - `--color-form-required`
- `--transition-timing`

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

## Utilities

- Loading `\[aria-busy=true]`
- Tooltip `\[data-tooltip][data-direction]`
- Flex `.flex` `.row` `.inline` `.flex-{0-4}` `.justify-{around, between, center}` `.align-{baseline, center, stretch, end}`
- Grid
- Accessility
