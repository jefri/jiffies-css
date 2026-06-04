# Project Under Review — Jiffies CSS (shared context)

> Shared Symposium context. **Every voice loads this.** It describes the standing
> review target; the specific task under review is passed in alongside it.

Jiffies CSS is a Post-Modern CSS full-page reset: one global stylesheet that
styles an entire page from semantic HTML. Load-bearing claims the Symposium will
test:

- **Classless & semantic** — a component is its DOM hierarchy plus its ARIA roles,
  rarely a class (`article > header` = card header; `[role=tab]` = a tab). Closed
  edge-class list: `.secondary`, `.contrast`, `.outline`.
- **Three-tier token model** — Intent (on `:root`, the public API) → Derivation
  (private `--_fn-*` pseudo-functions on `*`, lazy) → Application (per element).
  Non-negotiable invariants (contrast) live in Derivation, not Intent.
- **Modern CSS only** — `@layer` ordering as reading order, `:has`, `:is`/`:where`,
  `color-mix`, `oklch`, `@nest`, `env()`. Targets released Chrome/Safari/Firefox.
- **Single-brand theming** — one brand hue derives complementary/highlight colors;
  multi-brand-per-page is explicitly out of scope.
- **The brittleness rebuttal** — the parent/child + ARIA contract is held by a
  construction layer (typed DOM builder functions, or agentic AI), not by
  hand-authored markup hoped to match.
- **Testing** — static `node:test` reads CSS source for structural correctness;
  Playwright reads `getComputedStyle` for the live cascade.
