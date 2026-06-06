# Jiffies CSS — Philosophy

Jiffies CSS is a **Post-Modern CSS Full-Page Reset**, one global stylesheet that
normalizes and styles an entire page from a single place. It provides beautiful semantic
defaults, components built from element relationships, responsive layout, and
theming. Where a classic reset only _neutralizes_ the browser to a blank slate,
Jiffies keeps the platform's semantics and builds the finished page on top of
them, using the latest native CSS features. The _implementation_ is purely
semantic: write semantic HTML with consistent, appropriate hierarchy and get a
full-page app and its components in return. Set a few focused base variables to get
your full branding.

Customization happens in focused base variables that control large swaths of
the app. Resetting a single size variable adjusts the sizing basis for the
entire app, including layouts, fonts, and whitespace. But another variable
override can switch the entire page to compact or open whitespace. Colors work
the same way. A single `--brand-color` seeds the whole scheme: every role —
primary, secondary, tertiary, the neutrals, and their container/text pairs —
is derived from it through Material 3's generative color model, computed in
pure CSS. Or you can fine-tune a derived role or an Application final directly,
bypassing the derivation for that one outcome. The theming contract targets a
single brand color per page; multiple brands per page are out of scope.

## CSS Zen Garden and the Variable-First Theme Model

CSS Zen Garden (Dave Shea, 2003) made a seminal demonstration. One fixed HTML file
could show radically different visual designs by swapping only the external stylesheet.
The directive was explicit: no HTML modifications, but as much CSS styling as the designer could manage. Hundreds of
community submissions proved the point across the past two decades.
When structure is stable,
presentation is interchangeable.

Early critiques of Zen Garden were practical, not conceptual. Without CSS custom
properties, nesting, and other modern CSS conveniences, every theme required a full
stylesheet rewrite. Changing the primary color meant
grepping for every `#3366cc` in the file. A theme was a complete copy of the structural
rules, with values changed — brittle to maintain and expensive to author.

Modern CSS eliminates that friction. Custom properties separate the design decisions from
the structural rules. The structural rules read `var(--color-primary)` and `var(--border-radius-container)`;
a theme is only the overrides. Two stylesheets, not two complete copies:

```css
/* jiffies.css — structural rules referencing variables & defaults */
:root {
  --border-radius-container: 2px;
  --card-shadow: 1px 1px 0 2px var(--color-outline);
}
article {
  box-shadow: var(--card-shadow);
  border-radius: var(--border-radius-container);
}

/* ocean.css — variables only, no structural rules */
:root[data-theme="ocean"] {
  --border-radius-container: 0;
  --card-shadow: 0 0 0 1px var(--color-outline);
}
```

Classless CSS frameworks like Water.css, MVP.css, Simple.css, and Pico CSS all converged on
this architecture. Style semantic HTML elements via variables, let consumers
override the variables rather than the rules. Pico CSS exposes 130+ custom properties as
its theming API; Water.css ~20; all of them recognize that the public surface of a CSS
library is its custom property contract, not its selector machinery.

CSS Zen Garden is aspirational, not a constraint. It tells you whether the styling
surface is complete. Where a theme must reach for element selectors to express a visual
decision, that perhaps identifies a missing token. A likely gap between the structural rules
and the theming API. The four built-in themes (canvas, bento, paper, neumorphism)
express all visual decisons as variable overrides, with element
selector rules unnecessary via tokens like `--card-shadow`, `--card-border`, `--grid-gap`, and `--button-shadow-active`.

## Semantic HTML & Classless CSS

A component is identified primaryliy by its **DOM hierarchy** and its **ARIA roles**, rarely
by a class. `article > header` is a card header. `nav > ol` is a navigation
list. `[role=tab]` is a tab. The meaning lives in the element; the stylesheet
targets the element. This is the inverse of Tailwind (which puts meaning in
utility classes) and BEM (which puts meaning in `block__element--modifier`
classes). Tailwind, Bootstrap CSS, and BEM require every element to be annotated
by hand; in Jiffies CSS the HTML stays semantic and the styling is implicit.

Classes appear only at the **edges**, governed by a single **sanctioning
criterion**: a class is warranted only when an element cannot infer its intent
from its shape or its ARIA. If a `& >` relationship or a role already carries the
meaning, no class is added. The criterion is the gate that keeps the class
surface from sprawling — not a frozen enumeration. New edge-classes are added by
meeting the criterion and recording them, not by amending a closed list.

Two distinct sanctioned categories pass this gate:

- **Control edge-classes** carry a semantic variant of a control that its element
  and role do not express — `.secondary`, `.contrast`, `.outline` on buttons, for
  example.
- **Utilities** are class-based layout and density helpers that sit in their own
  `utility` layer, deliberately opt-in because the behaviour they request is not
  implied by any element — `.fluid`, `.compact`/`.loose`, `.round`,
  `figure.scroll-x`/`.scroll-y`, and the `.flex`/`.grid` family.

These are different in kind: a control edge-class refines a component, a utility
requests a behaviour. DESIGN.md › Components and › Patterns hold the
canonical census of which classes each component sanctions; this document owns
only the criterion.

## Variable Model: Intent → Derivation → Application

Every custom property lives in one of three tiers. The tiers are not just
_where_ a property is declared, they are a gradient of **meaning** that runs from
intent through appliction. A token starts as an author's intent and ends as a
rendered property; reading the gradient tells you where to reach to change a given
outcome and what else moves when you do.

**Intent** _on `:root`_ Answers _"how will this be used?"_ Brand and base
inputs like `--brand-color`, `--base-text-color`, `--base-size`, `--font-scale`
control wide swaths of the page's style. These properties are named in the words
of someone shaping a page. **This tier is the public API.** It is small, stable,
and deserves the most thought, because it is the contract an end user overrides.
The Intent set is a small, focused public surface, extended deliberately with
rationale rather than by accretion.

The blast radius of an Intent token is the set of Application finals that derive
from it through the Derivation tier. Overriding an Intent token is **coarse**
control: it moves everything downstream of it. Overriding an Application final
directly is **fine** control: it moves one property on one element and bypasses
the derivation.

**Derivation** _Pseudo-functions in `*`_ CSS functions connect intent to outcome:
values computed from the Intent tier that must re-derive _per element_.
Examples are `--_fn-color`, `--_color-hover`, `--_fn-border`. Declared on the
universal selector so a locally-set `--color` on a button yields a local
`--_color-hover` for the application properties. These properties are **lazy**.
The `oklch()` and `color-mix()` math runs only when a real property reads the
value, so an unread derivation costs its declaration but not its computation;
Marked _private with a leading `--_`_ so readers know these are part of the engine,
not a dial to override. When `@function` lands, this tier will be revised to take
advantage of native function support.

**Application** _per element_ Answers _"what does this change?"_ The property a
rule actually consumes: `--color-header`, `--font-size-base`,
`--margin-card-vertical`. Named from the inside, after the property and element
it sets. Declared in the element's own rule, kebab-case.

The **Derivation** tier holds the per-element re-derivation engine: the relations
that must recompute at every local override (a base color and its hover/active
states, the inverse-Oklab toe that maps M3 tone to OKLCH lightness). Placing them
here means tuning a public Intent dial cannot break them — they re-derive in terms
of the new input rather than going stale.

Contrast is **not** kept honest by tier placement, and this document does not
claim it is. The semantic role and `--color-on-*` pairs (`--color-primary` /
`--color-on-primary`) are role **defaults on `:root`** — Intent the system ships,
deliberately reachable for fine control, which a consumer may retune. The contrast
guarantee rests on two things, neither of which is "make the pair unoverridable":
M3's canonical tone-distance pairing (each role ships an `on-` foreground whose
HCT-tone gap clears the WCAG floor) **and** the CI contrast test
(`test/computed/contrast.test.mjs`), which resolves every role / `on-` pair to
sRGB and asserts the ratio across a spread of brand hues, so a pairing that drifts
below the floor fails CI rather than shipping. A consumer who overrides a role
therefore owns re-verification: re-run the test against their brand hue. The floor
is enforced where it can actually be checked, not asserted by hiding the dial.

## Selectors & Nesting

Jiffies CSS builds components out of patterns of DOM nodes. One component is one
(nested) selector tree, and the shape of that tree matches the subtree the
component styles. In the Jiffies stack this is literal: a DOM function calls
child functions to build a hierarchy, and the matching CSS nests `& >` blocks in
the same hierarchy. `article { & > header … & > main … & > footer … }` is the
stylesheet half of a `Card()` that emits a header, a main, and a footer. The
function and the stylesheet are two projections of one shape; reading either top
to bottom traces the same structure.

Selectors use the most modern CSS features supported by released Chrome, Safari,
and Firefox.

- **`& >`, the child combinator** — structural ownership: "a header that is a
  direct child of this card." It mirrors a parent calling a child in the DOM
  builder. Prefered over the bare descendant combinator whenever the
  relationship is structural, so a rule cannot leak into a nested instance of
  the same element.
- **`:is(…)`** — groups equivalent selectors and variants
  (`:is(header, footer) > nav`). It collapses repetition and takes the _highest_
  specificity among its arguments. Used to coordinate several equivalent mid-level
  semantic variants.
- **`:where(…)`** — groups _without_ adding specificity. Used for resets and
  defaults that later rules and user selectors override. This is how the
  Intent tier stays the real control surface: a default wrapped in `:where()`
  allows a one-line override instead of causing a specificity conflict.
- **`:has(…)`** — selects a parent by what it contains or by its state. A
  `header:has(> nav)` is a page-end; `li:has(a:hover)` reacts to a child. It
  lets the stylesheet respond to structural variants the component may or may
  not emit, without classes.
- **`:not(…)`** — carves an exception out of a general rule
  (`nav:not(aside > nav)`).
- **attribute and role selectors** (`[aria-current]`, `[role=tab]`) — match the
  ARIA contract for a component sets. ARIA attributes are central to an expanded
  semantic component set.

Two organizing rules follow from this map:

- Application finals are declared at the top of the block that consumes them,
  and re-set in nested state blocks. A `nav li` sets `--background-color` and
  reads it; its nested `&:has(a:hover)` re-sets the same final. State lives next
  to the structure it modifies, not in a distant override rule.
- One file per component; nesting is the component's shape, layers are the
  assembly. The file boundary matches the component boundary, and an explicit
  `@layer` order fixes how the files stack so that the cascade order is the
  reading order: a reader meets the browser reset before the elements, the
  elements before the components, and the components before the adjustments. The
  canonical order is owned by DESIGN.md › @layer order; this document
  argues only the concept. The concept holds only for normal author declarations
  kept within the layer order: it depends on every author style being layered,
  since an unlayered rule or an `!important` declaration escapes that order.

## Scope and Boundaries

Jiffies CSS targets **semantic documents**: articles, documentation, marketing
pages, portfolios, MVPs. It is a full-page reset, and the basis for a component
framework.

The standard critique of classless CSS is that the parent/child DOM contract is
**brittle**: hand-authored markup drifts from the structure the stylesheet
assumes, and complex app UIs outgrow what tag semantics can express. That
critique assumes the HTML is written by hand.

Modern stylesheets are paired with either a JS library, where semantic HTML is
generated by typed, composable tag function (`form`, `button`, `label`, …) and identity-retaining functional components components, or is authored by Agentic AI,
which is equally capable of following patterns and structure over longer horizons.
The parent/child-plus-ARIA structure this stylesheet targets is
produced by code and enforced at the construction site, not assembled by hand
and hoped to match. A reusable `Card(...)` function emits
`article > header / main / footer` every time. Because the DOM is composed from
semantic primitives, complex application UIs are viable on a semantic foundation.
The brittleness the critique fears is held off by the construction layer, rather
than by adding classes. Content the stack does not generate — hand-authored, CMS,
markdown, embedded — is styled loosely by element rather than by the tight `& >`
generated shell.
