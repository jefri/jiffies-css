// Feature test for: typography-block-vars
// Design: docs/developer/2026-06-02-A-typography-block-vars/design.md
//
// User story:
//   A site author includes Jiffies CSS v2 with no brand overrides. The base
//   typography block must read the same custom-property names it sets, sourced
//   from defined upstream tokens, so that body text renders with the theme's
//   base color, font-family, and weight instead of silently falling through to
//   user-agent defaults.
//
// Harness: zero-dependency static (grep) verification. Run with `node --test`.
// This encodes the design's "no longer appear anywhere" and upstream-source
// metrics. It does not assert the live computed cascade (deliberate scope
// choice for this feature).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const v2Dir = join(repoRoot, "v2");
const blockPath = join(v2Dir, "content", "typography-block.css");
const typographyThemePath = join(v2Dir, "theme", "typography.css");

function readAllCss(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...readAllCss(full));
    } else if (entry.endsWith(".css")) {
      out.push({ path: full, text: readFileSync(full, "utf8") });
    }
  }
  return out;
}

// zero-out (Phase 0): content/typography-block.css and theme/typography.css
// imports are commented out and both modules are reviewed/rewritten in later phases.
// re-enable with content/typography-block (Phase 3) + theme/typography (Phase 1).
test.skip("transposed read names are gone everywhere in v2", () => {
  const badNames = ["--text-color-base", "--font-family-body-base"];
  const offenders = [];
  for (const { path, text } of readAllCss(v2Dir)) {
    for (const name of badNames) {
      if (text.includes(name)) offenders.push(`${path} contains ${name}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `transposed/undefined property names still present:\n${offenders.join("\n")}`,
  );
});

// re-enable with content/typography-block (Phase 3 re-enable content/typography-block).
test.skip("base block reads the local names it sets", () => {
  const css = readFileSync(blockPath, "utf8");
  assert.match(
    css,
    /color:\s*var\(--color-text-base\)/,
    "color must read --color-text-base (the name set on the same rule)",
  );
  assert.match(
    css,
    /font-family:\s*var\(--font-family-body\)/,
    "font-family must read --font-family-body (the name set on the same rule)",
  );
});

// re-enable with theme/typography (Phase 1 re-enable theme/typography).
test.skip("upstream --base-font-weight token is defined in the typography theme", () => {
  const css = readFileSync(typographyThemePath, "utf8");
  assert.match(
    css,
    /--base-font-weight:\s*[^;]+;/,
    "--base-font-weight must be defined so --font-weight-base resolves",
  );
});
