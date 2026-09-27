import type { Board, RepositoryRef } from "@gitea-portal/domain";
import { PortalError } from "../errors.js";

export function validateBoardRepositories(
  _board: Pick<Board, "repositoryRefs">,
  repositories: RepositoryRef[],
): void {
  const distinct = new Set(
    repositories.map((repository) => `${repository.owner}/${repository.name}`),
  );
  if (distinct.size < 2)
    throw new PortalError(422, "跨庫看板至少需要兩個不同的 Repository");
  if (distinct.size !== repositories.length)
    throw new PortalError(422, "跨庫看板不可重複選擇 Repository");
}
