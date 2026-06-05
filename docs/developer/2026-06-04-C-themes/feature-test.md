# Theme Skins — Feature Test

## User Story

A visitor opens the Jiffies CSS demo page. It loads on the **canvas** treatment.
They drag the hue slider to a warm red, and the whole scheme re-tones to that
color. Then they find the new **theme** control row in the Usage panel — four
buttons: `canvas`, `bento`, `neumorphism`, `paper` — and start flipping through
them.

Each click changes the page's *identity* — the fonts, the corner radius, the
structural feel — but the **document does not change**: the same semantic HTML is
re-dressed, only the `<html>` attributes move (`data-theme`, the density class a
theme presets, the inline `--font-scale`). Their chosen red **persists** across
every switch — same color, different treatment.

**neumorphism** is the structural showcase: cards gain soft pillowed corners and
paired light/dark shadows, and the panel snaps density to **compact**. **paper**
goes the other way — corners crisp toward a print edge and every shadow
flattens. Whichever theme is active, the generated-code box prints the exact
reproduction recipe (`<html data-theme="…">` plus the `--brand-color` the slider
produced), so the visitor can copy their look into their own page.

### Given / When / Then

- **Given** the demo page loaded with `<html data-theme="canvas">` and a
  user-chosen brand hue,
- **When** the visitor selects any theme from the Usage panel's `theme` control
  row (a `fieldset[role="group"]` named "Theme"),
- **Then** `data-theme` on `<html>` becomes that theme, the semantic markup is
  byte-identical to before, the body font role and card radius change, and
  `--color-primary` (derived from the persistent `--brand-color`) is unchanged.
- **And** selecting `neumorphism` gives cards a larger radius than canvas, a
  non-`none` `box-shadow`, and syncs density to `compact`.
- **And** selecting `paper` gives cards a smaller radius than canvas and a
  `box-shadow` of `none`.
- **And** the generated-code box prints `data-theme="<active>"` alongside
  `--brand-color`.

## Executable Feature Test

`test/computed/theme-skins.test.mjs` — a node:test + Playwright suite driven
through `index.html` (via the existing `withPage`/`css` helpers). It is one
cohesive feature test: each `it` is a beat of the single story above and
re-selects the theme it needs, so the beats are order-free while sharing one
loaded page and one user-chosen hue.

### What it pins (the contract the implementation must satisfy)

1. **Default** — the page opens on `data-theme="canvas"`.
2. **The control row** — exactly one `fieldset[role="group"]` named "Theme",
   holding one button per theme (`canvas`/`bento`/`neumorphism`/`paper`).
3. **Same-HTML invariant** — switching to any theme sets `data-theme` and leaves
   `<body>` minus `#intent-panel` byte-identical (the demo chrome may sync; the
   semantic content may not).
4. **Identity + hue persistence** — leaving canvas changes the computed `body`
   `font-family` and `article` `border-radius`, while `--color-primary` (off the
   persistent `--brand-color`) stays equal. (This is also what forces the
   design's required migration: the inline canvas font roles must leave the
   unlayered `<head>` `:root` block, or a theme could never override the fonts.)
5. **neumorphism showcase** — larger radius than canvas, non-`none` `box-shadow`,
   `:root.compact` set, and the `compact` density button `aria-pressed="true"`.
6. **paper flatten** — smaller radius than canvas, `box-shadow: none`.
7. **Reproduction recipe** — the `#intent-code` box prints `data-theme="…"` and
   `--brand-color`.

### Why it fails today

No `theme` control row exists, `<html>` carries no `data-theme`, and no `themes/`
stylesheets ship — so beats 1–2 fail immediately and the `selectTheme` helper
asserts the missing buttons. The remaining beats turn green only as planning
delivers the `data-theme` contract, the four theme files, the panel theme row +
JS, and the canvas font-role migration.
