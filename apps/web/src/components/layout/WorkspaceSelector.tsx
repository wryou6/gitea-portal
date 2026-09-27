import { useEffect, useState } from "react";
import { resolveAppRoute, routePaths, safeReturnTo } from "../../app/routes";
import { api, toUserFacingError, type Repository, type UserFacingError } from "../../lib/api";
import { ErrorNotice } from "../feedback/ErrorNotice";
import { useTranslation } from "react-i18next";

function currentContext(pathname = window.location.pathname, search = window.location.search) {
  const route = resolveAppRoute(pathname, search);
  if (route.type !== "issue-detail" && route.type !== "issue-create") return route;
  const returnTo = safeReturnTo(new URLSearchParams(window.location.search).get("returnTo"));
  if (!returnTo) return resolveAppRoute(routePaths.issues);
  const target = new URL(returnTo, window.location.origin);
  return resolveAppRoute(target.pathname, target.search);
}

export function WorkspaceSelector({
  initialRepositories,
  initialPathname,
  onNavigate,
}: {
  initialRepositories?: Repository[];
  initialPathname?: string;
  onNavigate?: (path: string) => void;
} = {}) {
  const { t } = useTranslation("common");
  const context = currentContext(initialPathname);
  const isDashboard = context.type === "dashboard";
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<UserFacingError>();

  useEffect(() => {
    if (initialRepositories) {
      setRepositories(initialRepositories);
      setLoading(false);
      return;
    }
    let cancelled = false;
    void api<Repository[]>("/api/repositories")
      .then((items) => { if (!cancelled) setRepositories(items); })
      .catch((cause) => { if (!cancelled) setError(toUserFacingError(cause, t("workspaceListLoadError"))); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [initialRepositories, t]);

  const repository = context.type === "repository-view" ? context : undefined;
  const isAllRepos = context.type === "issues" || context.type === "all-repositories-view";
  const selected = repository
    ? `repository:${repository.owner}/${repository.repo}`
    : isAllRepos ? "all" : "";
  const activeView = repository?.view ?? (context.type === "all-repositories-view" ? context.view : "issues");

  const navigate = (value: string) => {
    let path: string | undefined;
    if (value === "all") path = activeView === "issues" ? routePaths.issues : routePaths[activeView];
    else if (value.startsWith("repository:")) {
      const [owner, repo] = value.slice("repository:".length).split("/", 2);
      if (owner && repo) path = routePaths.repositoryView(owner, repo, activeView);
    }
    if (path) onNavigate ? onNavigate(path) : (window.location.href = path);
  };

  return (
    <div className="workspace-selector">
      <label htmlFor="workspace-selector">{t("workspace")}</label>
      <select id="workspace-selector" aria-label={t("switchWorkspace")} value={selected} onChange={(event) => navigate(event.target.value)}>
        <option value="">{loading ? t("loadingWorkspace") : t("selectWorkspace")}</option>
        <option value="all">{t("allRepos")}</option>
        <optgroup label={t("repositoryWorkspace")}>
          {repositories.map((item) => <option key={item.fullName} value={`repository:${item.owner}/${item.name}`}>{item.fullName}</option>)}
        </optgroup>
      </select>
      {error && !isDashboard && <ErrorNotice message={error} />}
    </div>
  );
}
