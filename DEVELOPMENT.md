# Jiffies CSS — Development Guide

## Testing

Tests live in `test/` and run with `node --test 'test/**/*.test.mjs'`.

### When to use `node:test` (static)

Static tests read CSS source files directly and assert structural correctness:
token definitions exist, token references are satisfied, bridging aliases point
at the right upstream names. They run in milliseconds with no dependencies
beyond Node itself.

Use a static test when the question is syntactic or structural:

- "Is `--foo` defined in this file?"
- "Does every `var(--foo)` reference have a corresponding definition somewhere in v2?"
- "Does `--border-style` bridge to `solid` in this component's `:root` block?"

### When to use Playwright (computed)

Playwright tests load `index.html` in a real Chromium browser and assert
`getComputedStyle` values on rendered elements. They are slower (browser
launch, HTTP server) and require `playwright install chromium` on each machine.

Use a Playwright test when the question is about the live cascade:

- "Does `nav` actually render with a non-transparent background?"
- "Does `button` have non-zero padding after the full cascade resolves?"
- "Does `article > header` have a background color distinct from `body`?"

Static analysis cannot answer these questions — a token chain can be
syntactically intact while a specificity conflict or a missing `@layer`
import silently overrides the final value.

**Rule of thumb:** reach for a static test first. Add a Playwright test only
when the correctness claim requires a rendered browser context to verify.

## Releasing

`npm run release` — always through npm, never `node scripts/release.mjs`
directly, since npm's own `prerelease` script (`npm test && npm run build`)
is what runs the suite and rebuilds the bundle first; npm runs `prerelease`
automatically before `release` for any `npm run release` invocation, but a
direct `node` call skips it.

Versioning is **CalVer**, matching `@davidsouther/jiffies`:
`<ISO-week-year>.<ISO-week>.<micro>`. `micro` increments if a release
already went out during the current ISO week; otherwise it starts at `0`.
Pass an explicit version to override: `npm run release -- 2026.36.2`.

What it does, after `prerelease` has already run:

1. Confirms the working tree has no changes other than the four
   `jiffies-css-bundle.*` files `prerelease`'s build step just regenerated.
2. Computes the version and writes it into `package.json` **and**
   `package-lock.json` (both the top-level `version` and
   `packages[""].version` — the two npm keeps in sync and which had drifted
   independently before).
3. Commits `package.json`, `package-lock.json`, and the four bundle files as
   `Bump to X.Y.Z`, and tags `vX.Y.Z`.
4. **Always** pushes the commit and tag, and runs `npm publish` — that's the
   point of running this over bumping the version by hand.
