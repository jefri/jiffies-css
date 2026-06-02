// Feature test for: spacing-typography-vars
// Design: docs/developer/2026-06-02-A-spacing-typography-vars/design.md
//
// User story:
//   A site author includes Jiffies CSS v2 with no brand overrides. The
//   hgroup margin-bottom and nav li horizontal padding must resolve to a
//   defined value (8px, --size-base) instead of silently falling through to
//   the initial value (0), because the Intent-tier tokens they read are now
//   defined in the sizing theme.
//
// Harness: zero-dependency static (grep) verification. Run with `node --test`.
// Encodes the design's "zero undefined reads" and "definition beside existing
// --spacing-block-* tokens" metrics.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const v2Dir = join(repoRoot, "v2");
const sizingPath = join(v2Dir, "theme", "sizing.css");

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

const TOKENS = [
  "--spacing-typography-vertical",
  "--spacing-typography-horizontal",
];

test("tokens are defined in v2/theme/sizing.css", () => {
  const css = readFileSync(sizingPath, "utf8");
  for (const token of TOKENS) {
    assert.match(
      css,
      new RegExp(`${token}:`),
      `${token} must be defined in sizing.css`,
    );
  }
});

test("every reference to spacing-typography tokens in v2 has a definition", () => {
  const allFiles = readAllCss(v2Dir);
  const definitions = new Set();
  const references = [];

  for (const { path, text } of allFiles) {
    for (const token of TOKENS) {
      if (new RegExp(`${token}:`).test(text)) definitions.add(token);
      const varPattern = new RegExp(`var\\(${token}[,)]`);
      if (varPattern.test(text)) references.push({ path, token });
    }
  }

  const undefined_ = references.filter((r) => !definitions.has(r.token));
  assert.deepEqual(
    undefined_,
    [],
    `undefined spacing-typography token references remain:\n${undefined_.map((r) => `  ${r.path} uses ${r.token}`).join("\n")}`,
  );
});

test("sizing.css defines the tokens beside the existing --spacing-block-* definitions", () => {
  const css = readFileSync(sizingPath, "utf8");
  const blockIdx = css.indexOf("--spacing-block-");
  const vertIdx = css.indexOf("--spacing-typography-vertical:");
  const horizIdx = css.indexOf("--spacing-typography-horizontal:");

  assert.ok(blockIdx !== -1, "--spacing-block-* must exist in sizing.css");
  assert.ok(
    vertIdx !== -1,
    "--spacing-typography-vertical must be defined in sizing.css",
  );
  assert.ok(
    horizIdx !== -1,
    "--spacing-typography-horizontal must be defined in sizing.css",
  );
  assert.ok(
    Math.abs(vertIdx - blockIdx) < 500,
    "--spacing-typography-vertical should appear near --spacing-block-* definitions",
  );
});

test("tokens resolve to --size-base", () => {
  const css = readFileSync(sizingPath, "utf8");
  for (const token of TOKENS) {
    assert.match(
      css,
      new RegExp(`${token}:\\s*var\\(--size-base\\)`),
      `${token} must resolve to var(--size-base)`,
    );
  }
});
