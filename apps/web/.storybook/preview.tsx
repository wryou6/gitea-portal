import type { Preview } from "@storybook/react";
import { I18nextProvider } from "react-i18next";
import { i18n } from "../src/i18n";
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
      <I18nextProvider i18n={i18n}>
        <div
          className={context.globals.theme === "dark" ? "dark" : ""}
          style={{
            minHeight: "100vh",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            colorScheme: context.globals.theme,
          }}
        >
          <Story />
        </div>
      </I18nextProvider>
    ),
  ],
};

export default preview;
