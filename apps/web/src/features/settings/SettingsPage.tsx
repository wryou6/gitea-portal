import type { ThemeMode } from "./theme-preference";
import { useTranslation } from "react-i18next";
import { supportedLocales, type Locale } from "../../i18n/locales";

const themeLabelKeys: Record<ThemeMode, "light" | "dark" | "system"> = {
  light: "light",
  dark: "dark",
  system: "system",
};

const localeNames: Record<Locale, string> = {
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
};

export function SettingsPage({
  login,
  mode,
  onThemeChange,
  locale,
  onLocaleChange,
}: {
  login?: string;
  mode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}) {
  const { t } = useTranslation("settings");

  return (
    <section className="settings-page">
      <header className="page-heading">
        <h1>{t("title")}</h1>
      </header>
      <section className="settings-card" aria-labelledby="settings-appearance">
        <h2 id="settings-appearance">{t("appearance")}</h2>
        {login && <p className="muted">{t("currentAccount", { login })}</p>}
        <fieldset className="theme-options">
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
              <span>
                <strong>{t(themeLabelKeys[themeMode])}</strong>
                <small>{t(`${themeMode}Description`)}</small>
              </span>
            </label>
          ))}
        </fieldset>
        <p className="settings-current-mode" aria-live="polite">
          {t("currentMode", { mode: t(themeLabelKeys[mode]) })}
        </p>
        <fieldset className="theme-options">
          <legend>{t("language")}</legend>
          <p className="muted">{t("languageDescription")}</p>
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
              <span><strong>{localeNames[supportedLocale]}</strong></span>
            </label>
          ))}
        </fieldset>
      </section>
    </section>
  );
}
