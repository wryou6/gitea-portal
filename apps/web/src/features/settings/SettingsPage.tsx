import type { ColorPalette, ThemeMode } from "./theme-preference";
import { useTranslation } from "react-i18next";
import { supportedLocales, type Locale } from "../../i18n/locales";
import { useState } from "react";
import { api, type StatusLabelMigrationReport } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { UserIdentity } from "../../components/ui/UserIdentity";

const themeLabelKeys: Record<ThemeMode, "light" | "dark" | "system"> = {
  light: "light",
  dark: "dark",
  system: "system",
};
const colorPalettes = ["cobalt", "juniper", "iris"] as const;

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
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [migrationReport, setMigrationReport] =
    useState<StatusLabelMigrationReport | null>(null);

  async function runStatusMigration() {
    setMigrationRunning(true);
    setMigrationError(null);
    try {
      setMigrationReport(
        await api<StatusLabelMigrationReport>(
          "/api/admin/status-label-migration",
          { method: "POST" },
        ),
      );
    } catch (cause) {
      setMigrationError(
        cause instanceof Error ? cause.message : t("statusMigrationFailed"),
      );
    } finally {
      setMigrationRunning(false);
    }
  }

  return (
    <section className="settings-page">
      <header className="page-heading">
        <h1>{t("title")}</h1>
      </header>
      <section className="settings-card" aria-labelledby="settings-appearance">
        <h2 id="settings-appearance">{t("appearance")}</h2>
        {login && <p className="muted"><UserIdentity user={{ login, fullName: displayName, avatarUrl }} /></p>}
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
              <span>
                <strong>{t(colorPalette)}</strong>
                <small>{t(`${colorPalette}Description`)}</small>
                <span className="palette-swatches" aria-hidden="true">
                  <i className="palette-swatch-surface" />
                  <i className="palette-swatch-primary" />
                  <i className="palette-swatch-todo" />
                  <i className="palette-swatch-progress" />
                  <i className="palette-swatch-done" />
                </span>
              </span>
            </label>
          ))}
        </fieldset>
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
              <span>
                <strong>{localeNames[supportedLocale]}</strong>
              </span>
            </label>
          ))}
        </fieldset>
      </section>
      {login === "admin" && (
        <section
          className="settings-card"
          aria-labelledby="settings-status-migration"
        >
          <h2 id="settings-status-migration">{t("statusMigrationTitle")}</h2>
          <p>{t("statusMigrationDescription")}</p>
          <Button
            type="button"
            disabled={migrationRunning}
            onClick={() => void runStatusMigration()}
          >
            {migrationRunning
              ? t("statusMigrationRunning")
              : t("statusMigrationStart")}
          </Button>
          {migrationError && (
            <p className="error-text" role="alert">
              {migrationError}
            </p>
          )}
          {migrationReport && (
            <div className="status-migration-report" aria-live="polite">
              <p
                className={
                  migrationReport.verified ? "success-text" : "error-text"
                }
              >
                {migrationReport.verified
                  ? t("statusMigrationVerified")
                  : t("statusMigrationIncomplete")}
              </p>
              <ul>
                <li>
                  {t("statusMigrationCounts", {
                    repositories: migrationReport.repositories,
                    issues: migrationReport.issuesScanned,
                    migrated: migrationReport.migrated,
                    unchanged: migrationReport.unchanged,
                  })}
                </li>
              </ul>
              {migrationReport.successfulIssues.length > 0 && (
                <details>
                  <summary>
                    {t("statusMigrationSuccesses", {
                      count: migrationReport.successfulIssues.length,
                    })}
                  </summary>
                  <ul>
                    {migrationReport.successfulIssues.map((item) => (
                      <li
                        key={`${item.owner}/${item.repository}#${item.issueNumber}`}
                      >
                        {item.owner}/{item.repository}#{item.issueNumber}:{" "}
                        {t(
                          item.outcome === "migrated"
                            ? "statusMigrationIssueMigrated"
                            : "statusMigrationIssueUnchanged",
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {migrationReport.resolvedConflicts.length > 0 && (
                <section>
                  <h3>{t("statusMigrationConflicts")}</h3>
                  <ul>
                    {migrationReport.resolvedConflicts.map((item) => (
                      <li
                        key={`${item.owner}/${item.repository}#${item.issueNumber}`}
                      >
                        {item.owner}/{item.repository}#{item.issueNumber}:{" "}
                        {t("statusMigrationConflictValues", {
                          removed: item.removedLegacyLabels.join(", "),
                          retained: item.retainedStatusLabels.join(", "),
                        })}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {migrationReport.failures.length > 0 && (
                <section>
                  <h3>{t("statusMigrationFailures")}</h3>
                  <ul>
                    {migrationReport.failures.map((item, index) => (
                      <li
                        key={`${item.owner}/${item.repository}#${item.issueNumber ?? index}`}
                      >
                        {item.owner &&
                          `${item.owner}/${item.repository}${item.issueNumber ? `#${item.issueNumber}` : ""}: `}
                        {item.reason}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </section>
      )}
    </section>
  );
}
