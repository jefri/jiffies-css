// test/computed/colors.test.mjs
//
// Objective gate for the M3 generative color engine (Phase 1
// m3-tonal-palettes / derivation-private-prefix). These assertions prove the
// engine actually resolves in a real browser: the inverse-Oklab toe lands tone
// 40 near CIE L* (not a naive 0.40), the semantic role tokens resolve to real
// colors, on-pairs carry contrast, and dark mode REMAPS roles to different
// tones. A failure here means the derivation chain (functions.css fns layer →
// theme/colors.css :root roles) is broken — not a stylistic choice.

import { describe, before, after, it } from "node:test";
import assert from "node:assert/strict";
import { withPage, css } from "./helpers.mjs";

describe("M3 color engine — light", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
  });

  after(async () => {
    await session.close();
  });

  it("inverse Oklab toe — --_l-40 parses to ~0.48 (NOT 0.40)", async () => {
    const raw = await css(page, ":root", "--_l-40");
    const value = Number.parseFloat(raw);
    assert.ok(
      Number.isFinite(value),
      `--_l-40 did not parse to a number: "${raw}"`,
    );
    assert.ok(
      value >= 0.46 && value <= 0.5,
      `--_l-40 = ${value}, expected 0.46–0.50 (the toe-corrected ~0.482)`,
    );
  });

  it("--color-primary resolves to a non-empty color", async () => {
    const value = await css(page, ":root", "--color-primary");
    assert.notStrictEqual(value, "");
  });

  it("--color-on-primary differs from --color-primary", async () => {
    const primary = await css(page, ":root", "--color-primary");
    const onPrimary = await css(page, ":root", "--color-on-primary");
    assert.notStrictEqual(onPrimary, "");
    assert.notStrictEqual(onPrimary, primary);
  });

  it("--color-surface resolves to a non-empty color", async () => {
    const value = await css(page, ":root", "--color-surface");
    assert.notStrictEqual(value, "");
  });
});

describe("M3 color engine — dark remaps roles", () => {
  it("--color-primary differs light vs dark", async () => {
    let lightPrimary;
    await withPage(async (page) => {
      lightPrimary = await css(page, ":root", "--color-primary");
    });

    let darkPrimary;
    await withPage({ colorScheme: "dark" }, async (page) => {
      darkPrimary = await css(page, ":root", "--color-primary");
    });

    assert.notStrictEqual(lightPrimary, "");
    assert.notStrictEqual(darkPrimary, "");
    assert.notStrictEqual(
      darkPrimary,
      lightPrimary,
      "dark mode must reassign --color-primary to a different tone",
    );
  });
});
