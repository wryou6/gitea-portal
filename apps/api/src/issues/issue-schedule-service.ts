import type {
  IssueLabel,
  IssuePriority,
  IssueType,
  RepositoryRef,
} from "@gitea-portal/domain";
import {
  FIXED_ISSUE_STATUSES,
  isIssuePriorityLabelName,
  isIssueTypeLabelName,
  issuePriorityFromLabels,
  issuePriorityLabelName,
  issueScheduleFromLabels,
  issueTypeFromLabels,
  issueTypeLabelName,
  startDateLabelName,
  START_DATE_LABEL_PREFIX,
} from "@gitea-portal/domain";
import type { GiteaIssue } from "@gitea-portal/gitea-contracts";
import { PortalError } from "../errors.js";
import { GiteaError } from "../gitea/errors.js";
import { GiteaClient } from "../gitea/client.js";
import { replaceIssueLabelsAtomically } from "../gitea/label-replacement.js";

const DATE_LABEL_COLOR = "808080";
const TYPE_LABEL_COLORS: Record<IssueType, string> = {
  bug: "#d73a4a",
  feature: "#a2eeef",
  task: "#cfd3d7",
};
const TYPE_LABEL_DESCRIPTIONS: Record<IssueType, string> = {
  bug: "處理既有行為故障或與預期不符的工作",
  feature: "新增或改變產品能力",
  task: "文件、測試、維護或部署等支援性工作",
};
const PRIORITY_LABEL_COLORS: Record<IssuePriority, string> = {
  critical: "#b42318",
  high: "#c2410c",
  medium: "#9a6700",
  low: "#1f6feb",
};
const PRIORITY_LABEL_DESCRIPTIONS: Record<IssuePriority, string> = {
  critical: "最高優先級；需要立即處理",
  high: "高優先級；應優先排入近期工作",
  medium: "一般優先級；依正常工作順序處理",
  low: "低優先級；有餘裕時再處理",
};

function isStartDateLabel(name: string): boolean {
  return name.startsWith(START_DATE_LABEL_PREFIX);
}

async function startDateLabelId(
  client: GiteaClient,
  repository: RepositoryRef,
  date: string,
): Promise<{ id: number; name: string }> {
  const name = startDateLabelName(date);
  const existing = (await client.labels(repository)).find(
    (label) => label.name === name,
  );
  if (existing) return existing;

  try {
    return await client.createLabel(repository, {
      name,
      color: DATE_LABEL_COLOR,
      description: "Portal Issue start date",
    });
  } catch (error) {
    // A second writer may create the same repository label between lookup and POST.
    const concurrent = (await client.labels(repository)).find(
      (label) => label.name === name,
    );
    if (concurrent) return concurrent;
    throw error;
  }
}

async function issueTypeLabel(
  client: GiteaClient,
  repository: RepositoryRef,
  type: IssueType,
): Promise<{ id: number; name: string; color: string }> {
  const name = issueTypeLabelName(type);
  const existing = (await client.labels(repository)).find(
    (label) => label.name === name,
  );
  if (existing) return existing;

  try {
    return await client.createLabel(repository, {
      name,
      color: TYPE_LABEL_COLORS[type] ?? "#cfd3d7",
      description: TYPE_LABEL_DESCRIPTIONS[type],
    });
  } catch (error) {
    // Reuse the definition if another writer created it after the initial lookup.
    const concurrent = (await client.labels(repository)).find(
      (label) => label.name === name,
    );
    if (concurrent) return concurrent;
    throw error;
  }
}

async function issuePriorityLabel(
  client: GiteaClient,
  repository: RepositoryRef,
  priority: IssuePriority,
): Promise<{ id: number; name: string; color: string }> {
  const name = issuePriorityLabelName(priority);
  const existing = (await client.labels(repository)).find(
    (label) => label.name === name,
  );
  if (existing) return existing;

  try {
    return await client.createLabel(repository, {
      name,
      color: PRIORITY_LABEL_COLORS[priority],
      description: PRIORITY_LABEL_DESCRIPTIONS[priority],
    });
  } catch (error) {
    const concurrent = (await client.labels(repository)).find(
      (label) => label.name === name,
    );
    if (concurrent) return concurrent;
    throw error;
  }
}

async function labelIds(
  client: GiteaClient,
  repository: RepositoryRef,
  names: string[],
): Promise<number[]> {
  const definitions = await client.labels(repository);
  return names.map((name) => {
    const definition = definitions.find((label) => label.name === name);
    if (!definition)
      throw new PortalError(422, `Label does not exist in Gitea: ${name}`);
    return definition.id;
  });
}

export async function issueCreateLabelIds(
  client: GiteaClient,
  repository: RepositoryRef,
  type: IssueType,
  priority: IssuePriority,
  requestedNames: string[] = [],
  startDate?: string | null,
): Promise<number[]> {
  if (requestedNames.some(isStartDateLabel))
    throw new PortalError(
      422,
      "Start date Labels must be set with the startDate field",
    );
  const names = [...new Set(requestedNames)];
  const todoLabel = FIXED_ISSUE_STATUSES.find(
    (state) => state.key === "todo",
  )?.labelName;
  if (!todoLabel) throw new Error("Todo Status label is not configured");
  await client.ensureLabel(
    repository,
    todoLabel,
    "#2563eb",
    "Portal fixed Issue Status: Todo",
  );
  names.push(todoLabel);
  names.push((await issueTypeLabel(client, repository, type)).name);
  names.push((await issuePriorityLabel(client, repository, priority)).name);
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
  type: IssueType,
  priority: IssuePriority,
): Promise<GiteaIssue> {
  if (requestedNames?.some(isStartDateLabel))
    throw new PortalError(
      422,
      "Start date Labels must be set with the startDate field",
    );

  const existingDateLabels = issue.labels.filter((label) =>
    isStartDateLabel(label.name),
  );
  const statusLabels = issue.labels
    .filter(
      (label) =>
        label.name.startsWith("status:") ||
        label.name.startsWith("status-action:"),
    )
    .map((label) => label.name);
  const normalNames =
    requestedNames === undefined
      ? issue.labels
          .filter(
            (label) =>
              !isStartDateLabel(label.name) &&
              !isIssueTypeLabelName(label.name) &&
              !isIssuePriorityLabelName(label.name),
          )
          .map((label) => label.name)
      : [...new Set(requestedNames)];
  const selectedTypeLabel = await issueTypeLabel(client, repository, type);
  const selectedPriorityLabel = await issuePriorityLabel(
    client,
    repository,
    priority,
  );
  let dateNames = existingDateLabels.map((label) => label.name);
  if (startDate !== undefined) {
    dateNames =
      startDate === null
        ? []
        : [(await startDateLabelId(client, repository, startDate)).name];
  }
  const nextNames = [
    ...normalNames,
    ...statusLabels,
    ...dateNames,
    selectedTypeLabel.name,
    selectedPriorityLabel.name,
  ];
  const currentNames = issue.labels.map((label) => label.name);
  if (
    requestedNames === undefined &&
    startDate === undefined &&
    issueTypeFromLabels(issue.labels) === type &&
    issuePriorityFromLabels(issue.labels) === priority
  )
    return issue;

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

export function actualScheduleMessage(
  labels: IssueLabel[],
  dueDate: string | null,
): string {
  const schedule = issueScheduleFromLabels(labels, dueDate);
  return `Gitea 實際排程：start date ${schedule.startDate ?? "未設定"}；due date ${schedule.dueDate ?? "未設定"}。`;
}

export async function refreshedScheduleMessage(
  client: GiteaClient,
  repository: RepositoryRef,
  number: number,
): Promise<string> {
  try {
    const current = await client.issue(repository, number);
    return actualScheduleMessage(current.labels, current.dueDate);
  } catch (error) {
    return `無法重新讀取 Gitea 實際排程：${error instanceof Error ? error.message : String(error)}`;
  }
}

export function scheduleMutationError(
  error: unknown,
  currentSchedule: string,
): PortalError {
  const message =
    error instanceof GiteaError
      ? `Gitea 排程更新失敗：${error.message}`
      : error instanceof Error
        ? error.message
        : "排程更新失敗";
  const status =
    error instanceof GiteaError &&
    (error.status === 401 || error.status === 403 || error.status === 409)
      ? error.status
      : error instanceof PortalError && error.status === 422
        ? 422
        : 502;
  return new PortalError(status, `${message} ${currentSchedule}`);
}
