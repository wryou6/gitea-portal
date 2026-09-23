import { useCallback, useEffect, useState } from "react";
import { api, type Repository, type WorkflowConvention } from "../../lib/api";
import { BoardEditor } from "./BoardEditor";
import type { Board } from "./types";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";

export function BoardListPage() {
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

  return (
    <section>
      <PageHeader
        eyebrow="SHARED WORKSPACE"
        title="Boards"
        description="跨 Repository 管理 Gitea Issue 的工作狀態。"
      />
      {error && <ErrorNotice message={error} />}
      {loading && <LoadingState />}
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
      <div className="board-list">
        {boards.map((board) => (
          <article className="board-link" key={board.id}>
            <a href={`/boards/${board.id}`}>
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
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEditing(board)}
            >
              編輯
            </Button>
          </article>
        ))}
        {!loading && !boards.length && <EmptyState>尚未建立 Board</EmptyState>}
      </div>
    </section>
  );
}
