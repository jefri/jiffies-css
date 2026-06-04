# Jiffies CSS — Philosophy

Jiffies CSS is a **Post-Modern CSS Full-Page Reset**, one global stylesheet that
normalizes and styles an entire page from a single place. It provides beautiful semantic
defaults, components built from element relationships, responsive layout, and
theming. Where a classic reset only *neutralizes* the browser to a blank slate,
Jiffies keeps the platform's semantics and builds the finished page on top of
them, using the latest native CSS features. The *implementation* is purely 
semantic: write semantic HTML with consistent, appropriate hierarchy and get a
full-page app and its components in return. Set a few focused base variables to get
your full branding.

Customization happens in focused base variables that control large swaths of
the app. Resetting a single size variable adjusts the sizing basis for the
entire app, including layouts, fonts, and whitespace. But another variable
override can switch the entire page to compact or open whitespace. Colors work
the same way. A single root brand color can theme the entire page, including
complementary and highlight colors. Or you can fine-tune those colors directly,
bypassing the calculated variant. The theming contract targets a single brand
per page — one brand hue drives the derived complementary and highlight colors;
multiple brands per page are out of scope.

## Semantic HTML & Classless CSS

A component is identified by its **DOM hierarchy** and its **ARIA roles**, rarely
by a class. `article > header` is a card header. `nav > ol` is a navigation
list. `[role=tab]` is a tab. The meaning lives in the element; the stylesheet
targets the element. This is the inverse of Tailwind (which puts meaning in
utility classes) and BEM (which puts meaning in `block__element--modifier`
classes). Tailwind, Bootstrap CSS, and BEM require every element to be annotated
by hand; in Jiffies CSS the HTML stays semantic and the styling is implicit.

Classes appear only at the **edges**, where a semantic variant has no element or
role to carry it. The sanctioned edge-classes are a closed list, kept closed so
it cannot sprawl:

- `.secondary`, `.contrast`, `.outline` — button and control variants.
- _(extended only by amending this list, with rationale, in this document.)_

## Variable Model: Intent → Derivation → Application

Every custom property lives in one of three tiers. The tiers are not just
_where_ a property is declared, they are a gradient of **meaning** that runs from
intent through appliction. A token starts as an author's intent and ends as a
rendered property; reading the gradient tells you where to reach to change a given
outcome and what else moves when you do.

**Intent**  *on `:root`* Answers _"how will this be used?"_ Brand and base
inputs like `--brand-color`, `--base-text-color`, `--base-size`, `--font-scale`
control wide swaths of the page's style.  These properties are named in the words
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
Marked *private with a leading `--_`* so readers know these are part of the engine,
not a dial to override. When `@function` lands, this tier will be revised to take
advantage of native function support.

**Application** _per element_ Answers _"what does this change?"_ The property a
rule actually consumes: `--color-header`, `--font-size-base`,
`--margin-card-vertical`. Named from the inside, after the property and element
it sets. Declared in the element's own rule, kebab-case.

Non-negotiable invariants — contrast first among them — belong in **Derivation**,
not Intent. Intent is the public surface to overridde, not an appropriate place 
for invariants. When placed in Derivation, the invariant re-derives at every local
override and cannot be negotiated away.

## Selectors & Nesting

Jiffies CSS builds components out of patterns of DOM nodes. One component is one
(nested) selector tree, and the shape of that tree matches the subtree the
component styles.  In the Jiffies stack this is literal: a DOM function calls
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
  assembly. The file boundary matches the component boundary, and the `@layer`
  order fixes how the files stack: reset, then content, then component, then
  utility. A reader meets the browser reset before the elements, the elements
  before the components, and the components before the adjustments. The cascade
  order is the reading order. This holds for normal author declarations kept
  within the layer order: it depends on every author style being layered, since
  an unlayered rule or an `!important` declaration escapes that order.

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