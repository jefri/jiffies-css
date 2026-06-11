// Snippet module: tabs
export const section = `      <section id="tabs">
        <h1 id="tab-sample-header">Tabs</h1>
        <p>Styling for <code>&lt;section role="tablist"&gt;</code>.</p>
        <section role="tablist" aria-labelledby="tab-sample-header">
          <div role="tab" id="tab-1" aria-controls="tabpanel-1" aria-selected="false">
            <label>
              Tab 1
              <input
                type="radio"
                name="tablist-1"
                aria-controls="tabpanel-1"
                value="tab-1"
              />
            </label>
          </div>
          <div role="tabpanel" id="tabpanel-1" aria-labelledby="tab-1">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque urna diam, tincidunt nec porta sed, auctor id velit.
              Etiam venenatis nisl ut orci consequat, vitae tempus quam commodo.
            </p>
          </div>
          <div role="tab" id="tab-2" aria-controls="tabpanel-2" aria-selected="true">
            <label>
              Tab 2
              <input type="radio" name="tablist-1" value="tab-2" checked />
            </label>
          </div>
          <div role="tabpanel" id="tabpanel-2" aria-labelledby="tab-2">
            <ul>
              <li>Vestibulum id elit quis massa interdum sodales.</li>
              <li>Nunc quis eros vel odio pretium tincidunt nec quis neque.</li>
              <li>Quisque sed eros non eros ornare elementum.</li>
              <li>Cras sed libero aliquet, porta dolor quis, dapibus ipsum.</li>
            </ul>
          </div>
        </section>
      </section>`;
