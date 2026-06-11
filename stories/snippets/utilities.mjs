// Snippet module: utilities
export const section = `      <section id="utilities">
        <h1>Utilities</h1>
        <p>
          Class-based helpers in the <code>utility</code> layer:
          <code>.flex</code> / <code>.row</code> / <code>.inline</code> /
          <code>.flex-{0-4}</code> / <code>.justify-*</code> /
          <code>.align-*</code>, and <code>.grid</code> driven by the
          <code>--grid-column-count</code> dial.
        </p>

        <h2>Flex row — justify &amp; align</h2>
        <div class="flex row justify-between align-center">
          <button>Left</button>
          <button class="secondary">Middle</button>
          <button class="outline">Right</button>
        </div>

        <h2>Flex grow steps</h2>
        <div class="flex row">
          <div class="flex-1" style="background-color: var(--color-primary-container); color: var(--color-on-primary-container); padding: var(--size-small)">.flex-1</div>
          <div class="flex-2" style="background-color: var(--color-secondary-container); color: var(--color-on-secondary-container); padding: var(--size-small)">.flex-2 (2× share)</div>
          <div class="flex-0" style="background-color: var(--color-tertiary-container); color: var(--color-on-tertiary-container); padding: var(--size-small)">.flex-0 (holds size)</div>
        </div>

        <h2>Grid — 3-column override</h2>
        <div class="grid" style="--grid-column-count: 3">
          <div style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant); padding: var(--size-base)">1</div>
          <div style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant); padding: var(--size-base)">2</div>
          <div style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant); padding: var(--size-base)">3</div>
          <div style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant); padding: var(--size-base)">4</div>
          <div style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant); padding: var(--size-base)">5</div>
          <div style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant); padding: var(--size-base)">6</div>
        </div>
      </section>`;
