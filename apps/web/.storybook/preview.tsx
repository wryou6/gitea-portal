import type { Preview } from "@storybook/react";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    a11y: { test: "todo" },
  },
  globalTypes: {
    theme: {
      description: "Portal theme",
      defaultValue: "light",
      toolbar: { icon: "paintbrush", items: ["light", "dark"] },
    },
  },
  decorators: [
    (Story, context) => (
      <div className={context.globals.theme === "dark" ? "dark" : ""}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
