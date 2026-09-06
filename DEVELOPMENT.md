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

`npm run release -- <patch|minor|major|X.Y.Z>` (the `--` is required so npm
passes the argument through). It:

1. Refuses to run against a dirty working tree (including untracked files —
   commit or `.gitignore` anything you don't want swept into the release
   commit first).
2. Runs the full test suite (`npm test`); pass `--skip-tests` to bypass this,
   which is never recommended.
3. Computes the new version — a semver bump keyword, or an explicit `X.Y.Z`.
4. Writes it into `package.json` **and** `package-lock.json` (both the
   top-level `version` and `packages[""].version` — the two npm keeps in
   sync and which had drifted independently before).
5. Rebuilds the published bundle (`sh build.sh`) so the checked-in
   `jiffies-css-v2-bundle.*` artifacts match the new version's source.
6. Commits exactly those files as `Bump to X.Y.Z` and tags `vX.Y.Z`.

It stops there by default and prints the two remaining commands. Pushing the
commit/tag and publishing to npm are separate, explicit opt-ins:

```sh
npm run release -- patch          # local commit + tag only
npm run release -- patch --push   # also git push && git push --tags
npm run release -- patch --publish   # also npm publish
```

`--dry-run` prints every command it would run (including the version bump
it would compute) without touching any file or running git.
