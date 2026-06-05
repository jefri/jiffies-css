// test/computed/theme-skins.test.mjs
//
// FEATURE TEST — theme skins (one document, four identities).
//
// Encodes the whole user story end-to-end: a visitor opens the demo page, picks
// a brand hue, then flips through the four named treatments (canvas / bento /
// neumorphism / paper) from the new `theme` control row in the Usage panel and
// watches the SAME semantic HTML change identity — fonts, radius, and structural
// feel change while the chosen hue persists, and only the `<html>` attributes
// (`data-theme`, the density class, the inline `--font-scale`) move.
//
// This is the gate for the whole topic; everything in plan.md exists to turn it
// green. It FAILS today: there is no `theme` control row, no `data-theme`
// contract, and no themes/ stylesheets. Each `it` re-selects the theme it needs
// up front, so the beats are independent and order-free; they share one loaded
// page (and one user-chosen hue, set in `before`) to keep the flow honest.
//
// Ref: docs/developer/2026-06-04-C-themes/{design.md,feature-test.md}.

import { describe, before, after, it } from "node:test";
import assert from "node:assert/strict";
import { withPage, css } from "./helpers.mjs";

// A distinctive, off-default hue (default slider hue is 255deg/blue). Setting it
// proves the user's color choice survives every theme switch — the design's
// "same color, different treatment" invariant.
const USER_HUE = 25; // a warm red, unmistakably not the blue default

// The four treatments. `canvas` is the default (today's baseline, formalized).
const THEMES = ["canvas", "bento", "neumorphism", "paper"];

/** The active treatment, read off <html data-theme="…">. */
function dataTheme(page) {
  return page.evaluate(() => document.documentElement.dataset.theme ?? "");
}

/**
 * The semantic markup under test: the whole <body> MINUS the demo-chrome Usage
 * panel (#intent-panel). The panel legitimately mutates on a switch (theme/
 * density button aria-pressed, the generated-code box), so it is excluded; what
 * remains is the themed semantic content, which a theme switch must NOT touch.
 */
function semanticMarkup(page) {
  return page.evaluate(() => {
    const clone = document.body.cloneNode(true);
    clone.querySelector("#intent-panel")?.remove();
    return clone.innerHTML;
  });
}

/** Move the hue slider to `deg` and let the panel write `--brand-color` inline. */
function setHue(page, deg) {
  return page.evaluate((deg) => {
    const el = document.getElementById("color-h");
    el.value = String(deg);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, deg);
}

/**
 * Click a theme button in the Usage panel's `theme` control row — a
 * fieldset[role="group"] with the accessible name "Theme", reusing the density
 * toggle's button pattern. Asserts the button exists so a missing control row
 * fails with a clear message instead of a click timeout.
 */
async function selectTheme(page, name) {
  const btn = page
    .getByRole("group", { name: "Theme" })
    .getByRole("button", { name });
  assert.equal(
    await btn.count(),
    1,
    `theme control: a single "${name}" button must exist in the ` +
      `fieldset[role="group"] labeled "Theme" (the Usage-panel theme row)`,
  );
  await btn.click();
}

const px = (value) => Number.parseFloat(value);

describe("theme skins — one document, four identities", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
    // The visitor picks a hue first; it must persist across every switch.
    await setHue(page, USER_HUE);
  });

  after(async () => {
    await session.close();
  });

  it("opens on the canvas treatment by default", async () => {
    assert.equal(
      await dataTheme(page),
      "canvas",
      "the page must ship with <html data-theme=\"canvas\"> as the default",
    );
  });

  it("exposes a four-button theme control row in the Usage panel", async () => {
    const group = page.getByRole("group", { name: "Theme" });
    assert.equal(
      await group.count(),
      1,
      'exactly one fieldset[role="group"] named "Theme" must exist',
    );
    for (const name of THEMES) {
      assert.equal(
        await group.getByRole("button", { name }).count(),
        1,
        `the theme row must offer a "${name}" button`,
      );
    }
  });

  it("switches treatment by writing only <html> attributes, never the semantic markup", async () => {
    const baseline = await semanticMarkup(page);

    for (const theme of THEMES) {
      await selectTheme(page, theme);

      assert.equal(
        await dataTheme(page),
        theme,
        `selecting "${theme}" must set <html data-theme="${theme}">`,
      );
      assert.equal(
        await semanticMarkup(page),
        baseline,
        `selecting "${theme}" must not edit any semantic markup — only ` +
          `<html>'s data-theme/density-class/inline --font-scale may change`,
      );
    }
  });

  it("changes the page's identity (fonts + radius) while the chosen hue persists", async () => {
    await selectTheme(page, "canvas");
    const canvasFont = await css(page, "body", "font-family");
    const canvasRadius = await css(page, "article", "border-radius");
    const userColor = await css(page, ":root", "--color-primary");
    assert.notEqual(userColor, "", "--color-primary must resolve for the chosen hue");

    for (const theme of ["bento", "neumorphism", "paper"]) {
      await selectTheme(page, theme);

      assert.notEqual(
        await css(page, "body", "font-family"),
        canvasFont,
        `"${theme}" must override the body font role away from canvas's ` +
          `(requires the inline canvas font roles to move into themes/canvas.css)`,
      );
      assert.notEqual(
        await css(page, "article", "border-radius"),
        canvasRadius,
        `"${theme}" must override the radius scale away from canvas's`,
      );
      assert.equal(
        await css(page, ":root", "--color-primary"),
        userColor,
        `"${theme}" must key color off the persistent --brand-color — the ` +
          `user's hue must survive the switch unchanged`,
      );
    }
  });

  it("neumorphism is the structural showcase: soft radius, paired shadows, compact default", async () => {
    await selectTheme(page, "canvas");
    const canvasRadius = px(await css(page, "article", "border-radius"));

    await selectTheme(page, "neumorphism");

    assert.ok(
      px(await css(page, "article", "border-radius")) > canvasRadius,
      "neumorphism cards must use a softer (larger) radius than canvas",
    );
    assert.notEqual(
      await css(page, "article", "box-shadow"),
      "none",
      "neumorphism cards must carry the paired light/dark box-shadow",
    );
    assert.equal(
      await page.evaluate(() =>
        document.documentElement.classList.contains("compact"),
      ),
      true,
      "selecting neumorphism must sync density to compact (its default)",
    );
    assert.equal(
      await page.getAttribute("#density-compact", "aria-pressed"),
      "true",
      "the density toggle must reflect the compact preset neumorphism set",
    );
  });

  it("paper flattens the page: near-zero radius and no shadows", async () => {
    await selectTheme(page, "canvas");
    const canvasRadius = px(await css(page, "article", "border-radius"));

    await selectTheme(page, "paper");

    assert.ok(
      px(await css(page, "article", "border-radius")) < canvasRadius,
      "paper must crisp the radius down toward a print edge (below canvas)",
    );
    assert.equal(
      await css(page, "article", "box-shadow"),
      "none",
      "paper must flatten the page — cards carry no shadow",
    );
  });

  it("prints the reproduction recipe in the generated-code box", async () => {
    await selectTheme(page, "bento");

    const recipe = await page.evaluate(
      () => document.getElementById("intent-code").textContent,
    );
    assert.match(
      recipe,
      /data-theme="bento"/,
      "the code box must print the <html data-theme=\"…\"> attribute for the active theme",
    );
    assert.match(
      recipe,
      /--brand-color/,
      "the code box must still print the --brand-color the sliders produce",
    );
  });
});
