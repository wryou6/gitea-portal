import { useEffect, useState } from "react";
import { changeLocale, i18n } from "../i18n";
import { resolveLocale, type Locale } from "../i18n/locales";
import { useTranslation } from "react-i18next";
import { IssueListPage } from "../features/issues/IssueListPage";
import { IssueDetailPage } from "../features/issues/IssueDetailPage";
import { IssueCreatePage } from "../features/issues/IssueCreatePage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { WorkspaceViewPage } from "../features/work-views/WorkspaceViewPage";
import { RepositoryWorkspacePage } from "../features/repositories/RepositoryWorkspacePage";
import { AppShell } from "../components/layout/AppShell";
import {
  applyColorPalette,
  applyThemePreference,
  saveColorPalettePreference,
  saveThemePreference,
  subscribeToSystemTheme,
  type ColorPalette,
  type ThemeMode,
} from "../features/settings/theme-preference";
import { saveLocalePreference } from "../features/settings/locale-preference";
import { resolveAppRoute } from "./routes";
import { safeReturnTo } from "./routes";
import { LoginPage } from "../features/auth/LoginPage";
import { SessionExpiredNotice } from "../features/auth/SessionExpiredNotice";
import { SessionUnavailable } from "../features/auth/SessionUnavailable";
import type { SessionBootstrapState } from "../features/auth/session-state";

export function App({
  login,
  displayName,
  avatarUrl,
  sessionState = login
    ? { status: "authenticated", login, displayName, avatarUrl }
    : { status: "anonymous" },
  initialTheme = "system",
  initialPalette = "cobalt",
  initialLocale = "zh-TW",
  sessionExpiredNotice = false,
}: {
  login?: string;
  displayName?: string;
  avatarUrl?: string;
  sessionState?: SessionBootstrapState;
  initialTheme?: ThemeMode;
  initialPalette?: ColorPalette;
  initialLocale?: Locale;
  sessionExpiredNotice?: boolean;
} = {}) {
  const { i18n: currentI18n } = useTranslation();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  const [colorPalette, setColorPalette] =
    useState<ColorPalette>(initialPalette);
  useEffect(() => subscribeToSystemTheme(themeMode), [themeMode]);
  const currentLocale =
    resolveLocale(currentI18n.resolvedLanguage) ?? initialLocale;
  useEffect(() => {
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  const changeTheme = (mode: ThemeMode) => {
    saveThemePreference(login, mode);
    applyThemePreference(mode);
    setThemeMode(mode);
  };

  const changeColorPalette = (palette: ColorPalette) => {
    saveColorPalettePreference(login, palette);
    applyColorPalette(palette);
    setColorPalette(palette);
  };

  const changeUiLocale = async (locale: Locale) => {
    saveLocalePreference(login, locale);
    await changeLocale(locale);
  };

  const route = resolveAppRoute(
    window.location.pathname,
    window.location.search,
  );
  if (sessionState.status === "anonymous") {
    const returnTo = safeReturnTo(
      `${window.location.pathname}${window.location.search}`,
    );
    return (
      <LoginPage
        returnTo={returnTo ?? "/"}
        error={sessionState.error}
        sessionExpired={sessionExpiredNotice}
      />
    );
  }
  if (sessionState.status === "unavailable")
    return <SessionUnavailable onRetry={() => window.location.reload()} />;

  const content = (() => {
    switch (route.type) {
      case "dashboard":
        return <DashboardPage />;
      case "settings":
        return (
          <SettingsPage
            login={login}
            displayName={displayName}
            avatarUrl={avatarUrl}
            mode={themeMode}
            onThemeChange={changeTheme}
            palette={colorPalette}
            onPaletteChange={changeColorPalette}
            locale={currentLocale}
            onLocaleChange={changeUiLocale}
          />
        );
      case "issue-create":
        return <IssueCreatePage />;
      case "issue-detail":
        return (
          <IssueDetailPage
            owner={route.owner}
            repo={route.repo}
            number={route.number}
          />
        );
      case "all-repositories-view":
        return <WorkspaceViewPage view={route.view} login={login} />;
      case "repository-view":
        return (
          <RepositoryWorkspacePage
            owner={route.owner}
            repo={route.repo}
            view={route.view}
            login={login}
          />
        );
      case "issues":
        return <IssueListPage key={login ?? "issues"} login={login} />;
      case "not-found":
        return (
          <main>
            <h1>404</h1>
          </main>
        );
    }
  })();
  return (
    <AppShell login={login} displayName={displayName} avatarUrl={avatarUrl}>
      {sessionExpiredNotice && <SessionExpiredNotice />}
      {content}
    </AppShell>
  );
}
