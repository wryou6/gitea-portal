import { useEffect, useState } from "react";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "react-i18next";
import {
  api,
  toUserFacingError,
  type Repository,
  type UserFacingError,
} from "../../lib/api";
import type { Board } from "../boards/types";
import {
  buildWorkspaceDirectory,
  type WorkspaceDirectoryItem,
} from "./workspace-directory";

export function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const [workspaces, setWorkspaces] = useState<WorkspaceDirectoryItem[]>([]);
  const [error, setError] = useState<UserFacingError>();
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);

    void Promise.all([
      api<Repository[]>("/api/repositories"),
      api<Board[]>("/api/boards"),
    ])
      .then(([repositories, boards]) => {
        if (cancelled) return;
        setWorkspaces(buildWorkspaceDirectory(repositories, boards));
      })
      .catch((cause) => {
        if (!cancelled) {
          setWorkspaces([]);
          setError(toUserFacingError(cause, t("loadError")));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, t]);

  const retry = () => setReloadKey((current) => current + 1);

  return (
    <section className="dashboard-page">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      {loading && <LoadingState />}
      {!loading && error && (
        <div className="dashboard-error-state">
          <ErrorNotice message={error} />
          <Button variant="secondary" type="button" onClick={retry}>
            {t("retry")}
          </Button>
        </div>
      )}
      {!loading && !error && !workspaces.length && (
        <EmptyState>{t("empty")}</EmptyState>
      )}
      {!loading && !error && workspaces.length > 0 && (
        <ul className="workspace-directory" aria-label={t("listLabel")}>
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <a className="workspace-card" href={workspace.href}>
                <span className="workspace-card-kind">
                  {t(workspace.kind)}
                </span>
                <strong>{workspace.name}</strong>
                {workspace.kind === "board" && (
                  <span className="workspace-card-repositories">
                    {workspace.repositoryRefs
                      .map(({ owner, name }) => `${owner}/${name}`)
                      .join(" · ")}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
