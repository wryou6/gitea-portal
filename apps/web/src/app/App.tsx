import { useEffect, useState } from "react";
import { changeLocale, i18n } from "../i18n";
import { resolveLocale, type Locale } from "../i18n/locales";
import { useTranslation } from "react-i18next";
import { IssueListPage } from "../features/issues/IssueListPage";
import { IssueDetailPage } from "../features/issues/IssueDetailPage";
import { IssueCreatePage } from "../features/issues/IssueCreatePage";
import { BoardListPage } from "../features/boards/BoardListPage";
import { KanbanBoard } from "../features/boards/KanbanBoard";
import { BoardIssuesPage } from "../features/boards/BoardIssuesPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import type { Board } from "../features/boards/types";
import { RepositoryWorkspacePage } from "../features/repositories/RepositoryWorkspacePage";
import { ErrorNotice } from "../components/feedback/ErrorNotice";
import { LoadingState } from "../components/feedback/LoadingState";
import { api, toUserFacingError, type UserFacingError } from "../lib/api";
import { AppShell } from "../components/layout/AppShell";
import {
  applyThemePreference,
  saveThemePreference,
  subscribeToSystemTheme,
  type ThemeMode,
} from "../features/settings/theme-preference";
import { saveLocalePreference } from "../features/settings/locale-preference";
import { resolveAppRoute } from "./routes";

function BoardRoutePage({
  boardId,
  view,
}: {
  boardId: string;
  view: "issues" | "kanban" | "gantt";
}) {
  const { t } = useTranslation("boards");
  const [board, setBoard] = useState<Board>();
  const [error, setError] = useState<UserFacingError>();
  useEffect(() => {
    let cancelled = false;
    void api<Board[]>("/api/boards")
      .then((boards) => {
        const match = boards.find((item) => item.id === boardId);
        if (!match) throw new Error(t("boardUnavailable"));
        if (!cancelled) setBoard(match);
      })
      .catch((cause) => {
        if (!cancelled)
          setError(toUserFacingError(cause, t("boardLoadError")));
      });
    return () => {
      cancelled = true;
    };
  }, [boardId, t]);

  if (error) return <ErrorNotice message={error} />;
  if (!board) return <LoadingState />;
  if (view === "issues")
    return <BoardIssuesPage key={boardId} boardId={boardId} />;
  return <KanbanBoard key={boardId} boardId={boardId} viewMode={view} />;
}

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
      case "board-view":
        return <BoardRoutePage boardId={route.boardId} view={route.view} />;
      case "repository-view":
        return (
          <RepositoryWorkspacePage
            owner={route.owner}
            repo={route.repo}
            view={route.view}
          />
        );
      case "board-selection":
        return <BoardListPage viewIntent={route.viewIntent} />;
      case "board-settings":
        return <BoardListPage />;
      case "issues":
        return <IssueListPage />;
    }
  })();
  return <AppShell login={login}>{content}</AppShell>;
}
