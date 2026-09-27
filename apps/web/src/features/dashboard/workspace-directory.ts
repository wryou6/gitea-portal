import type { Board } from "../boards/types";
import type { Repository } from "../../lib/api";
import { routePaths } from "../../app/routes";

export type WorkspaceDirectoryItem = {
  id: string;
  kind: "repository" | "board";
  name: string;
  href: string;
  repositoryRefs: Array<{ owner: string; name: string }>;
};

export function buildWorkspaceDirectory(
  repositories: Repository[],
  boards: Board[],
): WorkspaceDirectoryItem[] {
  const readableRepositories = new Set(
    repositories.map((repository) => `${repository.owner}/${repository.name}`),
  );

  const repositoryItems: WorkspaceDirectoryItem[] = repositories.map(
    (repository) => ({
      id: `repository:${repository.owner}/${repository.name}`,
      kind: "repository",
      name: repository.fullName,
      href: routePaths.repositoryView(
        repository.owner,
        repository.name,
        "issues",
      ),
      repositoryRefs: [{ owner: repository.owner, name: repository.name }],
    }),
  );

  const boardItems: WorkspaceDirectoryItem[] = boards
    .filter(
      (board) =>
        board.repositoryRefs.length >= 2 &&
        board.repositoryRefs.every((repository) =>
          readableRepositories.has(`${repository.owner}/${repository.name}`),
        ),
    )
    .map((board) => ({
      id: `board:${board.id}`,
      kind: "board",
      name: board.name,
      href: routePaths.boardIssues(board.id),
      repositoryRefs: board.repositoryRefs,
    }));

  return [...repositoryItems, ...boardItems];
}
