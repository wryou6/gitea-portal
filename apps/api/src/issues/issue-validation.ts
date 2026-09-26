import { PortalError } from '../errors.js';
import { isCalendarDate, isIssueType } from '@gitea-portal/domain';

export type IssueMutationInput = { title?: string; body?: string; state?: 'open' | 'closed'; assignee?: string | null; labels?: string[]; type?: string; milestone?: string | null; startDate?: string | null; dueDate?: string | null; expectedUpdatedAt?: string };

function validateIssueInput(input: unknown, requireTitle: boolean): asserts input is IssueMutationInput {
  if (!input || typeof input !== 'object') throw new PortalError(422, 'Issue payload is required');
  const value = input as Record<string, unknown>;
  if (requireTitle && (typeof value.title !== 'string' || !value.title.trim())) throw new PortalError(422, 'Issue title is required');
  if (value.title !== undefined && (typeof value.title !== 'string' || !value.title.trim())) throw new PortalError(422, 'Issue title is required');
  if (value.body !== undefined && typeof value.body !== 'string') throw new PortalError(422, 'Issue body must be a string');
  if (value.state !== undefined && value.state !== 'open' && value.state !== 'closed') throw new PortalError(422, 'Issue state is invalid');
  if (value.assignee !== undefined && value.assignee !== null && (typeof value.assignee !== 'string' || !value.assignee.trim())) throw new PortalError(422, 'Issue assignee is invalid');
  if (value.labels !== undefined && (!Array.isArray(value.labels) || value.labels.some((label) => typeof label !== 'string' || !label.trim()))) throw new PortalError(422, 'Issue labels are invalid');
  if (value.labels !== undefined && (value.labels as string[]).some((label) => label.startsWith('type:'))) throw new PortalError(422, '請透過 Issue Type 欄位設定 Type Label');
  if (!isIssueType(value.type)) throw new PortalError(422, 'Issue Type 必須是 Bug、Feature 或 Task');
  if (value.milestone !== undefined && value.milestone !== null && (typeof value.milestone !== 'string' || !value.milestone.trim())) throw new PortalError(422, 'Issue milestone is invalid');
  if (value.expectedUpdatedAt !== undefined && (typeof value.expectedUpdatedAt !== 'string' || !Number.isFinite(Date.parse(value.expectedUpdatedAt)))) throw new PortalError(422, 'expectedUpdatedAt must be a valid timestamp');
  if (!requireTitle && (typeof value.expectedUpdatedAt !== 'string' || !Number.isFinite(Date.parse(value.expectedUpdatedAt)))) throw new PortalError(422, 'expectedUpdatedAt is required for Issue updates');
  for (const dateField of ['startDate', 'dueDate']) {
    const date = value[dateField];
    if (date !== undefined && date !== null && !isCalendarDate(date)) throw new PortalError(422, `${dateField} must be a valid YYYY-MM-DD calendar date`);
  }
}

export function validateIssueCreate(input: unknown): asserts input is IssueMutationInput & { title: string; type: 'bug' | 'feature' | 'task' } {
  validateIssueInput(input, true);
}

export function validateIssueUpdate(input: unknown): asserts input is IssueMutationInput & { type: 'bug' | 'feature' | 'task' } {
  validateIssueInput(input, false);
}

export function validateComment(body: unknown): string {
  if (typeof body !== 'string' || !body.trim()) throw new Error('Comment body is required');
  return body.trim();
}
