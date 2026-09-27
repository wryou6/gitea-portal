export type BoardView = "kanban" | "gantt";
export type WorkspaceView = "issues" | BoardView;

export const routePaths = {
  dashboard: "/dashboard",
  issues: "/issues",
  issueCreate: "/issues/new",
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
  repositoryView: (owner: string, repo: string, view: WorkspaceView) =>
    `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${view}`,
  boardSettings: "/boards",
  boardSelection: (view: BoardView) => `/${view}`,
  boardIssues: (boardId: string) =>
    `/boards/${encodeURIComponent(boardId)}/issues`,
  boardView: (boardId: string, view: BoardView) =>
    `/boards/${encodeURIComponent(boardId)}/${view}`,
};

export type AppRoute =
  | { type: "dashboard" }
  | { type: "issues" }
  | { type: "issue-create" }
  | { type: "issue-detail"; owner: string; repo: string; number: number }
  | { type: "settings" }
  | { type: "board-settings" }
  | { type: "board-selection"; viewIntent: BoardView }
  | {
      type: "repository-view";
      owner: string;
      repo: string;
      view: WorkspaceView;
    }
  | { type: "board-view"; boardId: string; view: WorkspaceView };

export function resolveAppRoute(pathname: string, search = ""): AppRoute {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (path === routePaths.settings) return { type: "settings" };
  if (path === "/" || path === routePaths.dashboard)
    return { type: "dashboard" };
  if (path === routePaths.issues) return { type: "issues" };
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

  if (path === "/kanban" || path === "/gantt") {
    return { type: "board-selection", viewIntent: path.slice(1) as BoardView };
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

  if (path === routePaths.boardSettings) {
    const legacyView = new URLSearchParams(search).get("view");
    if (legacyView === "kanban" || legacyView === "gantt") {
      return { type: "board-selection", viewIntent: legacyView };
    }
    return { type: "board-settings" };
  }

  const boardMatch = path.match(
    /^\/boards\/([^/]+)(?:\/(issues|kanban|gantt))?$/,
  );
  if (boardMatch) {
    return {
      type: "board-view",
      boardId: boardMatch[1]!,
      view: (boardMatch[2] as WorkspaceView | undefined) ?? "kanban",
    };
  }

  return { type: "issues" };
}

export function safeReturnTo(
  value: string | null | undefined,
): string | undefined {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return undefined;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return undefined;
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const knownRoute =
      path === "/issues" ||
      /^\/repositories\/[^/]+\/[^/]+\/(issues|kanban|gantt)$/.test(path) ||
      /^\/boards\/[^/]+\/(issues|kanban|gantt)$/.test(path);
    return knownRoute ? `${path}${url.search}` : undefined;
  } catch {
    return undefined;
  }
}
