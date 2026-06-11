// test/computed/modern-css-2026.test.mjs
//
// FEATURE TEST — Modern CSS adoption: evergreen baseline June 2026.
//
// Five CSS features promoted to the June 2026 baseline:
//   1. @starting-style + allow-discrete transitions  →  modal enter + exit animation, no JS
//   2. backdrop-filter: blur()                       →  frosted-glass dialog backdrop
//   3. ::details-content                             →  accordion content targeting + fade-in
//   4. text-wrap: balance                            →  even heading line distribution
//   5. light-dark()                                  →  :root color-scheme: light dark
//
// This test FAILS today on assertions 1–3 and 5:
//   - modal still uses @keyframes (animation-name: modal-open), no exit animation
//   - ::backdrop carries no backdrop-filter
//   - accordion uses summary ~ * (no ::details-content rule, transitionDuration: 0s)
//   - :root color-scheme is "light" only
// Assertion 4 (text-wrap: balance) already passes — the rule is present.
//
// Ref: docs/developer/2026-06-06-A-modern-css-adoption/design.md

import { describe, before, after, it } from "node:test";
import assert from "node:assert/strict";
import { withPage, css } from "./helpers.mjs";

describe("modern CSS 2026 baseline", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
  });

  after(async () => {
    await session.close();
  });

  // ── 1. @starting-style + allow-discrete transitions on dialog ─────────────

  it("dialog uses transitions (not @keyframes) for entry and exit", async () => {
    // The demo page renders the dialog inline-open (normal-flow).  Close it
    // first, then showModal() so we inspect the :modal computed styles.
    await page.evaluate(() => {
      const d = document.getElementById("demo-dialog");
      if (d.open) d.close();
      d.showModal();
    });

    const animName = await css(page, "dialog[open]", "animation-name");
    assert.strictEqual(
      animName,
      "none",
      `dialog must not use @keyframes — @starting-style + transition replaces ` +
        `modal-open/modal-backdrop-open (got animation-name: "${animName}")`,
    );

    const transitionProp = await css(page, "dialog[open]", "transition-property");
    assert.ok(
      transitionProp.includes("opacity"),
      `dialog transition-property must include "opacity" for @starting-style ` +
        `entry (got "${transitionProp}")`,
    );
    assert.ok(
      transitionProp.includes("display") || transitionProp.includes("all"),
      `dialog transition-property must include "display" (allow-discrete) so ` +
        `the exit transition can complete before display:none fires ` +
        `(got "${transitionProp}")`,
    );
  });

  // ── 2. backdrop-filter: blur() on ::backdrop ──────────────────────────────

  it("open modal dialog backdrop carries a blur (frosted glass)", async () => {
    // Ensure the dialog is open as :modal from the previous test; re-open if needed.
    await page.evaluate(() => {
      const d = document.getElementById("demo-dialog");
      if (!d.open) d.showModal();
    });

    const backdropFilter = await page.evaluate(() => {
      const d = document.querySelector("dialog:modal");
      return d ? window.getComputedStyle(d, "::backdrop").backdropFilter : "";
    });

    assert.match(
      backdropFilter,
      /blur\(/,
      `dialog[open]::backdrop must use backdrop-filter: blur() for frosted ` +
        `glass — currently the backdrop is a flat scrim only ` +
        `(got "${backdropFilter}")`,
    );

    // Clean up: return the dialog to its inline-open demo state.
    await page.evaluate(() => {
      const d = document.getElementById("demo-dialog");
      d.close();
      d.setAttribute("open", "");
    });
  });

  // ── 3. ::details-content with opacity fade-in ─────────────────────────────

  it("accordion ::details-content pseudo-element transitions opacity on open", async () => {
    // Use the first closed <details> in the accordion section.
    const closedDetails = page.locator("#accordion details:not([open])").first();
    await closedDetails.locator("summary").click();

    // The ::details-content pseudo-element must carry an opacity transition
    // (set by our rule) and resolve to opacity:1 when open.
    const { opacity, transitionDuration } = await page.evaluate(() => {
      const d = document.querySelector("#accordion details[open]");
      if (!d) return { opacity: null, transitionDuration: null };
      const style = window.getComputedStyle(d, "::details-content");
      return {
        opacity: style.opacity,
        transitionDuration: style.transitionDuration,
      };
    });

    assert.strictEqual(
      opacity,
      "1",
      `::details-content of an open details must have opacity: 1 — ` +
        `null means the pseudo-element is unrecognised or not open (got "${opacity}")`,
    );

    assert.notStrictEqual(
      transitionDuration,
      "0s",
      `::details-content must declare an opacity transition (non-zero duration) ` +
        `so @starting-style can fire the fade-in — "0s" means no ::details-content ` +
        `rule exists yet (the summary ~ * selector is still in use)`,
    );
  });

  // ── 4. text-wrap: balance on headings ────────────────────────────────────

  it("h1–h6 use text-wrap: balance for even line distribution", async () => {
    const value = await css(page, "h1", "text-wrap-style");
    assert.strictEqual(
      value,
      "balance",
      `h1 must compute text-wrap-style: balance (got "${value}")`,
    );
  });

  // ── 5. light-dark() — :root color-scheme: light dark ─────────────────────

  it(":root color-scheme is 'light dark', enabling light-dark() token pairs", async () => {
    const scheme = await css(page, ":root", "color-scheme");
    assert.match(
      scheme,
      /\blight\b.*\bdark\b/,
      `:root color-scheme must be "light dark" to activate light-dark() ` +
        `— currently it is "${scheme}" (dark-mode tokens live in a @media block)`,
    );
  });
});
