// test/computed/contract.test.mjs
//
// SHAPE / ROLE CONTRACT — the classless "DOM + ARIA" rebuttal, enforced.
//
// DESIGN.md's central claim is that the design system keys on element
// shape and ARIA role, NOT on class names, and that this is robust ("not
// brittle") in the LIVE cascade. The component symposium (Marcus) found this
// rebuttal had ZERO test enforcement: nothing actually proved that a role on a
// sectioning element diverts it away from the card surface, that a switch role
// repaints a checkbox, that tab selection is ARIA/`:checked`-driven, or that the
// breadcrumb is selected by its ARIA label rather than a `.breadcrumbs` class.
//
// This file asserts the contract on the LIVE demo index.html via computed
// style, since the cascade (not the source text) is what the contract depends
// on. Each `it` below is one clause of the contract.
//
// All assertions read getComputedStyle through helpers.mjs (`css` for an
// element property, `page.evaluate` for pseudo-elements / class membership).

import { describe, before, after, it } from "node:test";
import assert from "node:assert/strict";
import { withPage, css } from "./helpers.mjs";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

describe("shape/role contract (live cascade)", () => {
  let session;
  let page;

  before(async () => {
    session = await withPage();
    page = session.page;
  });

  after(async () => {
    await session.close();
  });

  // ---------------------------------------------------------------------------
  // CLAUSE 1 — a sectioning element that carries a component ROLE is NOT
  // card-surfaced. card.css guards the panel treatment with `:not([role])`, so
  // `section[role=tablist]` must NOT pick up the surface (background), the card
  // vertical rhythm (margin-block), or the card radius that a bare demo section
  // gets. If the guard regressed, the tablist would be double-styled as a panel
  // AND the margin/background/radius below would match the plain panel.
  // ---------------------------------------------------------------------------
  describe("CLAUSE 1: section[role=tablist] is not card-surfaced", () => {
    const PLAIN = "#card-panel > section";
    const TABLIST = "#tabs section[role='tablist']";

    it("background differs: tablist has no card surface, plain panel does", async () => {
      const tablistBg = await css(page, TABLIST, "background-color");
      const panelBg = await css(page, PLAIN, "background-color");
      // The plain panel is painted with the card surface; the role-bearing
      // tablist is left transparent (it is a component, not a card).
      assert.strictEqual(
        tablistBg,
        TRANSPARENT,
        "tablist should not pick up the card surface background",
      );
      assert.notStrictEqual(
        panelBg,
        TRANSPARENT,
        "plain panel should be surfaced",
      );
      assert.notStrictEqual(
        tablistBg,
        panelBg,
        "tablist background must differ from a plain panel",
      );
    });

    it("margin-block differs: tablist has no card vertical rhythm", async () => {
      const tablistMb = await css(page, TABLIST, "margin-block-start");
      const panelMb = await css(page, PLAIN, "margin-block-start");
      assert.strictEqual(
        tablistMb,
        "0px",
        "tablist should not carry the card margin",
      );
      assert.notStrictEqual(
        panelMb,
        "0px",
        "plain panel should carry the card margin",
      );
      assert.notStrictEqual(tablistMb, panelMb);
    });

    it("border-radius differs: tablist is not clipped to the card radius", async () => {
      const tablistR = await css(page, TABLIST, "border-top-left-radius");
      const panelR = await css(page, PLAIN, "border-top-left-radius");
      assert.strictEqual(
        tablistR,
        "0px",
        "tablist should not carry the card radius",
      );
      assert.notStrictEqual(
        panelR,
        "0px",
        "plain panel should carry the card radius",
      );
      assert.notStrictEqual(tablistR, panelR);
    });
  });

  // ---------------------------------------------------------------------------
  // CLAUSE 2 — a plain sectioning `section` (no role) IS panel-surfaced. This is
  // the positive half of the `:not([role])` guard: the guard must exclude ONLY
  // role-bearing sections, so a bare demo section must have the card surface
  // (background) AND the load-bearing panel outline (border).
  // ---------------------------------------------------------------------------
  describe("CLAUSE 2: plain section IS panel-surfaced", () => {
    const PLAIN = "#card-panel > section";

    it("plain section has the card surface background", async () => {
      const bg = await css(page, PLAIN, "background-color");
      assert.notStrictEqual(bg, TRANSPARENT);
    });

    it("plain section has the load-bearing panel outline", async () => {
      const width = await css(page, PLAIN, "border-top-width");
      const style = await css(page, PLAIN, "border-top-style");
      const color = await css(page, PLAIN, "border-top-color");
      assert.notStrictEqual(width, "0px", "panel must have a visible border");
      assert.strictEqual(style, "solid");
      assert.notStrictEqual(
        color,
        TRANSPARENT,
        "panel border must be a visible color",
      );
    });
  });

  // ---------------------------------------------------------------------------
  // CLAUSE 3 — input[role=switch] renders as a switch: native chrome is removed
  // (appearance:none) and the checked vs unchecked states are VISUALLY distinct
  // (the knob slides + the track recolors). Selection is the native :checked
  // pseudo, reflected through the ARIA role — no class, no JS.
  // ---------------------------------------------------------------------------
  describe("CLAUSE 3: input[role=switch] is a switch, on != off", () => {
    const ON = "#form-switch input[name='switch'][role='switch']";
    const OFF = "#form-switch input[name='switch2'][role='switch']";

    it("native checkbox chrome is removed (appearance:none)", async () => {
      const on = await css(page, ON, "appearance");
      const off = await css(page, OFF, "appearance");
      assert.strictEqual(on, "none");
      assert.strictEqual(off, "none");
    });

    it("track background differs between checked and unchecked", async () => {
      const onTrack = await css(page, ON, "background-color");
      const offTrack = await css(page, OFF, "background-color");
      assert.notStrictEqual(
        onTrack,
        offTrack,
        "checked track must differ from unchecked",
      );
    });

    it("knob position differs between checked and unchecked", async () => {
      // The knob is a ::before; getComputedStyle on the pseudo, in-page.
      const { on, off } = await page.evaluate(
        ({ onSel, offSel }) => {
          const t = (sel) =>
            getComputedStyle(document.querySelector(sel), "::before").translate;
          return { on: t(onSel), off: t(offSel) };
        },
        { onSel: ON, offSel: OFF },
      );
      assert.notStrictEqual(
        on,
        off,
        "checked knob must be translated relative to unchecked",
      );
      // The unchecked knob sits at the start gutter (no horizontal travel).
      assert.match(
        off,
        /^0px/,
        "unchecked knob should start at the gutter (no x-translation)",
      );
    });
  });

  // ---------------------------------------------------------------------------
  // CLAUSE 4 — a selected [role=tab] differs VISUALLY from an unselected one.
  // Selection is carried by `[aria-selected=true]` OR `:has(:checked)` (the
  // no-JS radio path), never a class. The selected tab gets the brand top edge
  // and a stronger text color; the unselected tab has a transparent top edge.
  // ---------------------------------------------------------------------------
  describe("CLAUSE 4: selected [role=tab] differs from unselected", () => {
    const UNSELECTED = "#tab-1"; // [role=tab], its radio is not checked
    const SELECTED = "#tab-2"; // [role=tab] :has(:checked)

    it("selected tab has a visible brand border-top; unselected does not", async () => {
      const selTop = await css(page, SELECTED, "border-top-color");
      const unselTop = await css(page, UNSELECTED, "border-top-color");
      assert.strictEqual(
        unselTop,
        TRANSPARENT,
        "unselected tab top edge should be transparent",
      );
      assert.notStrictEqual(
        selTop,
        TRANSPARENT,
        "selected tab top edge should be the brand color",
      );
      assert.notStrictEqual(selTop, unselTop);
    });

    it("selected tab text color differs from unselected", async () => {
      const selColor = await css(page, SELECTED, "color");
      const unselColor = await css(page, UNSELECTED, "color");
      assert.notStrictEqual(
        selColor,
        unselColor,
        "selected tab should read at a different (stronger) color",
      );
    });

    it("the selection is the ARIA/:checked path, not a class", async () => {
      // The selected tab carries no class; selection comes from its checked radio.
      const hasClass = await page.evaluate(
        (sel) => document.querySelector(sel).className.trim().length > 0,
        SELECTED,
      );
      assert.strictEqual(
        hasClass,
        false,
        "selected tab must not depend on a class name",
      );
    });
  });

  // ---------------------------------------------------------------------------
  // CLAUSE 5 — nav[aria-label="Breadcrumb"] is styled as a breadcrumb (the
  // separator glyph is present between crumbs) and is selected by the ARIA
  // label, NOT a `.breadcrumbs` class. We confirm (a) the live nav carries no
  // such class, (b) it still gets separators, and (c) an injected element with
  // ONLY the `.breadcrumbs` class gets NO separator — proving the class is inert
  // and the label is load-bearing.
  // ---------------------------------------------------------------------------
  describe("CLAUSE 5: breadcrumb is keyed on the ARIA label, not a class", () => {
    const NAV = "nav[aria-label='Breadcrumb']";

    it("the live breadcrumb nav carries no .breadcrumbs class", async () => {
      const hasClass = await page.evaluate(
        (sel) => document.querySelector(sel).classList.contains("breadcrumbs"),
        NAV,
      );
      assert.strictEqual(hasClass, false);
    });

    it("separator glyph is present between crumbs (but not before the first)", async () => {
      const { first, second } = await page.evaluate((sel) => {
        const lis = document.querySelectorAll(`${sel} > ol > li`);
        const sep = (li) => getComputedStyle(li, "::before").content;
        return { first: sep(lis[0]), second: sep(lis[1]) };
      }, NAV);
      // The second crumb gets the marker glyph; the contract's "separators
      // present" clause. The arrow may be returned wrapped in quotes.
      assert.ok(
        second.includes("→") || second.includes("/"),
        `expected a separator glyph on a non-first crumb, got ${second}`,
      );
      // The first crumb must NOT get a leading separator.
      assert.ok(
        !first.includes("→") && !first.includes("/"),
        `first crumb should have no leading separator, got ${first}`,
      );
    });

    it("a bare .breadcrumbs element is inert: no separator, proving the label keys it", async () => {
      const sep = await page.evaluate(() => {
        const nav = document.createElement("nav");
        nav.className = "breadcrumbs"; // class only — NO aria-label
        nav.innerHTML =
          "<ol><li><a href='#a'>A</a></li><li><a href='#b'>B</a></li></ol>";
        document.body.appendChild(nav);
        const li = nav.querySelectorAll("ol > li")[1];
        const content = getComputedStyle(li, "::before").content;
        nav.remove();
        return content;
      });
      // With no aria-label, the breadcrumb rule does not match, so the second
      // crumb gets no separator glyph ("none" or empty string).
      assert.ok(
        !sep.includes("→") && !sep.includes("/"),
        `a .breadcrumbs class alone must NOT produce a separator, got ${sep}`,
      );
    });
  });
});
