// Snippet module: form-switch
export const section = `      <section id="form-switch">
        <h1>Form switch</h1>
        <p>
          A pure-CSS toggle: a checkbox or radio painted as a sliding switch.
        </p>
        <form onsubmit="event.preventDefault(); return false;">
          <label>
            <input
              type="checkbox"
              role="switch"
              name="switch"
              checked="checked"
            />
            Switch on (checkbox)
          </label>
          <label>
            <input type="checkbox" role="switch" name="switch2" />
            Switch off (checkbox)
          </label>
          <label>
            <input type="checkbox" role="switch" name="switch3" disabled />
            Switch disabled
          </label>
          <label>
            <input type="radio" role="switch" name="switch-radio" checked />
            Switch (radio)
          </label>
        </form>
      </section>`;
