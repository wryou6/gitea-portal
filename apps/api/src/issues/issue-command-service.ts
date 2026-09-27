import type { RepositoryRef } from '@gitea-portal/domain';
import { GiteaClient } from '../gitea/client.js';
import { PortalError } from '../errors.js';
import { validateIssueCreate, validateIssueUpdate, type IssueMutationInput } from './issue-validation.js';
import { mapIssue } from './issue-service.js';
import { issueCreateLabelIds, refreshedScheduleMessage, scheduleMutationError, updateIssueLabelsAndSchedule } from './issue-schedule-service.js';

export async function createIssue(client: GiteaClient, repository: RepositoryRef, input: unknown) {
  validateIssueCreate(input);
  const payload = await toGiteaPayload(client, repository, input, 'create');
  payload.labels = await issueCreateLabelIds(client, repository, input.type, input.priority, input.labels, input.startDate);
  return mapIssue(await client.createIssue(repository, payload));
}

export async function updateIssue(client: GiteaClient, repository: RepositoryRef, number: number, input: unknown) {
  validateIssueUpdate(input);
  const labels = input.labels;
  const current = await client.issue(repository, number);
  if (input.expectedUpdatedAt !== current.updatedAt) throw new PortalError(409, 'Issue changed in Gitea; reload before saving your changes');
  const payload = await toGiteaPayload(client, repository, input, 'update');
  delete payload.labels;
  const hasScheduleMutation = input.startDate !== undefined || input.dueDate !== undefined;
  let updated = current;
  try {
    updated = await updateIssueLabelsAndSchedule(client, repository, current, labels, input.startDate, input.type, input.priority);
    if (Object.keys(payload).length > 0) updated = await client.updateIssue(repository, number, payload);
  } catch (error) {
    if (hasScheduleMutation) {
      throw scheduleMutationError(error, await refreshedScheduleMessage(client, repository, number));
    }
    throw error;
  }
  return mapIssue(updated);
}

async function toGiteaPayload(client: GiteaClient, repository: RepositoryRef, input: IssueMutationInput, operation: 'create' | 'update'): Promise<Record<string, unknown>> {
  const payload: Record<string, unknown> = { ...input };
  delete payload.startDate;
  delete payload.dueDate;
  delete payload.type;
  delete payload.priority;
  if (operation === 'create' && input.state !== undefined) {
    payload.closed = input.state === 'closed';
    delete payload.state;
  }
  if (input.dueDate) payload.due_date = `${input.dueDate}T00:00:00Z`;
  if (operation === 'update' && input.dueDate === null) payload.unset_due_date = true;
  if (input.milestone !== undefined) payload.milestone = input.milestone === null ? 0 : await resolveMilestoneId(client, repository, input.milestone);
  if (input.assignee === null) {
    delete payload.assignee;
    payload.assignees = [];
  }
  return payload;
}

async function resolveMilestoneId(client: GiteaClient, repository: RepositoryRef, value: string): Promise<number> {
  const milestones = await client.milestones(repository);
  const milestone = milestones.find((candidate) => candidate.title === value || String(candidate.id) === value);
  if (!milestone) throw new PortalError(422, `Milestone does not exist in Gitea: ${value}`);
  return milestone.id;
}
