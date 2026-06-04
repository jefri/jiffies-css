# Developer Tasks — Jiffies CSS v2

When starting any task, begin with research:using-research to explore best practices and common patterns for each component or feature.

---

## In Flight

_None._ The **design-system-rewrite** landed: `design_system.md` is now the
self-contained design-level spec (Foundations, Architecture, Components,
Patterns). D1 (Derivation `--_` prefix) and D2 (canonical `@layer` order) are
settled in Architecture. The code/spec divergences surfaced during the rewrite
are tracked under *Spec-alignment gaps* below; component ports under *Components*.

A follow-up refinement pass added device profiles to Breakpoints, adopted the
Radix 12-step color scale in Color, and added the Hero pattern. Section
references are **name anchors**, not numbers: a TASKS pointer reads
`Ref: <Heading>` and the doc cross-links by heading name. The anchor guard
(`test/design-system-anchors.test.mjs`) verifies every `Ref:` pointer resolves to
a real heading. The two new code/spec divergences are tracked below
(*radix-12-step-scale*, *hero-pattern*).

---

## Components (parity port — each follows docs/philosophy.md)

Suggested order = dependency / demo-prominence. Each consumes the parts-based
color system. README-promised, demoed in `index.html`, v2 import commented out.

- [ ] **component-buttons** — Reference implementation that proves the philosophy.
  `button, a[role=button], input[type=button/submit/reset]` + `.secondary
  .contrast .outline`. First consumer of `--fn-color`. Ref: Buttons.

- [ ] **layout-layer** — Implement container/page-end layout into the
  declared-but-empty `layout` layer, or drop the layer from the spine. Ref
  v2-tasks §1.6.

---
- [ ] **component-forms** — `label input select textarea fieldset legend` +
  `[aria-invalid] [disabled] [readonly]`. Largest; grid via `--grid-column-count`
  on fieldset. Ref: Forms.
- [ ] **component-form-switch** — `input[type=checkbox/radio][role=switch]`. Ref: Form switch.
- [ ] **component-tables** — `table thead tbody tfoot tr th td`; even/odd,
  Trebuchet family. Ref: Tables.
- [ ] **component-accordion** — `details > summary`; chevron already in
  `theme/icons.css`. Ref: Accordion.
- [ ] **component-tabs** — `section[role=tablist] [role=tab] [role=tabpanel]`;
  uses existing `accessibility.js` for `aria-selected`. Ref: Tabs.
- [ ] **component-modal** — `dialog`; reset has base, needs component styling. Ref: Modal.
- [ ] **component-property-sheet** — `dl dt dd`. Ref: Property sheet.
- [ ] **component-progress** — `progress`; smallest. Ref: Progress.
- [ ] **component-form-group** — `fieldset[role=group]`; joined-control row. Ref: Form group.
- [ ] **component-color-swatches** — rainbow/swatches commented block in
  `index.html`; depends on `--color-hue`/`--chroma` plumbing (finish Color first).

- [ ] **computed-thresholds** — Expand seed tests with exact threshold assertions:
  specific non-zero pixel sizes for padding, exact color comparisons for brand
  colors. Depends on component tasks landing stable values.

---

## Spec-alignment gaps (design_system.md)

These are code/spec divergences between `design_system.md` and the shipped CSS.
Each is a CSS realignment, tracked here rather than in the spec.

- [ ] **breakpoint-columns** — Align `--content-columns` ramp to the responsive
  table's target counts (1·1·1·2·2·4). `v2/theme/sizing.css` currently ramps to 2
  at `xl` and 3 at `4k`. Ref: Breakpoints.
- [ ] **motion-vocabulary** — Expand motion tokens to the named durations
  (`--motion-duration-snap`/`-shake`/`-draw`) and curves (`--motion-curve-*`) the
  README sketches; shipped code has only the single `--transition*` triple. Ref: Motion & Iconography.
- [ ] **derivation-private-prefix** — Rename shipped Derivation intermediates to the
  `--_` private prefix (D1). `v2/functions.css`: `--fn-color`, `--fn-merge`,
  `--fn-border`; update callers (`navigation.css`). The `--color-hover`/`-focus`/
  `-active` mixes are superseded by the step scale — fold into
  **radix-12-step-scale**. Ref: Naming grammar.

- [ ] **radix-12-step-scale** — Color now expands each hue into a 12-step Radix
  ladder (`--_brand-1`…`--_brand-12`), with interactive states as defined steps
  (component `3→4→5`, solid `9→10`, border `6→7→8`, focus ring `7`). Shipped
  `v2/functions.css` instead mixes toward white/black (`--color-hover`/`-focus`/
  `-active`). Realign the engine to emit the step ladder and reselect each
  component's state colors as steps; the amber step-9 fill takes dark text, not
  white. Ref: Color.

- [ ] **hero-pattern** — Implement the Hero pattern: a `figure > img` + heading inside a
  `header`/`footer` rail. Card scope (`:is(article, section) > …`) bleeds the
  figure past the rail padding and clips it to `--border-radius-card`; page scope
  (`body > #root > …`) is a full-bleed banner reusing `.fluid`. No CSS ships
  today. Ref: Hero.
- [ ] **layer-order-doc-alignment** — Reduce README and PHILOSOPHY layer lists to
  the layering *concept*; the `@layer order` section of `design_system.md` owns
  the canonical `fns, reset, layout, content, component, utility, user, theme`
  order. Ref: @layer order.
- [ ] **breadcrumb-classless** — Reselect breadcrumbs by the `Breadcrumb` ARIA
  label rather than the `ol.breadcrumbs` class, keeping the pattern classless.
  Shipped `v2/component/breadcrumb.css` uses `ol.breadcrumbs`. Ref: Breadcrumb.