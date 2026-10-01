import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { SettingsPage } from "./SettingsPage";
import type { ColorPalette, ThemeMode } from "./theme-preference";
import {
  applyColorPalette,
  applyThemePreference,
  readColorPalettePreference,
  saveColorPalettePreference,
} from "./theme-preference";

function SettingsScreen() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [palette, setPalette] = useState<ColorPalette>(() =>
    readColorPalettePreference("storybook"),
  );
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
  return (
    <AppShell login="engineer" routePathname="/settings" routeSearch="">
      <SettingsPage
        login="engineer"
        mode={mode}
        onThemeChange={setMode}
        palette={palette}
        onPaletteChange={changePalette}
        locale="zh-TW"
        onLocaleChange={() => undefined}
      />
    </AppShell>
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
