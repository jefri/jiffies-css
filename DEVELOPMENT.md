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

## Storybook authoring workflow

Three commands cover the full authoring loop:

```sh
npm run storybook     # open browser, live-reload on snippet or CSS edits
npm test              # run all node:test and feature tests (including VR)
npm run approve       # re-record VR baselines after intentional visual changes
```

**`npm run storybook`** starts the Storybook dev server on port 6006 and opens
the browser. Editing any file under `stories/snippets/` or `v2/` triggers a
live reload — the Vite dev server tracks the CSS import graph automatically.

**`npm test`** runs the full `node --test` suite. This includes:

- `test/demo-sync.test.mjs` — drift guard: verifies that `demo:build` would
  produce a byte-identical `index.html` from the committed snippet modules.
- `test/feature/storybook-harness.test.mjs` — end-to-end feature test that
  verifies all four phases (snippets, drift, VR, Storybook build).

**`npm run approve`** re-records the Vitest browser VR baselines under
`test/vr/__screenshots__/`. Run this after an intentional visual change, review
the PNG diffs in git, then commit the updated baselines.

### Adding a story

When adding a new component section:

1. Create `stories/snippets/<id>.mjs` and export `section` (the full
   `<section id="<id>">` markup) and any variant fragments.
2. Wrap the section in `index.html` with `<!-- demo:<id> -->` and
   `<!-- /demo:<id> -->` markers.
3. Create `stories/<id>.stories.mjs` with `export default { title: '<id>' }`
   and at least one `Section` story.
4. Run `npm run approve` to record the VR baselines.
5. Run `npm test` to confirm the feature test passes.

### Snippet ↔ index.html contract

`demo:build` (`npm run demo:build`) re-generates `index.html` by injecting each
snippet's `section` export between its marker pair. The drift test asserts the
output is byte-identical to the committed file. **The snippet is the source of
truth**; never edit the section inside `index.html` directly — edit the snippet
module and run `demo:build` instead.

The `storybook` dev server watches `stories/snippets/` and automatically runs
the equivalent of `demo:build` on every snippet save, so `index.html` is always
in sync while `npm run storybook` is running.
