import type { IssueLabel, RepositoryRef } from '@gitea-portal/domain';
import { issueScheduleFromLabels, startDateLabelName, START_DATE_LABEL_PREFIX } from '@gitea-portal/domain';
import type { GiteaIssue } from '@gitea-portal/gitea-contracts';
import { PortalError } from '../errors.js';
import { GiteaError } from '../gitea/errors.js';
import { GiteaClient } from '../gitea/client.js';
import { replaceIssueLabelsAtomically } from '../gitea/label-replacement.js';

const DATE_LABEL_COLOR = '808080';

function isStartDateLabel(name: string): boolean {
  return name.startsWith(START_DATE_LABEL_PREFIX);
}

async function startDateLabelId(client: GiteaClient, repository: RepositoryRef, date: string): Promise<{ id: number; name: string }> {
  const name = startDateLabelName(date);
  const existing = (await client.labels(repository)).find((label) => label.name === name);
  if (existing) return existing;

  try {
    return await client.createLabel(repository, {
      name,
      color: DATE_LABEL_COLOR,
      description: 'Portal Issue start date',
    });
  } catch (error) {
    // A second writer may create the same repository label between lookup and POST.
    const concurrent = (await client.labels(repository)).find((label) => label.name === name);
    if (concurrent) return concurrent;
    throw error;
  }
}

async function labelIds(client: GiteaClient, repository: RepositoryRef, names: string[]): Promise<number[]> {
  const definitions = await client.labels(repository);
  return names.map((name) => {
    const definition = definitions.find((label) => label.name === name);
    if (!definition) throw new PortalError(422, `Label does not exist in Gitea: ${name}`);
    return definition.id;
  });
}

export async function issueCreateLabelIds(
  client: GiteaClient,
  repository: RepositoryRef,
  requestedNames: string[] = [],
  startDate?: string | null,
): Promise<number[]> {
  if (requestedNames.some(isStartDateLabel)) throw new PortalError(422, 'Start date Labels must be set with the startDate field');
  const names = [...new Set(requestedNames)];
  if (startDate) {
    const definition = await startDateLabelId(client, repository, startDate);
    names.push(definition.name);
  }
  return labelIds(client, repository, names);
}

export async function updateIssueLabelsAndSchedule(
  client: GiteaClient,
  repository: RepositoryRef,
  issue: GiteaIssue,
  requestedNames: string[] | undefined,
  startDate: string | null | undefined,
): Promise<GiteaIssue> {
  if (requestedNames?.some(isStartDateLabel)) throw new PortalError(422, 'Start date Labels must be set with the startDate field');

  const existingDateLabels = issue.labels.filter((label) => isStartDateLabel(label.name));
  const normalNames = requestedNames === undefined
    ? issue.labels.filter((label) => !isStartDateLabel(label.name)).map((label) => label.name)
    : [...new Set(requestedNames)];
  let dateNames = existingDateLabels.map((label) => label.name);
  if (startDate !== undefined) {
    dateNames = startDate === null ? [] : [(await startDateLabelId(client, repository, startDate)).name];
  }
  const nextNames = [...normalNames, ...dateNames];
  const currentNames = issue.labels.map((label) => label.name);
  if (requestedNames === undefined && startDate === undefined) return issue;

  return replaceIssueLabelsAtomically(
    client,
    repository,
    issue.number,
    issue.updatedAt,
    currentNames,
    await labelIds(client, repository, nextNames),
    nextNames,
  );
}

export function actualScheduleMessage(labels: IssueLabel[], dueDate: string | null): string {
  const schedule = issueScheduleFromLabels(labels, dueDate);
  return `Gitea 實際排程：start date ${schedule.startDate ?? '未設定'}；due date ${schedule.dueDate ?? '未設定'}。`;
}

export async function refreshedScheduleMessage(client: GiteaClient, repository: RepositoryRef, number: number): Promise<string> {
  try {
    const current = await client.issue(repository, number);
    return actualScheduleMessage(current.labels, current.dueDate);
  } catch (error) {
    return `無法重新讀取 Gitea 實際排程：${error instanceof Error ? error.message : String(error)}`;
  }
}

export function scheduleMutationError(error: unknown, currentSchedule: string): PortalError {
  const message = error instanceof GiteaError
    ? `Gitea 排程更新失敗：${error.message}`
    : error instanceof Error ? error.message : '排程更新失敗';
  const status = error instanceof GiteaError && (error.status === 401 || error.status === 403 || error.status === 409)
    ? error.status
    : error instanceof PortalError && error.status === 422 ? 422 : 502;
  return new PortalError(status, `${message} ${currentSchedule}`);
}
