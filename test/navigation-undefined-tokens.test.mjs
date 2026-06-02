// Feature test for: navigation-undefined-tokens
// Design: docs/developer/2026-06-02-A-navigation-undefined-tokens/design.md
//
// User story:
//   A developer includes Jiffies CSS v2 on a page with no customization. The
//   navigation component's header background, border, link sizing, and hover
//   states must all resolve to visible, non-zero values instead of silently
//   falling through to CSS initial values, because the seven undefined token
//   references in navigation.css are now bridged to their v2 theme equivalents
//   in the component's own :root block.
//
// Harness: zero-dependency static (grep) verification. Run with `node --test`.
// Encodes the design's "all seven tokens resolve to non-zero values" and
// "no new undefined-token references introduced" metrics.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const v2Dir = join(repoRoot, "v2");
const navPath = join(v2Dir, "component", "navigation.css");

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
  "--color",
  "--color-accent",
  "--color-primary-hover",
  "--color-text",
  "--border-width",
  "--border-style",
  "--font-size-larger",
];

test("all seven bridging aliases are defined in navigation.css :root block", () => {
  const css = readFileSync(navPath, "utf8");
  const rootStart = css.indexOf(":root");
  const rootEnd = css.indexOf("}", rootStart) + 1;
  const rootBlock = css.slice(rootStart, rootEnd);
  for (const token of TOKENS) {
    assert.match(
      rootBlock,
      new RegExp(`${token}:`),
      `${token} must be defined in navigation.css :root block`,
    );
  }
});

test("every reference to the seven tokens in v2 has a definition", () => {
  const allFiles = readAllCss(v2Dir);
  const definitions = new Set();
  const references = [];

  for (const { path, text } of allFiles) {
    for (const token of TOKENS) {
      if (new RegExp(`${token}:`).test(text)) definitions.add(token);
      if (new RegExp(`var\\(${token}[,)]`).test(text))
        references.push({ path, token });
    }
  }

  const undefined_ = references.filter((r) => !definitions.has(r.token));
  assert.deepEqual(
    undefined_,
    [],
    `undefined token references remain:\n${undefined_
      .map((r) => `  ${r.path} uses ${r.token}`)
      .join("\n")}`,
  );
});

test("--color bridges to var(--brand-primary-color)", () => {
  const css = readFileSync(navPath, "utf8");
  assert.match(
    css,
    /--color:\s*var\(--brand-primary-color\)/,
    "--color must resolve to var(--brand-primary-color)",
  );
});

test("--color-accent bridges to oklch derived from brand primitives", () => {
  const css = readFileSync(navPath, "utf8");
  assert.match(
    css,
    /--color-accent:\s*oklch\(calc\(var\(--brand-luminance\)/,
    "--color-accent must resolve to oklch(...) using --brand-luminance",
  );
});

test("--color-primary-hover bridges to color-mix toward white", () => {
  const css = readFileSync(navPath, "utf8");
  assert.match(
    css,
    /--color-primary-hover:\s*color-mix\(in oklab,\s*var\(--brand-primary-color\)/,
    "--color-primary-hover must resolve to color-mix(in oklab, var(--brand-primary-color) ...)",
  );
});

test("--color-text bridges to var(--base-text-color)", () => {
  const css = readFileSync(navPath, "utf8");
  assert.match(
    css,
    /--color-text:\s*var\(--base-text-color\)/,
    "--color-text must resolve to var(--base-text-color)",
  );
});

test("--border-width bridges to var(--base-border-size)", () => {
  const css = readFileSync(navPath, "utf8");
  assert.match(
    css,
    /--border-width:\s*var\(--base-border-size\)/,
    "--border-width must resolve to var(--base-border-size)",
  );
});

test("--border-style bridges to solid", () => {
  const css = readFileSync(navPath, "utf8");
  assert.match(
    css,
    /--border-style:\s*solid/,
    "--border-style must be solid",
  );
});

test("--font-size-larger bridges to calc(base-font-size * font-scale)", () => {
  const css = readFileSync(navPath, "utf8");
  assert.match(
    css,
    /--font-size-larger:\s*calc\(var\(--base-font-size\)\s*\*\s*var\(--font-scale\)\)/,
    "--font-size-larger must resolve to calc(var(--base-font-size) * var(--font-scale))",
  );
});
