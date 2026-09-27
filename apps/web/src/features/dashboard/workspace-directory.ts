import type { Repository } from "../../lib/api";
import { routePaths } from "../../app/routes";

export type WorkspaceDirectoryItem = {
  id: string;
  kind: "allRepositories" | "repository";
  name?: string;
  href: string;
};

export function buildWorkspaceDirectory(
  repositories: Repository[],
): WorkspaceDirectoryItem[] {
  return [
    { id: "all-repositories", kind: "allRepositories", href: routePaths.gantt },
    ...repositories.map((repository) => ({
      id: `repository:${repository.owner}/${repository.name}`,
      kind: "repository" as const,
      name: repository.fullName,
      href: routePaths.repositoryView(repository.owner, repository.name, "issues"),
    })),
  ];
}
