// Feature test for: responsive-fonts (§2.2)
//
// User story:
//   A site author includes Jiffies CSS v2 with no brand overrides. Base
//   font size must scale across all six breakpoints (12/14/16/18/20/24px)
//   so text is readable on small screens and comfortable on wide displays.
//   Each breakpoint's --base-font-size must be explicitly set so the
//   README's responsive table matches the actual cascade.
//
// Harness: zero-dependency static (grep) verification. Run with `node --test`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sizingPath = join(repoRoot, "v2", "theme", "sizing.css");

// Each entry: [breakpoint label, media query min-width, expected font-size]
// xs is the default root block (no media query).
const LADDER = [
  ["xs (default)", null, "12px"],
  ["sm (425px)", "425px", "14px"],
  ["md (768px)", "768px", "16px"],
  ["lg (1024px)", "1024px", "18px"],
  ["xl (1440px)", "1440px", "20px"],
  ["4k (2560px)", "2560px", "24px"],
];

test("all six breakpoints define --base-font-size", () => {
  const css = readFileSync(sizingPath, "utf8");
  for (const [label, minWidth, fontSize] of LADDER) {
    if (minWidth === null) {
      // xs: look for the definition in the root block before any media query
      const rootSection = css.slice(0, css.indexOf("@media"));
      assert.match(
        rootSection,
        new RegExp(`--base-font-size:\\s*${fontSize}`),
        `xs default --base-font-size must be ${fontSize}`,
      );
    } else {
      // Find the media query block for this breakpoint
      const mediaIdx = css.indexOf(`min-width: ${minWidth}`);
      assert.ok(
        mediaIdx !== -1,
        `@media (min-width: ${minWidth}) block must exist for ${label}`,
      );
      const blockStart = css.indexOf("{", mediaIdx);
      const blockEnd = css.indexOf("}", blockStart) + 1;
      const block = css.slice(blockStart, blockEnd);
      assert.match(
        block,
        new RegExp(`--base-font-size:\\s*${fontSize}`),
        `${label} block must set --base-font-size: ${fontSize}`,
      );
    }
  }
});

test("README responsive table documents 12px at xs and 14px at sm", () => {
  const readmePath = join(repoRoot, "README.md");
  const readme = readFileSync(readmePath, "utf8");
  assert.match(readme, /xs.*12px/, "README table must show 12px at xs");
  assert.match(readme, /sm.*14px/, "README table must show 14px at sm");
});

test("README responsive table uses 425px as the sm breakpoint (matches code)", () => {
  const readmePath = join(repoRoot, "README.md");
  const readme = readFileSync(readmePath, "utf8");
  assert.match(
    readme,
    /\|\s*sm\s*\|\s*425px/,
    "README sm breakpoint must be 425px to match sizing.css",
  );
});
