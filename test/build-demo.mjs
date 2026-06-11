// Regenerates index.html from snippet modules by marker injection.
// For each stories/snippets/<id>.mjs, replaces the content between
// <!-- demo:<id> --> and <!-- /demo:<id> --> with the snippet's `section`
// export and writes index.html in place.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(ROOT, "index.html");

/**
 * Pure injection, separated from I/O so the drift test can run in memory.
 * @param {string} html
 * @param {Map<string, string>} snippets - map of id -> section HTML string
 * @returns {string}
 */
export function injectSnippets(html, snippets) {
  let result = html;
  for (const [id, section] of snippets) {
    const startTag = `<!-- demo:${id} -->`;
    const endTag = `<!-- /demo:${id} -->`;
    const startIdx = result.indexOf(startTag);
    const endIdx = result.indexOf(endTag);
    if (startIdx === -1 || endIdx === -1) continue;
    // Detect indentation from the whitespace before the closing marker.
    const lineStart = result.lastIndexOf("\n", endIdx) + 1;
    const indent = result.slice(lineStart, endIdx);
    result =
      result.slice(0, startIdx + startTag.length) +
      "\n" +
      section +
      "\n" +
      indent +
      result.slice(endIdx);
  }
  return result;
}

async function main() {
  const html = readFileSync(INDEX, "utf-8");
  const snippetsDir = join(ROOT, "stories", "snippets");
  const files = readdirSync(snippetsDir).filter((f) => f.endsWith(".mjs"));
  const snippets = new Map();
  for (const file of files) {
    const id = file.replace(/\.mjs$/, "");
    const mod = await import(pathToFileURL(join(snippetsDir, file)));
    snippets.set(id, mod.section);
  }
  const result = injectSnippets(html, snippets);
  writeFileSync(INDEX, result);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
