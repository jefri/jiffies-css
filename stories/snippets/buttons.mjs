// Snippet module contract: named exports are HTML-string fragments.
// `section` reproduces the committed <section id="buttons">...</section> markup
// exactly, including indentation. Running demo:build with this module must
// produce a byte-identical index.html.

/** The plain-button row (primary variants). */
export const standard = `        <button>Button</button>
        <input type="submit" value="Submit" />
        <input type="button" value="Input" />
        <input type="reset" value="Reset" />
        <a role="button">Link</a>`;

/** Full <section id="buttons">…</section> matching the committed index.html. */
export const section = `      <section id="buttons">
        <h1>Buttons</h1>
        <p>
          Button elements, links with <code>role="button"</code>, and input
          elements should all render exactly the same.
        </p>

        <h2>Primary</h2>
        <button>Button</button>
        <input type="submit" value="Submit" />
        <input type="button" value="Input" />
        <input type="reset" value="Reset" />
        <a role="button">Link</a>

        <h2>Secondary</h2>
        <p>
          Adding a <code>secondary</code> class reads the tonal container pair.
        </p>
        <button class="secondary">Button</button>
        <input type="submit" value="Submit" class="secondary" />
        <input type="button" value="Input" class="secondary" />
        <a role="button" class="secondary">Link</a>

        <h2>Contrast</h2>
        <p>Adding a <code>contrast</code> class.</p>
        <button class="contrast">Button</button>
        <input type="submit" value="Submit" class="contrast" />
        <input type="button" value="Input" class="contrast" />
        <a role="button" class="contrast">Link</a>

        <h2>Outline</h2>
        <p>
          Adding an <code>outline</code> class creates outlined buttons with no
          background.
        </p>
        <button class="outline">Button</button>
        <input type="reset" value="Reset" class="outline" />
        <input type="submit" value="Submit" class="contrast outline" />

        <h2>States</h2>
        <p>Disabled and busy (loading) states.</p>
        <button disabled>Disabled</button>
        <button aria-disabled="true">aria-disabled</button>
        <button aria-busy="true">Loading</button>
      </section>`;
