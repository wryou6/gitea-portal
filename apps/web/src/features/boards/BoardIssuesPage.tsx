import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { EmptyState } from "../../components/feedback/EmptyState";
import { IssueFilters } from "../issues/IssueFilters";
import { IssueRow } from "../issues/IssueRow";
import { filtersFromUrl } from "../issues/IssueListPage";
import { useIssueListState } from "../issues/issue-list-state";
import { api, queryBoardIssues, type Board } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { routePaths } from "../../app/routes";

export function BoardIssuesPage({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<Board>();
  const [boardError, setBoardError] = useState<string>();
  const loader = useCallback(
    (filters: Record<string, string>) => queryBoardIssues(boardId, filters),
    [boardId],
  );
  const { issues, filters, page, hasNext, loading, error, load } =
    useIssueListState(filtersFromUrl(), loader);

  useEffect(() => {
    let cancelled = false;
    void api<Board[]>("/api/boards")
      .then((boards) => {
        const match = boards.find((item) => item.id === boardId);
        if (!match) throw new Error("Board 不存在或已移除");
        if (!cancelled) setBoard(match);
      })
      .catch((cause) => {
        if (!cancelled)
          setBoardError(
            cause instanceof Error ? cause.message : "Board 無法載入",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  useEffect(() => {
    void load(
      filtersFromUrl(),
      Number(new URLSearchParams(window.location.search).get("page") ?? 1),
    );
  }, [boardId]);

  const returnTo = `${window.location.pathname}${window.location.search}`;
  if (boardError) return <ErrorNotice message={boardError} />;
  return (
    <section>
      <PageHeader
        eyebrow="跨庫看板"
        title={board?.name ?? "Issues"}
        description={
          board?.repositoryRefs
            .map((repository) => `${repository.owner}/${repository.name}`)
            .join(" · ") ?? "載入 Board 範圍中…"
        }
      />
      <IssueFilters
        initial={filters}
        onSubmit={(next) => load(next, 1)}
        showRepository={false}
      />
      {error && <ErrorNotice message={error} />}
      {loading && <LoadingState />}
      <div className="issue-list">
        {issues.map((issue) => (
          <IssueRow
            key={`${issue.owner}/${issue.name}#${issue.number}`}
            issue={issue}
            returnTo={returnTo}
          />
        ))}
        {!issues.length && !loading && !error && (
          <EmptyState>沒有符合條件的 Issue</EmptyState>
        )}
      </div>
      <div className="actions pagination">
        <Button
          variant="secondary"
          type="button"
          disabled={loading || page <= 1}
          onClick={() => load(filters, page - 1)}
        >
          上一頁
        </Button>
        <span>第 {page} 頁</span>
        <Button
          variant="secondary"
          type="button"
          disabled={loading || !hasNext}
          onClick={() => load(filters, page + 1)}
        >
          下一頁
        </Button>
      </div>
      <nav className="board-view-toggle" aria-label="Board 檢視方式">
        <a href={routePaths.boardIssues(boardId)} aria-current="page">
          Issues
        </a>
        <a href={routePaths.boardView(boardId, "kanban")}>Kanban</a>
        <a href={routePaths.boardView(boardId, "gantt")}>甘特圖</a>
      </nav>
    </section>
  );
}
