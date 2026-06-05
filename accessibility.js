/* Jiffies CSS — progressive-enhancement ARIA helper.
 *
 * Optional script. The pure-CSS tabs already work without it: each [role=tab]
 * wraps a visually-hidden radio whose :checked state drives the connected-tab
 * indicator and the matching [role=tabpanel] via CSS alone. But a [role=tab]
 * strip needs aria-selected reflected for the accessibility tree to MATCH the
 * render. This syncs aria-selected on each [role=tab] from its radio's checked
 * state, on load and on every change.
 *
 * (Native radio-group keyboard navigation already moves + selects within the
 * group; full APG roving-tabindex/arrow-key handling is a future addition.)
 */
function setTab(radio) {
  let node = radio;
  while (node && node.getAttribute("role") !== "tab") node = node.parentNode;
  if (node) node.setAttribute("aria-selected", String(radio.checked ?? false));
}

function tabChange(event) {
  document
    .querySelectorAll('input[type="radio"][name="' + event.target.name + '"]')
    .forEach(setTab);
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll('[role="tab"] input[type="radio"]')
    .forEach((radio) => {
      radio.addEventListener("change", tabChange);
      setTab(radio);
    });
});
