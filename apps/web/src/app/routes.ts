import { sanitizeWorkViewSearch } from "../features/work-views/work-view-url-state";

export type WorkspaceView = "issues" | "kanban" | "gantt";

export const routePaths = {
  dashboard: "/dashboard",
  issues: "/issues",
  issueCreate: "/issues/new",
  issueCreateFrom: (returnTo: string) => {
    const params = new URLSearchParams({ returnTo });
    return `/issues/new?${params}`;
  },
  issueCreateForRepository: (owner: string, repo: string, returnTo: string) => {
    const params = new URLSearchParams({
      repository: `${owner}/${repo}`,
      returnTo,
    });
    return `/issues/new?${params}`;
  },
  issueDetail: (owner: string, repo: string, number: number) =>
    `/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${number}`,
  issueDetailFrom: (
    owner: string,
    repo: string,
    number: number,
    returnTo: string,
  ) => {
    const params = new URLSearchParams({ returnTo });
    return `${routePaths.issueDetail(owner, repo, number)}?${params}`;
  },
  settings: "/settings",
  kanban: "/kanban",
  gantt: "/gantt",
  repositoryView: (owner: string, repo: string, view: WorkspaceView) =>
    `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${view}`,
};

export type AppRoute =
  | { type: "dashboard" }
  | { type: "issues" }
  | { type: "issue-create" }
  | { type: "issue-detail"; owner: string; repo: string; number: number }
  | { type: "settings" }
  | { type: "not-found" }
  | {
      type: "repository-view";
      owner: string;
      repo: string;
      view: WorkspaceView;
    }
  | { type: "all-repositories-view"; view: "kanban" | "gantt" };

export function workViewForRoute(route: AppRoute): WorkspaceView | undefined {
  if (route.type === "issues") return "issues";
  if (route.type === "all-repositories-view" || route.type === "repository-view")
    return route.view;
  return undefined;
}

export function resolveWorkViewNavigationContext(
  pathname: string,
  search: string,
): { route: AppRoute; pathname: string; search: string } {
  const route = resolveAppRoute(pathname, search);
  if (route.type !== "issue-detail" && route.type !== "issue-create")
    return { route, pathname, search };

  const returnTo = safeReturnTo(new URLSearchParams(search).get("returnTo"));
  if (!returnTo) return { route: resolveAppRoute(routePaths.issues), pathname: routePaths.issues, search: "" };

  const target = new URL(returnTo, window.location.origin);
  return {
    route: resolveAppRoute(target.pathname, target.search),
    pathname: target.pathname,
    search: target.search,
  };
}

export function resolveAppRoute(pathname: string, _search = ""): AppRoute {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (path === routePaths.settings) return { type: "settings" };
  if (path === "/") return { type: "all-repositories-view", view: "gantt" };
  if (path === routePaths.dashboard) return { type: "dashboard" };
  if (path === routePaths.issues) return { type: "issues" };
  if (path === routePaths.kanban || path === routePaths.gantt)
    return { type: "all-repositories-view", view: path.slice(1) as "kanban" | "gantt" };
  if (path === routePaths.issueCreate || path === "/issue/new") {
    return { type: "issue-create" };
  }

  const issueMatch = path.match(/^\/issues?\/([^/]+)\/([^/]+)\/(\d+)$/);
  if (issueMatch) {
    return {
      type: "issue-detail",
      owner: issueMatch[1]!,
      repo: issueMatch[2]!,
      number: Number(issueMatch[3]),
    };
  }

  const repositoryMatch = path.match(
    /^\/repositories\/([^/]+)\/([^/]+)\/(issues|kanban|gantt)$/,
  );
  if (repositoryMatch) {
    return {
      type: "repository-view",
      owner: decodeURIComponent(repositoryMatch[1]!),
      repo: decodeURIComponent(repositoryMatch[2]!),
      view: repositoryMatch[3] as WorkspaceView,
    };
  }

  return { type: "not-found" };
}

export function safeReturnTo(
  value: string | null | undefined,
): string | undefined {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.length > 2048
  )
    return undefined;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return undefined;
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const route = resolveAppRoute(path);
    if (route.type === "not-found") return undefined;
    url.searchParams.delete("portalAuthError");
    const view = workViewForRoute(route);
    if (view) url.search = sanitizeWorkViewSearch(url.search, view);
    return `${path}${url.search}`;
  } catch {
    return undefined;
  }
}
