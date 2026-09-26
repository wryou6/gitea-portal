import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import type {
  BoardCard,
  WorkspaceGanttView,
  WorkspaceKanbanView,
} from "./types";
import { GanttBoard } from "./GanttBoard";
import { KanbanColumn } from "./KanbanColumn";
import { transitionCard } from "./card-transition";
import { transitionRepositoryCard } from "../../lib/api";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageHeader } from "../../components/layout/PageHeader";
import { routePaths } from "../../app/routes";

export function KanbanBoard({
  boardId,
  repository,
  viewMode,
}: {
  boardId?: string;
  repository?: { owner: string; name: string };
  viewMode: "kanban" | "gantt";
}) {
  const [view, setView] = useState<WorkspaceKanbanView>();
  const [ganttView, setGanttView] = useState<WorkspaceGanttView>();
  const [dragged, setDragged] = useState<BoardCard>();
  const [error, setError] = useState<string>();
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => window.matchMedia("(max-width: 720px)").matches,
  );
  const [activeColumnKey, setActiveColumnKey] = useState<string>();

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const updateViewport = () => setIsMobileViewport(media.matches);
    media.addEventListener("change", updateViewport);
    updateViewport();
    return () => media.removeEventListener("change", updateViewport);
  }, []);

  const load = useCallback(
    async (clearError = true) => {
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
        } else if (boardId && viewMode === "kanban")
          setView(
            await api<WorkspaceKanbanView>(
              `/api/boards/${encodeURIComponent(boardId)}`,
            ),
          );
        else if (boardId)
          setGanttView(
            await api<WorkspaceGanttView>(
              `/api/boards/${encodeURIComponent(boardId)}/gantt`,
            ),
          );
        if (clearError) setError(undefined);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : viewMode === "gantt"
              ? "甘特圖無法載入"
              : "Board 無法載入",
        );
      }
    },
    [boardId, repository?.owner, repository?.name, viewMode],
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
  const board =
    currentView && "board" in currentView ? currentView.board : undefined;
  const repositoryView =
    currentView && "repository" in currentView
      ? currentView.repository
      : undefined;
  if (error && !currentView) return <ErrorNotice message={error} />;
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

  const move = async (issue: BoardCard, stateKey: string) => {
    setDragged(undefined);
    try {
      if (repository)
        await transitionRepositoryCard(
          repository.owner,
          repository.name,
          issue,
          stateKey,
        );
      else if (boardId) await transitionCard(boardId, issue, stateKey);
      setActiveColumnKey(stateKey);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "狀態轉換被拒絕");
      await load(false);
    }
  };

  return (
    <section>
      <a
        href={
          repository
            ? routePaths.repositoryView(
                repository.owner,
                repository.name,
                "issues",
              )
            : routePaths.boardSettings
        }
      >
        ← {repository ? "回到 Repository Issues" : "回到跨庫看板"}
      </a>
      {error && <ErrorNotice message={error} />}
      <PageHeader
        eyebrow="KANBAN WORKSPACE"
        title={board?.name ?? repositoryView?.fullName ?? "工作區"}
        description={
          repositoryView?.conventionId && repositoryView.conventionVersion
            ? `${repositoryView.conventionId}@${repositoryView.conventionVersion}${viewMode === "kanban" ? ` · ${view?.columns.length ?? 0} 個狀態欄位` : ""}`
            : `${board?.workflowConventionId ?? ""}@${board?.workflowConventionVersion ?? ""}${viewMode === "kanban" ? ` · ${view?.columns.length ?? 0} 個狀態欄位` : ""}`
        }
      />
      {viewMode === "gantt" ? (
        ganttView ? (
          <GanttBoard
            issues={ganttView.issues}
            returnTo={`${window.location.pathname}${window.location.search}`}
          />
        ) : (
          <LoadingState />
        )
      ) : (
        <>
          {isMobileViewport && (view?.columns.length ?? 0) > 0 && (
            <div className="field kanban-lane-picker">
              <label htmlFor="kanban-active-column">狀態欄位</label>
              <select
                id="kanban-active-column"
                value={selectedColumnKey}
                onChange={(event) => setActiveColumnKey(event.target.value)}
              >
                {view?.columns.map((column) => (
                  <option key={column.stateKey} value={column.stateKey}>
                    {column.displayName}（{column.cards.length}）
                  </option>
                ))}
              </select>
            </div>
          )}
          <div
            className={`kanban-board${isMobileViewport ? " kanban-board-mobile" : ""}`}
          >
            {visibleColumns.map((column) => (
              <KanbanColumn
                key={column.stateKey}
                column={column}
                destinations={view?.columns ?? []}
                dragged={dragged}
                onDragStart={setDragged}
                onDropCard={move}
                returnTo={`${window.location.pathname}${window.location.search}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
