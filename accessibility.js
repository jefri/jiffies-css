function tabChange(event) {
  [
    ...document.querySelectorAll(
      `input[type="radio"][name="${event.target.name}"]`
    ),
  ].forEach(setTab);
}

function setTab(radio) {
  let node = radio;
  while (node.getAttribute("role") != "tab") node = node.parentNode;
  node.setAttribute("aria-selected", radio.checked ?? false);
}

document.addEventListener("DOMContentLoaded", () => {
  [...document.querySelectorAll('[role="tab"] input[type="radio"]')].forEach(
    (tab) => {
      tab.addEventListener("change", tabChange);
      setTab(tab);
    }
  );
});
