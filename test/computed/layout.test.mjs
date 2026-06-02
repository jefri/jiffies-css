// test/computed/layout.test.mjs
//
// Seed computed-style tests. Each assertion targets a structural invariant of
// the v2 layer system; a failure here means a layer ordering error, a missing
// @import, a broken token derivation, or a specificity conflict — not a
// stylistic choice.

import { describe, before, after, it } from "node:test";
import assert from "node:assert/strict";
import { withPage, css } from "./helpers.mjs";

describe("layout computed styles", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
  });

  after(async () => {
    await session.close();
  });

  it("CSS loads at all — body background-color is not transparent", async () => {
    const value = await css(page, "body", "background-color");
    assert.notStrictEqual(value, "rgba(0, 0, 0, 0)");
  });

  it("Intent→Application chain resolves — header background differs from body", async () => {
    const bodyBg = await css(page, "body", "background-color");
    const headerBg = await css(page, "body > header", "background-color");
    assert.notStrictEqual(headerBg, "rgba(0, 0, 0, 0)");
    assert.notStrictEqual(headerBg, bodyBg);
  });

  it("Component layer fires — article border-radius is non-zero", async () => {
    const value = await css(page, "article", "border-radius");
    assert.notStrictEqual(value, "0px");
  });
});
