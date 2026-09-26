import { useCallback, useEffect, useState } from "react";
import { api, type Repository, type WorkflowConvention } from "../../lib/api";
import { BoardEditor } from "./BoardEditor";
import type { Board } from "./types";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { routePaths } from "../../app/routes";

export function BoardListPage({
  viewIntent,
}: {
  viewIntent?: "kanban" | "gantt";
}) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [conventions, setConventions] = useState<WorkflowConvention[]>([]);
  const [editing, setEditing] = useState<Board>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const [nextBoards, nextRepositories, nextConventions] = await Promise.all(
        [
          api<Board[]>("/api/boards"),
          api<Repository[]>("/api/repositories"),
          api<WorkflowConvention[]>("/api/workflow-conventions"),
        ],
      );
      setBoards(nextBoards);
      setRepositories(nextRepositories);
      setConventions(nextConventions);
      setError(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Board 無法載入");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const readableRepositories = new Set(
    repositories.map((repository) => `${repository.owner}/${repository.name}`),
  );
  const visibleBoards = boards.filter(
    (board) =>
      board.repositoryRefs.length >= 2 &&
      board.repositoryRefs.every((repository) =>
        readableRepositories.has(`${repository.owner}/${repository.name}`),
      ),
  );

  return (
    <section>
      <PageHeader
        eyebrow={viewIntent ? "BOARD SELECTION" : "SHARED WORKSPACE"}
        title={viewIntent ? "選擇跨庫看板" : "跨庫看板"}
        description={
          viewIntent
            ? viewIntent === "gantt"
              ? "選擇要開啟甘特圖的 Board。"
              : "選擇要開啟 Kanban 的 Board。"
            : "跨 Repository 管理 Gitea Issue 的工作狀態。"
        }
      />
      {error && <ErrorNotice message={error} />}
      {loading && <LoadingState />}
      {!viewIntent && !error && (
        <BoardEditor
          key={editing?.id ?? "new"}
          board={editing}
          repositories={repositories}
          conventions={conventions}
          onSaved={async () => {
            setEditing(undefined);
            await load();
          }}
          onCancelled={() => setEditing(undefined)}
        />
      )}
      <div className="board-list">
        {visibleBoards.map((board) => (
          <article className="board-link" key={board.id}>
            <a href={routePaths.boardView(board.id, viewIntent ?? "kanban")}>
              <h2>{board.name}</h2>
              <p>
                {board.repositoryRefs
                  .map((repo) => `${repo.owner}/${repo.name}`)
                  .join(" · ")}
              </p>
              <small>
                {board.workflowConventionId}@{board.workflowConventionVersion}
              </small>
            </a>
            {!viewIntent && (
              <>
                <nav
                  className="board-view-links"
                  aria-label={`${board.name} 檢視方式`}
                >
                  <a href={routePaths.boardView(board.id, "kanban")}>Kanban</a>
                  <a href={routePaths.boardView(board.id, "gantt")}>甘特圖</a>
                </nav>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setEditing(board)}
                >
                  編輯
                </Button>
              </>
            )}
          </article>
        ))}
        {!loading && !error && !visibleBoards.length && (
          <EmptyState>
            {viewIntent ? (
              <>
                尚未建立跨庫看板。前往{" "}
                <a href={routePaths.boardSettings}>跨庫看板設定</a> 建立 看板。
              </>
            ) : (
              "尚未建立跨庫看板"
            )}
          </EmptyState>
        )}
      </div>
    </section>
  );
}
