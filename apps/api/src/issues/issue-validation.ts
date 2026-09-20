import { PortalError } from '../errors.js';

export type IssueMutationInput = { title: string; body?: string; state?: 'open' | 'closed'; assignee?: string | null; labels?: string[]; milestone?: string | null };

function validateIssueInput(input: unknown, requireTitle: boolean): asserts input is IssueMutationInput {
  if (!input || typeof input !== 'object') throw new PortalError(422, 'Issue payload is required');
  const value = input as Record<string, unknown>;
  if (requireTitle && (typeof value.title !== 'string' || !value.title.trim())) throw new PortalError(422, 'Issue title is required');
  if (value.title !== undefined && (typeof value.title !== 'string' || !value.title.trim())) throw new PortalError(422, 'Issue title is required');
  if (value.body !== undefined && typeof value.body !== 'string') throw new PortalError(422, 'Issue body must be a string');
  if (value.state !== undefined && value.state !== 'open' && value.state !== 'closed') throw new PortalError(422, 'Issue state is invalid');
  if (value.assignee !== undefined && value.assignee !== null && (typeof value.assignee !== 'string' || !value.assignee.trim())) throw new PortalError(422, 'Issue assignee is invalid');
  if (value.labels !== undefined && (!Array.isArray(value.labels) || value.labels.some((label) => typeof label !== 'string' || !label.trim()))) throw new PortalError(422, 'Issue labels are invalid');
  if (value.milestone !== undefined && value.milestone !== null && (typeof value.milestone !== 'string' || !value.milestone.trim())) throw new PortalError(422, 'Issue milestone is invalid');
}

export function validateIssueCreate(input: unknown): asserts input is IssueMutationInput & { title: string } {
  validateIssueInput(input, true);
}

export function validateIssueUpdate(input: unknown): asserts input is IssueMutationInput {
  validateIssueInput(input, false);
}

export function validateComment(body: unknown): string {
  if (typeof body !== 'string' || !body.trim()) throw new Error('Comment body is required');
  return body.trim();
}
