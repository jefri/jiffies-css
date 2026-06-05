# Developer Tasks — Jiffies CSS v2

When starting any task, begin with research:using-research to explore best
practices and common patterns for each component or feature.

---

## Active topics

- [ ] **table-font-token** — Introduce `--brand-table-font-family` as a sixth
  font role alongside the existing five (body/header/label/nav/monospace). Add
  it to `v2/theme/typography.css` following the same `--brand-*` → named face →
  base stack pattern. Wire `--table-font-family` into the tables component
  (`component/tables.css`) and to any `table` selector in content. Once landed,
  replace the `@layer user` structural override in `themes/canvas.css` with a
  proper `--brand-table-font-family: "Trebuchet MS"` token declaration, and
  audit the other theme files for their table face (or leave them inheriting the
  body default). Also reconciles the `symposium-doc-debt` note (line 252–254)
  which already flagged this gap. Gated on theme-skins landing so canvas.css
  exists as the right edit target.

- [ ] **theme-skins-final-review** — After the theme-skins feature test passes,
  run a final refactor + review pass over the topic (themes/ files, panel theme
  row + JS, canvas font-role migration, contrast assertions) and tidy with
  `developer:cleanup`. Gated on the feature test being green.

---

## Conventions

**Re-enablement model.** The v2 stylesheet has accumulated cruft and has drifted
from `design_system.md`. Rather than edit in place, the rewrite **zeroes out** to a
sanitize-only baseline (see **zero-out**) and then walks *up the cascade* —
`fns → theme → layout → content → component → utility` — re-enabling **one module
at a time**. Each module's task is the same shape: uncomment its `@import`, review
and update the file against the spec in `design_system.md`, then capture a
screenshot. A module is not done until it matches the spec and its frame is
refreshed. `fns` and `theme` are not written in isolation, but edited as necessary working through `layout`, `content`, and `component`.

**Visible progress via screenshots.** `index.html` is the canonical demo page *and*
the progress tracker. The screenshot series begins from the near-unstyled
(sanitize-only) baseline and each re-enabled module adds a frame showing the delta,
so the set reads as a visual changelog of the rewrite. Screenshot capture is a
separate Playwright job (see **screenshot-harness**), not an assertion test in
`test/computed/`.

**Doc/code divergence (read before any foundation work).** Commit `42b5c5b` rewrote
the *docs* (`design_system.md`, `PHILOSOPHY.md`, `README.md`) to Material 3's
`--brand-color` model, but `v2/` still ships the **old parts API**:
`--brand-hue`/`--brand-luminance`/`--brand-chroma`, `--fn-color`/`--fn-merge`/
`--fn-border`, the `--color-hover`/`-focus`/`-active` mixes, and
`--brand-primary-color` (read by `navigation.css`). The `--_` private prefix is not
yet used. `design_system.md` is the authority; every re-enable task realigns its
module to it.

---

## Phase 0 — Zero out & harness (do these first)

- [x] **zero-out** — Comment the current implementation down to the `reset`
  (sanitize) layer, leaving a near-unstyled baseline. Keep the `@layer` declaration
  in `v2/index.css` so order survives. Specifically:
  - `v2/index.css`: comment the `fns` (`./functions.css`) and the broken `layout`
    (`./layout/layout.css`) layer imports — the latter also clears the current 404.
    Keep `./sanitize/index.css` active; keep the `theme`/`content`/`component`/
    `utility` layer imports active as empty shells.
  - `v2/theme/theme.css`: comment all six sub-imports (typography, colors, sizing,
    borders, animation, icons).
  - `v2/content/content.css`: comment the active sub-imports (containers,
    typography-block, typography-inline).
  - `v2/component/component.css`: comment the active sub-imports (card, navigation,
    breadcrumb).
  - `v2/utility/utility.css`: comment flex and grid.

  Result: only `reset` applies. Each later task re-enables exactly one of these
  lines. Verify the existing `test/computed/` suite still loads (it will need its
  expectations relaxed to the sanitize-only baseline, or skipped until modules
  return).

- [x] **demo-page** — Review and update `index.html` as the canonical test/demo
  page. Remove the stale old-API `:root` overrides in the inline `<style>`
  (`--brand-hue`, `--brand-chroma`, `--brand-luminance`, `--hyperlink-color`) and
  the old live-tuning controls (`--color-primary-hue`, `--sizing`,
  `--font-family-*`); replace them with the new Intent surface (`--brand-color`,
  `--base-size`/density, font-role overrides) or drop the controls until the engine
  lands. Ensure every component in `design_system.md` has a demo home so screenshots
  can track it: add the markup that is currently missing or commented out —
  `progress` (Progress), `dialog` (Modal), `dl` property sheet, hero `figure > img`
  + heading inside a rail (Hero), `nav[aria-label="Breadcrumb"]` (Breadcrumb), and
  the color swatches block. Ref: README demo, all Components.

- [x] **screenshot-harness** — Add a Playwright screenshot capability that drives
  `index.html` and writes PNGs to `docs/screenshots/`. Add a `screenshot(page,
  name)` helper alongside `withPage`/`css` in `test/computed/helpers.mjs` (or a
  sibling module), and an npm script (e.g. `screenshots`) that loads the demo page
  in Chromium, captures a full-page frame plus per-section frames, and runs both
  light and dark via `emulateMedia({ colorScheme })`. Capture the **baseline** now —
  the sanitize-only zero-out render — so every later module has a before to diff
  against. Keep this separate from `node --test` (artifacts, not assertions), and
  commit the PNGs. Ref: DEVELOPMENT.md (Playwright section).

---

## Phase 1 — Re-enable `fns` + `theme` (foundation; tokens every consumer reads)

- [x] **m3-tonal-palettes** — Re-enable `fns` (`./functions.css`) and `theme/colors.css`
  and rewrite both to Material 3's generative model. Color derives the scheme from
  one `--brand-color`: five key palettes (`--_p-*`/`--_s-*`/`--_t-*`/`--_n-*`/`--_nv-*`)
  plus a fixed `--_e-*` error, each a tonal ramp whose lightness passes through the
  inverse Oklab toe (`--_k1`/`--_k2`/`--_k3` → `--_l-*`), assigned to `--color-*`
  semantic role tokens with canonical light/dark tone mappings; dark mode reassigns
  roles to tones (does not re-derive). Add the state palettes (info/success/warning
  + fixed error). Replace the old parts API and the `--color-hover`/`-focus`/`-active`
  mixes. This is the gate for content and components below — they read `--color-*`
  roles that do not exist yet. Folds in the color half of **derivation-private-prefix**.
  Screenshot. Ref: *Color*.

- [x] **derivation-private-prefix** — Rename the remaining (non-color) Derivation
  intermediates to the `--_` private prefix (D1): `--fn-merge`/`--fn-border` →
  `--_fn-*`; update callers. Ref: *Naming grammar*.

- [x] **re-enable theme/typography** — Uncomment and review against *Typography*:
  major-third modular scale via `pow()`, the five font roles
  (`--body-`/`--header-`/`--label-`/`--nav-`/`--monospace-font-family` with
  `--brand-*` overrides), responsive `--base-font-size`. Screenshot.

- [x] **re-enable theme/sizing** — Uncomment and review against *Spacing & Sizing*
  and *Breakpoints*: the `--base-size` atom + t-shirt scale, the 6-step min-width
  ladder. Includes **breakpoint-columns**: align the `--content-columns` ramp to the
  responsive table's target counts (1·1·1·2·2·4); it currently ramps to 2 at `xl`
  and 3 at `4k`. Screenshot.

- [x] **re-enable theme/borders** — Uncomment and review against the border-radius
  token set (`--border-radius-container`/`-item`/`-button`/`-input`/`-inline`/`-badge`)
  and `--base-border-size`. Screenshot.

- [x] **re-enable theme/animation** — Uncomment and review against *Motion*. Includes
  **motion-vocabulary**: expand to the named durations
  (`--motion-duration-snap`/`-shake`/`-draw`) and curves (`--motion-curve-*`) the
  README sketches; shipped code has only the single `--transition*` triple, plus the
  `prefers-reduced-motion` collapse. Screenshot.

- [x] **re-enable theme/icons** — Uncomment and review against *Iconography*:
  inline data-URI SVG `--icon-chevron`. Screenshot.

---

## Phase 2 — Re-enable `layout`

- [x] **layout-layer** — The `layout` layer import was removed in **zero-out** (it
  pointed at a non-existent `./layout/layout.css`). Create the file, implement the
  page spine — flex-column root, content clamp to `--base-viewport-width`,
  header/footer page-ends, optional `aside` reflow by `order` — then re-add its
  layer import to `v2/index.css`. Screenshot. Ref: *Page layout & page-ends*;
  v2-tasks §1.6.

---

## Phase 3 — Re-enable `content` (semantic element styles)

- [x] **re-enable content/containers** — Uncomment and review against the container
  model (`body (> #root) > {main, header, footer, aside}`, overflow/`.scroll-*`).
  Screenshot.
- [x] **re-enable content/typography-block** — Uncomment and review block typography
  (`html hgroup h1–h6 p ul ol blockquote textarea`) against *Typography*. Screenshot.
- [x] **re-enable content/typography-inline** — Uncomment and review inline typography
  (`a[.secondary,.contrast] abbr strong b em i cite del ins kbd mark s small sub sup u`);
  `mark`/`ins`/`del` now read the M3 state roles. Screenshot.

---

## Phase 4 — Re-enable / port `component` (each reads `--color-*` roles; each ends with a screenshot)

Order = dependency / demo-prominence. `card`/`navigation`/`breadcrumb` already exist
and are *re-enabled + reviewed*; the rest are *parity ports* (commented stubs with no
file yet) that get created and enabled.

- [x] **re-enable component-card** — Uncomment and review `card.css` against
  *Card & Panel* (`:is(article, section) > :is(header, main, footer)`, M3 surface
  roles, inner borders, rail padding). Screenshot. Ref: Card & Panel.
- [x] **component-buttons** — Reference port that proves the philosophy.
  `button, a[role=button], input[type=button/submit/reset]` + `.secondary .contrast
  .outline`. First consumer of the `--color-primary`/`--color-on-primary` role pair
  (`.secondary`→container pair, `.outline`→`--color-outline`). Screenshot. Ref: Buttons.
- [x] **component-forms** — `label input select textarea fieldset legend` +
  `[aria-invalid] [disabled] [readonly]`. Largest; grid via `--grid-column-count`
  on fieldset. Screenshot. Ref: Forms.
- [x] **component-form-switch** — `input[type=checkbox/radio][role=switch]`. Screenshot. Ref: Form switch.
- [x] **component-tables** — `table thead tbody tfoot tr th td`; even/odd,
  Trebuchet family. Screenshot. Ref: Tables.
- [x] **component-accordion** — `details > summary`; chevron from `theme/icons.css`.
  Screenshot. Ref: Accordion.
- [x] **component-tabs** — `section[role=tablist] [role=tab] [role=tabpanel]`;
  uses existing `accessibility.js` for `aria-selected`. Screenshot. Ref: Tabs.
- [x] **component-modal** — `dialog`; reset has base, needs component styling.
  Screenshot. Ref: Modal.
- [x] **component-property-sheet** — `dl dt dd`. Screenshot. Ref: Property sheet.
- [x] **component-progress** — `progress`; smallest. Screenshot. Ref: Progress.
- [x] **component-form-group** — `fieldset[role=group]`; joined-control row.
  Screenshot. Ref: Form group.
- [x] **re-enable component-navigation** — Uncomment and review `navigation.css`
  against *Navigation*. Drop the old `--brand-primary-color`/`--color-primary-hover`
  for the `--color-*` role tokens (this is the caller flagged in
  **derivation-private-prefix**). Screenshot. Ref: Navigation.
- [x] **breadcrumb-classless** — Re-enable `breadcrumb.css` and reselect by the
  `Breadcrumb` ARIA label rather than the `ol.breadcrumbs` class, keeping the
  pattern classless. Screenshot. Ref: Breadcrumb.
- [x] **hero-pattern** — New: a `figure > img` + heading inside a `header`/`footer`
  rail. Card scope bleeds the figure past the rail padding and clips it to
  `--border-radius-card`; page scope (`body > #root > …`) is a full-bleed banner
  reusing `.fluid`. No CSS ships today. Screenshot. Ref: Hero.
- [x] **component-color-swatches** — Tonal-palette/role swatches block in
  `index.html`; depends on the `--brand-color` palette plumbing from
  **m3-tonal-palettes**. Screenshot. Ref: Color.

---

## Phase 5 — Re-enable `utility`

- [x] **re-enable utility/flex** — Uncomment and review against *Flex*
  (`.flex .row .inline .flex-{0-4} .justify-* .align-*`). Screenshot.
- [x] **re-enable utility/grid** — Uncomment and review the grid utilities
  (`--grid-column-count`). Screenshot.

---

## Phase 6 — Docs & hardening

- [x] **color-doc-alignment** — Realign the consumer-facing color docs to M3. The
  README `### Color` section still lists the old parts API
  (`--color-primary-hue`/`--primary-luminance`/`--primary-chroma`); reduce it to
  `--brand-color` plus the `--color-*` role surface. Sweep PHILOSOPHY for any
  remaining brand-hue/luminance color language. Ref: Color.
- [x] **layer-order-doc-alignment** — Reduce README and PHILOSOPHY layer lists to
  the layering *concept*; the `@layer order` section of `design_system.md` owns
  the canonical `fns, reset, layout, content, component, utility, user, theme`
  order. Ref: @layer order.
- [x] **computed-thresholds** — Expand the seed `test/computed/` tests with exact
  threshold assertions: specific non-zero pixel sizes for padding, exact color
  comparisons for brand colors. Depends on modules landing stable values.

- [x] **symposium-doc-debt** — Deferred doc-honesty items raised by the foundation
  and typography-base symposia (fix here so they don't propagate as more components
  land):
  - README: add a Usage / Getting-Started section (install / CDN `<link>` / "write
    semantic HTML"); the only package ref today is a commented-out v1 unpkg line.
  - Edge-class list: design_system.md calls `.secondary`/`.contrast`/`.outline` a
    *closed* list, but the system also sanctions `.fluid`, `.compact`/`.loose`,
    `.round`, `figure.scroll-x/-y`. Replace the closed enumeration with the
    *sanctioning criterion* ("a class only when an element can't infer intent from
    shape or ARIA") + one canonical census. Sweep PHILOSOPHY's closed-list claim too.
  - Bridge-token grammar: normalize `--mark-background-color`/`--mark-color`/
    `--ins-color`/`--del-color` (and `--page-background-color`/`--card-background-color`)
    to the documented category-first grammar (`--color-mark-background`, `--color-mark`,
    `--color-ins`, `--color-del`), or have consumers read the role tokens directly.
  - Font roles: reconcile design_system.md (names App-Header Roboto, Tables Trebuchet
    MS) with the shipped five roles (body/header/label/nav/monospace); introduce
    `--table-font-family` with the tables component (Phase 4) and document it.
  - Mark info/success/warning as PROJECT EXTENSIONS (not M3-canonical) in the Color
    section, and record `--brand-color`'s blast radius now reaching prose links/marks.
  - Document the foreign/embedded-content scope (bare-element selectors restyle CMS /
    third-party markup — declare out-of-scope or give a reset escape hatch) and the
    blessed `#root` SPA mount id; note base line-height is a frozen px ladder, not a
    unitless ratio.
  - Demo/screenshots honesty: the per-module screenshot folders show not-yet-styled
    components (intentional changelog), but note this so the set doesn't read as a
    more complete framework than ships.
  - From the component symposium (tier-model + polish):
    - Redefine D1 `--_` as "private to its declaring scope" (covers both `@layer fns`
      engine intermediates AND component-local Application finals), so the ~90% of the
      component layer that uses `--_` locals conforms without renames.
    - Add a 4th token classification "public component alias" (scoped, static,
      intentionally-overridable role-forwarder): `--color-form-*`, `--progress-track-color`.
      Stop calling `--color-form-*` "Derivation".
    - Decide per-component spacing home (local Application vs hoisted Intent) and apply
      uniformly — `--nav-item-spacing-*` got hoisted to :root while button padding stayed
      local; the Intent surface shouldn't grow by accretion.
    - Pin the h1 exponent (1.25^6 ≈ 3.81×) in type-scale-apply as a deliberate ceiling.
    - Fix the @layer-assignment phrasing ("imported sheets nest in the importing layer",
      not "import order = cascade order").
    - Code shouldFix: drop forms.css's redundant `@layer component {}` wrapper (the barrel
      assigns the layer); scope `--color-form-*` off the `*` selector to :root/fieldset so
      per-fieldset inheritance works; modernize the tabs visually-hidden recipe to
      `clip-path: inset(50%)`; document/justify the `fieldset[role=group]` styling hook.
    - Accordion: keep a real styled marker or document the custom-chevron state-announcement
      degradation in the screen-reader matrix.
    - Demo: add a live `@layer user` override example + the edge-class census; fix barrel
      comments; note ARIA attribute-value casing (`nav[aria-label="Breadcrumb"]`).
