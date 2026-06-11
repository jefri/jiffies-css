// Visual regression suite — mounts each snippet section and asserts against
// committed light/dark baselines. Color scheme is switched per-test via CDP
// (Emulation.setEmulatedMedia) so scheme names are explicit and deterministic.

import { test, expect } from "vitest";
import { page, cdp } from "vitest/browser";

import "../../v2/index.css";

const COMPONENT_IDS = [
  "color-swatches",
  "headings",
  "formatting",
  "lists",
  "buttons",
  "forms",
  "form-switch",
  "tables",
  "accordion",
  "tabs",
  "modal",
  "property-sheet",
  "progress",
  "form-group",
  "card-panel",
  "hero-page",
  "navigation",
  "breadcrumb",
  "utilities",
];

const SAMPLER_IDS = new Set(["buttons", "card-panel", "forms"]);
const SKINS = ["canvas", "paper", "bento", "neumorphism"];
const SCHEMES = /** @type {const} */ (["light", "dark"]);

const snippetModules = import.meta.glob("../../stories/snippets/*.mjs");

async function getSection(id) {
  const loader = snippetModules[`../../stories/snippets/${id}.mjs`];
  if (!loader) throw new Error(`No snippet module for id: ${id}`);
  const mod = await loader();
  return mod.section;
}

async function setScheme(scheme) {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: scheme }],
  });
  // Wait two frames for styles to recompute and layout to settle.
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
}

async function mount(html, theme = "canvas") {
  document.documentElement.setAttribute("data-theme", theme);
  document.body.innerHTML = `<main><div class="vr-target" style="width:960px;box-sizing:border-box">${html}</div></main>`;
  const el = document.querySelector(".vr-target");
  // Wait for images to load or fail so layout is stable before capture.
  const imgs = [...el.querySelectorAll("img")];
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          })
    )
  );
  return page.elementLocator(el);
}

for (const scheme of SCHEMES) {
  for (const id of COMPONENT_IDS) {
    test(`${id} — ${scheme}`, async () => {
      await setScheme(scheme);
      const section = await getSection(id);
      const el = await mount(section);
      await expect(el).toMatchScreenshot(`${id}-${scheme}.png`, {
        comparatorOptions: { allowedMismatchedPixelRatio: 0.02 },
        screenshotOptions: { scale: "css" },
      });
    });

    if (SAMPLER_IDS.has(id)) {
      for (const skin of SKINS) {
        test(`${id} — ${skin} — ${scheme}`, async () => {
          await setScheme(scheme);
          const section = await getSection(id);
          const el = await mount(section, skin);
          await expect(el).toMatchScreenshot(`${id}-${skin}-${scheme}.png`, {
            comparatorOptions: { allowedMismatchedPixelRatio: 0.02 },
            screenshotOptions: { scale: "css" },
          });
        });
      }
    }
  }
}
