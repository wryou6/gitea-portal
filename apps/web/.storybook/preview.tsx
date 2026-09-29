import type { Preview } from "@storybook/react";
import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { i18n } from "../src/i18n";
import type { Locale } from "../src/i18n/locales";
import "../src/index.css";

function StorybookFrame({
  theme,
  locale,
  children,
}: {
  theme: "light" | "dark";
  locale: Locale;
  children: ReactNode;
}) {
  useEffect(() => {
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div
      className={theme === "dark" ? "dark" : ""}
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        colorScheme: theme,
      }}
    >
      {children}
    </div>
  );
}

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
    locale: {
      description: "Portal language",
      defaultValue: "zh-TW",
      toolbar: { icon: "globe", items: ["zh-TW", "en", "ja"] },
    },
  },
  decorators: [
    (Story, context) => (
      <I18nextProvider i18n={i18n}>
        <StorybookFrame
          theme={context.globals.theme === "dark" ? "dark" : "light"}
          locale={context.globals.locale === "en" || context.globals.locale === "ja"
            ? context.globals.locale
            : "zh-TW"}
        >
          <Story />
        </StorybookFrame>
      </I18nextProvider>
    ),
  ],
};

export default preview;
