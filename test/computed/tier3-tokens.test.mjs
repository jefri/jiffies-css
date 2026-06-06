// test/computed/tier3-tokens.test.mjs
//
// FEATURE TEST — tier-3 component tokens (Zen Garden bridge layer).
//
// User story: A theme author opens the demo page and observes that switching
// between the four named treatments (canvas / bento / paper / neumorphism)
// changes the page's visual character — card depth, grid density, table font
// face — without any @layer user element-selector rules in the theme files.
// Each theme identity is expressed entirely as CSS custom property declarations
// inside a single @layer theme block.
//
// This is the gate for the whole topic. It FAILS today: the @layer user blocks
// still exist in the theme files, and the new bridge tokens (--card-shadow,
// --card-border, --card-color, --grid-gap, --table-font-family, etc.) are not
// yet declared in theme/ CSS or consumed by component CSS.
//
// Ref: docs/developer/2026-06-05-A-tier3-tokens/{design.md,feature-test.md}.

import { describe, before, after, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { withPage, css, repoRoot } from "./helpers.mjs";

// ── helpers ───────────────────────────────────────────────────────────────────

async function selectTheme(page, name) {
  const btn = page.getByRole("group", { name: "Theme" }).getByRole("button", { name });
  assert.equal(
    await btn.count(),
    1,
    `theme control: a single "${name}" button must exist in the fieldset[role="group"] labeled "Theme"`,
  );
  await btn.click();
}

// ── suite ─────────────────────────────────────────────────────────────────────

describe("tier-3 tokens — Zen Garden bridge layer", () => {
  let session, page;

  before(async () => {
    session = await withPage();
    page = session.page;
  });

  after(async () => {
    await session.close();
  });

  // ── Structural: theme files must be pure variable declarations ────────────

  it("theme files contain no @layer user blocks", () => {
    for (const theme of ["canvas", "bento", "paper", "neumorphism"]) {
      const src = readFileSync(join(repoRoot, `v2/themes/${theme}.css`), "utf8");
      assert.ok(
        !src.includes("@layer user"),
        `v2/themes/${theme}.css must contain no @layer user block — theme identity ` +
          `must be expressed entirely as custom property declarations in @layer theme`,
      );
    }
  });

  // ── Token surface: new bridge tokens must resolve at :root ───────────────

  it("declares --card-shadow, --card-border, --card-color at :root", async () => {
    await selectTheme(page, "canvas");
    for (const token of ["--card-shadow", "--card-border", "--card-color"]) {
      const value = await css(page, ":root", token);
      assert.notEqual(value, "", `${token} must resolve to a non-empty value at :root`);
    }
  });

  it("declares --grid-gap at :root", async () => {
    await selectTheme(page, "canvas");
    const value = await css(page, ":root", "--grid-gap");
    assert.notEqual(value, "", "--grid-gap must resolve at :root");
  });

  it("declares typography weight and table tokens at :root", async () => {
    await selectTheme(page, "canvas");
    for (const token of [
      "--heading-font-weight",
      "--label-font-weight",
      "--form-label-font-weight",
      "--table-header-font-weight",
      "--table-font-family",
      "--label-letter-spacing",
      "--nav-text-transform",
    ]) {
      const value = await css(page, ":root", token);
      assert.notEqual(value, "", `${token} must resolve to a non-empty value at :root`);
    }
  });

  // ── Canvas: Trebuchet MS table face via token ─────────────────────────────

  it("canvas sets table font to Trebuchet MS via --table-font-family", async () => {
    await selectTheme(page, "canvas");
    const tableFont = await css(page, "table", "font-family");
    assert.match(
      tableFont,
      /Trebuchet/i,
      "canvas must render the table in Trebuchet MS — " +
        "--table-font-family must override --body-font-family for canvas (previously @layer user)",
    );
  });

  // ── Bento: surface-variant tiles and tighter grid gap ─────────────────────

  it("bento cards use surface-variant background", async () => {
    await selectTheme(page, "canvas");
    const canvasBg = await css(page, "article", "background-color");

    await selectTheme(page, "bento");
    const bentoBg = await css(page, "article", "background-color");

    assert.notEqual(
      bentoBg,
      canvasBg,
      "bento article background must differ from canvas — " +
        "--card-background-color must forward to --color-surface-variant for bento",
    );
  });

  it("bento grid gap is smaller than canvas grid gap", async () => {
    await selectTheme(page, "canvas");
    const canvasGap = parseFloat(await css(page, ".grid", "column-gap"));

    await selectTheme(page, "bento");
    const bentoGap = parseFloat(await css(page, ".grid", "column-gap"));

    assert.ok(
      bentoGap < canvasGap,
      `bento grid gap (${bentoGap}px) must be smaller than canvas gap (${canvasGap}px) — ` +
        "--grid-gap must be set to --size-small for bento",
    );
  });

  // ── Paper: flat cards (no shadow, hairline border) ────────────────────────

  it("paper cards carry no shadow", async () => {
    await selectTheme(page, "paper");
    const shadow = await css(page, "article", "box-shadow");
    assert.equal(
      shadow,
      "none",
      "paper article must have box-shadow: none — --card-shadow must be set to none for paper",
    );
  });

  it("paper cards carry a visible border", async () => {
    await selectTheme(page, "paper");
    const borderWidth = await css(page, "article", "border-top-width");
    assert.ok(
      parseFloat(borderWidth) > 0,
      "paper article must have a visible border — --card-border must supply a 1px solid edge for paper",
    );
  });

  // ── Neumorphism: paired shadows, transparent borders ─────────────────────

  it("neumorphism cards carry the paired light/dark box-shadow", async () => {
    await selectTheme(page, "neumorphism");
    const shadow = await css(page, "article", "box-shadow");

    assert.notEqual(
      shadow,
      "none",
      "neumorphism article must carry the paired box-shadow — --card-shadow must be set for neumorphism",
    );
    assert.match(
      shadow,
      /,/,
      "neumorphism card shadow must be a multi-shadow value (two comma-separated shadows)",
    );
  });

  it("neumorphism interactive elements have transparent border color", async () => {
    await selectTheme(page, "neumorphism");
    const borderColor = await css(page, "button", "border-color");
    assert.match(
      borderColor,
      /rgba\(0,\s*0,\s*0,\s*0\)|transparent/i,
      "neumorphism button border-color must be transparent — --base-border-color must override to transparent",
    );
  });
});
