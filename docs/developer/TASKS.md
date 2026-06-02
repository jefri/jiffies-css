# Developer Tasks — Jiffies CSS v2

When starting any task, begin with research:using-research to explore best practices and common patterns for each component or feature.

- [ ] **ci-playwright-install** — Add `npx playwright install chromium` to CI setup
  step (runs once before `npm test`; separate from `npm install`).

- [ ] **computed-dark-mode** — Add dark-mode computed tests: second `withPage` call
  with `prefers-color-scheme: dark` emulation; assert body/header colors differ
  from light-mode values.

- [ ] **computed-thresholds** — Expand seed tests with exact threshold assertions:
  specific non-zero pixel sizes for padding, exact color comparisons for brand
  colors. Depends on component tasks landing stable values.

---

## Feature Docs (reconcile README + design_system.md with reality)

Discuss each drift as a decision, not an automatic rewrite.

- [ ] **type-scale-apply** — Apply accepted DR-3: set `--font-scale: 1.25` (major
  third), drop the φ claim from README. Keep the `pow()` engine. Ref DR-3.

- [ ] **[DECIDE] responsive-fonts** — Pick: single-bump (rewrite README table),
  full per-breakpoint ladder, or fluid `clamp()`. README promises
  12/14/16/18/20/24; code bumps once at 1024→18px. Ref §2.2.

- [ ] **fn-color-callers** — Decide when porting buttons/forms: wire `--fn-color`
  into the color system or mark it explicitly as scaffolding. Currently defined,
  no v2 consumers. Ref §2.3.

- [ ] **rewrite-design-system-md** — Rewrite `design_system.md` once philosophy
  and type-scale decisions land. Most misleading file in the repo. Hold until
  upstream tasks clear. Ref §2.4.

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
