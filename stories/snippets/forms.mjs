// Snippet module: forms
export const section = `      <section id="forms">
        <h1>Forms</h1>
        <form onsubmit="event.preventDefault(); return false;">
          <fieldset style="--grid-column-count: 3">
            <legend>Account</legend>
            <label>
              Text Input <input type="text" placeholder="Text Input" />
            </label>
            <label>
              Password
              <input type="password" placeholder="Password" />
            </label>
            <label>
              URL
              <input type="url" placeholder="http://www.example.com" />
            </label>
            <label>
              Email Address
              <input type="email" placeholder="email@example.com" />
            </label>
            <label>
              Phone Number <input type="tel" placeholder="123-123-1234" />
            </label>
            <label> Search <input type="search" placeholder="Search" /> </label>
            <label> Number <input type="number" placeholder="Number" /> </label>
            <label>
              Select
              <select>
                <option>Option One</option>
                <option>Option Two</option>
                <option>Option Three</option>
              </select>
            </label>
            <div>
              <label>
                <input name="checkboxA" type="checkbox" checked="checked" />
                Choice A
              </label>
              <label>
                <input name="checkboxB" type="checkbox" /> Choice B
              </label>
            </div>
            <div>
              <label>
                <input name="radio" type="radio" checked="checked" />
                Option 1
              </label>
              <label><input name="radio" type="radio" />Option 2</label>
            </div>
            <label>
              Textarea
              <textarea rows="5" cols="30" placeholder="Message"></textarea>
            </label>
          </fieldset>
          <input type="button" value="Button" />
          <input type="submit" value="Submit" />
          <input type="reset" value="Reset" />
          <button>Button element</button>
        </form>

        <h2>States</h2>
        <p>
          Validity and editability are read from ARIA and native attributes, not
          classes.
        </p>
        <form onsubmit="event.preventDefault(); return false;">
          <fieldset style="--grid-column-count: 4">
            <legend>Form States</legend>
            <label>
              Valid
              <input type="text" placeholder="Valid" aria-invalid="false" />
            </label>
            <label>
              Invalid
              <input type="text" placeholder="Invalid" aria-invalid="true" />
            </label>
            <label>
              Disabled
              <input type="text" placeholder="Disabled" disabled />
            </label>
            <label>
              Readonly
              <input type="text" value="Readonly" readonly />
            </label>
          </fieldset>
        </form>
      </section>`;
