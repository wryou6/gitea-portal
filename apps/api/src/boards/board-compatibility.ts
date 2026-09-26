import type {
  Board,
  RepositoryRef,
  WorkflowConvention,
} from "@gitea-portal/domain";
import { PortalError } from "../errors.js";

export function validateBoardRepositories(
  board: Pick<
    Board,
    "workflowConventionId" | "workflowConventionVersion" | "repositoryRefs"
  >,
  repositories: RepositoryRef[],
  conventions: WorkflowConvention[],
): void {
  const distinct = new Set(
    repositories.map((repository) => `${repository.owner}/${repository.name}`),
  );
  if (distinct.size < 2)
    throw new PortalError(422, "跨庫看板至少需要兩個不同的 Repository");
  if (distinct.size !== repositories.length)
    throw new PortalError(422, "跨庫看板不可重複選擇 Repository");
  const convention = conventions.find(
    (item) =>
      item.id === board.workflowConventionId &&
      item.version === board.workflowConventionVersion,
  );
  if (!convention)
    throw new PortalError(422, "Workflow Convention version is unavailable");
  const allowed = new Set(
    (convention as WorkflowConvention & { repositories?: string[] })
      .repositories ?? [],
  );
  for (const repository of repositories) {
    if (!allowed.has(`${repository.owner}/${repository.name}`))
      throw new PortalError(
        422,
        `Repository ${repository.owner}/${repository.name} is not compatible with this Workflow Convention`,
      );
  }
}
