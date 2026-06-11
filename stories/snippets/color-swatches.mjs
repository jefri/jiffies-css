// Snippet module: color-swatches
export const section = `      <section id="color-swatches">
        <h1>Color</h1>
        <p>
          The scheme derives from one <code>--brand-color</code>: five key
          palettes plus a fixed error, each a tonal ramp, assigned to semantic
          role tokens with light/dark mappings.
        </p>
        <style>
          #color-swatches .swatch-grid {
            display: grid;
            grid-template-columns: repeat(
              var(--grid-column-count, 5),
              minmax(0, 1fr)
            );
            gap: 0.25rem;
          }
          #color-swatches .swatch-grid > p {
            margin: 0;
            padding: 0.75rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            border: 1px solid var(--color-outline, currentColor);
          }
          #color-swatches .tonal-ramp {
            --grid-column-count: 7;
          }
        </style>

        <h2>Semantic roles</h2>
        <div class="swatch-grid">
          <p style="background-color: var(--color-primary); color: var(--color-on-primary)">Primary</p>
          <p style="background-color: var(--color-secondary); color: var(--color-on-secondary)">Secondary</p>
          <p style="background-color: var(--color-tertiary); color: var(--color-on-tertiary)">Tertiary</p>
          <p style="background-color: var(--color-error); color: var(--color-on-error)">Error</p>
          <p style="background-color: var(--color-surface); color: var(--color-on-surface)">Surface</p>
          <p style="background-color: var(--color-surface-variant); color: var(--color-on-surface-variant)">Surface variant</p>
          <p style="background-color: var(--color-primary-container); color: var(--color-on-primary-container)">Primary container</p>
          <p style="background-color: var(--color-secondary-container); color: var(--color-on-secondary-container)">Secondary container</p>
          <p style="background-color: var(--color-tertiary-container); color: var(--color-on-tertiary-container)">Tertiary container</p>
          <p style="background-color: var(--color-error-container); color: var(--color-on-error-container)">Error container</p>
        </div>

        <h2>Primary tonal palette</h2>
        <div class="swatch-grid tonal-ramp">
          <p style="background-color: var(--_p-10); color: var(--_p-90)">10</p>
          <p style="background-color: var(--_p-20); color: var(--_p-90)">20</p>
          <p style="background-color: var(--_p-40); color: var(--_p-100)">40</p>
          <p style="background-color: var(--_p-60); color: var(--_p-100)">60</p>
          <p style="background-color: var(--_p-80); color: var(--_p-10)">80</p>
          <p style="background-color: var(--_p-90); color: var(--_p-10)">90</p>
          <p style="background-color: var(--_p-100); color: var(--_p-10)">100</p>
        </div>
      </section>`;
