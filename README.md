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
  href="https://unpkg.com/@davidsouther/jiffies-css/jiffies-css-v2-bundle.min.css"
/>
```

Then write semantic HTML. Jiffies styles base elements, derives components from
the relationships between them, and reads ARIA roles to select between
modalities. The single dial for color is `--brand-color`; set it once and the
whole scheme derives. See [DESIGN.md](DESIGN.md) for the full design system — the
architecture, component contracts, and token surface — and
[PHILOSOPHY.md](PHILOSOPHY.md) for the rationale.

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

## Minimum Supported Browsers (mid-2024 baseline) Chrome 119 / Safari 16.4 / Firefox 128

Jiffies CSS uses modern CSS features.


- [oklch()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) — every color is assembled here from parts.
- [relative color syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors) — `oklch(from var(--brand-color) <L> <C> h)` derives every palette from the one seed.
- [@property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) — registers the toe tokens (`--_l-*`) with a typed numeric value.
- [color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) — state layers (hover/active) mix a role with its surface.
- [:has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) — selects a parent by what it contains (page-ends, breadcrumbs).
- [:is() / :where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:is) — group variants; `:where()` keeps reset/defaults at zero specificity.
- [@layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) — the cascade order that makes the token contract win.
- [pow()](https://developer.mozilla.org/en-US/docs/Web/CSS/pow) — the modular type scale is one `calc()`.

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
[DESIGN.md › @layer order](DESIGN.md#layer-order) for why `theme` is
last and what that means for token conflicts.

**Dark mode** follows the OS via `prefers-color-scheme`; each role reassigns to a
different tone of the same palette. A manual `[data-theme]` toggle is **not** built
in — OS-driven color schemes are the current, intentional behavior.

## Design, Theming, & Customization

Details of the design system, how to theme and customize, are detailed in DESIGN.md.