// Snippet module: form-group
export const section = `      <section id="form-group">
        <h1>Form group</h1>
        <p>
          A <code>fieldset[role=group]</code> joins adjacent controls into one
          segmented row.
        </p>
        <form onsubmit="event.preventDefault(); return false;">
          <fieldset role="group" aria-label="Search the site">
            <input type="search" placeholder="Search" />
            <button>Go</button>
          </fieldset>
          <fieldset role="group" aria-label="Add a value">
            <input type="text" placeholder="Value" />
            <select>
              <option>kg</option>
              <option>lb</option>
            </select>
            <button>Add</button>
          </fieldset>
        </form>
      </section>`;
