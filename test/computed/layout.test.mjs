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

  // zero-out (Phase 0): sanitize-only baseline does not paint a body background.
  // re-enable with content/containers (Phase 3) + theme/colors (Phase 1 m3-tonal-palettes)
  it.skip("CSS loads at all — body background-color is not transparent", async () => {
    assert.notStrictEqual(lightBodyBg, "rgba(0, 0, 0, 0)");
  });

  // zero-out (Phase 0): no theme/colors roles and no content/containers header surface yet.
  // re-enable with theme/colors (Phase 1 m3-tonal-palettes) + content/containers (Phase 3)
  it.skip("Intent→Application chain resolves — header background differs from body", async () => {
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

  // zero-out (Phase 0): no theme/colors roles, so dark mode does not reassign a body surface.
  // re-enable with theme/colors (Phase 1 m3-tonal-palettes) + content/containers (Phase 3)
  it.skip("dark body background differs from light", async () => {
    const darkBodyBg = await css(page, "body", "background-color");
    assert.notStrictEqual(darkBodyBg, lightBodyBg);
  });

  // zero-out (Phase 0): no theme/colors roles, so dark mode does not reassign a header surface.
  // re-enable with theme/colors (Phase 1 m3-tonal-palettes) + content/containers (Phase 3)
  it.skip("dark header background differs from light", async () => {
    const darkHeaderBg = await css(page, "body > header", "background-color");
    assert.notStrictEqual(darkHeaderBg, lightHeaderBg);
  });
});
