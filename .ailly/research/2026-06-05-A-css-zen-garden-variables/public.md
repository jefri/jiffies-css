# CSS Zen Garden + Variables + Classless Boilerplate: Research Synthesis

## Research Question

How can the CSS Zen Garden concept (fixed HTML, swappable CSS) be combined with modern classless boilerplates and CSS custom properties to create a system where semantic HTML is the stable foundation, a base reset provides defaults, and full visual themes are delivered entirely by overriding CSS variables?

---

## 1. CSS Zen Garden: The Architectural Premise

The CSS Zen Garden (launched May 2003, Dave Shea) demonstrated that a single fixed HTML file can be transformed into radically different visual designs by swapping only the external CSS stylesheet. The site's directive: "The HTML remains the same, the only thing that has changed is the external CSS file."

Key constraints enforced on all submissions:
- No HTML modifications allowed
- Styling via CSS selectors only (classes, pseudo-elements, structural selectors)
- View-source was encouraged as a teaching mechanism

In 2003, without CSS variables, all design variation required hardcoded values per stylesheet. Changing a theme color meant rewriting every rule that referenced that color. The Zen Garden concept was powerful in principle but impractical for systematic variation.

**The lesson:** Constraints drive creativity. Fixed structure, variable presentation is architecturally sound and educationally valuable. The missing piece was a mechanism to parameterize the visual layer without duplicating entire stylesheets.

---

## 2. Classless CSS: Styling Semantic HTML Directly

The classless CSS movement takes a complementary position: style HTML elements (`h1`, `p`, `button`, `form`, `section`, `nav`) directly, requiring no class names in the markup. The result is semantic HTML that looks professional without any attribute ceremony.

Notable frameworks in this space (2024-2026):

| Framework | Size (gzip) | CSS Variables | Themes |
|-----------|-------------|---------------|--------|
| Water.css | ~2 KB | Yes | Light/dark (system) |
| MVP.css | ~3.3 KB | Yes | Light/dark |
| Simple.css | ~4 KB | Yes | Custom schemes |
| Sakura.css | ~2.7 KB | Yes | Duotone system |
| new.css | ~4.7 KB | Yes | Light/dark/terminal |
| Pico CSS | ~10 KB | Yes (130+) | 20 pre-built |

All modern classless frameworks use CSS custom properties as their theming layer. This is the convergence point with the modernized Zen Garden concept.

The common structure:
```css
/* base defines sensible defaults on semantic elements */
h1, h2, h3 { font-family: var(--font-heading); }
body { background: var(--color-bg); color: var(--color-text); }
button { background: var(--color-primary); }
```

---

## 3. CSS Custom Properties as a Theming API

### Token Layer Architecture

Production design systems use a three-layer token hierarchy:

**Primitive tokens** — raw values without semantic meaning:
```css
--blue-500: #0066cc;
--space-4: 1rem;
--font-sans: system-ui, sans-serif;
```

**Semantic tokens** — contextual aliases that reference primitives:
```css
--color-bg: var(--white);
--color-text: var(--gray-900);
--color-primary: var(--blue-500);
```

**Component tokens** (optional) — element-specific aliases:
```css
--button-bg: var(--color-primary);
--card-radius: var(--radius-md);
```

The direction of dependency is always one-way: component → semantic → primitive. Changing a primitive cascades automatically.

### data-theme Switching

The standard pattern for theme variation uses attribute selectors:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #111111;
  --color-primary: #0066cc;
}

[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #eeeeee;
  --color-primary: #4d94ff;
}
```

Applied to `<html data-theme="dark">` or any scoped container. A theme becomes a set of variable overrides on a selector — exactly the Zen Garden model, but parameterized.

### Naming Convention

Established hierarchy: `[category]-[subcategory]-[element]-[modifier]-[state]`

Examples:
- `--color-bg`, `--color-text`, `--color-border`
- `--font-body`, `--font-heading`, `--font-mono`
- `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`
- `--radius-sm`, `--radius-md`, `--radius-full`

Framework-scoped prefixes (`--pico-`, `--mvp-`) avoid collisions but create verbosity. For a single-project system, unprefixed semantic names are cleaner.

### Responsive Tokens via clamp()

Modern systems eliminate breakpoint-keyed overrides by using fluid values:
```css
--space-md: clamp(0.75rem, 2vw, 1.25rem);
--font-size-body: clamp(1rem, 1.2vw, 1.125rem);
```

This makes the token layer itself responsive without requiring media queries in theme definitions.

---

## 4. Synthesized Architecture

The combination of these three ideas produces a clean three-layer system:

### Layer 1: Semantic HTML Foundation (fixed)
The HTML document uses native semantic elements correctly. No class names for layout or decoration. Structure is expressed through `<section>`, `<article>`, `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<figure>`, `<blockquote>`, etc.

This is the HTML that the Zen Garden fixed. The stability is the feature.

### Layer 2: Base CSS (reset + variable declarations)
A classless stylesheet that:
1. Declares all CSS custom property primitives and semantics at `:root`
2. Applies those variables to semantic HTML elements
3. Handles layout with flexbox/grid on structural elements
4. Implements responsive scaling via `clamp()`
5. Respects `prefers-color-scheme` for light/dark baseline

This stylesheet provides the sensible-defaults behavior of Water.css or Simple.css. It is not a theme; it is the theming API implemented with defaults.

### Layer 3: Theme CSS (variable overrides only)
A theme is a stylesheet that contains only CSS custom property overrides, scoped to `:root` or `[data-theme="name"]`. No selectors targeting HTML elements. No rules that reference or duplicate the base layer's structure.

```css
/* theme-ocean.css — a complete theme */
:root {
  --color-bg: #f0f7ff;
  --color-text: #0a2540;
  --color-primary: #0057b7;
  --font-heading: "Playfair Display", serif;
  --font-body: "Source Serif 4", serif;
  --radius-md: 0;
  --space-md: 1.25rem;
}
```

This is the CSS Zen Garden effect: swap `theme-ocean.css` for `theme-terminal.css` and the entire visual identity changes without touching HTML or base CSS.

### The Zen Garden Test

A system is working correctly when:
- Any valid theme file produces a coherent, usable design
- Removing the theme file reverts to a usable (if plain) default
- Two theme files, when applied to identical HTML, produce visually distinct results
- No HTML changes are required to switch themes

---

## 5. Key Design Decisions

**Variable surface area:** The theme API (the set of variables a theme can override) must be neither too small (not enough control) nor too large (too complex to author a theme). Pico CSS exposes 130+ variables; Water.css exposes ~20. A practical minimum is ~30-50 covering: colors (bg, text, primary, secondary, accent, border, muted), typography (font families, size scale, line height), spacing scale, border radius scale, and shadow scale.

**Fallback values:** `var(--color-primary, #0066cc)` provides a fallback that makes partial theme files work. A theme author can override only the variables they care about.

**Primitive vs. semantic split:** Themes should override semantics, not primitives. A theme that sets `--color-primary: blue` is portable; one that sets `--blue-500: green` is confusing.

**No JavaScript required for static themes:** The `data-theme` mechanism can be set server-side or at build time. JavaScript is only needed for runtime switching.

---

## Sources

- CSS Zen Garden (csszengarden.com) — Dave Shea, launched 2003
- [Comparing classless CSS frameworks — LogRocket Blog](https://blog.logrocket.com/comparing-classless-css-frameworks/)
- [No-Class CSS Frameworks — CSS-Tricks](https://css-tricks.com/no-class-css-frameworks/)
- [Pico CSS Documentation](https://picocss.com/docs/css-variables)
- [Open Props](https://open-props.style/)
- [The developer's guide to design tokens and CSS variables — Penpot](https://penpot.app/blog/the-developers-guide-to-design-tokens-and-css-variables/)
- [Design tokens explained — Contentful](https://www.contentful.com/blog/design-token-system/)
- [CSS Custom Properties vs Sass Variables — talent500](https://talent500.com/blog/css-custom-properties-vs-sass-variables-guide/)
- [The simplest CSS variable dark mode theme — Luke Lowrey](https://lukelowrey.com/css-variable-theme-switcher/)
- [MVP.css](https://andybrewer.github.io/mvp/)
- [Water.css](https://watercss.kognise.dev/)
- [Sakura.css](https://github.com/oxalorg/sakura)
