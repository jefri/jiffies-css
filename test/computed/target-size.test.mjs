// WCAG 2.5.8 AA (Target Size Minimum): the default button DOM shape
// (button, a[role=button], input[type=button|submit|reset]) must compute to
// at least 24x24 CSS px at every breakpoint x density combination. The worst
// case is the `xs` breakpoint (< 425px, --base-line-height: 16px) combined
// with `.compact` density (--base-size: 4px). Proves the min-block-size floor
// holds at that worst case without regressing resting geometry elsewhere.
//
// This file also re-pins thresholds.test.mjs's `lg` resting-density
// padding/border-width assertions as a guardrail: the fix must not change
// the default (non-compact) visual density at any breakpoint.

import { describe, before, after, it } from "node:test";
import assert from "node:assert/strict";
import { withPage, css } from "./helpers.mjs";

/** Parse a "<n>px" computed value to a Number, asserting it is finite. */
function px(value, label) {
  const n = Number.parseFloat(value);
  assert.ok(
    Number.isFinite(n),
    `${label}: expected an "<n>px" value, got "${value}"`,
  );
  return n;
}

// ===========================================================================
// WORST CASE: xs breakpoint (< 425px) + .compact density.
// ===========================================================================
describe("target-size — xs breakpoint + .compact density (WCAG 2.5.8 AA)", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
    // xs is the default (no min-width media query matches) — any width below
    // 425px (the `sm` step) lands on the xs ladder row.
    await page.setViewportSize({ width: 375, height: 700 });
    // Density classes (e.g. `.compact`) are applied to `<html>`, not the
    // component root.
    await page.evaluate(() => document.documentElement.classList.add("compact"));
  });

  after(async () => {
    await session.close();
  });

  it("default button computed height is >= 24px (WCAG 2.5.8 AA minimum)", async () => {
    const h = px(await css(page, "main button", "height"), "button height");
    assert.ok(
      h >= 24,
      `button height at xs + .compact = ${h}px, expected >= 24px (WCAG 2.5.8 AA); ` +
        `currently computes to 22px (1px border + 2px padding + 16px line-height + ` +
        `2px padding + 1px border) with no min-block-size floor`,
    );
  });
});

// ===========================================================================
// GUARDRAIL: lg breakpoint (1280px), NO .compact — resting density must be
// unchanged. Re-pins thresholds.test.mjs's `lg` resting-density
// padding/border-width assertions.
// ===========================================================================
describe("target-size — lg breakpoint, resting density unchanged (guardrail)", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  after(async () => {
    await session.close();
  });

  it("default button padding stays --size-small (4px) block / --size-base (8px) inline", async () => {
    const sel = "main button";
    const pt = px(await css(page, sel, "padding-top"), "button padding-top");
    const pb = px(await css(page, sel, "padding-bottom"), "button padding-bottom");
    const pl = px(await css(page, sel, "padding-left"), "button padding-left");
    const pr = px(await css(page, sel, "padding-right"), "button padding-right");
    assert.ok(
      Math.abs(pt - 4) <= 0.5 && Math.abs(pb - 4) <= 0.5,
      `button block padding = ${pt}/${pb}px, expected 4px (--size-small, ±0.5) — unchanged by the target-size fix`,
    );
    assert.ok(
      Math.abs(pl - 8) <= 0.5 && Math.abs(pr - 8) <= 0.5,
      `button inline padding = ${pl}/${pr}px, expected 8px (--size-base, ±0.5) — unchanged by the target-size fix`,
    );
  });

  it("default button border-width stays --base-border-size (2px)", async () => {
    const w = px(
      await css(page, "main button", "border-top-width"),
      "button border-top-width",
    );
    assert.ok(
      Math.abs(w - 2) <= 0.5,
      `button border-top-width = ${w}px, expected 2px (--base-border-size, ±0.5) — unchanged by the target-size fix`,
    );
  });
});
