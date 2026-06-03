# Design: Rewrite `design_system.md` as the Aspirational Design-Level Spec

> This is a *meta* design doc. It specifies **how** the repo-root `design_system.md`
> is rewritten and what it must contain. The rewrite itself is implemented in the
> later phases of this topic (feature-test → plan → red-green-refactor).

## Problem Statement

`design_system.md` was last touched 2023-11-05 (`0f7bc0c`). It describes a system
that no longer matches the v2 direction 

- **Naming** uses underscores (`--brand_chroma`, `--card_header_color`; grammar
  `--{source}[_{variant}][-{state}]_{unit}`); the code and PHILOSOPHY.md use a
  kebab-case three-tier model.
- **Breakpoints**: the active table is a 4-step max-width set (500/1000/1500/2000,
  Mobile/Tablet/Window/Desktop, 18–22px). The 6-step min-width ladder (xs–4k) is
  the v2 baseline (it already sits commented-out in the file); its per-breakpoint
  font sizes (12–24px) landed in `a2cf930`.
- **Typography**: the doc hardcodes a per-breakpoint REM size table (18/24, 22/28)
  plus family definitions. The current direction is a major-third scale
  (`--font-scale: 1.25`) over a `pow()` engine. (The golden-ratio `--phi-*` ladder
  was a *README* claim, removed in `a2cf930` — it never appeared in this file.)
- **Spacing** says base = 4/8/12px; the code uses `--base-size: 8px` with
  `.compact` = 4px and `.loose` = 16px.
- **Components** are an aspirational catalog; v2 ships only card, navigation, and
  breadcrumb.

Meanwhile its historical jobs have split across two newer documents:

| Concern | design_system.md (2023) | PHILOSOPHY.md | README.md |
|---|---|---|---|
| Variable model / tiers | naming grammar (underscores) | **owns** the model | — |
| Selector / nesting rules | — | **owns** | — |
| Breakpoints / type / spacing | stale tables | — | **owns** (reconciled `a2cf930`) |
| Override token list | partial | — | **owns** |
| Component catalog | aspirational list | scope only | one-line list |

The file is, per TASKS.md, "the most misleading file in the repo." A naïve
reconciliation to current code would either duplicate PHILOSOPHY/README or
re-freeze a snapshot that drifts again.

## Goals

- Re-establish `design_system.md` as the **aspirational design-level
  specification**: how the library *should* work, researched and internally
  coherent — the target implementation builds toward.
- Pitch it at a **contributor** (someone building or extending the library), not
  a consumer (README) and not a rationale reader (PHILOSOPHY).
- Keep a **stable section-numbering scheme** so TASKS.md tracks implementation
  progress against it by section anchor.
- State the ideal once and **cross-link** PHILOSOPHY/README rather than restating
  them.

## Non-Goals

- Not a reconciliation-to-as-built reference. The doc describes the destination;
  implementation status lives in TASKS.md.
- Not a consumer install/usage guide (README) or a rationale essay (PHILOSOPHY).
- Not creating a new progress-tracking document — TASKS.md is reused (see
  *TASKS.md Anchor Contract*).
- Not changing any CSS in this topic. Where the ideal differs from current code,
  the gap is a tracked TASKS.md item, not an edit here.

## Prior Art

- **`docs/research/v2-decisions.md`, `v2-design-system.md`, `v2-tasks.md`** — the
  project's own decision records and prior research (DR-3 type scale, the
  φ-in-README finding, the v2 task map). The primary grounding for the ideal;
  TASKS.md already references them (`Ref DR-3`, `v2-tasks §1.6`).
- **PHILOSOPHY.md** (sibling) — the three-tier variable model
  (Intent → Derivation → Application), classless/semantic philosophy, selector &
  nesting conventions, scope. `design_system.md` *applies* this model to concrete
  foundations and components; it must not re-explain it.
- **README.md** (sibling) — consumer-facing principles, the reconciled responsive
  table, override token list, fonts. `design_system.md` is the contributor-facing
  counterpart.
- **Pico.css** — classless semantic CSS reset; closest peer for "style semantic
  elements, components via element relationships."
- **Cloudscape foundations** and **Material design tokens** — token-tier
  vocabulary and foundations structure (README inspirations).
- **Open Props** / **modular-scale** — token catalogs and the type-scale `pow()`
  approach the major-third decision rests on.

## Metrics

The rewrite succeeds when:

1. **Anchor integrity** — every `§`-reference currently in TASKS.md
   (`§2.3`, `§4.1`–`§4.10`) resolves to a real section in the new doc. Verifiable
   with a static test that cross-checks TASKS.md refs against doc headings.
2. **No duplication** — foundations math and the variable model appear once;
   PHILOSOPHY/README are cross-linked, not copied. Spot-checked in review.
3. **Coherence** — the ideal is internally consistent: the type scale,
   breakpoints, spacing, color model, and tiers compose without contradiction.
4. **Grounded** — each Foundations and Architecture section cites at least one
   decision record (`docs/research/v2-decisions.md`) or prior-art source it rests
   on. Checkable by inspection: a section with no citation fails.

## Specification

### Role & sibling-doc contract

`design_system.md` is the **aspirational design-level spec** (the ideal).
Each section answers *"what should this part of the system be, in detail?"* and
links to PHILOSOPHY for *why* and README for *how to use it*. Implementation
status is never asserted in the doc; it is tracked in TASKS.md.

### Section outline (Approach A — Domain-first)

```
1  Purpose & Scope
   1.1 Role vs PHILOSOPHY / README
   1.2 Progress tracking via TASKS.md anchors
2  Foundations
   2.1 Breakpoints (xs–4k min-width ladder)
   2.2 Typography (major-third scale + families)
   2.3 Color (oklch hue/chroma/luminance; single-brand theming)
   2.4 Spacing & Sizing (--base-size + t-shirt scale)
   2.5 Motion & Iconography
3  Architecture
   3.1 Variable model (Intent/Derivation/Application → PHILOSOPHY)
   3.2 Naming grammar
   3.3 @layer order
   3.4 Selector & nesting conventions (→ PHILOSOPHY)
4  Components  (each: DOM+ARIA shape, tokens consumed, states)
   4.1 Buttons        4.2 Forms          4.3 Form switch
   4.4 Tables         4.5 Accordion      4.6 Tabs
   4.7 Modal          4.8 Property sheet  4.9 Progress
   4.10 Form group
5  Patterns (card, navigation, breadcrumb, layouts)
```

The `§4.x` numbering is fixed by the existing TASKS.md references and must not be
reordered. `§5` holds the patterns already shipped (card/nav/breadcrumb) plus
composite layouts.

### Drift-as-decision resolutions

Each prior-doc/current-direction conflict is resolved as an explicit decision.
The six below adopt already-settled directions; two further conflicts (D1, D2)
are open and flagged for confirmation. Rows follow the `§2.x`/`§3.x`/`§4.x`
outline order:

| # | Topic | Old doc | Ideal (this doc) | Status |
|---|---|---|---|---|
| 1 | Breakpoints (§2.1) | 4-step max-width 500–2000 (active table) | 6-step min-width ladder xs–4k | structure is the v2 baseline |
| 2 | Type scale (§2.2) | per-breakpoint REM table (18/24, 22/28) | major-third `--font-scale: 1.25` over `pow()` | scale + 12–24px ladder landed `a2cf930` |
| 3 | Color (§2.3) | foundation/brand/state/shadow, oklch | oklch single-brand-hue theming; derived complementary/state | per PHILOSOPHY scope |
| 4 | Spacing (§2.4) | base 4/8/12 | `--base-size: 8px`; `.compact` 4 / `.loose` 16; `--size-xsmall…xlarge` scale | landed |
| 5 | Naming/tiers (§3.2) | `--{source}[_{variant}][-{state}]_{unit}` underscores | kebab-case three-tier (Intent/Derivation/Application) | per PHILOSOPHY |
| 6 | Components (§4.x) | aspirational list | `§4.x` shape specs (DOM+ARIA+tokens+states) | aspirational |

Two conflicts are **genuine open architectural decisions** the ideal must settle.
Each is flagged `[DECISION]` in the draft for author confirmation:

- **D1 — Derivation tier prefix.** `[DECISION]` PHILOSOPHY specifies private
  derivations carry a leading `--_` (e.g. `--_fn-color`); the code uses unprefixed
  `--fn-color` / `--color-hover` (zero `--_` instances exist). *Recommended:* the
  ideal commits to `--_`, aligning with PHILOSOPHY; the current unprefixed code
  becomes a tracked TASKS.md gap. *Alternative:* bless `--fn-` and correct
  PHILOSOPHY instead.
- **D2 — Canonical `@layer` order.** `[DECISION]` Three docs disagree:
  - code (`v2/index.css`): `fns, reset, layout, content, component, utility, user, theme` (theme **last**)
  - README: `reset, theme, layout, content, components, utility, user`
  - PHILOSOPHY: `reset, content, component, utility`
  *Recommended:* the ideal records one canonical order — README's
  `reset → theme → layout → content → component → utility → user`. Two sub-points
  for the author: (a) is the code's `theme`-last position intentional, or a gap to
  the canonical order? (b) does the derivation engine stay a separate `fns` layer
  or merge into `theme`? Where the canonical order differs from code, that is a
  tracked TASKS.md gap, not a CSS edit in this topic; realigning README's and
  PHILOSOPHY's layer lists is likewise a separate tracked task, not part of this
  rewrite.

### Component spec format (`§4.x` template)

Each `§4.x` section is the contract its component-* task implements against:

```
### 4.N <Component>
- DOM shape:   <the & > nesting / element tree, e.g. article > header/main/footer>
- ARIA:        <roles/attributes that select modalities, e.g. [role=tab]>
- Tokens:      <Application finals it consumes, e.g. --color-header, --font-size-base>
- States:      <interactive/aria states it styles, e.g. :hover, [aria-invalid]>
- Edge-classes: <only the sanctioned closed list, if any: .secondary/.contrast/.outline>
```

DOM shapes are seeded from README's component list (e.g. accordion
`details > summary`, tabs `details[role=tablist] summary[role=tab]`, modal
`dialog`, property sheet `dl/dt/dd`, form group `fieldset[role=group]`). Whether
`§5 Patterns` reuses this full template or a lighter "already-shipped" format is
an open decision (see *Deferred decisions*).

### TASKS.md anchor contract

- `design_system.md` section numbers are **stable identifiers**. TASKS.md items
  reference them (`Ref §4.1`) as the implementation-progress link.
- Renumbering a section is a breaking change requiring a matching TASKS.md update.
- Adding a component appends a new `§4.x`; it does not renumber existing ones.
- This is the agreed substitute for a separate conformance doc.

### Well-researched mandate

The user's intent is a "well researched" ideal. Each Foundations and Architecture
section must cite the decision or prior art it rests on (decision records for the
type scale and breakpoints; PHILOSOPHY for the tiers; Pico/Cloudscape/Material for
structure). Research is performed during the rewrite (implementation phase), not
deferred to the reader.

## Alternatives Considered

- **Tier-first structure** (Intent → Derivation → Application, components as
  consumers). Elegant and close to PHILOSOPHY, but breaks the `§4.x` component
  anchors and forces a TASKS.md renumber. Rejected.
- **Reference-catalog structure** (exhaustive token/selector/shape tables).
  Maximal detail, but reads as generated reference, duplicates README's token
  tables, and is not "design-level." Rejected.
- **Retire the file** (fold content into PHILOSOPHY/README/per-component docs).
  Legitimate, but the user wants `design_system.md` to exist as the aspirational
  ideal that implementation targets. Rejected.
- **As-built reference** (document only what ships). Lowest drift risk, but the
  user explicitly wants the doc aspirational, with TASKS.md tracking the gap.
  Rejected.

## Summary

Rewrite `design_system.md` as the contributor-facing aspirational design-level
spec, organized domain-first (Foundations → Architecture → Components →
Patterns), with a stable `§`-numbering scheme that TASKS.md references for
progress. It states the ideal once and cross-links PHILOSOPHY (why) and README
(consumer how). The settled prior-doc conflicts adopt already-landed or
PHILOSOPHY-defined decisions; two (D1, D2) remain open for confirmation.

### Deferred decisions (confirm at draft gate)

- **D1** — Derivation tier prefix: `--_` (recommended) vs. unprefixed `--fn-`.
- **D2** — Canonical `@layer` order, and whether the code's `theme`-last position
  and separate `fns` layer are intentional.
- Whether `§5 Patterns` should also carry the `§4.x` spec template, or a lighter
  "already-shipped pattern" format.
