# Public: CSS Features 2024–2026 Relevant to Jiffies CSS

## Findings

Jiffies CSS targets Chrome 119 / Safari 16.4 / Firefox 128 (mid-2024 baseline) and already
uses oklch(), relative color syntax, @property, color-mix(), :has(), :is()/:where(), @layer,
and pow(). The two years since that baseline produced a dense crop of features, many now
Baseline Widely Available and directly applicable to Jiffies components.

---

### Baseline 2024 — safe to use today

**`@starting-style`** (Baseline Aug 2024; Chrome 120+, Safari 18+, Firefox 129+)
Defines the "before" state for an element's first style update, enabling CSS-only entry and
exit transitions on elements that transition from `display: none`, are added to the DOM, or
open as popovers or dialogs. Previously this required a JavaScript frame-delay to trigger
the transition after paint. Direct applications:
- Accordion (`<details>`) open/close fade-in without JS
- `<dialog>` entry/exit animation (currently Jiffies has no entry animation)
- Popover entry animation
([MDN @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style))

**`light-dark()`** (Baseline 2024; Chrome 119+, Firefox 120+, Safari 17.5+)
Accepts two color arguments and picks between them based on the active `color-scheme`. Simpler
than a `prefers-color-scheme` media query for individual token assignments. Could simplify the
current dark-mode role-reassignment blocks in `theme/colors.css` for tokens whose only
difference is light vs. dark tone selection.
([Chrome Wrapped 2024](https://chrome.dev/css-wrapped-2024/))

**`scrollbar-color` + `scrollbar-width`** (Baseline 2024; Chrome 121+, Firefox, Safari partial)
Standardized scrollbar styling, replacing non-standard `::-webkit-scrollbar` pseudo-elements.
Relevant to `.scroll-x` / `.scroll-y` overflow containers and any custom scrollbar theming.

**CSS Nesting** (Baseline 2023/2024)
Nesting selectors inside one another without a preprocessor. Jiffies already uses `@layer`;
nesting would reduce repetition in component files where the same base selector is qualified
many times (e.g., `button`, `button.secondary`, `button.outline`).

**`text-wrap: balance`** (cross-browser, Chrome 114+, Safari 17.5+, Firefox 121+)
Distributes text evenly across lines for headings without manual `<br>` or JS. Apply to
`h1–h6` in `content/typography-block.css` for better heading breaks at no markup cost.

**`text-wrap: pretty`** (Chrome/Safari only; progressive enhancement)
Avoids orphaned last words in paragraphs. Safe progressive enhancement for `p`.

**`linear()` easing** (cross-browser)
Arbitrary multi-stop easing curves, enabling elastic / spring animations in `theme/animation.css`
without JS physics libraries.

**Container queries** (Baseline Widely Available 2023/2024)
`@container` rules scope responsive behavior to a named container instead of the viewport.
Useful for cards and panels that must reflow at their own width regardless of viewport (e.g.,
a card in a sidebar vs. the main rail).

**`::backdrop` inheriting from originating element** (Chrome 122+)
`::backdrop` on `<dialog>` now inherits custom properties from the dialog element. Jiffies can
use `--color-*` role tokens on the backdrop overlay without separate `:root` declarations.

---

### Approaching Baseline — most major browsers, use with progressive enhancement

**`<details name>` exclusive accordion** (Chrome 120+, Firefox 128+, Safari 17.4+)
A `name` attribute on `<details>` groups them into a mutually-exclusive set — opening one
closes the others, natively. Jiffies's accordion component currently handles this with
`accessibility.js`. This removes that JavaScript dependency entirely.
([Chrome Wrapped 2024](https://chrome.dev/css-wrapped-2024/))

**`::details-content`** (Chrome 131+, other browsers in progress)
A pseudo-element targeting the collapsible region of `<details>` (everything after `<summary>`).
Enables `overflow: hidden` + height transitions on the content box directly, which was the
main blocker for smooth accordion animations. Pairs with `@starting-style` for a full CSS-only
open/close animation.

**`interpolate-size: allow-keywords` + `calc-size()`** (Chrome 129+, others in progress)
Enables smooth CSS transitions to and from intrinsic sizing keywords (`auto`, `min-content`,
`max-content`). The canonical use case is an accordion: `height: 0` → `height: auto` with
`transition: height`. Previously this required a JS measurement pass. Combine with
`::details-content` for a full CSS accordion expansion with no JS.
([Frontend Masters 2025](https://frontendmasters.com/blog/what-you-need-to-know-about-modern-css-2025-edition/))

**Anchor Positioning** (`anchor-name`, `position-anchor`, `position-area`)
(Chrome 125+, Safari 18+; Interop 2025 focus)
Declaratively positions an element relative to an anchor without JS. Eliminates third-party
tooltip/dropdown libraries. Relevant to: navigation dropdown menus, form validation tooltips,
any overlay that must track a trigger element.
([Interop 2025](https://web.dev/blog/interop-2025))

**`field-sizing: content`** (Chrome 120+, Safari in progress)
Auto-sizes `<textarea>` and `<input>` to their content. Jiffies's forms component currently
ships fixed-height textareas; `field-sizing: content` makes them grow with input, replacing
the common JS auto-resize pattern.
([Chrome Wrapped 2024](https://chrome.dev/css-wrapped-2024/))

**`@scope`** (Chrome 118+, Safari 17.4+, Firefox 128+; Interop 2025)
Defines a scoped sub-tree for CSS rules, limiting their reach without increasing specificity.
Useful for component-level rules that must not leak (e.g., scoping card inner-border rules to
`article > *` without affecting `section > *` globally).
([Interop 2025](https://web.dev/blog/interop-2025))

**`popover` attribute** (Baseline 2024)
Native popover behavior: top-layer promotion, light-dismiss, focus management, and
accessibility — no JS. `popover=auto` and `popover=hint` (Chrome 2025). Relevant to tooltips,
dropdown menus, and any overlay Jiffies currently wires with JS.

**View Transitions** (same-document; Chrome 111+, Safari 18.2+, Firefox 130+)
`view-transition-name` on elements enables animated DOM state changes. Useful for tab panels
(fade between `[role=tabpanel]`), dialog open/close, and page-section reveals.
Cross-document view transitions (Chrome 126+, Safari landing) enable page-load transitions
from a `<link>` stylesheet alone.

**`backdrop-filter`** (Baseline Sept 2024; all major browsers)
Blur/saturate/contrast effects on the region behind an element. Currently missing from the
Jiffies dialog `::backdrop`; enables frosted-glass overlays with a one-liner.

---

### 2025 emerging — Chrome-leading, watch for baseline

**`@function`** (Chrome 135+)
Define reusable CSS functions:
```css
@function --clamp-scale(--min, --max) {
  result: clamp(var(--min), 4vw, var(--max));
}
```
Would let `functions.css` replace some `calc()` duplication with named functions. Not yet
cross-browser; design for progressive use.

**`if()` inline conditional** (Chrome TBD)
```css
width: if(media(width > 600px): 50%; else: 100%);
```
Inline media/supports/style branching within a property value. Could replace some
`@media` / `@container` query blocks for single-property switches.

**`sibling-index()` / `sibling-count()`** (Chrome 135+)
Integer functions giving an element's position among siblings. Enables staggered animation
delays in CSS with no class or data attributes — useful for tab indicators, list reveals,
color swatch staggering.

**Scroll-driven animations** (`animation-timeline: scroll()` / `view()`)
(Chrome 115+; Interop 2025 / Firefox and Safari shipping)
Link animation progress to scroll position. Could animate the navigation highlight or progress
bar fill on scroll without a JS scroll listener.

**Scroll-state container queries** (`container-type: scroll-state`, Chrome 133+)
Query whether an element is `stuck` (sticky positioning active), `snapped`, or `scrollable`.
Eliminates the IntersectionObserver pattern for styling a sticky header differently when stuck.

**`text-box-trim` / `text-box-edge`** (Chrome 133+, Safari behind flag)
Trim cap-height and baseline space from text boxes, enabling precise vertical rhythm without
magic number paddings. Relevant to button label vertical centering and heading spacing.

**Customizable `<select>`** (`appearance: base-select`, Chrome 135+)
Full CSS control of `<select>`, its dropdown, and individual options. Jiffies currently cannot
style the native select picker; this removes the need for a JS custom-select widget entirely.

**`corner-shape`** (Chrome TBD)
Shapes beyond border-radius: `squircle`, `bevel`, `notch`, `scoop`. Could serve the
neumorphism and bento themes as a token-driven value.

---

### Feature-to-Component mapping for Jiffies

| Component | Feature | Impact |
|---|---|---|
| Accordion (`<details>`) | `<details name>`, `::details-content`, `interpolate-size`, `@starting-style` | Full CSS accordion with exclusive behavior and smooth animation — no JS |
| Modal (`<dialog>`) | `@starting-style`, `popover`, `closedby`, `::backdrop` inheritance, `backdrop-filter` | Entry/exit animation, light-dismiss, frosted glass — no JS |
| Forms | `field-sizing`, `appearance: base-select` | Auto-resize textarea, styled select — no JS |
| Navigation / Dropdowns | Anchor Positioning, `popover` | Declarative dropdown positioning — no JS |
| Tabs | View Transitions, `sibling-index()` | Animated panel switching — no JS |
| Dark mode | `light-dark()` | Simplify two-value token declarations |
| Typography | `text-wrap: balance/pretty`, `text-box-trim` | Better headings and vertical rhythm |
| Scrollable containers | `scrollbar-color`/`scrollbar-width`, Scroll-state queries | Styled scrollbars, stuck-header detection |
| Animations / Motion | `@starting-style`, `linear()`, Scroll-driven | Richer motion vocabulary |
| Component scoping | `@scope`, CSS Nesting | Narrower cascade without specificity increase |
| Layout utilities | Container queries, Subgrid | Component-scoped responsive design |

---

### Browser support summary (mid-2026 perspective)

| Feature | Chrome | Safari | Firefox | Baseline? |
|---|---|---|---|---|
| `@starting-style` | 120 | 18 | 129 | 2024 |
| `light-dark()` | 119 | 17.5 | 120 | 2024 |
| `text-wrap: balance` | 114 | 17.5 | 121 | 2024 |
| `scrollbar-color/width` | 121 | partial | yes | 2024 |
| `<details name>` | 120 | 17.4 | 128 | 2024 |
| `field-sizing` | 120 | in progress | — | near |
| `interpolate-size` | 129 | in progress | — | near |
| `::details-content` | 131 | in progress | — | near |
| Anchor Positioning | 125 | 18 | Interop 2025 | near |
| `@scope` | 118 | 17.4 | 128 | near |
| `popover` attribute | 114 | 17 | 125 | 2024 |
| View Transitions (same-doc) | 111 | 18.2 | 130 | near |
| `backdrop-filter` | all | all | all | 2024 |
| Container queries | all | all | all | widely 2023 |
| CSS Nesting | all | all | all | widely 2023 |
| Scroll-driven animations | 115 | landing | Interop 2025 | near |
| `sibling-index()` | 135 | — | — | emerging |
| `@function` | 135 | — | — | emerging |
| `if()` | TBD | — | — | emerging |
| `appearance: base-select` | 135 | — | — | emerging |

---

## Sources

- [CSS Wrapped 2024](https://chrome.dev/css-wrapped-2024/) — official Chrome summary of 2024 CSS additions
- [CSS Wrapped 2025](https://chrome.dev/css-wrapped-2025/) — official Chrome summary of 2025 CSS additions
- [What You Need to Know about Modern CSS (2025 Edition) — Frontend Masters](https://frontendmasters.com/blog/what-you-need-to-know-about-modern-css-2025-edition/) — curated feature guide with browser support notes
- [Interop 2025 — web.dev](https://web.dev/blog/interop-2025) — cross-browser Baseline progress for 2025
- [MDN @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style) — authoritative spec and browser support table
- [CSS in 2026 — LogRocket](https://blog.logrocket.com/css-in-2026/) — 2026 feature overview with semantic framework notes
- [CSS Snapshot 2025 — W3C](https://www.w3.org/TR/css-2025/) — normative W3C snapshot
- [Interop 2026 — CSS-Tricks](https://css-tricks.com/interop-2026/) — 2026 cross-browser focus areas
