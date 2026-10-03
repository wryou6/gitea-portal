import type { ColorPalette, ThemeMode } from "./theme-preference";
import { useTranslation } from "react-i18next";
import { supportedLocales, type Locale } from "../../i18n/locales";
import { UserIdentity } from "../../components/ui/UserIdentity";
import { IssueStatusBadge } from "../../components/ui/IssueStatusBadge";

const themeLabelKeys: Record<ThemeMode, "light" | "dark" | "system"> = {
  light: "light",
  dark: "dark",
  system: "system",
};
const colorPalettes: readonly ColorPalette[] = [
  "cobalt",
  "juniper",
  "iris",
  "carbon",
  "ember",
  "glacier",
];

const localeNames: Record<Locale, string> = {
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
};

export function SettingsPage({
  login,
  displayName,
  avatarUrl,
  mode,
  onThemeChange,
  palette,
  onPaletteChange,
  locale,
  onLocaleChange,
}: {
  login?: string;
  displayName?: string;
  avatarUrl?: string;
  mode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  palette: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  const { t } = useTranslation("settings");

  return (
    <section className="settings-page">
      <header className="settings-page-heading">
        <div>
          <h1>{t("title")}</h1>
          <p>{t("pageDescription")}</p>
        </div>
        {login && (
          <div className="settings-account">
            <UserIdentity user={{ login, fullName: displayName, avatarUrl }} />
          </div>
        )}
      </header>

      <section className="settings-card" aria-labelledby="settings-language">
        <header className="settings-section-heading">
          <h2 id="settings-language">{t("language")}</h2>
          <p>{t("languageDescription")}</p>
        </header>
        <fieldset className="theme-options locale-options">
          <legend>{t("language")}</legend>
          {supportedLocales.map((supportedLocale) => (
            <label
              className={`theme-option ${locale === supportedLocale ? "theme-option--selected" : ""}`}
              key={supportedLocale}
            >
              <input
                type="radio"
                name="interface-locale"
                value={supportedLocale}
                checked={locale === supportedLocale}
                onChange={() => onLocaleChange(supportedLocale)}
              />
              <span className="theme-option-copy">
                <strong>{localeNames[supportedLocale]}</strong>
              </span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="settings-card" aria-labelledby="settings-appearance">
        <header className="settings-section-heading">
          <h2 id="settings-appearance">{t("appearance")}</h2>
          <p>{t("appearanceDescription")}</p>
        </header>
        <fieldset className="theme-options appearance-mode-options">
          <legend>{t("appearanceMode")}</legend>
          {(["light", "dark", "system"] as const).map((themeMode) => (
            <label
              className={`theme-option ${mode === themeMode ? "theme-option--selected" : ""}`}
              key={themeMode}
            >
              <input
                type="radio"
                name="theme-mode"
                value={themeMode}
                checked={mode === themeMode}
                onChange={() => onThemeChange(themeMode)}
              />
              <span className="theme-option-copy">
                <strong>{t(themeLabelKeys[themeMode])}</strong>
                <small>{t(`${themeMode}Description`)}</small>
              </span>
            </label>
          ))}
        </fieldset>
        <p className="settings-current-mode" aria-live="polite">
          {t("currentMode", { mode: t(themeLabelKeys[mode]) })}
        </p>
      </section>

      <section className="settings-card" aria-labelledby="settings-palette">
        <header className="settings-section-heading">
          <h2 id="settings-palette">{t("colorPalette")}</h2>
          <p>{t("colorPaletteDescription")}</p>
        </header>
        <fieldset className="theme-options palette-options">
          <legend>{t("colorPalette")}</legend>
          {colorPalettes.map((colorPalette) => (
            <label
              className={`theme-option palette-option palette-option--${colorPalette} ${palette === colorPalette ? "theme-option--selected" : ""}`}
              key={colorPalette}
            >
              <input
                type="radio"
                name="color-palette"
                value={colorPalette}
                checked={palette === colorPalette}
                onChange={() => onPaletteChange(colorPalette)}
              />
              <span className="theme-option-copy">
                <strong>{t(colorPalette)}</strong>
                <small>{t(`${colorPalette}Description`)}</small>
                <span
                  className="palette-preview"
                  data-palette={colorPalette}
                  aria-hidden="true"
                >
                  <span className="palette-preview-card">
                    <span className="palette-preview-key">PORTAL-42</span>
                    <span className="palette-preview-title">
                      <strong>{t("palettePreviewTitle")}</strong>
                      <i />
                    </span>
                    <span className="palette-preview-badges">
                      <IssueStatusBadge
                        status="todo"
                        className="palette-preview-badge"
                      />
                      <IssueStatusBadge
                        status="in-progress"
                        className="palette-preview-badge"
                      />
                      <IssueStatusBadge
                        status="done"
                        className="palette-preview-badge"
                      />
                    </span>
                  </span>
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      </section>
    </section>
  );
}
