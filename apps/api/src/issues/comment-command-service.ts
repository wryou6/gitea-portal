import type { GiteaComment } from '@gitea-portal/gitea-contracts';
import type { RepositoryRef } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';

export async function addIssueComment(client: GiteaClient, repository: RepositoryRef, number: number, body: unknown): Promise<GiteaComment> {
  if (typeof body !== 'string' || !body.trim()) throw new Error('Comment body must not be empty');
  return client.createComment(repository, number, body.trim());
}
