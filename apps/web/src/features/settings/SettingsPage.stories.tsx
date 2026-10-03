import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SettingsPage } from "./SettingsPage";
import type { ColorPalette, ThemeMode } from "./theme-preference";
import { i18n } from "../../i18n";
import { resolveLocale, type Locale } from "../../i18n/locales";
import {
  applyColorPalette,
  applyThemePreference,
  saveColorPalettePreference,
} from "./theme-preference";

function SettingsScreen({
  initialMode = "system",
  initialPalette = "cobalt",
}: {
  initialMode?: ThemeMode;
  initialPalette?: ColorPalette;
}) {
  const { i18n: translator } = useTranslation("settings");
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [locale, setLocale] = useState<Locale>(
    () => resolveLocale(translator.language) ?? "zh-TW",
  );
  const [palette, setPalette] = useState<ColorPalette>(initialPalette);
  useEffect(() => {
    setLocale(resolveLocale(translator.language) ?? "zh-TW");
  }, [translator.language]);
  useEffect(() => {
    applyThemePreference(mode);
  }, [mode]);
  useEffect(() => {
    applyColorPalette(palette);
    document.querySelectorAll<HTMLElement>(".dark").forEach((element) => {
      element.dataset.palette = palette;
    });
  }, [palette]);
  const changePalette = (nextPalette: ColorPalette) => {
    saveColorPalettePreference("storybook", nextPalette);
    setPalette(nextPalette);
  };
  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
    void i18n.changeLanguage(nextLocale);
  };
  return (
    <main className="settings-story-frame">
      <SettingsPage
        login="engineer"
        displayName="Portal Engineer"
        mode={mode}
        onThemeChange={setMode}
        palette={palette}
        onPaletteChange={changePalette}
        locale={locale}
        onLocaleChange={changeLocale}
      />
    </main>
  );
}

const meta = {
  title: "Screens/Settings",
  component: SettingsScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Appearance: Story = {};

export const English: Story = {
  globals: { locale: "en", theme: "light" },
};

export const JapaneseDark: Story = {
  globals: { locale: "ja", theme: "dark" },
  render: () => <SettingsScreen initialMode="dark" />,
};

export const NarrowJapanese: Story = {
  globals: { locale: "ja", theme: "light" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const CarbonDark: Story = {
  globals: { locale: "zh-TW", theme: "dark" },
  render: () => <SettingsScreen initialMode="dark" initialPalette="carbon" />,
};

export const EmberDark: Story = {
  globals: { locale: "zh-TW", theme: "dark" },
  render: () => <SettingsScreen initialMode="dark" initialPalette="ember" />,
};

export const GlacierDark: Story = {
  globals: { locale: "zh-TW", theme: "dark" },
  render: () => <SettingsScreen initialMode="dark" initialPalette="glacier" />,
};
