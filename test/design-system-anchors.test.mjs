// Acceptance guard for: design-system-rewrite (design.md Metrics §1)
//
// User story:
//   A contributor follows a `Ref §4.1`-style pointer from TASKS.md into
//   design_system.md and lands on a real section. The aspirational spec's
//   section numbers are stable identifiers; every design_system §-reference in
//   TASKS.md must resolve to a heading that actually exists in the doc.
//
//   This stands in for the (author-skipped) feature test: it mechanically
//   verifies anchor integrity, the one objective metric in the design doc.
//
// Harness: zero-dependency static (grep) verification. Run with `node --test`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const tasksPath = join(repoRoot, "docs", "developer", "TASKS.md");
const docPath = join(repoRoot, "design_system.md");

// Section numbers of real headings in design_system.md.
// A heading looks like `## 2 Foundations`, `### 2.3 Color`, `### 4.10 Form group`.
function headingNumbers(markdown) {
  const numbers = new Set();
  for (const line of markdown.split("\n")) {
    const match = /^#{1,6}\s+(\d+(?:\.\d+)*)\b/.exec(line);
    if (match) numbers.add(match[1]);
  }
  return numbers;
}

// Section numbers TASKS.md references that point at design_system.md.
// A §-reference qualified by a filename-like token (one containing a hyphen,
// e.g. `v2-tasks §1.6`) targets another document and is excluded; the
// design_system pointers read `Ref §4.1` / `finish §2.3`.
function designSystemRefs(markdown) {
  const refs = new Set();
  const pattern = /(\S+)?\s*§\s*(\d+(?:\.\d+)*)/g;
  let match;
  while ((match = pattern.exec(markdown))) {
    const preceding = match[1] ?? "";
    if (preceding.includes("-")) continue; // cross-doc ref, e.g. v2-tasks
    refs.add(match[2]);
  }
  return refs;
}

test("TASKS.md contains design_system §-references to check", () => {
  const tasks = readFileSync(tasksPath, "utf8");
  assert.ok(
    designSystemRefs(tasks).size > 0,
    "expected at least one design_system §-reference in TASKS.md",
  );
});

test("every design_system §-reference in TASKS.md resolves to a heading", () => {
  const tasks = readFileSync(tasksPath, "utf8");
  const doc = readFileSync(docPath, "utf8");
  const headings = headingNumbers(doc);
  const missing = [...designSystemRefs(tasks)].filter(
    (ref) => !headings.has(ref),
  );
  assert.deepEqual(
    missing,
    [],
    `TASKS.md references sections design_system.md has no heading for: ${missing
      .map((ref) => `§${ref}`)
      .join(", ")}`,
  );
});
