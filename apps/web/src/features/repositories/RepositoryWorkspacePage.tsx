import { useEffect, useState } from "react";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { routePaths } from "../../app/routes";
import { api, toUserFacingError, type Repository, type UserFacingError } from "../../lib/api";
import { IssueListPage } from "../issues/IssueListPage";
import { KanbanBoard } from "../work-views/KanbanBoard";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("common");
  const [repository, setRepository] = useState<Repository>();
  const [error, setError] = useState<UserFacingError>();

  useEffect(() => {
    let cancelled = false;
    void api<Repository[]>("/api/repositories")
      .then((repositories) => {
        const match = repositories.find(
          (item) => item.owner === owner && item.name === repo,
        );
        if (!match) throw new Error(t("repositoryUnavailable"));
        if (!cancelled) {
          setRepository(match);
          setError(undefined);
        }
      })
      .catch((cause) => {
        if (!cancelled)
          setError(toUserFacingError(cause, t("repositoryWorkspaceLoadError")));
      });
    return () => {
      cancelled = true;
    };
  }, [owner, repo, t]);

  if (error) {
    return (
      <section>
        <ErrorNotice message={error} />
        <a href={routePaths.issues}>{t("returnToIssues")}</a>
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
