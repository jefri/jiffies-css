# Implementation Plan: Rewrite `design_system.md` as the aspirational design-level spec

**Feature test:** *Skipped by author direction* — human review covers acceptance.
The one mechanically-verifiable metric (anchor integrity, design.md *Metrics* §1)
is added as the objective guard in Step 6: a `test/*.test.mjs` that cross-checks
every TASKS.md `§`-reference against a real heading in `design_system.md`.
Coherence, no-duplication, and grounding (design.md *Metrics* §2–§4) are review
checks, not executable.

**User story:** A contributor opening `design_system.md` reads a researched,
internally-coherent ideal, Foundations → Architecture → Components → Patterns. It
states the ideal once, cross-links PHILOSOPHY (why) and README (how to use), and
carries a stable  section numbering scheme that TASKS.md references for progress.

**Decisions settled at the design draft gate (encoded by this plan):**
- **D1** — Derivation tier uses the `--_` private prefix. The shipped unprefixed
  `--fn-` / `--color-hover` code becomes a tracked TASKS.md gap (Step 3).
- **D2** — `design_system.md` is the sole authority for the *specific* canonical
  `@layer` order. README and PHILOSOPHY document only the layering *concept*. The
  exact order is settled in §3.3 during Step 3, grounded in the decision records;
  divergence from shipped code becomes a tracked TASKS.md gap.
- **§5 format** — Patterns use the full `§4.x` template (DOM+ARIA+Tokens+States+
  Edge-classes), uniform with components and able to carry not-yet-built composite
  layouts as aspirational specs.

**Source of truth for content:** `design.md` (this folder) — *Specification*,
*Drift-as-decision resolutions* table, *Component spec format*, *Section outline
(Approach A — Domain-first)*. Grounding: `docs/research/v2-decisions.md`,
`v2-design-system.md`, `v2-tasks.md`; siblings PHILOSOPHY.md, README.md.

**Steps:**
- [x] Step 1: Skeleton, anchors, and §1 Purpose & Scope (anchor guard pulled
  forward from Step 6 as the red→green test for the skeleton)
- [x] Step 2: §2 Foundations
- [x] Step 3: §3 Architecture (settles D1, D2)
- [x] Step 4: §4 Components (§4.1–§4.10)
- [x] Step 5: §5 Patterns
- [x] Step 6: Anchor-integrity guard and TASKS.md close-out (guard written in
  Step 1; this step is TASKS.md close-out + full-suite confirmation)

---

## Step 1: Skeleton, anchors, and §1 Purpose & Scope

**Enables:** Anchor integrity (Metric §1) from the first step. Establishes the
role/no-duplication contract (Metric §2).

Replace `design_system.md` with the full heading tree from design.md's *Section
outline*, every section present as a stub so all TASKS.md `§`-refs resolve
immediately:

```
# Jiffies CSS — Design System (aspirational spec)
## 1 Purpose & Scope
### 1.1 Role vs PHILOSOPHY / README
### 1.2 Progress tracking via TASKS.md anchors
## 2 Foundations
### 2.1 Breakpoints
### 2.2 Typography
### 2.3 Color
### 2.4 Spacing & Sizing
### 2.5 Motion & Iconography
## 3 Architecture
### 3.1 Variable model
### 3.2 Naming grammar
### 3.3 @layer order
### 3.4 Selector & nesting conventions
## 4 Components
### 4.1 Buttons … ### 4.10 Form group   (all ten headings present)
## 5 Patterns
```

Write §1 in full:
- **§1.1** — states the doc *is* the aspirational design-level spec; each section
  answers "what should this part be, in detail?"; links PHILOSOPHY for *why* and
  README for *how to use*; implementation status is never asserted here (it lives
  in TASKS.md). (design.md *Role & sibling-doc contract*.)
- **§1.2** — the TASKS.md anchor contract: section numbers are stable identifiers;
  renumbering is a breaking change needing a matching TASKS.md edit; adding a
  component appends a new `§4.x` and never renumbers. (design.md *TASKS.md anchor
  contract*.)

Sections §2–§5 carry a one-line "filled in Step N" placeholder. The doc is
internally valid (every anchor exists); `npm test` is untouched and green.

**Invariant:** The `§4.1`–`§4.10` and `§2.3` headings must exist verbatim from
this step forward — they are the live TASKS.md reference targets.

## Step 2: §2 Foundations

**Enables:** Grounding metric (§4) for foundations; documents drift-table rows
1–4 as the settled ideal.

Write §2.1–§2.5. Each subsection states the ideal and cites at least one decision
record or prior-art source (Metric §4 fails any uncited Foundations section):

- **2.1 Breakpoints** — 6-step min-width ladder `xs`–`4k`, per-breakpoint font
  sizes 12–24px. Cite the v2 baseline (`v2-tasks`/`v2-design-system`) and the
  landing commit `a2cf930`. (Drift row 1.)
- **2.2 Typography** — major-third scale `--font-scale: 1.25` over a `pow()`
  engine, plus families. Cite DR-3 (`v2-decisions.md`) and Open Props /
  modular-scale prior art. Note the golden-ratio `--phi-*` ladder was a removed
  README claim, never in this file. (Drift row 2.)
- **2.3 Color** — oklch single-brand-hue theming; derived complementary/state
  colors. Cite PHILOSOPHY scope. (Drift row 3. This is the `§2.3` TASKS.md anchor —
  heading must stay exact.)
- **2.4 Spacing & Sizing** — `--base-size: 8px`; `.compact` 4 / `.loose` 16;
  `--size-xsmall…xlarge` t-shirt scale. (Drift row 4.)
- **2.5 Motion & Iconography** — chevron icon set (`theme/icons.css`) and motion
  tokens; cite the icon source.

Rows 1–4 record already-landed directions, so few or no new gaps. Any foundation
where the ideal still differs from shipped CSS is appended to TASKS.md as a tracked
gap in this step, never edited into CSS here. `npm test` stays green.

## Step 3: §3 Architecture (settles D1, D2)

**Enables:** Records D1 and the canonical `@layer` order; grounding for
architecture; drift-table row 5.

- **3.1 Variable model** — Intent → Derivation → Application, three tiers.
  Cross-link PHILOSOPHY; do **not** re-explain it (Metric §2). (Drift row 5.)
- **3.2 Naming grammar** — kebab-case three-tier grammar. **D1:** derivations
  carry the `--_` private prefix (e.g. `--_fn-color`). Append a TASKS.md gap: the
  shipped unprefixed `--fn-` / `--color-hover` derivations rename to `--_`.
- **3.3 @layer order** — **D2:** record the single canonical order here, derived
  from the decision records and the code's intent. Settle the two sub-questions:
  (a) is the shipped `theme`-last position canonical or a gap? (b) does the
  derivation engine remain a separate `fns` layer or merge into `theme`? README
  and PHILOSOPHY are *not* corrected to this specificity — they keep the concept
  only; this section owns the order. Where the chosen order diverges from
  `v2/index.css`, append a TASKS.md gap (realign code), and note README/PHILOSOPHY
  specificity is intentionally out of scope.
- **3.4 Selector & nesting conventions** — cross-link PHILOSOPHY; summary only.

`npm test` stays green (no CSS touched; gaps are TASKS.md items).

## Step 4: §4 Components (§4.1–§4.10)

**Enables:** Fills the ten `§4.x` anchors with real contracts; drift-table row 6.

For each of §4.1 Buttons, 4.2 Forms, 4.3 Form switch, 4.4 Tables, 4.5 Accordion,
4.6 Tabs, 4.7 Modal, 4.8 Property sheet, 4.9 Progress, 4.10 Form group, write the
spec using design.md's *Component spec format* template:

```
### 4.N <Component>
- DOM shape:    <element tree / nesting>
- ARIA:         <roles / attributes>
- Tokens:       <Application finals consumed>
- States:       <interactive / aria states styled>
- Edge-classes: <sanctioned closed list, if any>
```

Seed DOM shapes from README's component list (accordion `details > summary`, tabs
`details[role=tablist] summary[role=tab]`, modal `dialog`, property sheet
`dl/dt/dd`, form group `fieldset[role=group]`, etc.). Each `§4.x` is the contract
its `component-*` TASKS.md item implements against — build status stays in TASKS.md,
not asserted here. `npm test` stays green.

## Step 5: §5 Patterns

**Enables:** Completes §5 with the full template (the settled §5-format decision).

Write §5 covering the shipped patterns — card, navigation, breadcrumb — and the
aspirational composite layouts, each using the same `§4.x` template as Step 4.
Shipped patterns describe the ideal shape (not "as-built"); divergence is a
TASKS.md gap, consistent with the rest of the doc. `npm test` stays green.

## Step 6: Anchor-integrity guard and TASKS.md close-out

**Enables:** Metric §1 mechanically verified; tracker left consistent with the
new doc.

1. Add `test/design-system-anchors.test.mjs` (node `--test`): parse every
   `§`-reference in TASKS.md, assert each resolves to a real heading in
   `design_system.md`. This is the objective acceptance guard standing in for the
   skipped feature test. *If the author prefers pure human review, drop this file
   at the plan draft gate and keep anchor integrity as a review-checklist item.*
2. Update TASKS.md *In Flight*: remove the stale "design draft gate" note for this
   topic and mark the rewrite complete; confirm the gap items appended in Steps 2–3
   (`--_` rename; `@layer` realignment to canonical) are present and correctly
   `§`-anchored.
3. Run `npm test` — confirm green, including the new anchor test.

**Invariant:** TASKS.md and `design_system.md` agree on every `§` anchor after
this step. No CSS changed in the topic; every doc/code divergence is a tracked
TASKS.md gap, not an edit.
