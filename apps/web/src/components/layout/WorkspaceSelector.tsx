import { useEffect, useState } from "react";
import { resolveAppRoute, routePaths, safeReturnTo } from "../../app/routes";
import { api, type Repository } from "../../lib/api";
import type { Board } from "../../features/boards/types";

function routeContext() {
  const route = resolveAppRoute(
    window.location.pathname,
    window.location.search,
  );
  if (route.type !== "issue-detail" && route.type !== "issue-create")
    return route;
  const returnTo = safeReturnTo(
    new URLSearchParams(window.location.search).get("returnTo"),
  );
  if (!returnTo) return resolveAppRoute(routePaths.issues);
  const target = new URL(returnTo, window.location.origin);
  return resolveAppRoute(target.pathname, target.search);
}

function routeWorkspaceValue(): string {
  const route = routeContext();
  if (route.type === "repository-view")
    return `repository:${route.owner}/${route.repo}`;
  if (route.type === "board-view") return `board:${route.boardId}`;
  if (route.type === "issues") return "all";
  return "";
}

export function WorkspaceSelector({
  onCrossRepositoryBoardSelected,
}: {
  onCrossRepositoryBoardSelected: (selected: boolean) => void;
}) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      api<Repository[]>("/api/repositories"),
      api<Board[]>("/api/boards")
        .then((nextBoards) => ({
          nextBoards,
          error: undefined as string | undefined,
        }))
        .catch((cause) => ({
          nextBoards: [] as Board[],
          error:
            cause instanceof Error ? cause.message : "跨庫看板清單無法載入",
        })),
    ])
      .then(([nextRepositories, boardResult]) => {
        if (cancelled) return;
        setRepositories(nextRepositories);
        setBoards(boardResult.nextBoards);
        setError(boardResult.error);
      })
      .catch((cause) => {
        if (!cancelled)
          setError(
            cause instanceof Error ? cause.message : "工作區清單無法載入",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const readableRepositories = new Set(
    repositories.map((repository) => `${repository.owner}/${repository.name}`),
  );
  const availableBoards = boards.filter(
    (board) =>
      board.repositoryRefs.length >= 2 &&
      board.repositoryRefs.every((repository) =>
        readableRepositories.has(`${repository.owner}/${repository.name}`),
      ),
  );
  const candidate = routeWorkspaceValue();
  const selected =
    candidate === "all" ||
    repositories.some(
      (repository) =>
        candidate === `repository:${repository.owner}/${repository.name}`,
    ) ||
    availableBoards.some((board) => candidate === `board:${board.id}`)
      ? candidate
      : "";

  useEffect(() => {
    onCrossRepositoryBoardSelected(selected.startsWith("board:"));
  }, [onCrossRepositoryBoardSelected, selected]);

  const navigate = (value: string) => {
    if (value === "all") window.location.href = routePaths.issues;
    else if (value.startsWith("repository:")) {
      const [owner, repo] = value.slice("repository:".length).split("/", 2);
      if (owner && repo)
        window.location.href = routePaths.repositoryView(owner, repo, "issues");
    } else if (value.startsWith("board:")) {
      window.location.href = routePaths.boardIssues(
        value.slice("board:".length),
      );
    }
  };

  return (
    <div className="workspace-selector">
      <label htmlFor="workspace-selector">工作區</label>
      <select
        id="workspace-selector"
        aria-label="切換工作區"
        value={selected}
        onChange={(event) => navigate(event.target.value)}
      >
        <option value="">{loading ? "載入工作區…" : "選擇工作區"}</option>
        <option value="all">全部 Issues</option>
        <optgroup label="Repository 工作區">
          {repositories.map((repository) => (
            <option
              key={repository.fullName}
              value={`repository:${repository.owner}/${repository.name}`}
            >
              {repository.fullName}
            </option>
          ))}
        </optgroup>
        <optgroup label="跨庫看板">
          {availableBoards.map((board) => (
            <option key={board.id} value={`board:${board.id}`}>
              {board.name}
            </option>
          ))}
        </optgroup>
      </select>
      {error && (
        <span className="workspace-selector-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
