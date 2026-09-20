import type { RepositoryRef } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';
import { validateIssueCreate } from './issue-validation.js';

export async function createIssue(client: GiteaClient, repository: RepositoryRef, input: unknown) {
  validateIssueCreate(input);
  return client.createIssue(repository, input);
}

export async function updateIssue(client: GiteaClient, repository: RepositoryRef, number: number, input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Issue update payload is required');
  return client.updateIssue(repository, number, input);
}
