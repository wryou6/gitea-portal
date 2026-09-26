export type BoardView = "kanban" | "gantt";

export const routePaths = {
  issues: "/issues",
  issueCreate: "/issues/new",
  issueDetail: (owner: string, repo: string, number: number) =>
    `/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${number}`,
  boardSettings: "/boards",
  boardSelection: (view: BoardView) => `/${view}`,
  boardView: (boardId: string, view: BoardView) =>
    `/boards/${encodeURIComponent(boardId)}/${view}`,
};

export type AppRoute =
  | { type: "issues" }
  | { type: "issue-create" }
  | { type: "issue-detail"; owner: string; repo: string; number: number }
  | { type: "board-settings" }
  | { type: "board-selection"; viewIntent: BoardView }
  | { type: "board-view"; boardId: string; view: BoardView };

export function resolveAppRoute(pathname: string, search = ""): AppRoute {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (path === "/" || path === routePaths.issues) return { type: "issues" };
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

  if (path === routePaths.boardSettings) {
    const legacyView = new URLSearchParams(search).get("view");
    if (legacyView === "kanban" || legacyView === "gantt") {
      return { type: "board-selection", viewIntent: legacyView };
    }
    return { type: "board-settings" };
  }

  const boardMatch = path.match(/^\/boards\/([^/]+)(?:\/(kanban|gantt))?$/);
  if (boardMatch) {
    return {
      type: "board-view",
      boardId: boardMatch[1]!,
      view: (boardMatch[2] as BoardView | undefined) ?? "kanban",
    };
  }

  return { type: "issues" };
}
