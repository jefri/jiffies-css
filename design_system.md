# Jiffies CSS Design System

## Variable Naming

Theme variables. Specified in `:root` block.

- `--{source}[_{variant}][-{state}]_{unit}`
- `--brand_chroma`
- `--card_header_color`
- `--accordion_rounding`

Functions & Intermediates. Specified in `*` blocks.

- ``

Finals. Specified in component blocks.

- `--{property}-{source}[-{variant}][-{state}]`
- `--color-brand-primary`
- `--box-shadow-article`

**Sources:**

- `page`
- `brand`
  - `primary`
  - `secondary`
  - `contrast`
- `card`
  - `header`
  - `main`
  - `footer`
- `accordion`
  - `summary`
  - `details`
- `tab`
  - `tablist`
  - `body`
- `nav`
- `form`
  - `controls`
  - `control`
- `text`
  - `body`
  - `label`
  - `heading`
  - `monospace`
  - `link`

\*\*

**Units:**

- `oklch`: `chroma`, `luminance`, `hue`
- `length`: `rem`, `em`, `px`, etc
- `scale`
- `percent`

## Foundations

### Breakpoints

Breakpoints specified on max-width

```
500 1000  1500  2000 - Breakpoints
360  640  1024  1260 - Viewports
Mobile, Tablet, Window, Screen
```

Target Devices:

- iPhone 15 Pro Max 430 920
- iPhone SE (2nd Gen) 375 667
- Pixel 5 393 851
- Galaxy S8+ . 360 740
- iPad Pro 10.5" 834 1112
- iPad Pro 12.9" (6th Gen) 1024 1366
- MacBook Pro M1 Scaled 1168
- MacBook Pro M1 Default 1523
- MacBook Pro M1 Retina 3024

1920×1080 – 9.94%
1366×768 – 6.22%
360×640 – 5.88%
414×896 – 4.21%
1536×864 – 3.94%
375×667 – 3.74%

- _Breakpoint: Size / Line Height_
- Mobile: 18/24px ; 16/24px
- Tablet: 18/24px ;
- Window: 22/28px ; 18/24px
- Screen: 22/28px

| Breakpoint | Size   | Viewport | text | line height |
| ---------- | ------ | -------- | ---- | ----------- |
| Mobile     | 500px  | 360px    | 18px | 24px        |
| Tablet     | 1000px | 640px    | 18px | 24px        |
| Window     | 1500px | 1024px   | 22px | 28px        |
| Desktop    | 2000px | 1260px   | 22px | 28px        |

<!--
| Size | Breakpoint | Viewport | Columns | base |
| ---- | ---------- | -------- | ------- | ---- |
| xs   | 0          |          | 1       | 12px |
| sm   | 510px      | 425px    | 1       | 14px |
| md   | 768px      | 700px    | 1       | 16px |
| lg   | 1024px     | 920px    | 2       | 18px |
| xl   | 1440px     | 1130px   | 2       | 20px |
| 4k   | 2560px     | 2170px   | 4       | 24px |
-->

### Spacing

- base = Compact 4px, Comfortable 8px, Loose 12px,
- border-box
- padding + border = base
- padding = .25 base
- margin = base

#### Units

- spacing-xsmall: base / 4
- spacing-small: base / 2
- spacing-base: base
- spacing-medium: base \* 2
- spacing-large: base \* 3
- spacing-xlarge: base \* 4
- spacing-border: xsmall

#### Flexbox

Based on a 12-column grid for flow layout. Variety of helpers, and page CSS is free to specify adaptive overrides.

- .flex
- .flex-1 through .flex-12
- .row, .column
-

#### Grid

- grid

### Typography

#### Families

- _Body_ either display. For `<p>` tag prose. brand-body, ...
- _Heading_ serif display. For `<header>`, `<h*>` headings. brand-heading, ...
- _Label_ sans serif display. For `<button>`, `<label>`, `<legend>` labels. Default body if body sans-serif. brand-label, ...
- _Nav_ either display. For `<nav>` links. Default heading if heading serif. brand-nav, ...
- _Monospace_ mono display. For `<code>`, `<kbd>`. brand-monospace, ...

#### Sizes

**REM**:

- _Breakpoint: Size / Line Height_
- Mobile: 18/24px ; 16/24px
- Tablet: 18/24px ;
- Window: 22/28px ; 18/24px
- Screen: 22/28px

**Headings**

-

### Color

All colors in oklch. Respect prefers-color-scheme.

- _Foundation_ greyscale colors for demarking page areas.
  - _Base_ White or Black for "Article" background (height 1); light white / dark grey for "page" background (height 0)
  - _Border_ for borders on table rows, around
  - _Table_ for `<dl>` and `<table>` backgrounds. Includes `even` and `odd` variants.
  - _Text_
    - body, heading, label, nav, link, mark, ins, del,
- Brand
  - _primary_
  - _secondary_
  - _accent_ primary and secondary accent colors
- State
  - _Information_ - Blue
  - _Success_ - Green
  - _Warning_ - Yellow
  - _Error_ - Red
- Shadow
  - height-1, height-2 shadow projection depending how "high" in the stack the item is
  - applies to complete elements: `<article>`, `<input>`, etc.

### Motion

- `nav li` hover slide over
- `accordion` slide open

### Iconography

- https://feathericons.com
- https://v1.heroicons.com

## Content

### Inline

### Components

Groupings and configurations of HTML that implicitly create a "component"

- Page Ends: header footer > nav
- Card - article > {header, main, footer}
- Nav - nav > ol
- Accordian
- Tabs
- Code Block

### Layouts

#### Long-form content with left-side contents

### Forms

#### Form Fields

- Input
- Checkbox, Radio, Switch
- Text Area
- Label, Validation, Instruction

#### Form Validations

#### Form Layouts

#### Nesting Forms
