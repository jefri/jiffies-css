# Feature Test — Modern CSS Adoption: Evergreen Baseline June 2026

*Draft 2026-06-06*

## User Story

A developer adopting Jiffies CSS opens the demo page in Chrome, Safari, or Firefox
(June 2026 evergreen baseline). They observe five behaviours without writing any
JavaScript:

1. They click "Open modal" and the dialog fades and lifts into view. They press
   Escape and the dialog fades back out before disappearing — the exit animation
   runs without JavaScript because `@starting-style` and `allow-discrete` keep the
   dialog in the rendering pipeline long enough for the CSS transition to complete.
   The backdrop is a frosted-glass blur, not a flat scrim.

2. They click an accordion summary. The panel content fades in. The CSS targets the
   `::details-content` pseudo-element directly instead of the legacy `summary ~ *`
   sibling combinator.

3. They glance at the page headings at a narrow viewport. The lines are evenly
   distributed — no orphaned single words — because `text-wrap: balance` is applied
   to `h1`–`h6`.

4. They open DevTools and switch to dark mode. The color tokens remap correctly.
   The `:root` declaration carries `color-scheme: light dark`, so every token pair
   is expressed as a single `light-dark(lightValue, darkValue)` call rather than a
   duplicated `@media (prefers-color-scheme: dark)` block.

5. They read the README. It states "All evergreen browsers — June 2026 baseline" and
   the modern-features list includes all five adopted features.

## Executable Feature Test

**File:** `test/computed/modern-css-2026.test.mjs`

The test uses the shared `withPage` / `css` helpers (Playwright + `node:test`).
It shares one browser session across five `it` blocks:

| Assertion | Red today? | Mechanism under test |
|---|---|---|
| `animation-name` on `dialog[open]` is `none` | Yes | `@starting-style` migration removes `@keyframes modal-open` |
| `transition-property` includes `"display"` | Yes | `allow-discrete` on the transition chain enables exit |
| `::backdrop` `backdropFilter` matches `blur(` | Yes | `backdrop-filter: blur(4px)` on `dialog[open]::backdrop` |
| `::details-content` `transitionDuration` is not `"0s"` | Yes | `transition: opacity var(--transition)` on the pseudo-element |
| `::details-content` `opacity` is `"1"` when open | Yes | `@starting-style` fade entry; pseudo-element resolves to 1 |
| `text-wrap-style` on `h1` is `"balance"` | No (already done) | Rule already present in `typography-block.css` |
| `:root` `color-scheme` matches `light.*dark` | Yes | `color-scheme: light dark` enables `light-dark()` |

Run with:

```
node --test test/computed/modern-css-2026.test.mjs
```

Or via the project suite:

```
npm test
```
