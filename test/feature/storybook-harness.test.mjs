// Feature test: Storybook Test Harness
// Story: .ailly/developer/2026-06-11-A-storybook-harness/feature-test.md
// Design: .ailly/developer/2026-06-11-A-storybook-harness/design.md
//
// Shared snippet modules are the single source of component markup, feeding
// the Storybook explorer, the Vitest browser-mode VR suite, and the
// regenerated index.html. This test walks that maintainer workflow
// end-to-end and fails until the harness exists.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// The 19 component demo sections of index.html. The 3 chrome sections
// (overview, usage, intent-panel) stay authored in index.html directly.
const COMPONENT_IDS = [
  "color-swatches",
  "headings",
  "formatting",
  "lists",
  "buttons",
  "forms",
  "form-switch",
  "tables",
  "accordion",
  "tabs",
  "modal",
  "property-sheet",
  "progress",
  "form-group",
  "card-panel",
  "hero-page",
  "navigation",
  "breadcrumb",
  "utilities",
];

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf-8",
    timeout: opts.timeout ?? 5 * 60 * 1000,
    ...opts,
  });
  return result;
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

test("snippets feed Storybook, the VR suite, and index.html without drift", async (t) => {
  // Phase 1 — coverage parity: every component section has a snippet
  // module exporting `section`, a stories file, and committed VR
  // baselines for light and dark.
  await t.test("every component section has a snippet, a story, and baselines", async () => {
    for (const id of COMPONENT_IDS) {
      const snippetPath = join(ROOT, "stories", "snippets", `${id}.mjs`);
      assert.ok(existsSync(snippetPath), `missing snippet module stories/snippets/${id}.mjs`);

      const snippet = await import(pathToFileURL(snippetPath));
      assert.equal(
        typeof snippet.section,
        "string",
        `stories/snippets/${id}.mjs must export a \`section\` string`
      );
      assert.ok(
        snippet.section.includes(`<section id="${id}"`),
        `snippet \`section\` for ${id} must reproduce <section id="${id}">`
      );

      const storyPath = join(ROOT, "stories", `${id}.stories.mjs`);
      assert.ok(existsSync(storyPath), `missing stories file stories/${id}.stories.mjs`);
    }

    const screenshotsDir = join(ROOT, "test", "vr", "__screenshots__");
    assert.ok(existsSync(screenshotsDir), "missing committed baselines at test/vr/__screenshots__/");
    const baselines = [...walk(screenshotsDir)].filter((p) => p.endsWith(".png"));
    for (const id of COMPONENT_IDS) {
      for (const scheme of ["light", "dark"]) {
        assert.ok(
          baselines.some((p) => p.includes(id) && p.includes(scheme)),
          `missing committed ${scheme} VR baseline for ${id}`
        );
      }
    }
  });

  // Phase 2 — no drift: index.html carries marker comments for every
  // component section, and regenerating it from the snippets is
  // byte-identical to the committed file.
  await t.test("demo:build regenerates index.html byte-identically", () => {
    const indexPath = join(ROOT, "index.html");
    const committed = readFileSync(indexPath, "utf-8");

    for (const id of COMPONENT_IDS) {
      assert.ok(committed.includes(`<!-- demo:${id} -->`), `index.html missing <!-- demo:${id} --> marker`);
      assert.ok(committed.includes(`<!-- /demo:${id} -->`), `index.html missing <!-- /demo:${id} --> marker`);
    }

    try {
      const build = run("npm", ["run", "demo:build"]);
      assert.equal(build.status, 0, `demo:build failed:\n${build.stderr}`);
      const regenerated = readFileSync(indexPath, "utf-8");
      assert.equal(regenerated, committed, "regenerated index.html drifted from the committed file");
    } finally {
      writeFileSync(indexPath, committed);
    }
  });

  // Phase 3 — visual regression: the Vitest browser-mode suite asserts
  // every fragment against its committed light and dark baselines.
  await t.test("the VR suite passes against committed baselines", () => {
    const vr = run("npm", ["run", "test:vr"], { timeout: 3 * 60 * 1000 });
    assert.equal(vr.status, 0, `test:vr failed:\n${vr.stdout}\n${vr.stderr}`);
  });

  // Phase 4 — explorer: a Storybook build indexes at least one story per
  // component.
  await t.test("storybook build indexes a story for every component", () => {
    const build = run("npm", ["run", "storybook:build"], { timeout: 10 * 60 * 1000 });
    assert.equal(build.status, 0, `storybook:build failed:\n${build.stderr}`);

    const indexJsonPath = join(ROOT, "storybook-static", "index.json");
    assert.ok(existsSync(indexJsonPath), "storybook build produced no index.json");
    const index = JSON.parse(readFileSync(indexJsonPath, "utf-8"));
    const entries = Object.values(index.entries ?? {});
    for (const id of COMPONENT_IDS) {
      assert.ok(
        entries.some((entry) => entry.id === id || entry.id.startsWith(`${id}--`)),
        `storybook index has no story for ${id}`
      );
    }
  });
});
