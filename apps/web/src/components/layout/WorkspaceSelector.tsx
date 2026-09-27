import { useEffect, useState } from "react";
import { resolveAppRoute, routePaths, safeReturnTo } from "../../app/routes";
import { api, toUserFacingError, type Repository, type UserFacingError } from "../../lib/api";
import { ErrorNotice } from "../feedback/ErrorNotice";
import type { Board } from "../../features/boards/types";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("common");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<UserFacingError>();

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      api<Repository[]>("/api/repositories"),
      api<Board[]>("/api/boards")
        .then((nextBoards) => ({
          nextBoards,
          error: undefined as UserFacingError | undefined,
        }))
        .catch((cause) => ({
          nextBoards: [] as Board[],
          error: toUserFacingError(cause, t("boardListLoadError")),
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
          setError(toUserFacingError(cause, t("workspaceListLoadError")));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

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
      <label htmlFor="workspace-selector">{t("workspace")}</label>
      <select
        id="workspace-selector"
        aria-label={t("switchWorkspace")}
        value={selected}
        onChange={(event) => navigate(event.target.value)}
      >
        <option value="">{loading ? t("loadingWorkspace") : t("selectWorkspace")}</option>
        <option value="all">{t("allIssues")}</option>
        <optgroup label={t("repositoryWorkspace")}>
          {repositories.map((repository) => (
            <option
              key={repository.fullName}
              value={`repository:${repository.owner}/${repository.name}`}
            >
              {repository.fullName}
            </option>
          ))}
        </optgroup>
        <optgroup label={t("crossRepositoryBoards")}>
          {availableBoards.map((board) => (
            <option key={board.id} value={`board:${board.id}`}>
              {board.name}
            </option>
          ))}
        </optgroup>
      </select>
      {error && <ErrorNotice message={error} />}
    </div>
  );
}
