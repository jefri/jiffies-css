# Developer Tasks — Jiffies CSS v2

When starting any task, begin with research:using-research to explore best practices and common patterns for each component or feature.

---

## In Flight

- [ ] **design-system-rewrite** — Design doc drafted at
  `docs/developer/2026-06-02-B-design-system-rewrite/design.md` (branch
  `2026-06-02-B-design-system-rewrite`). At the design draft gate: review, resolve
  the two flagged decisions (D1 derivation prefix `--_`; D2 canonical `@layer`
  order), remove the `*DRAFT*` marker, then run `developer:ailly` to continue
  (feature-test).

---

## Components (parity port — each follows docs/philosophy.md)

Suggested order = dependency / demo-prominence. Each consumes the parts-based
color system. README-promised, demoed in `index.html`, v2 import commented out.

- [ ] **component-buttons** — Reference implementation that proves the philosophy.
  `button, a[role=button], input[type=button/submit/reset]` + `.secondary
  .contrast .outline`. First consumer of `--fn-color`. Ref §4.1.

- [ ] **layout-layer** — Implement container/page-end layout into the
  declared-but-empty `layout` layer, or drop the layer from the spine. Ref
  v2-tasks §1.6.

---
- [ ] **component-forms** — `label input select textarea fieldset legend` +
  `[aria-invalid] [disabled] [readonly]`. Largest; grid via `--grid-column-count`
  on fieldset. Ref §4.2.
- [ ] **component-form-switch** — `input[type=checkbox/radio][role=switch]`. Ref §4.3.
- [ ] **component-tables** — `table thead tbody tfoot tr th td`; even/odd,
  Trebuchet family. Ref §4.4.
- [ ] **component-accordion** — `details > summary`; chevron already in
  `theme/icons.css`. Ref §4.5.
- [ ] **component-tabs** — `section[role=tablist] [role=tab] [role=tabpanel]`;
  uses existing `accessibility.js` for `aria-selected`. Ref §4.6.
- [ ] **component-modal** — `dialog`; reset has base, needs component styling. Ref §4.7.
- [ ] **component-property-sheet** — `dl dt dd`. Ref §4.8.
- [ ] **component-progress** — `progress`; smallest. Ref §4.9.
- [ ] **component-form-group** — `fieldset[role=group]`; joined-control row. Ref §4.10.
- [ ] **component-color-swatches** — rainbow/swatches commented block in
  `index.html`; depends on `--color-hue`/`--chroma` plumbing (finish §2.3 first).

- [ ] **computed-thresholds** — Expand seed tests with exact threshold assertions:
  specific non-zero pixel sizes for padding, exact color comparisons for brand
  colors. Depends on component tasks landing stable values.

---

## Spec-alignment gaps (design_system.md)

The aspirational `design_system.md` states the ideal; these are the code/spec
divergences it surfaced. Each is a CSS realignment, tracked here per the doc's
no-edit-in-spec rule.

- [ ] **breakpoint-columns** — Align `--content-columns` ramp to the responsive
  table's target counts (1·1·1·2·2·4). `v2/theme/sizing.css` currently ramps to 2
  at `xl` and 3 at `4k`. Ref §2.1.
- [ ] **motion-vocabulary** — Expand motion tokens to the named durations
  (`--motion-duration-snap`/`-shake`/`-draw`) and curves (`--motion-curve-*`) the
  README sketches; shipped code has only the single `--transition*` triple. Ref §2.5.
- [ ] **derivation-private-prefix** — Rename shipped Derivation intermediates to the
  `--_` private prefix (D1). `v2/functions.css`: `--fn-color`, `--color-hover`/
  `-focus`/`-active`, `--fn-merge`, `--fn-border`; update callers (`navigation.css`).
  Ref §3.2.
- [ ] **layer-order-doc-alignment** — Reduce README and PHILOSOPHY layer lists to
  the layering *concept*; `design_system.md` §3.3 owns the canonical
  `fns, reset, layout, content, component, utility, user, theme` order. Ref §3.3.