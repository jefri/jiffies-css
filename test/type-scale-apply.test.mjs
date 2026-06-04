// Feature test for: type-scale-apply (DR-3)
//
// User story:
//   A site author includes Jiffies CSS v2 with no brand overrides. Heading
//   sizes must use a 1.25 (major-third) modular scale so the h1/h2/h3
//   hierarchy is visible without being oversized. The φ (golden-ratio)
//   claim must no longer appear in the README's type-scale documentation.
//
// Harness: zero-dependency static (grep) verification. Run with `node --test`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sizingPath = join(repoRoot, "v2", "theme", "sizing.css");
const readmePath = join(repoRoot, "README.md");

// zero-out (Phase 0): theme/sizing.css import is commented out and the module
// is reviewed/rewritten in Phase 1; the README is doc-realigned in Phase 6.
// re-enable with theme/sizing (Phase 1 re-enable theme/sizing) + Phase 6 doc-alignment.
test.skip("--font-scale is 1.25 (major third) in sizing.css", () => {
  const css = readFileSync(sizingPath, "utf8");
  assert.match(
    css,
    /--font-scale:\s*1\.25/,
    "--font-scale must be 1.25 (major third) per DR-3",
  );
});

// re-enable with theme/sizing (Phase 1 re-enable theme/sizing).
test.skip("sizing.css comment identifies the scale as Major third", () => {
  const css = readFileSync(sizingPath, "utf8");
  assert.match(
    css,
    /--font-scale:\s*1\.25;?\s*\/\*[^*]*Major third/i,
    "--font-scale comment must say 'Major third'",
  );
});

// re-enable with Phase 6 doc-alignment (README realignment).
test.skip("README no longer lists --phi-* constants as the type scale", () => {
  const readme = readFileSync(readmePath, "utf8");
  assert.doesNotMatch(
    readme,
    /--phi-cube|--phi-square|--phi-3-2/,
    "README must not reference golden-ratio phi-ladder constants for type scale",
  );
});

// re-enable with theme/sizing (Phase 1) + Phase 6 doc-alignment (README realignment).
test.skip("README typography section references --font-scale", () => {
  const readme = readFileSync(readmePath, "utf8");
  assert.match(
    readme,
    /--font-scale/,
    "README must document --font-scale as the type-scale control variable",
  );
});
