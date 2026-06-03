# Jiffies CSS — Design System (aspirational spec)

This is the **aspirational design-level specification** for Jiffies CSS: how the
library *should* work, researched and internally coherent — the target the
implementation builds toward. It is written for a **contributor** building or
extending the library.

It is not a consumer guide and not a rationale essay. For *why* the model is
shaped this way, read [PHILOSOPHY.md](PHILOSOPHY.md); for *how to install and use*
the library, read [README.md](README.md). This document states the ideal once and
cross-links those siblings rather than restating them.

> **Implementation status is never asserted here.** Where the ideal differs from
> the shipped CSS, the gap is a tracked item in
> [docs/developer/TASKS.md](docs/developer/TASKS.md), not an edit in this doc.

---

## 1 Purpose & Scope

### 1.1 Role vs PHILOSOPHY / README

`design_system.md` is the aspirational design-level spec — the ideal. Each section
answers one question: **"what should this part of the system be, in detail?"**

The three contributor- and consumer-facing documents divide cleanly:

| Document | Question it answers | Audience |
|---|---|---|
| **`design_system.md`** (this doc) | *What* should each part be, in detail? | Contributor (builds/extends) |
| **[PHILOSOPHY.md](PHILOSOPHY.md)** | *Why* is the model shaped this way? | Reader of rationale |
| **[README.md](README.md)** | *How* do I install and use it? | Consumer |

The contract between them:

- This doc **applies** PHILOSOPHY's three-tier variable model
  (Intent → Derivation → Application) and its classless/semantic conventions to
  concrete foundations and components. It does **not** re-explain the model; it
  links to PHILOSOPHY (§3.1, §3.4).
- This doc gives the contributor-facing detail behind README's consumer-facing
  responsive table, override-token list, and fonts. It does **not** duplicate
  README's install/usage material; it links to it.
- Implementation status — what currently ships versus what is still aspirational —
  is **never** asserted here. It lives in [TASKS.md](docs/developer/TASKS.md). A
  reader who wants "is this built yet?" goes to TASKS.md; a reader who wants "what
  is this supposed to be?" stays here.

### 1.2 Progress tracking via TASKS.md anchors

This document carries a **stable section-numbering scheme**. TASKS.md references
those numbers (`Ref §4.1`) as the link between an implementation task and the
spec section it builds toward. The contract:

- **Section numbers are stable identifiers.** A `§`-reference in TASKS.md must
  always resolve to a real heading here. This is verified mechanically by
  `test/design-system-anchors.test.mjs`.
- **Renumbering a section is a breaking change.** It requires a matching edit to
  every TASKS.md reference in the same change.
- **Adding a component appends a new `§4.x`.** It never renumbers an existing one,
  so historical references stay valid.
- This stable-anchor scheme is the agreed substitute for a separate conformance
  document; TASKS.md is the single progress tracker.

---

## 2 Foundations

*Filled in Step 2.*

### 2.1 Breakpoints

*Filled in Step 2.*

### 2.2 Typography

*Filled in Step 2.*

### 2.3 Color

*Filled in Step 2.*

### 2.4 Spacing & Sizing

*Filled in Step 2.*

### 2.5 Motion & Iconography

*Filled in Step 2.*

---

## 3 Architecture

*Filled in Step 3.*

### 3.1 Variable model

*Filled in Step 3.*

### 3.2 Naming grammar

*Filled in Step 3.*

### 3.3 @layer order

*Filled in Step 3.*

### 3.4 Selector & nesting conventions

*Filled in Step 3.*

---

## 4 Components

*Filled in Step 4. Each `§4.x` is the contract its `component-*` task in
[TASKS.md](docs/developer/TASKS.md) implements against.*

### 4.1 Buttons

*Filled in Step 4.*

### 4.2 Forms

*Filled in Step 4.*

### 4.3 Form switch

*Filled in Step 4.*

### 4.4 Tables

*Filled in Step 4.*

### 4.5 Accordion

*Filled in Step 4.*

### 4.6 Tabs

*Filled in Step 4.*

### 4.7 Modal

*Filled in Step 4.*

### 4.8 Property sheet

*Filled in Step 4.*

### 4.9 Progress

*Filled in Step 4.*

### 4.10 Form group

*Filled in Step 4.*

---

## 5 Patterns

*Filled in Step 5.*
