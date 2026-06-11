// Drift guard: builds the regenerated document in memory via injectSnippets()
// and asserts strict equality with the committed index.html. Never writes to disk.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, injectSnippets } from "./build-demo.mjs";

test("demo:build round-trip is byte-identical", async () => {
  const html = readFileSync(join(ROOT, "index.html"), "utf-8");
  const snippetsDir = join(ROOT, "stories", "snippets");
  const files = readdirSync(snippetsDir).filter((f) => f.endsWith(".mjs"));
  const snippets = new Map();
  for (const file of files) {
    const id = file.replace(/\.mjs$/, "");
    const mod = await import(pathToFileURL(join(snippetsDir, file)));
    snippets.set(id, mod.section);
  }
  const result = injectSnippets(html, snippets);
  assert.equal(result, html, "demo:build regenerated index.html would differ from committed");
});
