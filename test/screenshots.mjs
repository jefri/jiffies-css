// Standalone screenshot runner — NOT a *.test.mjs file, so `node --test` skips
// it. Drives index.html through Chromium and writes a frame set under
// docs/screenshots/<label>/ for both light and dark color schemes. Each module
// in the rewrite re-runs this with its own label so the series reads as a
// visual changelog. Artifacts, not assertions.
//
//   npm run screenshots -- <label>      (default label: "latest")

import { chromium } from "playwright";
import { startServer, screenshot } from "./computed/helpers.mjs";

const label = process.argv[2] ?? "latest";
const schemes = /** @type {const} */ (["light", "dark"]);

const server = await startServer();
const { port } = server.address();
const browser = await chromium.launch();

const written = [];
try {
  for (const colorScheme of schemes) {
    const page = await browser.newPage();
    await page.emulateMedia({ colorScheme });
    await page.goto(`http://127.0.0.1:${port}/index.html`);

    // Full-page frame for this color scheme.
    written.push(
      await screenshot(page, `${label}/full-page--${colorScheme}`, {
        fullPage: true,
      }),
    );

    // One frame per top-level demo section. index.html lays the demos out as
    // `main > section[id]`; iterate those so each component tracks its own frame.
    const sections = await page.locator("main > section[id]").all();
    for (const section of sections) {
      const id = await section.getAttribute("id");
      await section.scrollIntoViewIfNeeded();
      written.push(
        await screenshot(page, `${label}/${id}--${colorScheme}`, {
          element: section,
        }),
      );
    }

    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
}

for (const path of written) {
  console.log(path);
}
console.log(`\n${written.length} frame(s) written under docs/screenshots/${label}/`);
