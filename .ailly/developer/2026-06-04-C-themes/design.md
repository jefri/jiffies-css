# Theme Skins

## Problem Statement

Jiffies CSS derives an entire Material 3 scheme from one `--brand-color` seed plus
a handful of Intent dials (`--font-scale`, density, the five `--brand-*-font-family`
roles, the radius scale). The claim the framework makes — that semantic HTML plus a
tiny Intent surface yields a complete, accessible design — is asserted in the docs
but never *shown* at the scale of a whole visual identity. The demo page exposes the
dials (hue, scale, density) but only ever renders one look.

This component adds **theme skins**: named treatments (`canvas`, `bento`,
`neumorphism`, `paper`) that change the entire feel of the page from the *same*
semantic HTML, in the spirit of CSS Zen Garden. The goal is pedagogical as much as
functional: each theme file is intentionally small, and its byte count is the proof
that radically different designs cost only a few css overrides. The Usage panel
gains a `theme` control row so a visitor can flip between the four and watch one HTML
document change identity.

## Prior Art

- **CSS Zen Garden** — the explicit inspiration: one HTML document, many stylesheets,
  proving that presentation is fully separable from structure. Jiffies' twist is that
  a "garden entry" is not a from-scratch stylesheet but a *small override of a shared
  engine* — the themes inherit M3 derivation, dark mode, the contrast floor, sizing, 
  layout, etc for free.
- **Material 3 theming** — the `--brand-color`-seeded tonal-palette engine already in
  `v2/theme/colors.css`. Themes ride it rather than replace it.
- **The existing Intent panel** (`index.html`, `#intent-panel`) — the hue/scale/density
  controls and the `fieldset[role="group"]` density toggle whose pressed/quiet button
  pattern the new theme row reuses verbatim.
- **The anticipated variant hook** — `v2/index.css:13` ships a commented
  `@import "./variants/neumorphic.css" layer(user);`, confirming variant-skinning via
  `@layer user` was always the intended seam.
- **The source skills** — `skills/{bento,neumorphism,paper}/DESIGN.md` supply each
  theme's palette, type, spacing, and radius foundations. The matching `SKILL.md` files
  describe what and how that theme is unique.

## Metrics

A deployed theme set is operating correctly when:

- **Same-HTML invariant.** Switching themes changes only the `data-theme` attribute on
  `<html>` (plus the inline `--font-scale` and the density class the panel writes when a
  theme syncs its presets). Zero edits to semantic markup. This is the whole point and is
  verifiable by diffing the DOM across switches.
- **Override budget.** `canvas`, `bento`, and `paper` each land under ~25 token
  declarations. `neumorphism` is larger because it is the structural showcase, but its
  *token* (non-structural) budget stays in the same range. A small budget is the
  demonstration; a bloated theme file is a design failure.
- **Contrast floor.** Every theme passes `test/computed/contrast.test.mjs` for the
  `on-surface` and `on-primary` role pairs, across light and dark. Themes that ride the
  engine inherit this automatically; the one sanctioned surface override
  (neumorphism's gray) gets an explicit assertion.
- **Switch cost.** Selecting a theme is one attribute write plus a control sync — no
  stylesheet reload, no layout thrash beyond the repaint.

## Specification

### The model: a theme is a treatment that rides the shared dials

The three Intent dials stay **global and live for every theme**:

- `hue → --brand-color` (the hue slider),
- `--font-scale` (the scale slider),
- density (the `.compact` / `.loose` class on `:root`).

A theme keys all of its color off the *live* `--brand-color` through the existing M3
engine, and overrides only its **non-color identity**: the five font roles, the radius
scale, and structural feel. No theme *file* ever declares `--brand-color` or
`--font-scale`. When a theme "presets" font-scale and density, it does so by moving the
panel controls — which write `--font-scale` inline and toggle the density class — not by
declaring those tokens in the theme stylesheet. The user's chosen hue **persists across
theme switches** — same color, different treatment — which is the cleanest expression of
the philosophy.

### Public API: the `data-theme` contract

A single attribute on the document root selects the active theme:

```html
<html data-theme="canvas">   <!-- default -->
<html data-theme="bento">
<html data-theme="neumorphism">
<html data-theme="paper">
```

One value means one active theme; the values are mutually exclusive by construction.
Density remains an orthogonal axis (the existing `.compact` / `.loose` classes): a theme
sets a *default* density when selected (neumorphism opens compact), but the density toggle
stays live, so the user can change it afterward and the theme treatment persists.

### Layer placement

- **Token overrides** live in `@layer theme { :root[data-theme="X"] { … } }` — the same
  layer as the base `:root` tokens, so the `[data-theme]` selector wins by specificity
  (0,1,1 over 0,1,0) without leaving the documented layer system.
- **Structural feel** lives in `@layer user { [data-theme="X"] … { … } }` — `user` is
  declared after `component`, so structural rules (shadows, border removal, flattening)
  beat the component layer without specificity fights. This is the seam the commented
  `variants/neumorphic.css` anticipated.

### Why the dials still win (precedence)

The panel JS writes `--brand-color` and `--font-scale` as **inline** styles on `:root`.
Inline declarations beat every cascade layer, so the dials own color and scale
unconditionally — exactly the intended behavior. Themes never touch those two tokens,
so there is no conflict to resolve.

**Required migration.** The canvas font roles currently sit in an **unlayered** `:root`
block inside a `<head>` `<style>` element in `index.html` (an unlayered stylesheet rule,
distinct from the true inline `style`-attribute writes the sliders make). Unlayered beats
every layer, so left there they would override any theme's fonts. They move into
`themes/canvas.css` (inside `@layer theme`) so themes can swap fonts. After the move, the
only `:root` declarations outside the layer system are the two inline `style`-property
writes the sliders make at runtime. Canvas declares four roles (body/header/nav/mono) and
leaves `--brand-label-font-family` unset, falling through to the `typography.css` Roboto
default — themes may set it explicitly where their label face differs.

### Per-theme override budget

Each theme's identity, expressed as the smallest override set. Token *names* are
given; exact values are an implementation detail tuned against the source skills. Two
radius values deliberately deviate from the source skills' 4/8px — paper to near-0
(crisp print edge) and neumorphism to ≈1rem (soft pillow) — to carry each look. These
deviations are intentional, not a transcription of the source.

| Theme | Font roles | Radius | Structural (`@layer user`) | Control presets |
|---|---|---|---|---|
| **canvas** | Poppins / Libre Baskerville / Roboto / JetBrains Mono | .5 / .25 / .125rem | none | scale 1.25, normal |
| **bento** | Inter (body/header/nav) + JetBrains Mono | 8px container / 4px item | card surface-variant fill, tighter `.grid` gaps | scale ~1.2, normal |
| **paper** | Montserrat (header) / Roboto (body) / PT Mono (mono) | near-0 (crisp print edge) | flatten (kill shadows), 1px ink hairline borders, optional faint grain (off by default) | normal |
| **neumorphism** | Space Mono + JetBrains Mono | soft (≈1rem) | paired light/dark `box-shadow` on cards/buttons/inputs/switches; `:active` inset; borders removed | scale 1.25, **compact** |

`canvas` is today's baseline, formalized as a theme so it is selectable and so its font
roles leave the inline block.

`neumorphism` is the structural showcase and the one **sanctioned identity surface
override**: its dual shadows need a mid-tone to read, so it overrides `--color-surface`
to a mid-gray. That override is the only place a theme leaves the engine, and it carries
its own contrast assertion and a `prefers-color-scheme: dark` block (dark surface,
inverted shadows). Accessibility guards: shadows are decorative only, text stays
engine-derived on the gray, and `:focus-visible` rings are preserved (never signalled by
shadow alone).

### Usage panel: the `theme` control row

A new control row labeled `theme`, a `fieldset[role="group"]` of four buttons, reusing
the exact pressed (`aria-pressed="true"` → filled primary) and quiet (transparent →
on-surface-variant) styling the density toggle already defines. Selecting a theme:

1. sets `data-theme` on `<html>`;
2. syncs the controls to that theme's characteristic **font-scale and density**
   (the hue slider is left untouched);
3. updates the generated-code box to the full reproduction recipe — the
   `<html data-theme="…">` attribute (plus the density class, if any) and the
   `:root { --brand-color; --font-scale }` the sliders currently produce.

The teaching message the box delivers: *pick a theme, then tune three dials.* Moving a
dial after selecting a theme leaves the theme active (the treatment persists) and only
re-tunes that dial.

### File layout

```
v2/themes/
  themes.css        barrel
  canvas.css
  bento.css
  neumorphism.css
  paper.css
```

`themes.css` is imported into `v2/index.css` **without** a `layer()` wrapper, so each
theme file's internal `@layer theme {}` and `@layer user {}` blocks self-assign to the
correct layers. (`@import … layer(user)` would force the whole file into `user` and
break the token overrides; the plain import preserves each file's internal layering.)

Font loading: the Google-Fonts `@import` URL in `index.html` expands to cover the new
faces (Inter, Space Mono, Montserrat, PT Mono) alongside the existing four. Each font
role still falls through to the offline system stack, so a missing webfont degrades
gracefully.

### Dark mode and contrast

Because color rides `--brand-color` through the engine for all four themes, dark mode
(the M3 role reassignment in `colors.css`) and the contrast CI gate keep working
automatically. The two deliberate exceptions get explicit handling: neumorphism's
gray-surface override ships a dark-mode block and a contrast assertion; paper's
near-neutral, low-chroma look is verified to clear the floor.

## Alternatives

- **Separate-stylesheet `<link>` swap (literal Zen Garden).** Each theme a standalone
  sheet, swapped by toggling `<link disabled>`. Rejected: four themes cannot render live
  in one demo without reloading, and an attribute toggle is friendlier for consumers who
  want to flip a class.
- **Full-fidelity per-theme role recolor.** Override the complete role surface (primary,
  secondary, surface, on-* pairs, outline) per theme to match each source skill exactly.
  Rejected by the fidelity decision: it bypasses the engine, forfeits automatic dark
  mode, and forces a contrast re-verification pass per theme — the opposite of the
  minimal-override demonstration.
- **Hardcode `--brand-color` per theme.** Each theme pins its source skill's primary
  hex. Rejected: it fights the live hue slider (inline style wins anyway) and breaks the
  "same color, different treatment" demonstration. Color is the user's dial; the theme
  is the treatment.
- **Class instead of `data-theme`.** `<html class="theme-bento">` mirrors the existing
  `.compact`/`.loose` density classes. Viable, but `data-theme` encodes "exactly one of a
  set" natively and reads better in selectors; density staying a class keeps the two axes
  visibly distinct.

## Summary

Theme skins turn the framework's central claim into a live demonstration: four named
treatments — `canvas`, `bento`, `neumorphism`, `paper` — selected by one `data-theme`
attribute, each a small override of the shared M3 engine. The three Intent dials stay
global and live; a theme changes fonts, radius, and structural feel while keying color
off the user's persistent hue. Token overrides sit in `@layer theme` with a
`[data-theme]` selector; structural feel sits in `@layer user`. Dark mode and the
contrast floor come for free except for neumorphism's one sanctioned surface override,
which carries its own dark block and assertion. The Usage panel gains a `theme` row and
a code box that prints the exact reproduction recipe.

### Deferred technical decisions

- **Exact token values** (per-theme hues nudged or not, precise radius, neumorphism
  shadow offsets/blur, paper grain texture) are tuned during implementation against the
  source skills and the screenshot harness.
- **Bundle vs. opt-in shipping.** Whether the built `jiffies-css-v2-bundle.css` includes
  all four themes (consumer flips an attribute) or themes ship as opt-in files is left to
  the planning phase; the demo loads all four regardless.
- **Contrast-test extension shape.** Whether to parametrize the existing test over
  `data-theme` values or add a dedicated neumorphism-surface assertion is a planning-phase
  call.
- **Paper grain texture** ships off by default; whether to include it at all is a polish
  decision for implementation.
