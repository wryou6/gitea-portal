import type { GiteaComment } from '@gitea-portal/gitea-contracts';
import type { RepositoryRef } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';

export async function getIssueComments(client: GiteaClient, repository: RepositoryRef, number: number): Promise<GiteaComment[]> {
  const comments = await client.comments(repository, number);
  return comments.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}
