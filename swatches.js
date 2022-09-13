/// <reference path="./jiffies.d.ts" />
const jiffies = require("jiffies");
const { range } = jiffies.range;
const { main, section, div, h2 } = jiffies.dom.html;

const Swatch = () => div({ class: "grid" }, ...range(0, 36).map(() => div()));

document.body.append(
  main(
    ...[
      ["Grey Hue", "grey"],
      ["Primary Hue", "color-primary"],
      ["Secondary Hue", "color-secondary"],
      ["Accent Hue", "color-accent"],
    ].map(([h, hue]) =>
      section({ style: { "--hue": `var(--${hue}-hue)` } }, h2(h), Swatch())
    )
  ),
  main(...range(0, 6).map(() => section(Swatch())))
);
