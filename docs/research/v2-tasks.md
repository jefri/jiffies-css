# Jiffies CSS v2 — Task List

Goal: **full parity rewrite.** v2 should reach what the README and demo promise.
Ordered in four buckets, deliberately: **Philosophy → Feature Docs → Bugs →
Components.** Philosophy first because every component ported below will encode
whatever conventions we set here; settle them late and the work is re-done.

Decisions that are yours to make are marked **[DECIDE]** with options. Rejected
options stay on the page once chosen, for the next reader.

---

## 1. Code Philosophy

The governing conventions. Write these down as `docs/philosophy.md` so every
ported component obeys one rulebook. Three of these are open decisions.

### 1.1 [RESEARCHED → DR-1] Variable naming convention

See `v2-decisions.md` DR-1. **Recommendation: Option B — plain hyphens,
category/element-first; mark tier-2 intermediates private with `--_` prefix
(Verou).** No system encodes tier via mid-name underscore; it collides with BEM
`__` and Verou's `--_`. Pico (the closest peer) uses plain `--pico-*` kebab-case.
Rejected: underscore-tier (anti-pattern), mandatory Material-style prefixes
(enterprise ceremony). *Awaiting confirmation.*

### 1.2 [RESEARCHED → DR-2] `functions.css` lives on `*`

See `v2-decisions.md` DR-2. **Recommendation: Option B — split.** Keep
context-dependent intermediates (`--color-hover`, `--fn-color`, `--fn-border`) on
`*` — they stay lazy until consumed, so they are cheap. Move pure-global
derivations to `:root`. Research correction: all-to-`:root` is the *footgun* (it
freezes derived values and ignores a button's local `--color`); `@property`
registration would make these *worse*. Rejected: all-on-`*` (wasteful),
all-to-`:root` (breaks color system). *Awaiting confirmation.*

### 1.3 Document the three-tier model (no decision, just write it)

`[brand/base tokens :root]` → `[--fn-* intermediates *]` → `[--final per element]`.
This is real and consistent in the code. Capture it so component authors know
where a new variable goes.

### 1.4 Document the classless contract (no decision, just write it)

Component = DOM relationship + ARIA role. Classes only at the edges. Write the
list of sanctioned edge-classes so it does not sprawl.

### 1.5 Fix the `fns` layer declaration

`@layer reset, layout, content, component, utility, user, theme;` omits `fns`,
but `functions.css` is imported `layer(fns)`. Add `fns` to the statement in the
intended position (likely first, before `reset`).

### 1.6 Decide the empty `layout` layer

Layer is declared, import commented out; `content/containers.css` carries page
layout today. Either move container/page-end layout into the `layout` layer, or
drop the layer from the spine. `[reserved slot with nothing in it]`

---

## 2. Feature Docs

Reconcile README + `design_system.md` with reality. You chose **discuss each** —
so each drift is a decision, not an automatic doc-rewrite.

### 2.1 [RESEARCHED → DR-3] Type scale: φ ladder vs 1.125 modular

See `v2-decisions.md` DR-3. **Recommendation: set `--font-scale: 1.25` (major
third) and drop the φ claim from README.** Research finding: φ as a live `pow()`
ratio is the documented anti-pattern (H1 ≈ 178px, jarring jumps); 1.125 is too
flat (H1 ≈ 32px). The evidence band is 1.2–1.333. At 1.25, H1 ≈ 61px — clean.
Keep the `pow()` engine. If φ *branding* is required, take the deferred Option C
(hand-tuned φ ladder with capped H1) — the only honest path to a literal golden
claim. Future: fluid `clamp()` (Utopia). *Awaiting your call on φ branding.*

### 2.2 [DECIDE] Responsive fonts: ladder vs single bump

README table promises 12/14/16/18/20/24 per breakpoint. Code bumps font size
once (1024 → 18px); breakpoints mostly clamp viewport width.

- **Option one — single-bump wins.** Rewrite the README table to match. Optimizes
  for fewer reflow surprises. Gives up fine density control on small screens.
- **Option two — full ladder.** Implement per-breakpoint `--base-font-size`.
  Optimizes for tuned reading size at every width. Gives up simplicity; six
  values to maintain.
- **Option three — fluid `clamp()`.** Neither table — one `clamp()` that scales
  continuously with viewport. Optimizes for smoothness. Gives up the named-step
  predictability both docs assume.

### 2.3 `--fn-color` has no callers

The parts-based `--fn-color` (luminance/chroma/hue with fallbacks) is defined in
`functions.css` but no v2 component consumes it. Either wire it into the color
system or mark it explicitly as scaffolding for the components below. Decide when
porting buttons/forms (they are its intended consumers).

### 2.4 Rewrite `design_system.md` once 1.1–2.2 are settled

It currently mixes aspiration and stale spec (two breakpoint tables, one
commented out; naming that the code ignores). It is the most misleading file in
the repo. Hold the rewrite until the decisions above land.

---

## 3. Bugs

Concrete defects in shipped v2 code.

### 3.1 Undefined-variable cluster in `content/typography-block.css`

The shared block rule sets `--color-text-base` then reads `--text-color-base`;
sets `--font-family-body` then reads `--font-family-body-base`; reads
`--font-weight-base` and `--base-font-weight` which are never defined. Result:
`color`, `font-family`, `font-weight` on every block element resolve to
nothing/inherit. Transposed names. High-confidence real bug. `[confirm, then fix]`

### 3.2 `--spacing-typography-*` referenced, never defined

`hgroup` reads `--spacing-typography-vertical`; nav reads
`--spacing-typography-horizontal`. Grep shows no definition in v2. Either define
them in the sizing theme or repoint to `--spacing-block-*`.

### 3.3 `navigation.css` references many undefined tokens

`--color`, `--color-accent`, `--color-primary-hover`, `--color-text`,
`--border-width`, `--font-size-larger`, `--color-text-base`. These look ported
from v1 without their definitions. Audit nav against the v2 theme and either
define or repoint each.

### 3.4 `theme/typography.css` family chain dead-ends in `"unknown"`

`--body-font-family: var(--brand-body-font-family, "unknown"), var(--base-body-font-family)`.
When no brand font is set, the chain literally contains the string `"unknown"`
before the real fallback. Harmless (browser skips an unknown family) but
sloppy; confirm intent or drop the `"unknown"` sentinel.

---

## 4. Components (parity port)

Each is promised by README + demoed in `index.html`, but the v2 import is
commented out. Suggested order = dependency / demo-prominence. Each should follow
the philosophy from §1 and consume the parts-based color system.

| # | Component | Selector contract | Notes |
|---|-----------|-------------------|-------|
| 4.1 | Buttons | `button, a[role=button], input[type=button/submit/reset]` + `.secondary .contrast .outline` | First consumer of `--fn-color`; demo has 4 variants. No v2 file yet. |
| 4.2 | Forms | `label input select textarea fieldset legend` + `[aria-invalid] [disabled] [readonly]` | Largest. Demo shows grid via `--grid-column-count` on fieldset. |
| 4.3 | Form switch | `input[type=checkbox/radio][role=switch]` | Pure-CSS toggle. |
| 4.4 | Tables | `table thead tbody tfoot tr th td` | README wants opinionated tables, even/odd, Trebuchet family. |
| 4.5 | Accordion | `details > summary` | Pure-CSS; chevron icon already in `theme/icons.css`. |
| 4.6 | Tabs | `section[role=tablist] [role=tab] [role=tabpanel]` | Needs `accessibility.js` (already exists) for `aria-selected`. |
| 4.7 | Modal | `dialog` | Reset has base `dialog`; needs component styling. |
| 4.8 | Property sheet | `dl dt dd` | README "Property Sheet." |
| 4.9 | Progress | `progress` | Smallest. |
| 4.10 | Form group | `fieldset[role=group]` | Joined-control row. |

Also pending and demoed but not in README components: **color swatches / rainbow**
(commented block in `index.html`) — depends on `--color-hue`/`--chroma` plumbing,
i.e. the same parts-based system §2.3 must finish.

---

## Suggested first three moves

1. **§1.1 + §1.2** — make the two philosophy decisions. Everything downstream
   inherits them.
2. **§3.1** — fix the typography-block variable transposition. It silently breaks
   text styling on every page right now.
3. **§4.1 Buttons** — port the first component end-to-end as the *reference
   implementation* that proves the philosophy, then the rest follow its pattern.
