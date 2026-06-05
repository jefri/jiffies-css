// test/computed/thresholds.test.mjs
//
// EXACT THRESHOLD GATE (Phase 6 computed-thresholds). The seed suites
// (colors/layout) assert only "non-zero" / "differs"; the shouldFix work has
// landed and the values are now FINAL, so these assertions PIN the specific
// numbers design_system.md specifies, with tight numeric deltas — never
// "non-zero".
//
// BREAKPOINT IS FIXED. Every value below is breakpoint-dependent (the font /
// viewport ladder lives in theme/sizing.css), so each describe block calls
// page.setViewportSize({ width: 1280 }) FIRST. 1280px is the `lg` step
// (min-width 1024px), where the ladder pins:
//     --base-font-size 18px, --base-line-height 24px, --base-viewport-width
//     920px, --base-main-width 664px, --content-columns 2.
// All numbers below are stated at THAT breakpoint. A different viewport reads a
// different ladder row and these assertions would (correctly) not hold.
//
// This file does NOT touch the contrast (WCAG ratio) or contract (shape/role)
// suites — it is orthogonal: it pins absolute computed magnitudes.

import { describe, before, after, it } from "node:test";
import assert from "node:assert/strict";
import { withPage, css } from "./helpers.mjs";

// The lg breakpoint. 1280 >= 1024 (lg min-width) and < 1440 (xl), so the lg
// row of theme/sizing.css's ladder is the one in force.
const LG_WIDTH = 1280;
const LG_HEIGHT = 900;

// At lg the root/base font size is 18px and the major-third ratio is 1.25.
const BASE_FONT = 18;
const FONT_SCALE = 1.25;

/** Parse a "<n>px" computed value to a Number, asserting it is finite. */
function px(value, label) {
  const n = Number.parseFloat(value);
  assert.ok(
    Number.isFinite(n),
    `${label}: expected an "<n>px" value, got "${value}"`,
  );
  return n;
}

/**
 * Resolve a list of CSS color strings (or :root custom-property tokens) to sRGB
 * byte triples via 2D-canvas readback inside the page. The canvas resolves
 * oklch(from …) exactly as the renderer paints it, which getComputedStyle alone
 * does not do for a custom property (it returns the literal oklch(from …)
 * string). Returns token -> { value, rgb:[r,g,b] }.
 */
function resolveColorsInPage(tokens) {
  const cs = getComputedStyle(document.documentElement);
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const out = {};
  for (const token of tokens) {
    // A leading "--" means read it off :root; otherwise treat as a literal color.
    const value = token.startsWith("--")
      ? cs.getPropertyValue(token).trim()
      : token;
    ctx.fillStyle = "#000000";
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    out[token] = { value, rgb: [d[0], d[1], d[2]] };
  }
  return out;
}

async function resolveColors(page, tokens) {
  return page.evaluate(
    ({ tokens, fnSource }) => {
      const resolve = new Function(`return (${fnSource})`)();
      return resolve(tokens);
    },
    { tokens, fnSource: resolveColorsInPage.toString() },
  );
}

/** Max absolute per-channel difference between two sRGB byte triples. */
function maxChannelDelta(a, b) {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
}

// ===========================================================================
// TYPOGRAPHY — the modular scale lands on its exact px stops at lg (18px base).
// ===========================================================================
describe("thresholds — typography @ lg (1280px, --base-font-size 18px)", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
    await page.setViewportSize({ width: LG_WIDTH, height: LG_HEIGHT });
  });

  after(async () => {
    await session.close();
  });

  it("--base-font-size is exactly 18px (lg ladder row)", async () => {
    const v = await css(page, ":root", "--base-font-size");
    assert.strictEqual(v, "18px", `--base-font-size = ${v}, expected 18px @ lg`);
  });

  it("body font-size == 18px (== --base-font-size)", async () => {
    const v = px(await css(page, "body", "font-size"), "body font-size");
    assert.ok(
      Math.abs(v - BASE_FONT) <= 0.5,
      `body font-size = ${v}px, expected ${BASE_FONT}px (±0.5)`,
    );
  });

  it("h1 font-size == 18 * 1.25^6 (≈ 68.66px, ±0.5)", async () => {
    const expected = BASE_FONT * FONT_SCALE ** 6; // 68.6646…
    const v = px(await css(page, "h1", "font-size"), "h1 font-size");
    assert.ok(
      Math.abs(v - expected) <= 0.5,
      `h1 font-size = ${v}px, expected ${expected.toFixed(4)}px (18*1.25^6, ±0.5)`,
    );
  });

  it("h6 font-size == 18 * 1.25 (== 22.5px) and stays ABOVE body", async () => {
    const expectedH6 = BASE_FONT * FONT_SCALE; // 22.5
    const h6 = px(await css(page, "h6", "font-size"), "h6 font-size");
    const body = px(await css(page, "body", "font-size"), "body font-size");
    assert.ok(
      Math.abs(h6 - expectedH6) <= 0.5,
      `h6 font-size = ${h6}px, expected ${expectedH6}px (18*1.25, ±0.5)`,
    );
    assert.ok(
      h6 > body,
      `h6 (${h6}px) must stay above body (${body}px) at every step`,
    );
  });

  it("--small-font-size resolves to 18/1.25 (== 14.4px, ±0.5)", async () => {
    // The custom property reads back as the literal calc() string off :root, so
    // resolve it to a USED length by applying it to a probe element's font-size.
    const expected = BASE_FONT / FONT_SCALE; // 14.4
    const resolved = await page.evaluate(() => {
      const el = document.createElement("div");
      el.style.fontSize = "var(--small-font-size)";
      document.body.appendChild(el);
      const fs = getComputedStyle(el).fontSize;
      el.remove();
      return fs;
    });
    const v = px(resolved, "--small-font-size (resolved)");
    assert.ok(
      Math.abs(v - expected) <= 0.5,
      `--small-font-size resolved to ${v}px, expected ${expected}px (18/1.25, ±0.5)`,
    );
  });
});

// ===========================================================================
// COLOR — exact resolved sRGB for the brand at oklch(55% 0.18 255) → tone 40.
// ===========================================================================
describe("thresholds — color (exact resolved sRGB)", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
    await page.setViewportSize({ width: LG_WIDTH, height: LG_HEIGHT });
  });

  after(async () => {
    await session.close();
  });

  it("--color-primary carries L≈0.4815, C 0.13, H 255 (the tone-40 toe value)", async () => {
    // The literal value string proves the engine reached tone 40 with the right
    // chroma/hue: oklch(from <brand> <L> <C> h). L is the inverse-Oklab toe of
    // tone 40 (≈0.482), NOT a naive 0.40.
    const value = await css(page, ":root", "--color-primary");
    const m = value.match(
      /oklch\(from\s+oklch\(55% 0\.18 255deg\)\s+([0-9.]+)\s+([0-9.]+)\s+h\)/,
    );
    assert.ok(m, `--color-primary did not match the expected form: "${value}"`);
    const L = Number.parseFloat(m[1]);
    const C = Number.parseFloat(m[2]);
    assert.ok(
      Math.abs(L - 0.4815) <= 0.003,
      `--color-primary L = ${L}, expected ≈0.4815 (inverse-Oklab toe of tone 40), ±0.003`,
    );
    assert.strictEqual(C, 0.13, `--color-primary chroma = ${C}, expected 0.13`);
  });

  it("--color-primary resolves to the expected sRGB ([34,94,165], ±2/channel)", async () => {
    const resolved = await resolveColors(page, ["--color-primary"]);
    const rgb = resolved["--color-primary"].rgb;
    const expected = [34, 94, 165];
    const delta = maxChannelDelta(rgb, expected);
    assert.ok(
      delta <= 2,
      `--color-primary resolved to sRGB ${rgb} (value "${resolved["--color-primary"].value}"), ` +
        `expected ≈${expected} for brand oklch(55% 0.18 255) at tone 40, max channel Δ ${delta} > 2`,
    );
  });

  it("--color-surface (tone 98) differs light vs dark by a wide margin", async () => {
    let lightSurface;
    await withPage(async (p) => {
      await p.setViewportSize({ width: LG_WIDTH, height: LG_HEIGHT });
      lightSurface = (await resolveColors(p, ["--color-surface"]))[
        "--color-surface"
      ].rgb;
    });

    let darkSurface;
    await withPage({ colorScheme: "dark" }, async (p) => {
      await p.setViewportSize({ width: LG_WIDTH, height: LG_HEIGHT });
      darkSurface = (await resolveColors(p, ["--color-surface"]))[
        "--color-surface"
      ].rgb;
    });

    // Light surface is the near-white neutral (tone 98); dark is the near-black
    // neutral (tone 10). They must be far apart, not merely "different".
    assert.ok(
      lightSurface[0] >= 230,
      `light --color-surface should be near-white (tone 98), got ${lightSurface}`,
    );
    assert.ok(
      darkSurface[0] <= 40,
      `dark --color-surface should be near-black (tone 10), got ${darkSurface}`,
    );
    const delta = maxChannelDelta(lightSurface, darkSurface);
    assert.ok(
      delta >= 150,
      `light vs dark --color-surface should differ widely; max channel Δ ${delta} < 150 ` +
        `(light ${lightSurface}, dark ${darkSurface})`,
    );
  });
});

// ===========================================================================
// SPACING / SIZE — the 8px atom and the exact px it derives at lg (18px root).
// ===========================================================================
describe("thresholds — spacing & size @ lg (1280px, 18px root)", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
    await page.setViewportSize({ width: LG_WIDTH, height: LG_HEIGHT });
  });

  after(async () => {
    await session.close();
  });

  it("--base-size is exactly 8px (the spacing atom)", async () => {
    const v = await css(page, ":root", "--base-size");
    assert.strictEqual(v, "8px", `--base-size = ${v}, expected 8px`);
  });

  it("default button padding == --size-small (4px) block / --size-base (8px) inline", async () => {
    // The first primary button in main. --size-small = 8/2 = 4px (block),
    // --size-base = 8px (inline).
    const sel = "main button";
    const pt = px(await css(page, sel, "padding-top"), "button padding-top");
    const pb = px(await css(page, sel, "padding-bottom"), "button padding-bottom");
    const pl = px(await css(page, sel, "padding-left"), "button padding-left");
    const pr = px(await css(page, sel, "padding-right"), "button padding-right");
    assert.ok(
      Math.abs(pt - 4) <= 0.5 && Math.abs(pb - 4) <= 0.5,
      `button block padding = ${pt}/${pb}px, expected 4px (--size-small, ±0.5)`,
    );
    assert.ok(
      Math.abs(pl - 8) <= 0.5 && Math.abs(pr - 8) <= 0.5,
      `button inline padding = ${pl}/${pr}px, expected 8px (--size-base, ±0.5)`,
    );
    // Explicitly NOT "non-zero": the padding is a specific magnitude.
    assert.notStrictEqual(pt, 0, "button block padding must be set (not 0)");
  });

  it("button border-width == --base-border-size (--size-xsmall == 2px)", async () => {
    const w = px(
      await css(page, "main button", "border-top-width"),
      "button border-top-width",
    );
    assert.ok(
      Math.abs(w - 2) <= 0.5,
      `button border-top-width = ${w}px, expected 2px (--size-xsmall, ±0.5)`,
    );
  });

  it("card border-radius == --border-radius-container == 0.5rem (== 9px @ 18px root)", async () => {
    // 0.5rem against an 18px root resolves to 9px. Read it as a USED length off
    // the card (article), since the :root custom prop reads back as "0.5rem".
    const token = await css(page, ":root", "--border-radius-container");
    assert.strictEqual(
      token,
      "0.5rem",
      `--border-radius-container = ${token}, expected 0.5rem`,
    );
    const r = px(
      await css(page, "article", "border-top-left-radius"),
      "card border-radius",
    );
    assert.ok(
      Math.abs(r - 9) <= 0.5,
      `card border-top-left-radius = ${r}px, expected 9px (0.5rem @ 18px root, ±0.5)`,
    );
  });

  it("text input border-width == 2px (--base-border-size)", async () => {
    const w = px(
      await css(page, "input[type='text']", "border-top-width"),
      "input border-top-width",
    );
    assert.ok(
      Math.abs(w - 2) <= 0.5,
      `input border-top-width = ${w}px, expected 2px (--base-border-size, ±0.5)`,
    );
  });
});

// ===========================================================================
// LAYOUT — the lg content clamp is 920px; the spine centers a clamped slot.
//
// NOTE ON THE DEMO PAGE: index.html has a body-level `> aside`, so the layout
// `:has(> aside)` reflow is in force and `main` does NOT clamp to 920px on the
// live page — it becomes `flex: 1 1 --base-main-width (664px)` and shares the
// row beside the aside (measured 844px, left-aligned, at 1280px). The task's
// "main clamps to 920px and is centered" expectation therefore does NOT hold
// for the live demo because of the aside. We assert BOTH the live reflow (the
// real behavior) AND the clamp itself (by removing the aside so the spine falls
// back to the centered single-column path), so the 920px-centered clamp is
// pinned without pretending the live page does it.
// ===========================================================================
describe("thresholds — layout content clamp @ lg (1280px)", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
    await page.setViewportSize({ width: LG_WIDTH, height: LG_HEIGHT });
  });

  after(async () => {
    await session.close();
  });

  it("--base-viewport-width is exactly 920px at lg", async () => {
    const v = await css(page, ":root", "--base-viewport-width");
    assert.strictEqual(
      v,
      "920px",
      `--base-viewport-width = ${v}, expected 920px @ lg`,
    );
  });

  it("LIVE demo: with a body > aside, main reflows beside it (NOT the 920px clamp)", async () => {
    const geo = await page.evaluate(() => {
      const main = document.querySelector("body > main");
      const aside = document.querySelector("body > aside");
      const mr = main.getBoundingClientRect();
      const ar = aside.getBoundingClientRect();
      const cs = getComputedStyle(main);
      return {
        mainWidth: mr.width,
        mainLeft: mr.left,
        asideWidth: ar.width,
        flexBasis: cs.flexBasis,
        innerWidth: window.innerWidth,
      };
    });
    // main carries the --base-main-width (664px) flex-basis, not the 920px clamp.
    assert.strictEqual(
      geo.flexBasis,
      "664px",
      `main flex-basis = ${geo.flexBasis}, expected 664px (--base-main-width) under the aside reflow`,
    );
    // It shares the row: main + aside together span the viewport, neither is the
    // full 920px clamp on its own.
    assert.ok(
      geo.asideWidth > 0,
      `aside should occupy the row (width ${geo.asideWidth})`,
    );
    assert.ok(
      Math.abs(geo.mainWidth + geo.asideWidth - geo.innerWidth) <= 1,
      `main (${geo.mainWidth}) + aside (${geo.asideWidth}) should fill the viewport ` +
        `(${geo.innerWidth}) under the row-wrap reflow`,
    );
    assert.notStrictEqual(
      Math.round(geo.mainWidth),
      920,
      "with an aside present, main must NOT be the 920px single-column clamp",
    );
  });

  it("CLAMP: with no aside, main clamps to 920px and is centered (±1px symmetric margins)", async () => {
    const geo = await page.evaluate(() => {
      // Remove the body-level aside so the spine takes the centered
      // single-column path (& > :is(header,main,footer) { width clamp;
      // margin-inline:auto }).
      const aside = document.querySelector("body > aside");
      if (aside) aside.remove();
      const main = document.querySelector("body > main");
      const r = main.getBoundingClientRect();
      return {
        width: r.width,
        left: r.left,
        right: window.innerWidth - r.right,
        innerWidth: window.innerWidth,
      };
    });
    assert.ok(
      Math.abs(geo.width - 920) <= 1,
      `main width = ${geo.width}px, expected the lg clamp 920px (±1)`,
    );
    // Centered: left and right gutters equal, each ≈ (1280-920)/2 = 180px.
    const expectedGutter = (geo.innerWidth - 920) / 2;
    assert.ok(
      Math.abs(geo.left - geo.right) <= 1,
      `main is not centered: left gutter ${geo.left}px vs right ${geo.right}px`,
    );
    assert.ok(
      Math.abs(geo.left - expectedGutter) <= 1,
      `main left gutter ${geo.left}px, expected ≈${expectedGutter}px (centered clamp)`,
    );
  });
});
