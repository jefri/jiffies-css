# Symposium Tension Map (shared)

> Shared Symposium context. **Every voice loads this.** It predicts where the
> panel clashes in Phase 3 — your orientation relative to the other voices, not
> their actual reviews. The other reviews stay unseen until Phase 3; this map only
> tells you where your lens is expected to rub against the panel.

These are the predicted live disagreements. Phase 3 resolves each into either a
real trade-off (record it) or a misunderstanding (resolve it).

- **Amara vs Iris** — Designer taste for subtle, low-contrast type and quiet grays
  vs WCAG contrast minimums. Real trade-off; find the line where "looks elegant"
  stops meeting "is readable."
- **Iris vs Priya** — Both care about tokens, from opposite ends: Priya from
  taxonomy and architecture, Iris from "can I map my Figma variables onto the
  Intent tier and get a harmonious result?" Priya's clean public surface only
  matters if Iris can use it.
- **Iris vs Marcus** — Iris is a near-newcomer who edits variables and copies
  markup — exactly the hand-authored / copy-paste path Marcus says breaks. Does a
  designer who doesn't understand the cascade actually drift the contract? Another
  live test of his brittleness charge, from the design-handoff side.
- **Lukas vs Theo** — Spec purity and "shipped in stable" rigor vs "the shim works
  for users today." Purist resists; adopter ships.
- **Priya vs Marcus** — She reads the three-tier token model and closed class list
  as deliberate structure; he reads them as over-engineering and an inevitable
  sprawl. The system's coherence is exactly his target.
- **Marcus vs Theo** — Marcus argues DOM-coupled styling is brittle in the wild;
  Theo is the empirical test — does the generated/AI-authored markup actually hold
  the contract, or does it drift? Theo's Phase-1 finding can confirm or refute
  Marcus's core attack.
- **Priya vs Lukas** — Whether to design the Derivation tier for today's
  `color-mix`/`oklch` reality or to hold for native `@function`. Architecture
  timing vs platform timing.
- **Amara vs Priya** — Contrast lives in Derivation so it re-derives at every local
  override (likely agreement) — but they should confirm it actually holds, not just
  that it's well-placed.
- **All vs Marcus** — The whole panel must answer his central charge: is the
  brittleness rebuttal load-bearing, or marketing? If the construction layer (typed
  builders / agentic AI) genuinely enforces the contract, the premise holds; if Theo
  finds the generated markup drifts, it doesn't. Settle this first — much of the
  rest depends on it.
