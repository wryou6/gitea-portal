import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { BoardCard, BoardGanttView, BoardView } from "./types";
import { GanttBoard } from "./GanttBoard";
import { KanbanColumn } from "./KanbanColumn";
import { transitionCard } from "./card-transition";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageHeader } from "../../components/layout/PageHeader";

export function KanbanBoard({ boardId, viewMode }: { boardId: string; viewMode: "kanban" | "gantt" }) {
  const [view, setView] = useState<BoardView>();
  const [ganttView, setGanttView] = useState<BoardGanttView>();
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
        if (viewMode === "kanban") setView(await api<BoardView>(`/api/boards/${boardId}`));
        else setGanttView(await api<BoardGanttView>(`/api/boards/${boardId}/gantt`));
        if (clearError) setError(undefined);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : viewMode === "gantt" ? "甘特圖無法載入" : "Board 無法載入");
      }
    },
    [boardId, viewMode],
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

  const board = viewMode === "gantt" ? ganttView?.board : view?.board;
  if (error && !board) return <ErrorNotice message={error} />;
  if (!board) return <LoadingState />;

  const selectedColumnKey = view?.columns.some(
    (column) => column.stateKey === activeColumnKey,
  )
    ? activeColumnKey
    : view?.columns[0]?.stateKey;
  const visibleColumns = isMobileViewport
    ? view?.columns.filter((column) => column.stateKey === selectedColumnKey) ?? []
    : view?.columns ?? [];

  const move = async (issue: BoardCard, stateKey: string) => {
    setDragged(undefined);
    try {
      await transitionCard(boardId, issue, stateKey);
      setActiveColumnKey(stateKey);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "狀態轉換被拒絕");
      await load(false);
    }
  };

  return (
    <section>
      <a href="/boards">← 回到 Boards</a>
      {error && <ErrorNotice message={error} />}
      <PageHeader
        eyebrow="KANBAN WORKSPACE"
        title={board.name}
        description={`${board.workflowConventionId}@${board.workflowConventionVersion}${viewMode === "kanban" ? ` · ${view?.columns.length ?? 0} 個狀態欄位` : ""}`}
      />
      <nav className="board-view-toggle" aria-label="Board 檢視方式">
        <a href={`/boards/${boardId}/kanban`} aria-current={viewMode === "kanban" ? "page" : undefined}>Kanban</a>
        <a href={`/boards/${boardId}/gantt`} aria-current={viewMode === "gantt" ? "page" : undefined}>甘特圖</a>
      </nav>
      {viewMode === "gantt" ? (
        ganttView ? <GanttBoard issues={ganttView.issues} /> : <LoadingState />
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
          />
        ))}
      </div>
      </>
      )}
    </section>
  );
}
