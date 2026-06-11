import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

/**
 * startServer() — starts a node:http static file server bound to a random
 * loopback port, serving files relative to the repo root. Resolves with the
 * listening server instance (call server.address().port for the port, and
 * server.close() to tear down).
 *
 * @returns {Promise<import('node:http').Server>}
 */
export function startServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const filePath = join(repoRoot, url.pathname);
    try {
      const stat = statSync(filePath);
      const target = stat.isDirectory() ? join(filePath, "index.html") : filePath;
      const content = readFileSync(target);
      const mime = MIME[extname(target)] ?? "application/octet-stream";
      res.writeHead(200, { "Content-Type": mime });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

/**
 * withPage(options?, fn?) — launches Chromium, starts a node:http static server
 * on a random port serving the repo root, opens index.html, then either:
 *   - if fn is provided: calls fn(page) and tears down both on return or throw
 *   - if fn is omitted: returns { page, close } for use in before/after hooks
 *
 * @param {{ colorScheme?: 'light' | 'dark' } | ((page: import('playwright').Page) => Promise<void>)=} optionsOrFn
 * @param {((page: import('playwright').Page) => Promise<void>)=} fn
 * @returns {Promise<void | { page: import('playwright').Page, close: () => Promise<void> }>}
 */
export async function withPage(optionsOrFn, fn) {
  let options = {};
  if (typeof optionsOrFn === "function") {
    fn = optionsOrFn;
  } else if (optionsOrFn !== undefined) {
    options = optionsOrFn;
  }
  const { colorScheme } = options;

  const server = await startServer();
  const { port } = server.address();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/index.html`);
  if (colorScheme !== undefined) {
    await page.emulateMedia({ colorScheme });
  }

  const close = async () => {
    await browser.close();
    await new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  };

  if (fn !== undefined) {
    try {
      await fn(page);
    } finally {
      await close();
    }
    return;
  }

  return { page, close };
}

/**
 * css(page, selector, property) — evaluates getComputedStyle in the browser
 * and returns the trimmed string value of the given CSS property on the first
 * element matching selector.
 *
 * @param {import('playwright').Page} page
 * @param {string} selector  — CSS selector, must match exactly one element
 * @param {string} property  — CSS property name (may be a custom property)
 * @returns {Promise<string>}
 */
export async function css(page, selector, property) {
  return page.evaluate(
    ({ selector, property }) =>
      window
        .getComputedStyle(document.querySelector(selector))
        .getPropertyValue(property)
        .trim(),
    { selector, property },
  );
}

