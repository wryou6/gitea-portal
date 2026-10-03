import type { GiteaIssue } from "@gitea-portal/gitea-contracts";
import {
  FIXED_ISSUE_STATUSES,
  STATUS_ACTIONS,
  resolveIssueStatus,
  statusActionLabel,
  type StatusAction,
} from "@gitea-portal/domain";
import type { RepositoryRef } from "@gitea-portal/domain";
import { canAccessRepository } from "../auth/permissions.js";
import { PortalError } from "../errors.js";
import { GiteaClient } from "../gitea/client.js";
import { replaceIssueLabelsAtomically } from "../gitea/label-replacement.js";
import { mapIssue } from "../issues/issue-service.js";

export type TransitionInput = {
  actionKey?: string;
  selectedAssignee?: string;
  expectedUpdatedAt?: string;
};

function sameList(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function assigneeLogins(issue: GiteaIssue): string[] {
  return issue.assignees.map((assignee) => assignee.login);
}

function targetRoster(
  action: StatusAction,
  current: string[],
  selected?: string,
): string[] {
  const needsSelection = action.assigneePolicy === "required-handoff";
  const requiredWhenUnassigned =
    action.assigneePolicy === "require-if-unassigned" && current.length === 0;
  const canSelect = action.assigneePolicy === "optional-reviewer";
  if ((needsSelection || requiredWhenUnassigned) && !selected)
    throw new PortalError(422, "此轉換必須指定下一位負責人");
  if (selected && !needsSelection && !requiredWhenUnassigned && !canSelect)
    throw new PortalError(422, "此轉換不接受額外 Assignee");
  if (!selected) return current;
  return [selected, ...current.filter((login) => login !== selected)];
}

async function writeAssigneeOrder(
  client: GiteaClient,
  repository: RepositoryRef,
  number: number,
  target: string[],
): Promise<GiteaIssue> {
  await client.updateAssignees(repository, number, []);
  const cleared = await client.issue(repository, number);
  if (cleared.assignees.length !== 0)
    throw new PortalError(409, "Gitea did not clear the Assignee list");
  await client.updateAssignees(repository, number, target);
  const updated = await client.issue(repository, number);
  if (!sameList(assigneeLogins(updated), target))
    throw new PortalError(
      409,
      "Gitea did not preserve the requested Assignee order",
    );
  return updated;
}

async function replaceLabels(
  client: GiteaClient,
  repository: RepositoryRef,
  issue: GiteaIssue,
  names: string[],
): Promise<GiteaIssue> {
  const definitions = await client.labels(repository);
  const ids = names.map((name) => {
    const label = definitions.find((candidate) => candidate.name === name);
    if (!label)
      throw new PortalError(422, `Label does not exist in Gitea: ${name}`);
    return label.id;
  });
  return replaceIssueLabelsAtomically(
    client,
    repository,
    issue.number,
    issue.updatedAt,
    issue.labels.map((label) => label.name),
    ids,
    names,
  );
}

async function restoreSnapshot(
  client: GiteaClient,
  repository: RepositoryRef,
  number: number,
  original: GiteaIssue,
): Promise<GiteaIssue> {
  let current = await client.issue(repository, number);
  const originalNames = original.labels.map((label) => label.name);
  if (
    !sameList(
      current.labels.map((label) => label.name).sort(),
      originalNames.sort(),
    )
  ) {
    current = await replaceLabels(client, repository, current, originalNames);
  }
  if (current.state !== original.state) {
    current = await client.updateIssue(repository, number, {
      state: original.state,
    });
  }
  if (!sameList(assigneeLogins(current), assigneeLogins(original))) {
    current = await writeAssigneeOrder(
      client,
      repository,
      number,
      assigneeLogins(original),
    );
  }
  return client.issue(repository, number);
}

export async function transitionIssue(
  client: GiteaClient,
  repository: RepositoryRef,
  number: number,
  input: TransitionInput,
) {
  if (!(await canAccessRepository(client, repository, "update")))
    throw new PortalError(403, "目前使用者沒有修改此 Issue 的權限");
  if (!(await canAccessRepository(client, repository, "labels")))
    throw new PortalError(403, "目前使用者沒有修改此 Repository Labels 的權限");
  if (!input.actionKey || !input.expectedUpdatedAt)
    throw new PortalError(422, "actionKey 與 expectedUpdatedAt 為必填欄位");

  const action = STATUS_ACTIONS.find(
    (candidate) => candidate.key === input.actionKey,
  );
  if (!action) throw new PortalError(422, "未定義的 Status 動作");
  const original = await client.issue(repository, number);
  if (original.updatedAt !== input.expectedUpdatedAt)
    throw new PortalError(409, "Issue 已在 Gitea 更新，請重新載入");
  const resolved = resolveIssueStatus(original.state, original.labels);
  if (resolved.kind !== "status")
    throw new PortalError(
      409,
      "Issue Status 異常，請先修正 Gitea Labels",
    );
  if (resolved.key !== action.fromState)
    throw new PortalError(409, "此原因不適用於 Issue 目前狀態，請重新載入");

  const currentRoster = assigneeLogins(original);
  const nextRoster = targetRoster(
    action,
    currentRoster,
    input.selectedAssignee,
  );
  if (input.selectedAssignee) {
    const available = await client.assignees(repository);
    if (
      !available.some((candidate) => candidate.login === input.selectedAssignee)
    )
      throw new PortalError(422, "所選使用者目前不可指派至此 Repository");
  }

  const targetState = FIXED_ISSUE_STATUSES.find(
    (state) => state.key === action.toState,
  );
  if (!targetState)
    throw new PortalError(422, "Status 動作的目標狀態不存在");
  const actionName = statusActionLabel(action.key);
  await client.ensureLabel(
    repository,
    actionName,
    "#2563eb",
    `Portal status action: ${action.reasonLabel}`,
  );
  const targetStatusName = targetState.labelName;
  if (targetStatusName)
    await client.ensureLabel(
      repository,
      targetStatusName,
      "#1e3a5f",
      `Portal Issue Status: ${targetState.displayName}`,
    );

  let current = original;
  try {
    if (!sameList(currentRoster, nextRoster)) {
      current = await writeAssigneeOrder(
        client,
        repository,
        number,
        nextRoster,
      );
    }
    if (current.state !== targetState.giteaState) {
      current = await client.updateIssue(repository, number, {
        state: targetState.giteaState,
      });
    }
    const preserved = current.labels
      .filter(
        (label) =>
          !label.name.startsWith("status:") &&
          !label.name.startsWith("status-action:"),
      )
      .map((label) => label.name);
    const nextLabels = [
      ...preserved,
      ...(targetStatusName ? [targetStatusName] : []),
      actionName,
    ];
    current = await replaceLabels(client, repository, current, nextLabels);
    return mapIssue(await client.issue(repository, number));
  } catch (error) {
    try {
      const restored = await restoreSnapshot(
        client,
        repository,
        number,
        original,
      );
      const actual = mapIssue(restored);
      throw new PortalError(
        409,
        `工作流轉換失敗；已還原原狀態。實際資料：${JSON.stringify(actual)}`,
      );
    } catch (rollbackError) {
      if (
        rollbackError instanceof PortalError &&
        rollbackError.message.startsWith("工作流轉換失敗；已還原")
      )
        throw rollbackError;
      let actual: GiteaIssue | undefined;
      try {
        actual = await client.issue(repository, number);
      } catch {
        /* report rollback failure below */
      }
      throw new PortalError(
        409,
        `工作流轉換失敗，且無法完整還原；目前實際資料：${actual ? JSON.stringify(mapIssue(actual)) : "無法從 Gitea 讀回"}；原因：${error instanceof Error ? error.message : String(error)}；還原錯誤：${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`,
      );
    }
  }
}
