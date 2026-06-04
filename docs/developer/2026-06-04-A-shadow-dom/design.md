# Shadow DOM in Jiffies-CSS — Decision Record

*DRAFT 2026-06-04*

## Problem Statement

Should Jiffies-CSS adopt Shadow DOM? The question has two halves that must be
answered first: (1) when is Shadow DOM the right tool for a component, and (2)
how do CSS resets and global styles behave at a shadow boundary. This record settles the question so it does not recur, and
documents the reasoning that makes the answer stable.

Jiffies-CSS is **a classless reset for semantic HTML**. A component is
identified by its DOM hierarchy and its ARIA role — `article > header` is a card
header, `nav > ol` is a navigation list, `[role=tab]` is a tab — and styled by a
single global stylesheet whose cascade is ordered by one canonical document-wide
`@layer` spine (`fns, reset, layout, content, component, utility, user, theme`).
Customization runs through a small Intent tier of custom properties on `:root`.

Shadow DOM is the platform's **style and DOM encapsulation** primitive. The
question is whether a project whose entire mechanism is *global semantic reach*
has anything to gain from a primitive whose entire purpose is *sealing reach
off*.

## Decision

**Jiffies-CSS rejects Shadow DOM as its component model.** It remains a
light-DOM, global-cascade, classless reset. The two models are not merely a poor
fit; they are opposite answers to the same question, and adopting the second
negates the first.

A narrow, additive interop path is recorded (not adopted) at the end: teams that
independently use Shadow DOM can consume Jiffies's reset as a shared
stylesheet, and Jiffies's `:root` tokens will theme their components through
inheritance. This costs the core model nothing and is documented so the option
is on record without expanding scope.

## Prior Art — The Research

### When to use Shadow DOM for a component

The unifying condition for reaching for Shadow DOM is: **you do not control the
host page's CSS, and isolation must hold in both directions.** Shadow DOM
attaches a separate tree whose internals are "hidden from JavaScript and CSS
running in the page"; styles inside do not leak out and "the page CSS does not
affect nodes inside the shadow DOM"
([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)).

It is the right tool for:

- **Distributable third-party widgets and embeds** dropped into unknown pages,
  where the widget's CSS must not collide with the host and vice versa
  ([dev.to](https://dev.to/issuecapture/shadow-dom-css-isolation-how-to-embed-a-widget-without-breaking-the-host-page-4oio)).
- **Design-system component libraries shipped as custom elements** that must
  render identically regardless of the consuming page
  ([Smashing, 2025](https://www.smashingmagazine.com/2025/07/web-components-working-with-shadow-dom/)).

It is the wrong tool, and pure friction, when:

- **You control the CSS.** "If your project does not really need strict
  isolation, for example if you control all the CSS … then skipping Shadow DOM
  is a totally reasonable choice"
  ([meefik](https://meefik.dev/2025/03/19/tailwindcss-and-shadow-dom/)).
- **You rely on a global/utility CSS framework.** Shadow DOM and global
  stylesheets are "a fundamental incompatibility": resets and utilities "do not
  automatically apply inside Shadow DOM"
  ([KINTO, 2025](https://blog.kinto-technologies.com/posts/2025-07-14-web-components-and-tailwind-css-dont-mix-en/)).
- **Authors want to style the component.** Encapsulation degrades styling to
  `::part` and custom properties, a deliberately narrow surface
  ([Frontend Masters](https://frontendmasters.com/blog/light-dom-only/)).

The costs an adopter takes on: global resets stop at the boundary and must be
re-applied per root; FOUC/SSR concerns answered only by Declarative Shadow DOM
(`<template shadowrootmode>`, Baseline as of Aug 2024,
[web.dev](https://web.dev/articles/declarative-shadow-dom)); form participation
requiring `ElementInternals`
([MDN](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)); and
the cross-root ARIA IDREF problem, where `aria-labelledby`/`aria-controls` and
friends cannot cross the boundary — "Accessibility with shadow roots is broken"
([Nolan Lawson](https://nolanlawson.com/2022/11/28/shadow-dom-and-accessibility-the-trouble-with-aria/)),
with the `referenceTarget` proposal still maturing
([Igalia](https://blogs.igalia.com/mrego/solving-cross-root-aria-issues-in-shadow-dom/)).

### CSS resets at the shadow boundary

The boundary is **opaque to selectors and permeable to inherited values.** This
asymmetry is the load-bearing fact for the decision.

- **Selector-based rules do not cross.** "Selectors and their associated style
  definitions don't bleed between scopes"; a document `span { color: blue }` does
  not match shadow content
  ([MDN scoping](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scoping)).
  A document reset therefore has *zero* effect inside a shadow root.
- **Inherited properties DO cross.** "Inheritable styles (`background`, `color`,
  `font`, `line-height`, etc.) … pierce the shadow DOM boundary by default"
  ([web.dev](https://web.dev/articles/shadowdom-v1)). Encapsulation gates
  selector *matching*, not *inheritance*.
- **Custom properties cross and are the supported theming channel.** `--vars`
  are inherited properties, so they flow through; the page sets `--x` on the
  host and the component reads `var(--x)` inside
  ([web.dev](https://web.dev/articles/custom-properties-web-components)).
- **`@layer` is sealed per tree-scope.** "Cascade layers are scoped to their
  origin and context, so the ordering of layers in the light DOM has no impact on
  the order of identically-named layers in the shadow DOM"
  ([CSS Cascade 5](https://drafts.csswg.org/css-cascade-5/)). A canonical layer
  spine cannot coordinate across boundaries.
- **The reset hooks that exist** are `:host`/`:host()`/`:host-context()`,
  `::part()` + `exportparts`, `::slotted()` (top-level slotted nodes only), and
  custom properties. To block inherited bleed-through inside a root, `:host { all:
  revert }` rolls inherited values back to the UA/user origin (close to default
  browser styling); `:host { all: initial }` is the more aggressive option,
  wiping every inherited value to its CSS initial — usually too destructive for a
  host. Crucially, either form leaves `--var` theming intact: `all` resets every
  property *except* `unicode-bidi`, `direction`, and **custom properties**
  ([MDN `all`](https://developer.mozilla.org/en-US/docs/Web/CSS/all)).
- **Sharing a reset cheaply** is done with one `CSSStyleSheet` in
  `adoptedStyleSheets` — parsed once, shared across many roots, updates
  propagate
  ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)).
  In Declarative Shadow DOM that channel is unavailable; styles ship as inline
  `<style>`/`<link>` inside each root (still deduped to one parse)
  ([web.dev](https://web.dev/articles/declarative-shadow-dom)).
- **No "open-stylable" escape hatch has shipped.** Proposals to let page styles
  opt into penetrating a root exist (CSSWG #10176 "Shadow Layers"/`adoptStyles`)
  but are not standardized as of mid-2026
  ([csswg-drafts #10176](https://github.com/w3c/csswg-drafts/issues/10176)). The
  platform direction is *explicit opt-in*, never implicit piercing.

## The Core Tension — Global Semantic Selectors vs. Strict Encapsulation

Jiffies-CSS and Shadow DOM answer the same question — *how does a style rule find
the element it should style?* — with opposite bets. Jiffies bets on **global
semantic addressing**: an element's position in the document tree and its ARIA
role *are* its address, and one stylesheet with global reach matches that
address wherever it appears. Shadow DOM bets on **local encapsulated
addressing**: a component's internal structure is private, addressability stops
at the boundary, and the component exposes only a small explicit interface. The
feature of each is the anti-feature of the other. Five axes make the opposition
concrete, running from raw mechanism up to motivation.

### 1. Global reach is the substrate; encapsulation removes it

The mechanical root of the opposition has two faces. First, **structure must be
legible to be selected.** Classless CSS works only if the semantic tree is
globally visible — the document's hierarchy and ARIA roles are the substrate the
stylesheet selects against. Jiffies states it directly: "The meaning lives in the
element; the stylesheet targets the element." Shadow DOM's primary feature is
making that tree illegible from outside: page CSS and `document.querySelectorAll`
cannot see in. A classless framework needs every component's structure published
to the document; Shadow DOM exists to seal it off.

Second, **a reset is global by definition.** Jiffies is *a reset*, and a reset's
job is to normalize the whole document from one place — inherently singular and
global. Shadow DOM forces that single responsibility to fragment: the document
reset reaches nothing inside a root, so each root must re-establish its own,
re-parsed per instance unless shared through `adoptedStyleSheets`. "Classless
reset" and "encapsulated component" describe opposite distributions of the same
styling responsibility — one centralizes it, the other replicates it N times.

Both faces reduce to one fact — selectors do not cross — but they show how that
fact lands on Jiffies specifically: it loses the global legibility it selects
against, and the singular reset that is its whole identity.

### 2. The permeability seam cuts Jiffies exactly at its tier boundary

Jiffies's variable model has three tiers
(PHILOSOPHY.md): **Intent** (custom properties on `:root`, the public API),
**Derivation** (pseudo-functions like `--_fn-color` declared *on the `*`
universal selector* so they re-derive per element), and **Application**
(per-element/role rules that consume the finals). The shadow boundary's
permeability lines up almost exactly with the seams between these tiers:

| Tier | Declared on | Crosses a shadow boundary? |
|---|---|---|
| Intent | `:root` custom properties | **Yes** — custom properties inherit through |
| Derivation | `*` (universal selector) | **No** — selector-bound, stops at the boundary |
| Application | element / role selectors | **No** — selector-bound, stops at the boundary |

A shadow component on a Jiffies page would inherit `--brand-hue`,
`--base-luminance`, `--font-scale` for free — the public token API penetrates by
construction. But the Derivation engine that turns those tokens into outcomes is
declared on `*`, a selector, and does **not** cross. Neither does any Application
rule. So Shadow DOM would amputate Jiffies precisely at the Intent↔Derivation
seam: the inputs arrive, the machine that consumes them and every rule it feeds
are left outside the wall. The component receives `--brand-hue`, but Jiffies's
machinery for acting on it — `--_fn-color` and the rules that read it — never
crossed; unless the component re-imports that machinery, the token arrives with
nothing to consume it. To restore function you would re-inject the entire engine
and component layer into every root — i.e., rebuild Jiffies inside each box,
having first paid to wall the box off.

### 3. Composition assumes one continuous tree; Shadow DOM fragments it

Jiffies ties its CSS nesting to the DOM builder's call tree: "a DOM function
calls child functions to build a hierarchy, and the matching CSS nests `& >`
blocks in the same hierarchy … two projections of one shape." That 1:1
projection assumes a single continuous tree. Shadow DOM splits the tree into a
light half and a shadow half joined by `<slot>`, with event retargeting at the
seam. The `& >` child-combinator chain — Jiffies's core composition primitive —
cannot span that split: a selector rooted in the light DOM stops at the host, and
`::slotted()` reaches only top-level slotted nodes, never their descendants
([web.dev](https://web.dev/articles/shadowdom-v1)). The "two projections of one
shape" premise fails the moment the shape is two trees.

### 4. Override philosophy inverts

Jiffies keeps control global and cascade-ordered: defaults wrapped in `:where()`
carry zero specificity so "a one-line override" wins, and the Intent tier is a
public dial anyone can turn. The control surface is *open* — any author can
override any final, anywhere. Shadow DOM inverts this: the component author fixes
the entire override surface in advance (which `::part`s and custom properties are
exposed), and the consumer cannot reach past it. Jiffies's `:where()` strategy is
meaningless across a boundary that blocks the selectors outright — there is
nothing to under-specify when the rule never matches. Open, global override and
closed, pre-declared override are not reconcilable; you get one model or the
other.

### 5. They are competing answers to the same brittleness fear

Jiffies's "Scope and Boundaries" section answers the standard critique that
classless CSS is brittle — that hand-authored markup drifts from the structure
the stylesheet assumes. Its answer: the DOM is generated by typed component
functions or by agentic AI, "enforced at the construction site, not assembled by
hand and hoped to match." Shadow DOM is a *different answer to the same fear*: it
enforces robustness by sealing the component so nothing outside can perturb it.
Both target the same risk. Choosing Jiffies's answer — disciplined generation
plus global cascade — is choosing *not to need* the shadow boundary. Layering
Shadow DOM on top would pay twice for one guarantee, and the second payment
buys the encapsulation that disables the first answer's mechanism. They are
substitutes, not complements.

## Specification — What This Means for Jiffies

1. **No shadow roots in the core; the model's home is the light DOM.** Jiffies
   ships global stylesheets in the canonical `@layer` spine, selecting by
   hierarchy and ARIA role against the light DOM. This matches the research's
   decision rule: light-DOM-only is correct precisely when "you control the CSS
   or want global styles to apply," which is Jiffies's target and its
   construction story (DOM generated by composable functions or AI).
2. **`:root` tokens already theme across any boundary that happens to exist.**
   Because custom properties inherit through shadow boundaries, a page themed by
   Jiffies Intent tokens still themes a third-party shadow component that reads
   matching `var(--…)` names — without Jiffies adopting Shadow DOM. This is a
   free property of the existing design, worth stating so it is not rediscovered.

If a consumer independently builds with Shadow DOM, Jiffies can interoperate
without changing its model: export the reset as a shareable constructable
stylesheet for consumers to adopt into their roots (`:host { all: revert }`
blocks inherited bleed-through while leaving custom-property theming intact, since
`all` excludes custom properties), and let token inheritance carry theming. This
is recorded as an option only — not on the roadmap, and it expands nothing in the
core.

## Metrics — How This Decision Stays Correct

The decision is sound as long as these hold; if any flips, re-open the record:

- **Jiffies's target stays semantic documents and code/AI-generated semantic
  UI**, where the author controls the CSS. (If Jiffies pivots to shipping
  distributable widgets for hostile third-party pages, Alternative B re-opens.)
- **The platform keeps encapsulation opt-out, not opt-in.** No shipped
  "open-stylable shadow root" that lets global selectors penetrate. (If CSSWG
  #10176 ships broadly, the cost side of the tension softens and the interop path
  may widen — but the *model* decision does not change, because the issue is
  selectors-don't-cross, which that proposal addresses by re-introducing global
  reach.)
- **Custom-property inheritance across boundaries remains stable.** This is the
  one channel the decision relies on for cross-boundary theming.

## Alternatives Considered

**A. Adopt Shadow DOM as the component model.** Encapsulate Jiffies components in
shadow roots. Rejected: it requires re-applying the reset per root, abandoning
the global `@layer` spine, replacing every role/hierarchy selector with
per-component internal CSS, and absorbing cross-root ARIA breakage,
`ElementInternals` form participation, and FOUC/SSR costs. It negates the
project's reason to exist (§Core Tension, all six axes). Not viable.

**B. Hybrid — light-DOM default plus a shadow-encapsulated build for
distributable widgets.** Keep light DOM as default, offer a shadow-wrapped build
for embedding into pages Jiffies does not control. An honest fit for the
embeddable-widget use case, which is the canonical reason to reach for Shadow
DOM. Deferred, not adopted: embeddability is not a current goal, and the build
would double the test surface. Recorded here so it can be revisited if
distribution into hostile pages becomes a project goal — the trigger named in
Metrics.

## Summary

Shadow DOM and Jiffies-CSS are opposite bets on how a rule finds its element:
global semantic addressing versus sealed local addressing. The shadow boundary
is opaque to selectors and permeable only to inherited values and custom
properties — which means it would cut Jiffies exactly at the seam between its
public token API (which crosses) and its engine plus component rules (which do
not). Jiffies stays light-DOM and global-cascade. Its `:root` token API already
themes across any boundary it meets, for free. A shared-reset interop path is
recorded as an additive, non-roadmap option.

**Deferred decisions:** (1) whether to ship the interop reset stylesheet —
deferred until a real shadow-DOM consumer exists; (2) the hybrid widget build
(Alternative B) — deferred until embeddability becomes a goal, per the Metrics
trigger.
