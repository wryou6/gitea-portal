import { useEffect, useState } from "react";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { routePaths } from "../../app/routes";
import { api, type Repository } from "../../lib/api";
import { IssueListPage } from "../issues/IssueListPage";
import { KanbanBoard } from "../boards/KanbanBoard";
import type { Board } from "../boards/types";

type View = "issues" | "kanban" | "gantt";

export function RepositoryWorkspacePage({
  owner,
  repo,
  view,
}: {
  owner: string;
  repo: string;
  view: View;
}) {
  const [repository, setRepository] = useState<Repository>();
  const [legacyConventionMismatch, setLegacyConventionMismatch] =
    useState(false);
  const [legacyMetadataUnavailable, setLegacyMetadataUnavailable] =
    useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      api<Repository[]>("/api/repositories"),
      api<Board[]>("/api/boards")
        .then((boards) => ({ boards, unavailable: false as const }))
        .catch(() => ({ boards: [] as Board[], unavailable: true as const })),
    ])
      .then(([repositories, boardResult]) => {
        const { boards } = boardResult;
        const match = repositories.find(
          (item) => item.owner === owner && item.name === repo,
        );
        if (!match) throw new Error("Repository 不存在、不可讀取或已移除");
        const retainedLegacyBoards = boards.filter(
          (board) =>
            board.repositoryRefs.length === 1 &&
            board.repositoryRefs[0]?.owner === owner &&
            board.repositoryRefs[0]?.name === repo,
        );
        const mismatch = retainedLegacyBoards.some(
          (board) =>
            board.workflowConventionId !== match.conventionId ||
            board.workflowConventionVersion !== match.conventionVersion,
        );
        if (!cancelled) {
          setRepository(match);
          setLegacyConventionMismatch(mismatch);
          setLegacyMetadataUnavailable(boardResult.unavailable);
          setError(undefined);
        }
      })
      .catch((cause) => {
        if (!cancelled)
          setError(
            cause instanceof Error
              ? cause.message
              : "Repository 工作區無法載入",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  if (error) {
    return (
      <section>
        <ErrorNotice message={error} />
        <a href={routePaths.issues}>返回 Issues 並重新選擇工作區</a>
      </section>
    );
  }
  if (!repository) return <LoadingState />;

  return (
    <section>
      {view !== "issues" && legacyConventionMismatch && (
        <div className="workspace-notice" role="status">
          保留的單 repo Board Convention 與目前 YAML 設定不同；此檢視依目前 YAML
          assignment 顯示，不套用舊 Board 設定。
        </div>
      )}
      {view !== "issues" && legacyMetadataUnavailable && (
        <div className="workspace-notice" role="status">
          無法檢查保留的舊 Board 設定差異；此檢視仍依目前 YAML assignment 顯示。
        </div>
      )}
      {view !== "issues" &&
        (!repository.conventionId || !repository.conventionVersion) && (
          <div className="workspace-notice" role="status">
            此 Repository 尚未設定有效的 Workflow Convention，Kanban
            與甘特圖暫不可用。
            <a href={routePaths.repositoryView(owner, repo, "issues")}>
              返回 Issues
            </a>
            。
          </div>
        )}
      {view === "issues" && (
        <IssueListPage repository={{ owner, name: repo }} />
      )}
      {(view === "kanban" || view === "gantt") &&
        repository.conventionId &&
        repository.conventionVersion && (
          <KanbanBoard repository={{ owner, name: repo }} viewMode={view} />
        )}
      {(view === "kanban" || view === "gantt") &&
        (!repository.conventionId || !repository.conventionVersion) && (
          <div className="workspace-notice-actions">
            <a href={routePaths.repositoryView(owner, repo, "issues")}>
              繼續查看 Issues
            </a>
          </div>
        )}
    </section>
  );
}
