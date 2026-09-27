import type { RepositoryRef } from "@gitea-portal/domain";
import type { GiteaRepository } from "@gitea-portal/gitea-contracts";
import { canAccessRepository } from "../auth/permissions.js";
import { PortalError } from "../errors.js";
import { GiteaClient } from "../gitea/client.js";
import { getWorkflowColumns } from "../work-views/kanban-service.js";
import { mapIssue } from "../issues/issue-service.js";

export type RepositoryWorkspaceView = GiteaRepository;

export async function getRepositoryWorkspace(
  client: GiteaClient,
  repository: RepositoryRef,
): Promise<RepositoryWorkspaceView> {
  if (!(await canAccessRepository(client, repository, "read"))) {
    throw new PortalError(403, "Permission denied for this Repository");
  }
  const visibleRepository = (await client.repositories()).find(
    (item) => item.owner === repository.owner && item.name === repository.name,
  );
  if (!visibleRepository) throw new PortalError(404, "Repository not found");
  return visibleRepository;
}

export async function getRepositoryKanban(
  client: GiteaClient,
  repository: RepositoryWorkspaceView,
) {
  const columns = await getWorkflowColumns(client, [repository]);
  return {
    repository,
    columns,
  };
}

export async function getRepositoryGantt(
  client: GiteaClient,
  repository: RepositoryWorkspaceView,
) {
  const issues = await client.repositoryIssuesAllPages(repository, {
    state: "all",
    type: "issues",
  });
  return { repository, issues: issues.map(mapIssue) };
}
