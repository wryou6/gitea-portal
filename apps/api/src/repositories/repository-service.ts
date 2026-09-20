import type { GiteaRepository } from '@gitea-portal/gitea-contracts';
import type { WorkflowConvention } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';

export function listRepositories(client: GiteaClient, conventions: WorkflowConvention[]): Promise<Array<GiteaRepository & { conventionId: string | null; conventionVersion: string | null }>> {
  return client.repositories().then((repositories) => repositories.map((repository) => {
    const assignment = conventions.find((convention) => (convention as WorkflowConvention & { repositories?: string[] }).repositories?.includes(`${repository.owner}/${repository.name}`));
    return { ...repository, conventionId: assignment?.id ?? null, conventionVersion: assignment?.version ?? null };
  }));
}
