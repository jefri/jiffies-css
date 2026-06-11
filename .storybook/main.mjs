/** @type {import('@storybook/html-vite').StorybookConfig} */
export default {
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  stories: ["../stories/*.stories.mjs"],
  addons: ["@storybook/addon-themes"],
};
