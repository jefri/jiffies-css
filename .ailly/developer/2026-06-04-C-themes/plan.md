# Implementation Plan: Theme Skins

**Feature test:** `test/computed/theme-skins.test.mjs`
**User story:** A visitor opens the demo page, picks a brand hue, and flips through four named treatments (canvas / bento / neumorphism / paper) that change fonts, radius, and structural feel while the hue and semantic HTML stay constant.

**Steps:**

- [ ] Step 1: `data-theme` contract and canvas font migration
- [ ] Step 2: Theme control row and `setTheme` JS
- [ ] Step 3: `bento.css` — fonts, radius, card fill
- [ ] Step 4: `paper.css` — crisp print edge, flattened shadows
- [ ] Step 5: `neumorphism.css` — soft pillowed corners, paired shadows

---

## Step 1: `data-theme` contract and canvas font migration

**Enables:** Beat 1 (the page opens on `data-theme="canvas"`). Required precondition for beats 3–4: canvas font roles must leave the unlayered `<style>` block so other themes can override them.

### Changes

**`index.html` — `<html>` tag**

```html
<html lang="en-US" data-theme="canvas">
```

**`index.html` — Google Fonts URL (expand to cover the five new faces)**

Add `Lato`, `Inter`, `Space+Mono`, `Montserrat`, and `PT+Mono` alongside the existing four. Each theme role falls through to the system stack if the webfont is absent.

**`index.html` — remove the four `--brand-*-font-family` declarations from the inline `:root` block**

The block that remains:
```css
:root {
  --brand-color: oklch(55% 0.05 255deg);
  /* --brand-*-font-family declarations removed — now live in themes/canvas.css */
}
```

The unlayered inline style beats every `@layer`, so the font roles must move or no theme can override them. The `--brand-color` seed and any runtime inline writes from the sliders stay — inline `style` attribute beats layers by a different rule and is intentional.

**`v2/themes/canvas.css`** (new file)

```css
/* Canvas: the baseline treatment. Formalized as a theme so the font roles live
   inside @layer theme — where [data-theme] specificity (0,1,1) beats a bare :root
   (0,1,0) and other themes can override them. */
@layer theme {
  :root[data-theme="canvas"] {
    --brand-body-font-family: "Poppins";
    --brand-header-font-family: "Libre Baskerville";
    --brand-nav-font-family: "Lato";
    --brand-monospace-font-family: "JetBrains Mono";
    /* Radius: carry the borders.css defaults explicitly so canvas is selectable
       and the theme switcher has a concrete baseline to compare against. */
    --border-radius-container: 0.5rem;
    --border-radius-item: 0.25rem;
  }
}

/* Tables have no dedicated brand token — they inherit --brand-body-font-family.
   Trebuchet MS is a distinct tabular face, so it gets a structural override. */
@layer user {
  [data-theme="canvas"] table {
    font-family: "Trebuchet MS", sans-serif;
  }
}
```

**`v2/themes/bento.css`**, **`v2/themes/paper.css`**, **`v2/themes/neumorphism.css`** — stubs:

```css
/* stub — filled in Steps 3/4/5 */
@layer theme {}
@layer user {}
```

**`v2/themes/themes.css`** (new barrel file)

```css
/* Theme skins — plain imports preserve each file's internal @layer blocks.
   Do NOT wrap in layer() here; each theme self-assigns to @layer theme and
   @layer user internally. */
@import "./canvas.css";
@import "./bento.css";
@import "./neumorphism.css";
@import "./paper.css";
```

**`v2/index.css`** — add one import after the `@layer` declaration line:

```css
@import "./themes/themes.css";
```

The import goes without a `layer()` wrapper so each file's internal `@layer theme {}` and `@layer user {}` blocks self-assign to the already-declared layers. The layer order is already `… component, utility, user, theme;` — `theme` last means `[data-theme]` token overrides win; `user` after `component` means structural overrides win.

---

## Step 2: Theme control row and `setTheme` JS

**Enables:** Beat 2 (the Usage panel exposes exactly one `fieldset[role="group"]` named "Theme" with four buttons). Beat 3 (selecting a theme writes `data-theme` and leaves semantic markup unchanged). Beat 7 (the code box prints `data-theme="…"` and `--brand-color`).

### Changes

**`index.html` — add the theme control row inside `#intent-controls`**

The row mirrors the existing density fieldset pattern: a `fieldset[role="group"]` of `type="button"` buttons, each with an `onclick` calling `setTheme(name)`.

```html
<label for="theme-canvas">theme</label>
<fieldset role="group" aria-label="Theme">
  <button type="button" id="theme-canvas"      aria-pressed="true"  onclick="setTheme('canvas')">canvas</button>
  <button type="button" id="theme-bento"       aria-pressed="false" onclick="setTheme('bento')">bento</button>
  <button type="button" id="theme-neumorphism" aria-pressed="false" onclick="setTheme('neumorphism')">neumorphism</button>
  <button type="button" id="theme-paper"       aria-pressed="false" onclick="setTheme('paper')">paper</button>
</fieldset>
```

**`index.html` — add `window.setTheme` and update `updateCode`**

`setTheme` writes the attribute, syncs density (neumorphism → compact; everything else → normal), reflects aria-pressed on all four buttons, and calls the existing `updateCode` path.

`updateCode` prepends the `<html data-theme="…">` snippet to the output so the code box shows the full reproduction recipe.

```js
// Density presets: a theme may override the density dial when selected.
// The user can always re-tune density afterward; the theme treatment persists.
const THEME_DENSITY = {
  canvas:       '',
  bento:        '',
  neumorphism:  'compact',
  paper:        '',
};

let currentTheme = document.documentElement.dataset.theme || 'canvas';

window.setTheme = function (name) {
  currentTheme = name;
  root.dataset.theme = name;
  // Sync density preset for the selected theme.
  setDensity(THEME_DENSITY[name] ?? '');
  // Reflect aria-pressed on all theme buttons.
  ['canvas', 'bento', 'neumorphism', 'paper'].forEach(t => {
    document.getElementById(`theme-${t}`)
      ?.setAttribute('aria-pressed', t === name ? 'true' : 'false');
  });
  updateCode(
    `oklch(55% 0.18 ${hEl.value}deg)`,
    +(scaleEl.value / 100).toFixed(2)
  );
};

// updateCode — update to include data-theme in the reproduction recipe.
function updateCode(color, scale) {
  const densityLine = currentDensity
    ? `\n/* density: add class="${currentDensity}" to <html> */`
    : '';
  document.getElementById('intent-code').textContent =
    `<html data-theme="${currentTheme}">\n` +
    `:root {\n  --brand-color: ${color};\n  --font-scale: ${scale.toFixed(2)};\n}${densityLine}`;
}
```

Note: `currentDensity` is already tracked by the existing `setDensity` scope; `setTheme` calls `setDensity` so the density variable stays consistent. The hue and scale dials are untouched by `setTheme` — inline `style` writes from the sliders are preserved.

---

## Step 3: `bento.css` — fonts, radius, card fill

**Enables:** Beat 4 (bento overrides body font and article radius away from canvas's values).

### Changes

**`v2/themes/bento.css`** (replace the stub)

Token overrides in `@layer theme`: Inter for body/header/nav, JetBrains Mono for mono, 8px container radius, 4px item radius.

Structural overrides in `@layer user`: cards (`article`) get a `--color-surface-variant` fill to read as bento tiles; `.grid` utility gap tightened so the tile grid reads as a denser grid.

```css
/* Bento: clean editorial grid. Inter-first type, tight tile geometry. */
@layer theme {
  :root[data-theme="bento"] {
    --brand-body-font-family: "Inter";
    --brand-header-font-family: "Inter";
    --brand-nav-font-family: "Inter";
    --brand-monospace-font-family: "JetBrains Mono";
    --border-radius-container: 8px;
    --border-radius-item: 4px;
  }
}

@layer user {
  /* Cards read as bento tiles: surface-variant fill, no extra border. */
  [data-theme="bento"] article {
    background-color: var(--color-surface-variant);
    color: var(--color-on-surface-variant);
  }
  /* Tighter grid gaps so the tile density reads differently from canvas. */
  [data-theme="bento"] .grid {
    gap: var(--size-small);
  }
}
```

---

## Step 4: `paper.css` — crisp print edge, flattened shadows

**Enables:** Beat 4 (paper overrides body font and radius). Beat 6 (paper radius is below canvas; `box-shadow` on article is `none`).

### Changes

**`v2/themes/paper.css`** (replace the stub)

Token overrides in `@layer theme`: Montserrat for header, Roboto for body/nav, PT Mono for mono, near-zero radius (2px) to read as a print edge.

Structural overrides in `@layer user`: kill all `box-shadow` on articles and cards; add a 1px ink hairline border to give structure without depth.

```css
/* Paper: print-edge geometry, no shadows, ink hairline borders. */
@layer theme {
  :root[data-theme="paper"] {
    --brand-body-font-family: "Roboto";
    --brand-header-font-family: "Montserrat";
    --brand-nav-font-family: "Roboto";
    --brand-monospace-font-family: "PT Mono";
    --border-radius-container: 2px;
    --border-radius-item: 1px;
  }
}

@layer user {
  /* Flatten: remove all card depth, replace with a hairline ink border. */
  [data-theme="paper"] article,
  [data-theme="paper"] .card {
    box-shadow: none;
    border: 1px solid var(--color-outline-variant);
  }
}
```

---

## Step 5: `neumorphism.css` — soft pillowed corners, paired shadows

**Enables:** Beat 4 (neumorphism overrides body font and radius). Beat 5 (article radius > canvas; article `box-shadow` is not `none`; density is compact when selected).

### Changes

**`v2/themes/neumorphism.css`** (replace the stub)

Token overrides in `@layer theme`: Space Mono for body/header/nav, JetBrains Mono for mono, ~1rem radius (soft pillow). The one sanctioned surface override: `--color-surface` to a mid-gray so the paired shadows (light above, dark below) have a mid-tone to read against. Ships a `prefers-color-scheme: dark` block with inverted surface and shadow directions. Shadows are `@layer user` structural rules, not token declarations.

Structural overrides in `@layer user`: paired `box-shadow` (`inset` on active) on articles and interactive elements. Borders removed (shadow alone provides edge).

```css
/* Neumorphism: soft geometry, paired light/dark shadows, mid-gray surface.
   This is the structural showcase — the one theme that overrides --color-surface.
   The override ships its own dark-mode block and a contrast assertion in the test. */
@layer theme {
  :root[data-theme="neumorphism"] {
    --brand-body-font-family: "Space Mono";
    --brand-header-font-family: "Space Mono";
    --brand-nav-font-family: "Space Mono";
    --brand-monospace-font-family: "JetBrains Mono";
    --border-radius-container: 1rem;
    --border-radius-item: 0.75rem;
    /* Sanctioned surface override: the paired shadows need a mid-tone ground. */
    --color-surface: #e0e0e0;
    --color-on-surface: #1a1a1a;
  }
  @media (prefers-color-scheme: dark) {
    :root[data-theme="neumorphism"] {
      --color-surface: #2a2a2a;
      --color-on-surface: #e8e8e8;
    }
  }
}

@layer user {
  /* Paired light/dark box-shadow gives the pillowed effect.
     Values are tuned during implementation; the relative offsets are stable. */
  [data-theme="neumorphism"] article,
  [data-theme="neumorphism"] .card {
    box-shadow:
      6px 6px 12px rgba(0,0,0,0.25),
      -6px -6px 12px rgba(255,255,255,0.7);
    border: none;
  }
  @media (prefers-color-scheme: dark) {
    [data-theme="neumorphism"] article,
    [data-theme="neumorphism"] .card {
      box-shadow:
        6px 6px 12px rgba(0,0,0,0.5),
        -6px -6px 12px rgba(255,255,255,0.1);
    }
  }
  /* Inset on active press for interactive elements. */
  [data-theme="neumorphism"] button:active,
  [data-theme="neumorphism"] input:active {
    box-shadow:
      inset 3px 3px 6px rgba(0,0,0,0.25),
      inset -3px -3px 6px rgba(255,255,255,0.7);
  }
  /* Remove flat borders — shadow alone carries the edge. */
  [data-theme="neumorphism"] article,
  [data-theme="neumorphism"] .card,
  [data-theme="neumorphism"] button,
  [data-theme="neumorphism"] input,
  [data-theme="neumorphism"] select {
    border-color: transparent;
  }
}
```
