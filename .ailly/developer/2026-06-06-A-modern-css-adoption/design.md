# Modern CSS Adoption — Evergreen Baseline June 2026

> DRAFT 2026-06-06

## Problem Statement

Jiffies CSS's stated baseline ("Chrome 119 / Safari 16.4 / Firefox 128") is frozen at a
mid-2024 snapshot. Seven features that were in-progress or vendor-prefixed at that snapshot
have since reached full cross-browser support in all three evergreen engines. The framework
uses none of them, leaving the "modern CSS" claim stale and leaving concrete wins on the
table: exit animations regressed because `@keyframes` on `[open]` fires only on entry and the
dismiss path has no CSS coverage, the accordion content area cannot be targeted by a
pseudo-element, headings wrap unevenly, the dialog backdrop is an opaque scrim rather than a
frosted surface, and the dark-mode token block contains an unnecessary `@media` override block
that duplicates every dark-mode token.

Adopting these features brings the README baseline claim in line with the actual 2026 browser
landscape while improving four components and simplifying one internal module. No new
components are introduced, no architectural changes are made, and no JavaScript is touched.

## Prior Art

The existing components establish the patterns this design extends:

- `modal.css` already uses `@keyframes modal-open` and a `prefers-reduced-motion` guard that
  collapses the animation.
- `accordion.css` already uses CSS nesting and the `--_accordion-*` local custom property
  block (the component's private finals). `::details-content` slots into the same nesting
  structure, replacing `summary ~ *` without touching any other rule.
- `colors.css` already uses `color-scheme: light` and a `@media (prefers-color-scheme: dark)`
  block. `light-dark()` requires only that the `:root` declaration become
  `color-scheme: light dark`; the palette engine beneath is unchanged.
- `typography-block.css` sets `h1–h6` in a shared `:is()` rule with no `text-wrap` property
  today.
- `README.md` lists minimum browser versions as a pinned triplet; the modern-features table
  uses a bullet list.

Feature baseline confirmation (June 2026):

| Feature | Chrome | Safari | Firefox | Status |
| --- | --- | --- | --- | --- |
| `@starting-style` | 120 | 18 | 129 | Baseline 2024 |
| `light-dark()` | 119 | 17.5 | 120 | Baseline 2024 |
| `text-wrap: balance` | 114 | 17.5 | 121 | Baseline 2024 |
| `backdrop-filter` | all | all | all | Baseline 2024 |
| `::details-content` | 131 | 18.2 | 133 | Baseline Sept 2025 |

## Metrics

- `README.md` states "all evergreen browsers, June 2026 baseline" and the feature table lists
  each adopted feature.
- Screenshot comparison (existing Playwright suite) — modal: dialog animates in on
  `showModal()` AND animates out on `close()`, with no JavaScript.
- Screenshot comparison (existing Playwright suite) — accordion: content area fades in on
  open; the `summary ~ *` selector is absent from the compiled output.
- Screenshot comparison (existing Playwright suite) — typography: h1–h6 headings balance
  across lines without orphaned words at narrow widths.
- Screenshot comparison (existing Playwright suite) — modal backdrop: a blur is visible behind
  an open dialog in all three engines.
- `colors.css`: dark mode token values are numerically identical before and after the rewrite;
  no computed color changes in `test/computed/`.
- Existing screenshot suite passes. Existing `test/computed/` suite passes.

## Specification

### 1. `v2/component/modal.css` — entry + exit animation via `@starting-style`

Remove the `@keyframes modal-open` and `modal-backdrop-open` blocks and the `animation:`
declarations on `dialog[open]` and `dialog[open]::backdrop`.

Replace with a transition approach:

- `dialog` (always): `opacity: 0; transform: translateY(0.5rem) scale(0.98)` — the closed
  state. Add `transition` covering `opacity`, `transform`, `display`, and `overlay`, with
  `allow-discrete` on the discrete pair so the dialog stays in the rendering pipeline long
  enough for the exit transition to complete.
- `dialog[open]`: `opacity: 1; transform: none` — the open state.
- `@starting-style { dialog[open] { opacity: 0; transform: translateY(0.5rem) scale(0.98) } }`
  — gives the entry transition a "before" state so it fires on first paint.

The `prefers-reduced-motion` guard collapses the transition durations to `0s` (same guard,
different property: was `animation: none`, becomes `transition-duration: 0s`).

For `::backdrop`: `dialog::backdrop` (without `[open]`) carries `backdrop-filter: blur(0)` —
the closed state from which the open state transitions. `dialog[open]::backdrop` adds
`backdrop-filter: blur(4px)`. Add a matching `@starting-style` for the entry. The existing
`--_modal-backdrop-color` value is unchanged.

### 2. `v2/component/accordion.css` — `::details-content` migration

Replace the `details > summary ~ *` selector with `details::details-content`. The `padding`
and `margin: 0` rules move verbatim. No other rules change.

Add to `details::details-content`:

```css
opacity: 1;
transition: opacity var(--transition);
```

Add inside `details[open]`:

```css
@starting-style {
  &::details-content { opacity: 0; }
}
```

This gives a CSS-only fade-in on open. The closed state of `details::details-content` does
not need an explicit `opacity: 0` rule — when `<details>` loses `[open]`, the pseudo-element
returns to `display: none` and the opacity resets. No exit transition is expected: height and
opacity both collapse instantly on close; only the entry fades in.

Height animation is out of scope: `interpolate-size` remains Chrome-only as of June 2026 and
is tracked in TASKS.md.

### 3. `v2/content/typography-block.css` — `text-wrap: balance` on headings

Add `text-wrap: balance` to the `h1, h2, h3, h4, h5, h6` (or `:is(h1,h2,h3,h4,h5,h6)`)
rule. No selector change, no other property change.

### 4. `v2/theme/colors.css` — `light-dark()` compression

Change `:root { color-scheme: light; }` to `color-scheme: light dark`.

For each token that has exactly two declarations — one value in the light `:root` block and
one in the `@media (prefers-color-scheme: dark) :root` override — collapse both into a single
`light-dark(lightValue, darkValue)` call in the `:root` block.

Tokens that cannot be expressed as
`light-dark(var(--_palette-light-tone), var(--_palette-dark-tone))` — for example
`color-scheme` itself or any `--_`-prefixed derivation intermediate — stay as explicit
media-query overrides. The `@media (prefers-color-scheme: dark)` block is removed if no
residual cases remain after the sweep.

### 5. `README.md` and `DESIGN.md` — baseline and feature table

Update the minimum-browser line to:

> All evergreen browsers — Chrome, Safari, Firefox — June 2026 baseline.

Update the modern-features bullet list to add:

- `@starting-style` — entry and exit animations on modal and accordion without JavaScript
- `light-dark()` — single-declaration dark/light token pairs
- `::details-content` — direct styling of the accordion's collapsible region
- `text-wrap: balance` — even heading line distribution
- `backdrop-filter` — frosted-glass dialog backdrop
- `<details name>` — user pattern: adding `name="group"` to sibling `<details>` elements
  gives exclusive-accordion behaviour natively; no CSS change required

Append after the existing Accordion component description in `DESIGN.md`: document the
`<details name>` exclusive-group pattern and note that height animation (`interpolate-size`)
is deferred to wave 2.

### 6. `docs/developer/TASKS.md` — wave 2 entry

Add after the last active-topic entry in the Active topics section:

> **modern-css-wave-2** — Adopt `interpolate-size` + height animation on `::details-content`
> (accordion slide) and `field-sizing: content` on `textarea` once both reach cross-browser
> baseline. Gate on Firefox shipping both.

## Alternatives

**Keep the pinned version targets.** Avoids any risk of a broken screenshot or edge-case
regression. Leaves the README claim stale and leaves the modal without an exit animation
indefinitely. Each additional month the baseline stays frozen, the gap between the README
claim and actual browser capabilities widens and each feature of a newer baseline must be
re-evaluated as a possible adoption. Low value.

**Raise the baseline to Chrome 125 / Safari 18 / Firefox 147 to claim Anchor Positioning.**
Anchor positioning is all-evergreen as of January 2026, but no existing Jiffies component
uses it. Bumping the baseline for a feature nothing currently uses is a claim without
evidence. Anchor positioning belongs in a separate design scoped to a tooltip or dropdown
component.

**Use `@starting-style` only on the modal, skip the accordion.**
`::details-content` is independently useful as a cleaner selector even without height
animation, and the fade-in is a low-risk progressive enhancement. Skipping it saves nothing.

**Adopt `field-sizing: content` on `textarea` now.**
`field-sizing` lacks Firefox support as of June 2026. It does not meet the "all evergreen"
criterion and must wait for wave 2.

## Summary

Four CSS files change and two documentation files update. No JavaScript is added or removed.

Deferred to wave 2 (TASKS.md):

- Accordion height animation (`interpolate-size`, Chrome-only)
- Auto-grow textarea (`field-sizing`, Firefox missing)
- Anchor-positioned tooltip / dropdown component (new feature scope, separate design)
