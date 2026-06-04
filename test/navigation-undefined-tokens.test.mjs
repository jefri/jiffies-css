// Feature test for: navigation-undefined-tokens
// Design: docs/developer/2026-06-02-A-navigation-undefined-tokens/design.md
//
// User story (Phase 4 rewrite):
//   A developer includes Jiffies CSS v2 on a page with no customization. The
//   navigation component no longer bridges the seven legacy aliases
//   (--brand-primary-color / --color-primary-hover / --color-accent / ...).
//   Instead the rewritten navigation.css reads the M3 --color-* role tokens
//   directly (--color-primary, --color-on-surface, --color-surface-variant),
//   which are defined upstream in v2/theme/colors.css. Every color the nav
//   component references must therefore still resolve to a defined token rather
//   than falling through to a CSS initial value.
//
// Harness: zero-dependency static (grep) verification. Run with `node --test`.

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

// The M3 role tokens the rewritten navigation.css is allowed to consume for
// color. These are defined in v2/theme/colors.css.
const COLOR_ROLES = [
  "--color-primary",
  "--color-on-surface",
  "--color-surface-variant",
];

// The legacy bridge aliases that the Phase 4 rewrite DROPS. None of these may
// be defined in navigation.css :root anymore.
const DROPPED_ALIASES = [
  "--brand-primary-color",
  "--color-primary-hover",
  "--color-accent",
  "--font-size-larger",
  "--header-nav-color",
  "--header-nav-background-color",
];

test("navigation.css reads the M3 --color-* role tokens directly", () => {
  const css = readFileSync(navPath, "utf8");
  for (const role of COLOR_ROLES) {
    assert.match(
      css,
      new RegExp(`var\\(${role}[,)]`),
      `${role} must be read directly by navigation.css`,
    );
  }
});

test("navigation.css no longer defines the dropped legacy bridge aliases", () => {
  const css = readFileSync(navPath, "utf8");
  for (const alias of DROPPED_ALIASES) {
    assert.doesNotMatch(
      css,
      new RegExp(`${alias}\\s*:`),
      `${alias} must not be (re)defined in navigation.css — it was dropped`,
    );
  }
});

test("every --color-* role referenced by navigation.css is defined in v2", () => {
  const allFiles = readAllCss(v2Dir);
  const definitions = new Set();
  for (const { text } of allFiles) {
    for (const role of COLOR_ROLES) {
      if (new RegExp(`${role}\\s*:`).test(text)) definitions.add(role);
    }
  }
  const undefined_ = COLOR_ROLES.filter((role) => {
    const navCss = readFileSync(navPath, "utf8");
    const referenced = new RegExp(`var\\(${role}[,)]`).test(navCss);
    return referenced && !definitions.has(role);
  });
  assert.deepEqual(
    undefined_,
    [],
    `undefined --color-* role references remain:\n${undefined_
      .map((role) => `  navigation.css uses ${role} with no definition`)
      .join("\n")}`,
  );
});
