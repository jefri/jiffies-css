// Snippet module: card-panel
export const section = `      <section id="card-panel">
        <h1>Card &amp; Panel</h1>
        <p>
          <code>article</code> is the elevated card; <code>section</code> is the
          flat panel. Each may carry header/main/footer rails.
        </p>

        <article>
          <header>
            <h2>Card (article)</h2>
            <p>An elevated surface with header, main, and footer rails.</p>
          </header>
          <main>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
              eu posuere orci. Nulla convallis lectus rutrum quam hendrerit, in
              facilisis elit sollicitudin.
            </p>
          </main>
          <footer>
            <p>Footer content for a card.</p>
            <button>Ok</button>
          </footer>
        </article>

        <section>
          <header>
            <h2>Panel (section)</h2>
          </header>
          <main>
            <p>
              A flat panel surface. Same rail structure as the card, without the
              elevation.
            </p>
          </main>
        </section>

        <!-- HERO inside a card rail (card-scoped: bleeds to card edge, clips
             to --border-radius-card). DESIGN.md › Hero -->
        <article id="hero-card">
          <header>
            <figure>
              <img
                src="https://picsum.photos/seed/jiffies-card/1200/400"
                alt="Decorative banner inside a card header"
              />
              <h2>Card-scoped hero</h2>
            </figure>
          </header>
          <main>
            <p>
              The hero <code>figure</code> sits in a card's header rail. Its
              parent (the <code>article</code>) decides its scale: it bleeds past
              the rail padding and clips to the card radius.
            </p>
          </main>
        </article>
      </section>`;
