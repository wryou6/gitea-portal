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
  applyThemePreference,
  saveThemePreference,
  subscribeToSystemTheme,
  type ThemeMode,
} from "../features/settings/theme-preference";
import { saveLocalePreference } from "../features/settings/locale-preference";
import { resolveAppRoute } from "./routes";

export function App({
  login,
  initialTheme = "system",
  initialLocale = "zh-TW",
}: {
  login?: string;
  initialTheme?: ThemeMode;
  initialLocale?: Locale;
} = {}) {
  const { i18n: currentI18n } = useTranslation();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  useEffect(() => subscribeToSystemTheme(themeMode), [themeMode]);
  const currentLocale = resolveLocale(currentI18n.resolvedLanguage) ?? initialLocale;
  useEffect(() => {
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  const changeTheme = (mode: ThemeMode) => {
    saveThemePreference(login, mode);
    applyThemePreference(mode);
    setThemeMode(mode);
  };

  const changeUiLocale = async (locale: Locale) => {
    saveLocalePreference(login, locale);
    await changeLocale(locale);
  };

  const route = resolveAppRoute(
    window.location.pathname,
    window.location.search,
  );
  const content = (() => {
    switch (route.type) {
      case "dashboard":
        return <DashboardPage />;
      case "settings":
        return (
          <SettingsPage
            login={login}
            mode={themeMode}
            onThemeChange={changeTheme}
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
        return <WorkspaceViewPage view={route.view} />;
      case "repository-view":
        return (
          <RepositoryWorkspacePage
            owner={route.owner}
            repo={route.repo}
            view={route.view}
          />
        );
      case "issues":
        return <IssueListPage />;
      case "not-found":
        return <main><h1>404</h1></main>;
    }
  })();
  return <AppShell login={login}>{content}</AppShell>;
}
