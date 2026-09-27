import { useEffect, useState } from "react";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { routePaths } from "../../app/routes";
import { api, type Repository } from "../../lib/api";
import { IssueListPage } from "../issues/IssueListPage";
import { KanbanBoard } from "../boards/KanbanBoard";

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
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    void api<Repository[]>("/api/repositories")
      .then((repositories) => {
        const match = repositories.find(
          (item) => item.owner === owner && item.name === repo,
        );
        if (!match) throw new Error("Repository 不存在、不可讀取或已移除");
        if (!cancelled) {
          setRepository(match);
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
      {view === "issues" && (
        <IssueListPage repository={{ owner, name: repo }} />
      )}
      {(view === "kanban" || view === "gantt") && (
        <KanbanBoard repository={{ owner, name: repo }} viewMode={view} />
      )}
    </section>
  );
}
