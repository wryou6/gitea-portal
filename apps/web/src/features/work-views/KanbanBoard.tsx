import { useCallback, useEffect, useState } from "react";
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

export function KanbanBoard({
  repository,
  viewMode,
}: {
  repository?: { owner: string; name: string };
  viewMode: "kanban" | "gantt";
}) {
  const { t, i18n } = useTranslation("work-views");
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
  if (error && !currentView) return <section><ErrorNotice message={error} /><button type="button" onClick={() => void load()}>{t("retry")}</button></section>;
  if (!currentView) return <LoadingState />;

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

  const move = async (issue: WorkViewCard, stateKey: string) => {
    setDragged(undefined);
    setPendingTransition({ issue, targetState: stateKey });
  };

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
        eyebrow={t(viewMode === "gantt" ? "ganttEyebrow" : "kanbanEyebrow")}
        title={repositoryView?.fullName ?? t("allRepositories")}
        description={
          viewMode === "gantt"
            ? t("ganttDescription")
            : t("kanbanDescription")
        }
      />
      {viewMode === "gantt" ? (
        ganttView ? (
          <GanttBoard
            issues={ganttView.issues}
            repository={repository}
            emptyMessage={"repositories" in ganttView && ganttView.repositories.length === 0 ? t("noReadableRepositories") : undefined}
            returnTo={`${window.location.pathname}${window.location.search}`}
          />
        ) : (
          <LoadingState />
        )
      ) : (
        <>
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
            {!hasNoReadableRepositories && visibleColumns.map((column) => (
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
        </>
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
