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
