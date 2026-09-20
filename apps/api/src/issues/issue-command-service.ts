import type { RepositoryRef } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';
import { validateIssueCreate } from './issue-validation.js';
import { mapIssue } from './issue-service.js';

export async function createIssue(client: GiteaClient, repository: RepositoryRef, input: unknown) {
  validateIssueCreate(input);
  return mapIssue(await client.createIssue(repository, input));
}

export async function updateIssue(client: GiteaClient, repository: RepositoryRef, number: number, input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Issue update payload is required');
  return mapIssue(await client.updateIssue(repository, number, input));
}
