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

  it("CSS loads at all — body background-color is not transparent", async () => {
    assert.notStrictEqual(lightBodyBg, "rgba(0, 0, 0, 0)");
  });

  it("Intent→Application chain resolves — header background differs from body", async () => {
    assert.notStrictEqual(lightHeaderBg, "rgba(0, 0, 0, 0)");
    assert.notStrictEqual(lightHeaderBg, lightBodyBg);
  });

  it("Component layer fires — article border-radius is non-zero", async () => {
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

  it("dark body background differs from light", async () => {
    const darkBodyBg = await css(page, "body", "background-color");
    assert.notStrictEqual(darkBodyBg, lightBodyBg);
  });

  it("dark header background differs from light", async () => {
    const darkHeaderBg = await css(page, "body > header", "background-color");
    assert.notStrictEqual(darkHeaderBg, lightHeaderBg);
  });
});
