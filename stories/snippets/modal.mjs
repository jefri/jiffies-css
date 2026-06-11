// Snippet module: modal
export const section = `      <section id="modal">
        <h1>Modal</h1>
        <p>Native <code>dialog</code>; often <code>dialog &gt; article</code>.</p>
        <button onclick="document.getElementById('demo-dialog').showModal()">
          Open modal
        </button>
        <!-- Rendered open inline so the screenshot harness captures the surface
             and backdrop without driving JS. -->
        <dialog id="demo-dialog" open aria-labelledby="dialog-title">
          <article>
            <header>
              <h2 id="dialog-title">Modal title</h2>
            </header>
            <main>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. The
                modal reuses the card surface for its body.
              </p>
            </main>
            <footer>
              <button onclick="document.getElementById('demo-dialog').close()">
                Confirm
              </button>
              <button
                class="secondary"
                onclick="document.getElementById('demo-dialog').close()"
              >
                Cancel
              </button>
            </footer>
          </article>
        </dialog>
      </section>`;
