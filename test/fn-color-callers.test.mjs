// Feature test for: fn-color-callers (§2.3)
//
// User story:
//   A developer looking at functions.css must be able to understand that
//   --fn-color is intentional scaffolding for the upcoming buttons/forms
//   components, not an orphaned variable. No v2 component reads it yet,
//   and that is the expected state until component-buttons is ported.
//
// Harness: zero-dependency static (grep) verification. Run with `node --test`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const v2Dir = join(repoRoot, "v2");
const functionsPath = join(v2Dir, "functions.css");

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

// zero-out (Phase 0): the fns (functions.css) import is commented out and the
// file is rewritten to the M3 generative model in Phase 1, replacing the old
// --fn-color parts API this test asserts.
// re-enable with fns (Phase 1 m3-tonal-palettes / derivation-private-prefix).
test.skip("--fn-color is defined in functions.css", () => {
  const css = readFileSync(functionsPath, "utf8");
  assert.match(
    css,
    /--fn-color:/,
    "--fn-color must be defined in functions.css",
  );
});

// re-enable with fns (Phase 1 m3-tonal-palettes / derivation-private-prefix).
test.skip("functions.css has a scaffolding annotation on --fn-color", () => {
  const css = readFileSync(functionsPath, "utf8");
  assert.match(
    css,
    /Scaffolding.*fn-color|fn-color.*Scaffolding|component-buttons|first consumer/i,
    "--fn-color must have a comment marking it as scaffolding for button/form components",
  );
});

// re-enable with fns (Phase 1 m3-tonal-palettes / derivation-private-prefix).
test.skip("no v2 component reads var(--fn-color)", () => {
  const callers = [];
  for (const { path, text } of readAllCss(v2Dir)) {
    if (path === functionsPath) continue;
    if (/var\(--fn-color[,)]/.test(text)) callers.push(path);
  }
  assert.deepEqual(
    callers,
    [],
    `--fn-color must have no callers until component-buttons is ported:\n${callers.join("\n")}`,
  );
});
