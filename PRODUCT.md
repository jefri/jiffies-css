# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Frontend developers building semantic, standards-forward HTML applications who want a full-page CSS reset and component system without adopting a utility-class framework (Tailwind-style) or shipping JavaScript for component behavior. This includes David's own projects (e.g. it is the base CSS layer for davidsouther.com) as well as external developers who discover and adopt it as a public open-source library — public adoption is a genuine goal, not just a side effect of publishing to npm.

## Product Purpose

jiffies-css is a "post-modern full-app CSS reset": a CSS library that gives beautiful, accessible, responsive default styling to semantic HTML elements and their ARIA-role-driven states, so that plain, correct markup looks and behaves like a designed application without additional classes or JS. It's published to npm and unpkg (`@davidsouther/jiffies-css`) for direct consumption by any project.

## Positioning

The mechanism a utility-class or component-library competitor can't just copy: styling is driven entirely by semantic HTML structure, element relationships, and ARIA roles/states — not by utility classes or JS component logic. Components (cards, accordions, tabs, modals, nav, breadcrumbs, property sheets, form groups) emerge from plain semantic markup patterns (e.g. `article > {header, main, footer}` is a card; `details[role=tablist] summary[role=tab]` is a tab), styled via CSS cascade layers (`reset, theme, layout, content, components, utility, user`) so consuming projects can override cleanly without specificity fights. Zero JS is required for any included component.

## Operating Context

- Distributed as an npm package (`main: index.css`, `unpkg: jiffies-css-bundle.min.css`) and consumed via `@import`/`<link>` or npm install.
- Current source lives in `v2/` (functions, sanitize, theme, content, component, utility layers); the root-level `component/`, `variants/`, and non-v2 bundle files represent an earlier v1 generation still present in the repo.
- Built with `@parcel/css-cli` and `esbuild` (see `build.sh`).
- Has a public demo page (`index.html`, and a hosted GitHub Pages demo) plus `design_system.md` / `design_system.html` documenting the token and layer conventions.
- Known real consumer: davidsouther.com's `src/global.css`, which layers its own theme tokens on top of the jiffies-css v2 bundle.

## Capabilities and Constraints

- Targets modern (~2023-era) CSS standards deliberately: `@layer`, `color-mix()`, `env()` for user-defined variables, `:has()`, `hwb`/`oklch` color — no fallback path for older browsers is a design constraint, not an oversight.
- Theme colors preferentially specified in oklch; the system must always respect `prefers-color-scheme` and support named theme overrides via CSS variables.
- Responsive typography and layout use a golden-ratio (`phi`) based sizing scale, with named breakpoints (Mobile/Tablet/Window/Desktop) tied to representative device viewports.
- User configuration and extension happen entirely through CSS custom properties and the reserved `user` cascade layer — no build-time config or JS API.
- v1 (root-level `component/`, `variants/`) and v2 (`v2/`) coexist in the repo; v2 is current development, v1 is legacy/still bundled for compatibility. This split is an open technical fact, not yet resolved by this init pass.

## Brand Commitments

- Package name and identity: `@davidsouther/jiffies-css`, authored by David Souther, MIT licensed, hosted at `github.com/jefri/jiffies-css`.
- Named design inspirations acknowledged in the README: Pico.css, Primitive UI, Skeleton, Cloudscape foundations, Material design tokens — evidence of intended company, not binding constraints.

## Evidence on Hand

- `README.md`: principles, standards targeted, layer list, font choices (Poppins body, Libre Baskerville text headers, Roboto app headers, Trebuchet MS tables, JetBrains Mono code).
- `design_system.md` / `design_system.html`: variable naming scheme, breakpoints, spacing scale, typography scale, color model, motion, iconography, and component/layout inventory. This is de facto incumbent design documentation; a later `document` or `new-work` pass should reconcile it with an official `DESIGN.md`.
- Live demo page: `index.html`, published via GitHub Pages at `jefri.github.io/jiffies-css`.
- No fabricated adoption metrics, testimonials, or third-party usage claims exist or should be invented.

## Product Principles

- Semantic HTML first: styling attaches to elements and ARIA roles/states, never to invented utility classes.
- Zero JavaScript for any included component or interaction (accordions, tabs, tooltips, etc. use pure CSS/HTML mechanisms like `<details>` and `:has()`).
- Cascade layers are the extension contract: users override via the `user` layer and CSS variables, not by fighting specificity.
- Target current CSS standards without back-compat shims; the constraint is a deliberate bet on where the platform is going, not a limitation to work around.
- Public, redistributable library: changes should consider external consumers (like davidsouther.com), not only in-repo demos.
