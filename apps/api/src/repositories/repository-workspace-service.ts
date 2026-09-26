import type { RepositoryRef, WorkflowConvention } from "@gitea-portal/domain";
import type { GiteaRepository } from "@gitea-portal/gitea-contracts";
import { canAccessRepository } from "../auth/permissions.js";
import { PortalError } from "../errors.js";
import { GiteaClient } from "../gitea/client.js";
import { getWorkflowColumns } from "../boards/board-view-service.js";
import { mapIssue } from "../issues/issue-service.js";

export type RepositoryWorkspaceView = GiteaRepository & {
  conventionId: string | null;
  conventionVersion: string | null;
};

export async function getRepositoryWorkspace(
  client: GiteaClient,
  repository: RepositoryRef,
  conventions: WorkflowConvention[],
): Promise<RepositoryWorkspaceView> {
  if (!(await canAccessRepository(client, repository, "read"))) {
    throw new PortalError(403, "Permission denied for this Repository");
  }
  const visibleRepository = (await client.repositories()).find(
    (item) => item.owner === repository.owner && item.name === repository.name,
  );
  if (!visibleRepository) throw new PortalError(404, "Repository not found");
  const convention = conventions.find((item) =>
    item.repositories?.includes(`${repository.owner}/${repository.name}`),
  );
  return {
    ...visibleRepository,
    conventionId: convention?.id ?? null,
    conventionVersion: convention?.version ?? null,
  };
}

export function requireRepositoryConvention(
  repository: RepositoryWorkspaceView,
  conventions: WorkflowConvention[],
): WorkflowConvention {
  const convention = conventions.find(
    (item) =>
      item.id === repository.conventionId &&
      item.version === repository.conventionVersion,
  );
  if (
    !repository.conventionId ||
    !repository.conventionVersion ||
    !convention
  ) {
    throw new PortalError(
      422,
      "Repository has no compatible Workflow Convention assignment",
    );
  }
  return convention;
}

export async function getRepositoryKanban(
  client: GiteaClient,
  repository: RepositoryWorkspaceView,
  convention: WorkflowConvention,
) {
  const columns = await getWorkflowColumns(client, [repository], convention);
  return {
    repository,
    conventionId: convention.id,
    conventionVersion: convention.version,
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
