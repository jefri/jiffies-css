---
name: jiffies-css-semantic-html
description: Use when writing HTML components that will be styled by jiffies-css — card layouts, forms, navigation, tabs, accordions, dialogs, or any UI component. Apply when the task involves creating or editing HTML structure in a jiffies-css project, or when wondering whether to add CSS classes to elements.
---

# jiffies-css Semantic HTML

## Overview

jiffies-css styles components by DOM hierarchy and ARIA roles, not class names. Write semantic HTML and get a styled page. The framework's selectors target element types and their relationships — adding classes that the framework does not define bypasses the styling system and creates maintenance debt.

## Core Rule

**No classes unless the element's intent cannot be expressed by its tag, position, or ARIA role.**

The framework hooks into patterns like `article > header`, `details > summary`, `nav > ol`, and `[role=tab]`. When you add `class="card"` to an `<article>`, you break nothing — but you also add nothing.

## Component Patterns

| UI Pattern | Correct HTML | Common Mistake |
|---|---|---|
| Elevated card | `<article>` | `<div class="card">` |
| Flat panel | `<section>` | `<div class="panel">` |
| Card sections | `<article> > <header>`, `<main>`, `<footer>` | `<div class="card-header">` |
| Primary button | `<button>` | `<button class="btn btn-primary">` |
| Secondary button | `<button class="secondary">` | `<button class="btn btn-secondary">` |
| Outlined button | `<button class="outline">` | `<button class="btn-outline">` |
| Accordion | `<details> <summary>Title</summary> <p>Content</p> </details>` | `<div class="accordion">` |
| Tabs (no JS) | `<[role=tablist]> <input type=radio><label role=tab>` | `<div class="tabs">` |
| Tabs (with JS) | `<[role=tablist]> <button role=tab aria-selected>` | `<div class="tab active">` |
| Modal | `<dialog>` | `<div class="modal">` |
| Breadcrumb | `<nav aria-label="Breadcrumb"> <ol>` | `<nav class="breadcrumb">` |
| Property sheet | `<dl> <dt>Label</dt> <dd>Value</dd>` | `<div class="property-row">` |
| Form group | `<fieldset role="group">` | `<div class="form-group">` |
| Toggle switch | `<input type="checkbox" role="switch">` | `<input type="checkbox" class="switch">` |
| Progress bar | `<progress value="40" max="100">` | `<div class="progress-bar">` |
| Hero image | `<figure> <img> </figure>` inside `<header>` | `<div class="hero">` |

## Sanctioned Classes

These are the only classes jiffies-css defines. Use them only when the semantic element alone does not express the variant:

**Control variants** (on `<button>`, `<a[role=button]>`, `<input>`):
- `.secondary` — secondary emphasis
- `.contrast` — high-contrast inverse
- `.outline` — ghost/outlined style

**Density** on any container, preferably high on the page for all children:
- `.compact` — 4px base atom (tight layouts)
- `.loose` — 16px base atom (spacious layouts)

**Shape/flow**:
- `.fluid` — full-bleed, opts out of content-width clamp
- `.round` — maximum border-radius pill (buttons, badges, progress)

**Layout utilities** (on containers):
- `.flex`, `.row`, `.inline`, `.grid`
- `.flex-0` through `.flex-4` (flex-grow)
- `.justify-start`, `.justify-center`, `.justify-end`, `.justify-between`
- `.align-start`, `.align-center`, `.align-end`

**Scroll containers** (on `<figure>`):
- `.scroll-x`, `.scroll-y`

## Example: Profile Card

```html
<!-- Correct: DOM hierarchy drives all styling -->
<article>
  <header>
    <figure>
      <img src="avatar.jpg" alt="Alice Nakamura" width="96" height="96">
    </figure>
    <hgroup>
      <h2>Alice Nakamura</h2>
      <p>Senior Design Engineer</p>
    </hgroup>
  </header>
  <main>
    <p>Works at the intersection of systems design and frontend engineering.</p>
  </main>
  <footer>
    <button>Follow</button>
    <button class="secondary">Message</button>
  </footer>
</article>

<!-- Wrong: BEM classes shadow the semantic structure jiffies-css already handles -->
<article class="profile-card">
  <div class="profile-card__header">
    <figure class="profile-card__avatar">
      <img class="profile-card__img" src="avatar.jpg" alt="Alice Nakamura">
    </figure>
    <div class="profile-card__meta">
      <h2 class="profile-card__name">Alice Nakamura</h2>
      <p class="profile-card__role">Senior Design Engineer</p>
    </div>
  </div>
</article>
```

## Common Mistakes

- Adding BEM or utility classes to elements the framework already targets
- Using `<div>` where `<article>`, `<section>`, `<main>`, `<aside>`, `<figure>`, or `<details>` expresses the intent
- Wrapping content in `<div class="card-body">` instead of `<main>` inside `<article>`
- Using `<a class="button">` without `role="button"` (the framework targets `a[role=button]`)
- Omitting `type="button"` on buttons inside forms (causes accidental form submission)
- Using `class="primary"` on buttons (default `<button>` is already primary; only variants need classes)
- Adding `aria-label` when the element's text content already names it
