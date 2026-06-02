# Jiffies CSS v2 — Decision Records

Three gating decisions, researched against public best practice (2024–2026).
Each records the options, the evidence, the recommendation, and the rejected
alternatives — kept on the page for the next reader. **Status: recommendation
made, awaiting your confirmation.** Full source lists live in the research agents'
output; key citations inline.

---

## DR-1 — Variable naming convention (§1.1)

**Question:** docs prescribe underscores to encode tier (`--card_header_color`);
v2 code uses hyphens. Which is the rule?

**Evidence:** No surveyed design system encodes tier with a mid-name underscore.
Material 3 (`--md-sys-color-primary`), Adobe Spectrum (`--spectrum-global-color-*`),
Style Dictionary's CSS output, and the W3C Design Tokens spec are all hyphen-only,
category-first. The W3C spec puts hierarchy in *nesting*, not in leaf-name
punctuation. The one established underscore convention is Lea Verou's `--_x`
*prefix* meaning "pseudo-private, do not override" — which **collides** with using
`_` as a separator. The closest peer, **Pico CSS** (also classless), uses one
`--pico-*` prefix + plain kebab-case + property-like names, specifically so users
need not learn a convention.

- Material: https://m3.material.io/foundations/design-tokens/overview
- Verou (`--_` private): https://lea.verou.me/blog/2021/10/custom-properties-with-defaults/
- Pico variables: https://picocss.com/docs/css-variables
- Naming order (category-first): https://www.smashingmagazine.com/2024/05/naming-best-practices/
- EightShapes taxonomy: https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676

**RECOMMENDATION → Option B: plain hyphens, category/element-first.** Keep public
source tokens (`--brand-hue`, `--base-size`) and finals (`--color-header`,
`--font-size-base`) as hyphen kebab-case. Mark the tier-2 computed intermediates
**private with a leading `--_`** (`--_color-hover`, `--_fn-color`) per Verou.
Rewrite `design_system.md` to drop the underscore-tier scheme. ACCEPTED.

- **[REJECTED] Option C — underscores as source/unit separator.** Anti-pattern:
  no tooling understands it (Style Dictionary, DTCG), and it collides with BEM
  `__` and Verou's `--_` private prefix. Lowest interoperability.
- **[REJECTED] Option A — mandatory Material-style tier prefixes
  (`--brand-*/--fn-*/--{property}-*` on everything).** Standards-clean but
  enterprise ceremony; verbose and disproportionate for a small classless reset.
  Revisit only if the token set grows large or is consumed by external token
  tooling.

---

## DR-2 — `functions.css` on the universal selector (§1.2)

**Question:** every element re-derives `--fn-color`, `--color-hover`, `--fn-border`
via `* {}`. Keep on `*`, split, or move all to `:root`?

**Evidence:** Declaring on `*` does **not** add inheritance (custom properties
inherit from `:root` already); it changes *where the value is re-derived*, which
is the whole point — a locally-set `--color` on a button must yield a local
`--color-hover` on that button. Critically, `oklch()`/`color-mix()` inside an
**unreferenced** custom property stay **lazy**: the spec leaves custom-property
values "almost entirely unevaluated" except for `var()` substitution, so the
heavy color math runs only when the value is consumed by a real property. Thus
`* { --x: expensive() }` is cheap until `--x` is read. The real footgun is the
*opposite*: computing a derived value on `:root` **freezes** it and ignores
deeper overrides. `@property` registration would make it **worse** here (forces
eager per-element evaluation, and `inherits:false` is wrong for values you want
to inherit).

- CSS Variables L1 (values unevaluated except var()): https://www.w3.org/TR/css-variables-1/
- `*` vs `:root` re-derivation gotcha: https://www.smashingmagazine.com/2019/07/css-custom-properties-cascade/
- Mutation cost (76ms high vs 1.9ms leaf): https://lisilinhart.info/posts/css-variables-performance
- @property perf (`inherits:false` ~848% faster on change): https://web.dev/blog/at-property-performance

**RECOMMENDATION → Option B: split.** Keep genuinely context-dependent
intermediates (`--color-hover`, `--fn-color`, `--fn-border`) on `*` — they need
per-element re-derivation and stay cheap while unreferenced. Move any
pure-global derivation (inputs only ever set at `:root`) to `:root`. Do **not**
`@property`-register these inherited intermediates. If any are ever animated via
JS, mutate them on the narrowest element, never on `:root`. ACCEPTED.

- **[REJECTED] Option C — all to `:root`.** The actual footgun: freezes derived
  values, so a button's local `--color` would not produce a local `--color-hover`.
  Breaks the parts-based color system.
- **[REJECTED] Option A — all on `*`.** Correct but pays per-element substitution
  bookkeeping for intermediates that never vary below `:root`. Wasteful at large
  DOM sizes; measure with DevTools Selector Stats if the tree exceeds ~10k nodes.

---

## DR-3 — Type scale ratio (§2.1)

**Question:** README brands golden-ratio (φ ≈ 1.618); v2 uses 1.125 (minor
second) via `pow(scale, 7 - level)`. Which ratio?

**Evidence:** φ as a single ratio over seven heading exponents is a documented
anti-pattern: `pow(1.618, 6)` → H1 ≈ 178px with jarring mid-level jumps. Kevin
Powell, Refactoring UI, and even Tim Brown (who originated the φ-type branding)
warn against φ as a universal multi-level ratio. Current 1.125 errs flat: H1
only ≈ 32px, weaker than what shipping systems use. The convergent band for
body+heading hierarchy is **1.2–1.333** (minor third to perfect fourth). Material
3, Tailwind, and Refactoring UI all ship hand-tuned scales with effective
step ratios in ~1.1–1.33, none at φ. "Most aesthetic" is partly subjective; no
ratio is measurably most beautiful — fit depends on content density.

At **1.25**: H1 ≈ 61px, H2 ≈ 49px, H3 ≈ 39px, H4 ≈ 31px, H5 ≈ 25px, H6 ≈ 20px —
clean, usable hierarchy. Keep the `pow()` engine; only the constant is wrong.

- Tim Brown, More Meaningful Typography: https://alistapart.com/article/more-meaningful-typography/
- Powell (φ "looks like crap" full-screen on mobile; smaller ratio on mobile): https://www.kevinpowell.co/article/typographic-scale/
- Refactoring UI rejects pure modular/φ scales: https://iamaatoh.com/essays/refactoring-ui.html
- Material 3 type scale: https://m3.material.io/styles/typography/applying-type
- Fluid type (Utopia, ~1.2 narrow → 1.25 wide): https://utopia.fyi/type/calculator/

**RECOMMENDATION → set `--font-scale: 1.25` and drop the φ claim from README.**
Keeps the one-line `pow()`, lands in the evidence-backed band, fixes the weak
hierarchy. If the φ *branding* is commercially important, take Option C instead
(below) — the only honest way to keep a literal golden-ratio claim.

- **[REJECTED] Option A — φ as the live `pow()` ratio.** Oversized H1 (~178px),
  unusable intermediate steps. The documented anti-pattern.
- **[REJECTED-ish] Option B — keep 1.125.** Safe but flat; weaker heading
  contrast than Material/Tailwind; contradicts the README's φ branding. Defensible
  only for a dense-UI posture.
- **[DEFERRED] Option C — hand-authored φ-derived discrete ladder with a capped
  H1.** Abandons the single-ratio `pow()` for a short hand-tuned ladder; mirrors
  how real systems actually ship. The only path that keeps a truthful φ claim.
  More work. Hold unless φ branding is a requirement.
- **[FUTURE] Fluid `clamp()` steps (Utopia):** ~1.2 at narrow → ~1.25 at wide.
  The current best practice over any fixed ratio. Out of scope for a minimal
  reset now; note for a later pass.

ACCEPTED: `--font-scale: 1.25` (major third).
