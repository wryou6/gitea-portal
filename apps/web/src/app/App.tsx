import { useEffect, useState } from "react";
import { IssueListPage } from "../features/issues/IssueListPage";
import { IssueDetailPage } from "../features/issues/IssueDetailPage";
import { IssueCreatePage } from "../features/issues/IssueCreatePage";
import { BoardListPage } from "../features/boards/BoardListPage";
import { KanbanBoard } from "../features/boards/KanbanBoard";
import { BoardIssuesPage } from "../features/boards/BoardIssuesPage";
import { LegacyBoardNoticePage } from "../features/boards/LegacyBoardNoticePage";
import type { Board } from "../features/boards/types";
import { RepositoryWorkspacePage } from "../features/repositories/RepositoryWorkspacePage";
import { ErrorNotice } from "../components/feedback/ErrorNotice";
import { LoadingState } from "../components/feedback/LoadingState";
import { api } from "../lib/api";
import { AppShell } from "../components/layout/AppShell";
import { resolveAppRoute } from "./routes";

function BoardRoutePage({
  boardId,
  view,
}: {
  boardId: string;
  view: "issues" | "kanban" | "gantt";
}) {
  const [board, setBoard] = useState<Board>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    let cancelled = false;
    void api<Board[]>("/api/boards")
      .then((boards) => {
        const match = boards.find((item) => item.id === boardId);
        if (!match) throw new Error("跨庫看板不存在或已移除");
        if (!cancelled) setBoard(match);
      })
      .catch((cause) => {
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : "看板無法載入");
      });
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  if (error) return <ErrorNotice message={error} />;
  if (!board) return <LoadingState />;
  if (board.repositoryRefs.length === 1)
    return <LegacyBoardNoticePage board={board} />;
  if (view === "issues")
    return <BoardIssuesPage key={boardId} boardId={boardId} />;
  return <KanbanBoard key={boardId} boardId={boardId} viewMode={view} />;
}

export function App() {
  const route = resolveAppRoute(
    window.location.pathname,
    window.location.search,
  );
  const content = (() => {
    switch (route.type) {
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
  return <AppShell>{content}</AppShell>;
}
