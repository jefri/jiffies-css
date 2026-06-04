// test/computed/layout.test.mjs
//
// Seed computed-style tests. Each assertion targets a structural invariant of
// the v2 layer system; a failure here means a layer ordering error, a missing
// @import, a broken token derivation, or a specificity conflict — not a
// stylistic choice.

import { describe, before, after, it } from "node:test";
import assert from "node:assert/strict";
import { withPage, css } from "./helpers.mjs";

let lightBodyBg;
let lightHeaderBg;

describe("layout computed styles", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
    lightBodyBg = await css(page, "body", "background-color");
    lightHeaderBg = await css(page, "body > header", "background-color");
  });

  after(async () => {
    await session.close();
  });

  // re-enabled Phase 2 (layout-layer): the layout spine paints the body root with
  // --page-background-color (theme/colors bridge alias, Phase 1).
  it("CSS loads at all — body background-color is not transparent", async () => {
    assert.notStrictEqual(lightBodyBg, "rgba(0, 0, 0, 0)");
  });

  // re-enabled Phase 2 (layout-layer): body > header holds a > nav, so the layout
  // page-end rule paints it with the M3 --color-primary brand background, distinct
  // from the neutral page body. Proves the Intent→Application chain resolves.
  it("Intent→Application chain resolves — header background differs from body", async () => {
    assert.notStrictEqual(lightHeaderBg, "rgba(0, 0, 0, 0)");
    assert.notStrictEqual(lightHeaderBg, lightBodyBg);
  });

  // zero-out (Phase 0): component layer is empty; article gets no border-radius.
  // re-enable with component-card (Phase 4) + theme/borders (Phase 1 re-enable theme/borders)
  it.skip("Component layer fires — article border-radius is non-zero", async () => {
    const value = await css(page, "article", "border-radius");
    assert.notStrictEqual(value, "0px");
  });
});

describe("layout computed styles — dark mode", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage({ colorScheme: "dark" });
    page = session.page;
  });

  after(async () => {
    await session.close();
  });

  // re-enabled Phase 2 (layout-layer): dark mode reassigns --color-background to a
  // dark neutral tone (theme/colors), and the layout spine paints the body root with
  // it — so the dark body surface differs from light.
  it("dark body background differs from light", async () => {
    const darkBodyBg = await css(page, "body", "background-color");
    assert.notStrictEqual(darkBodyBg, lightBodyBg);
  });

  // re-enabled Phase 2 (layout-layer): the brand page-end reads --color-primary,
  // which dark mode reassigns to a lighter primary tone — so the dark page-end
  // brand bar differs from light.
  it("dark header background differs from light", async () => {
    const darkHeaderBg = await css(page, "body > header", "background-color");
    assert.notStrictEqual(darkHeaderBg, lightHeaderBg);
  });
});
