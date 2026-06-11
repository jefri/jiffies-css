import "../v2/index.css";
import { withThemeByDataAttribute } from "@storybook/addon-themes";

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      canvas: "canvas",
      paper: "paper",
      bento: "bento",
      neumorphism: "neumorphism",
    },
    defaultTheme: "canvas",
    attributeName: "data-theme",
  }),
];

export const parameters = {
  layout: "fullscreen",
};
