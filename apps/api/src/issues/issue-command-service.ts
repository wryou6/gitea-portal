import type { RepositoryRef } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';
import { PortalError } from '../errors.js';
import { validateIssueCreate, validateIssueUpdate, type IssueMutationInput } from './issue-validation.js';
import { mapIssue } from './issue-service.js';

export async function createIssue(client: GiteaClient, repository: RepositoryRef, input: unknown) {
  validateIssueCreate(input);
  const payload = await toGiteaPayload(client, repository, input, 'create');
  return mapIssue(await client.createIssue(repository, payload));
}

export async function updateIssue(client: GiteaClient, repository: RepositoryRef, number: number, input: unknown) {
  validateIssueUpdate(input);
  const labels = input.labels;
  const payload = await toGiteaPayload(client, repository, input, 'update');
  if (labels !== undefined) delete payload.labels;
  await client.updateIssue(repository, number, payload);
  if (labels !== undefined) {
    const labelIds = await resolveLabelIds(client, repository, labels);
    await client.replaceIssueLabels(repository, number, labelIds);
  }
  return mapIssue(await client.issue(repository, number));
}

async function toGiteaPayload(client: GiteaClient, repository: RepositoryRef, input: IssueMutationInput, operation: 'create' | 'update'): Promise<Record<string, unknown>> {
  const payload: Record<string, unknown> = { ...input };
  if (operation === 'create' && input.state !== undefined) {
    payload.closed = input.state === 'closed';
    delete payload.state;
  }
  if (input.labels !== undefined) payload.labels = await resolveLabelIds(client, repository, input.labels);
  if (input.milestone !== undefined) payload.milestone = input.milestone === null ? 0 : await resolveMilestoneId(client, repository, input.milestone);
  if (input.assignee === null) {
    delete payload.assignee;
    payload.assignees = [];
  }
  return payload;
}

async function resolveLabelIds(client: GiteaClient, repository: RepositoryRef, names: string[]): Promise<number[]> {
  const labels = await client.labels(repository);
  return names.map((name) => {
    const label = labels.find((candidate) => candidate.name === name);
    if (!label) throw new PortalError(422, `Label does not exist in Gitea: ${name}`);
    return label.id;
  });
}

async function resolveMilestoneId(client: GiteaClient, repository: RepositoryRef, value: string): Promise<number> {
  const milestones = await client.milestones(repository);
  const milestone = milestones.find((candidate) => candidate.title === value || String(candidate.id) === value);
  if (!milestone) throw new PortalError(422, `Milestone does not exist in Gitea: ${value}`);
  return milestone.id;
}
