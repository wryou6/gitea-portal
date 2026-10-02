import { useCallback, useEffect, useMemo, useState } from "react";
import { api, toUserFacingError, type UserFacingError } from "../../lib/api";
import type { WorkViewCard, WorkspaceGanttView, WorkspaceKanbanView } from "./types";
import { GanttBoard } from "./GanttBoard";
import { KanbanColumn } from "./KanbanColumn";
import { transitionIssue } from "../../lib/api";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { EmptyState } from "../../components/feedback/EmptyState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatusTransitionDialog } from "../issues/StatusTransitionDialog";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../i18n/format";
import { WorkViewFilterBar } from "./WorkViewFilterBar";
import { WorkViewLayout } from "./WorkViewLayout";
import { matchesRecentDoneVisibility, matchesWorkViewFilters, parseWorkViewFilters, serializeWorkViewFilters, type WorkViewFilters } from "./work-view-filters";

export function KanbanBoard({
  repository,
  viewMode,
  login,
}: {
  repository?: { owner: string; name: string };
  viewMode: "kanban" | "gantt";
  login?: string;
}) {
  const { t, i18n } = useTranslation("work-views");
  const { t: tCommon } = useTranslation("common");
  const [filters, setFilters] = useState<WorkViewFilters>(() => parseWorkViewFilters(window.location.search));
  const [recentDoneOnly, setRecentDoneOnly] = useState(true);
  const [view, setView] = useState<WorkspaceKanbanView>();
  const [ganttView, setGanttView] = useState<WorkspaceGanttView>();
  const [dragged, setDragged] = useState<WorkViewCard>();
  const [error, setError] = useState<UserFacingError>();
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => window.matchMedia("(max-width: 720px)").matches,
  );
  const [activeColumnKey, setActiveColumnKey] = useState<string>();
  const [pendingTransition, setPendingTransition] = useState<{
    issue: WorkViewCard;
    targetState: string;
  }>();

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const updateViewport = () => setIsMobileViewport(media.matches);
    media.addEventListener("change", updateViewport);
    updateViewport();
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    setRecentDoneOnly(true);
  }, [viewMode, repository?.owner, repository?.name]);

  const load = useCallback(
    async (clearError = true) => {
      setView(undefined);
      setGanttView(undefined);
      if (clearError) setError(undefined);
      try {
        if (repository) {
          if (viewMode === "kanban")
            setView(
              await api<WorkspaceKanbanView>(
                `/api/repositories/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/kanban`,
              ),
            );
          else
            setGanttView(
              await api<WorkspaceGanttView>(
                `/api/repositories/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/gantt`,
              ),
            );
        } else if (viewMode === "kanban")
          setView(await api<WorkspaceKanbanView>("/api/repositories/kanban"));
        else
          setGanttView(await api<WorkspaceGanttView>("/api/repositories/gantt"));
        if (clearError) setError(undefined);
      } catch (cause) {
        setError(
          toUserFacingError(
            cause,
            viewMode === "gantt" ? t("ganttLoadError") : t("viewLoadError"),
          ),
        );
      }
    },
    [repository?.owner, repository?.name, viewMode, t],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (viewMode !== "kanban") return;
    if (!view?.columns.length) return;
    setActiveColumnKey((current) =>
      view.columns.some((column) => column.stateKey === current)
        ? current
        : view.columns[0]!.stateKey,
    );
  }, [view, viewMode]);

  const currentView = viewMode === "gantt" ? ganttView : view;
  const repositoryView =
    currentView && "repository" in currentView
      ? currentView.repository
      : undefined;
  const hasNoReadableRepositories = Boolean(
    currentView && "repositories" in currentView && currentView.repositories.length === 0,
  );
  const selectedColumnKey = view?.columns.some(
    (column) => column.stateKey === activeColumnKey,
  )
    ? activeColumnKey
    : view?.columns[0]?.stateKey;
  const visibleColumns = isMobileViewport
    ? (view?.columns.filter(
        (column) => column.stateKey === selectedColumnKey,
      ) ?? [])
    : (view?.columns ?? []);
  const repositories = currentView && "repositories" in currentView ? currentView.repositories : currentView ? [currentView.repository] : [];
  const allCards = view?.columns.flatMap((column) => column.cards) ?? [];
  const assignees = [...new Set((viewMode === "gantt" ? ganttView?.issues ?? [] : allCards).flatMap((issue) => issue.assignees))].sort((a, b) => a.localeCompare(b));
  const filteredColumns = useMemo(() => visibleColumns.map((column) => ({
    ...column,
    cards: column.cards.filter((issue) => matchesWorkViewFilters(issue, filters, login) && matchesRecentDoneVisibility(issue, recentDoneOnly)),
  })), [visibleColumns, filters, recentDoneOnly]);

  if (error && !currentView) return <section><ErrorNotice message={error} /><button type="button" onClick={() => void load()}>{t("retry")}</button></section>;
  if (!currentView) return <LoadingState />;

  function updateFilters(next: WorkViewFilters) {
    setFilters(next);
    const search = serializeWorkViewFilters(next, window.location.search);
    window.history.replaceState({}, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  }

  const move = async (issue: WorkViewCard, stateKey: string) => {
    setDragged(undefined);
    setPendingTransition({ issue, targetState: stateKey });
  };

  const filterControls = <WorkViewFilterBar filters={filters} onChange={updateFilters} repositories={repositories} assignees={assignees} currentUserLogin={login} repositoryFixed={Boolean(repository)} recentDoneOnly={recentDoneOnly} onRecentDoneOnlyChange={setRecentDoneOnly} />;

  const submitTransition = async (
    actionKey: string,
    selectedAssignee?: string,
  ) => {
    if (!pendingTransition) return;
    try {
      await transitionIssue(
        pendingTransition.issue.owner,
        pendingTransition.issue.name,
        pendingTransition.issue,
        actionKey,
        selectedAssignee,
      );
      setActiveColumnKey(pendingTransition.targetState);
      await load();
    } catch (cause) {
      setError(toUserFacingError(cause, t("transitionRejected")));
      await load(false);
      throw cause;
    }
  };

  return (
    <section className={viewMode === "gantt" ? "workspace-view workspace-view--gantt" : "workspace-view"}>
      {error && <><ErrorNotice message={error} /><button type="button" onClick={() => void load()}>{t("retry")}</button></>}
      <PageHeader
        title={repositoryView?.fullName ?? tCommon(viewMode === "gantt" ? "gantt" : "kanban")}
        compact
      />
      {viewMode === "gantt" ? (
        ganttView ? (
          <GanttBoard
            issues={ganttView.issues}
            repository={repository}
            emptyMessage={"repositories" in ganttView && ganttView.repositories.length === 0 ? t("noReadableRepositories") : undefined}
            returnTo={`${window.location.pathname}${window.location.search}`}
            filters={filters}
            filterControls={filterControls}
            currentUserLogin={login}
            recentDoneOnly={recentDoneOnly}
          />
        ) : (
          <LoadingState />
        )
      ) : (
        <WorkViewLayout controls={filterControls} filters={filters} repositoryFixed={Boolean(repository)} resultCount={allCards.filter((issue) => matchesWorkViewFilters(issue, filters, login) && matchesRecentDoneVisibility(issue, recentDoneOnly)).length} recentDoneOnly={recentDoneOnly} error={Boolean(error)}>
          {hasNoReadableRepositories && <EmptyState>{t("noReadableRepositories")}</EmptyState>}
          {isMobileViewport && (view?.columns.length ?? 0) > 0 && (
            <div className="field kanban-lane-picker">
              <label htmlFor="kanban-active-column">{t("statusColumn")}</label>
              <select
                id="kanban-active-column"
                value={selectedColumnKey}
                onChange={(event) => setActiveColumnKey(event.target.value)}
              >
                {view?.columns.map((column) => (
                  <option key={column.stateKey} value={column.stateKey}>
                    {column.displayName}（{formatNumber(column.cards.length, i18n.language)}）
                  </option>
                ))}
              </select>
            </div>
          )}
          <div
            className={`kanban-board${isMobileViewport ? " kanban-board-mobile" : ""}`}
          >
            {!hasNoReadableRepositories && filteredColumns.map((column) => (
              <KanbanColumn
                key={column.stateKey}
                column={column}
                dragged={dragged}
                onDragStart={setDragged}
                onDropCard={move}
                returnTo={`${window.location.pathname}${window.location.search}`}
              />
            ))}
          </div>
        </WorkViewLayout>
      )}
      {pendingTransition && (
        <StatusTransitionDialog
          issue={pendingTransition.issue}
          targetState={pendingTransition.targetState}
          onClose={() => setPendingTransition(undefined)}
          onSubmit={submitTransition}
        />
      )}
    </section>
  );
}
