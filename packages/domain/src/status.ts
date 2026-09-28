import type { IssueState } from "./issue.js";

export const FIXED_ISSUE_STATUSES = [
  {
    key: "todo",
    labelName: "status:todo",
    displayName: "待辦",
    order: 0,
    giteaState: "open",
  },
  {
    key: "in-progress",
    labelName: "status:in-progress",
    displayName: "處理中",
    order: 1,
    giteaState: "open",
  },
  {
    key: "done",
    labelName: null,
    displayName: "已完成",
    order: 2,
    giteaState: "closed",
  },
] as const satisfies readonly {
  key: string;
  labelName: string | null;
  displayName: string;
  order: number;
  giteaState: IssueState;
}[];

export type FixedIssueStatus = (typeof FIXED_ISSUE_STATUSES)[number];
export type FixedIssueStatusKey = FixedIssueStatus["key"];
export type AssigneePolicy =
  | "required-handoff"
  | "optional-reviewer"
  | "keep-current"
  | "require-if-unassigned";

export const STATUS_ACTIONS = [
  {
    key: "reassign-owner",
    fromState: "todo",
    toState: "todo",
    reasonLabel: "重新指派負責人",
    nextAction: "開始處理",
    nextActionKey: "begin-work",
    assigneePolicy: "required-handoff",
  },
  {
    key: "clarify-requirements",
    fromState: "todo",
    toState: "todo",
    reasonLabel: "釐清或補充需求",
    nextAction: "釐清需求",
    nextActionKey: "clarify",
    assigneePolicy: "keep-current",
  },
  {
    key: "wait-external-response-todo",
    fromState: "todo",
    toState: "todo",
    reasonLabel: "等待外部回覆",
    nextAction: "內部跟進",
    nextActionKey: "internal-follow-up",
    assigneePolicy: "keep-current",
  },
  {
    key: "reschedule-todo",
    fromState: "todo",
    toState: "todo",
    reasonLabel: "重新排期",
    nextAction: "重新排期",
    nextActionKey: "reschedule",
    assigneePolicy: "keep-current",
  },
  {
    key: "start-work",
    fromState: "todo",
    toState: "in-progress",
    reasonLabel: "開始處理",
    nextAction: "開始實作",
    nextActionKey: "implement",
    assigneePolicy: "require-if-unassigned",
  },
  {
    key: "duplicate-todo",
    fromState: "todo",
    toState: "done",
    reasonLabel: "重複 Issue",
    nextAction: "查看既有 Issue",
    nextActionKey: "view-existing",
    assigneePolicy: "keep-current",
  },
  {
    key: "wont-do-todo",
    fromState: "todo",
    toState: "done",
    reasonLabel: "不處理",
    nextAction: "無後續動作",
    nextActionKey: "no-follow-up",
    assigneePolicy: "keep-current",
  },
  {
    key: "completed-elsewhere-todo",
    fromState: "todo",
    toState: "done",
    reasonLabel: "已在其他地方完成",
    nextAction: "確認完成結果",
    nextActionKey: "confirm-completion",
    assigneePolicy: "keep-current",
  },
  {
    key: "pause-and-requeue",
    fromState: "in-progress",
    toState: "todo",
    reasonLabel: "暫停並重新排入待辦",
    nextAction: "開始實作",
    nextActionKey: "implement",
    assigneePolicy: "keep-current",
  },
  {
    key: "wait-external-response-in-progress",
    fromState: "in-progress",
    toState: "todo",
    reasonLabel: "等待外部回覆",
    nextAction: "內部跟進",
    nextActionKey: "internal-follow-up",
    assigneePolicy: "keep-current",
  },
  {
    key: "reschedule-in-progress",
    fromState: "in-progress",
    toState: "todo",
    reasonLabel: "重新排期",
    nextAction: "重新排期",
    nextActionKey: "reschedule",
    assigneePolicy: "keep-current",
  },
  {
    key: "clarify-requirements-in-progress",
    fromState: "in-progress",
    toState: "todo",
    reasonLabel: "釐清或補充需求",
    nextAction: "釐清需求",
    nextActionKey: "clarify",
    assigneePolicy: "keep-current",
  },
  {
    key: "submit-for-review",
    fromState: "in-progress",
    toState: "in-progress",
    reasonLabel: "送交審查",
    nextAction: "審查 Issue",
    nextActionKey: "review-issue",
    assigneePolicy: "optional-reviewer",
  },
  {
    key: "review-request-changes",
    fromState: "in-progress",
    toState: "in-progress",
    reasonLabel: "審查退回修改",
    nextAction: "修改並重新送審",
    nextActionKey: "revise-and-resubmit",
    assigneePolicy: "keep-current",
  },
  {
    key: "work-complete",
    fromState: "in-progress",
    toState: "done",
    reasonLabel: "工作完成",
    nextAction: "確認完成結果",
    nextActionKey: "confirm-completion",
    assigneePolicy: "keep-current",
  },
  {
    key: "duplicate-in-progress",
    fromState: "in-progress",
    toState: "done",
    reasonLabel: "重複 Issue",
    nextAction: "查看既有 Issue",
    nextActionKey: "view-existing",
    assigneePolicy: "keep-current",
  },
  {
    key: "wont-do-in-progress",
    fromState: "in-progress",
    toState: "done",
    reasonLabel: "不處理",
    nextAction: "無後續動作",
    nextActionKey: "no-follow-up",
    assigneePolicy: "keep-current",
  },
  {
    key: "superseded",
    fromState: "in-progress",
    toState: "done",
    reasonLabel: "已被其他工作取代",
    nextAction: "查看取代項目",
    nextActionKey: "view-replacement",
    assigneePolicy: "keep-current",
  },
  {
    key: "re-evaluate",
    fromState: "done",
    toState: "todo",
    reasonLabel: "重新評估",
    nextAction: "釐清需求",
    nextActionKey: "clarify",
    assigneePolicy: "keep-current",
  },
  {
    key: "scope-changed",
    fromState: "done",
    toState: "todo",
    reasonLabel: "需求變更，需釐清",
    nextAction: "釐清需求",
    nextActionKey: "clarify",
    assigneePolicy: "keep-current",
  },
  {
    key: "resume-work",
    fromState: "done",
    toState: "in-progress",
    reasonLabel: "恢復處理",
    nextAction: "開始實作",
    nextActionKey: "implement",
    assigneePolicy: "keep-current",
  },
  {
    key: "acceptance-failed",
    fromState: "done",
    toState: "in-progress",
    reasonLabel: "驗收未通過",
    nextAction: "修正後重新驗收",
    nextActionKey: "fix-and-retest",
    assigneePolicy: "keep-current",
  },
  {
    key: "regression-found",
    fromState: "done",
    toState: "in-progress",
    reasonLabel: "發現回歸問題",
    nextAction: "修正問題",
    nextActionKey: "fix-issue",
    assigneePolicy: "keep-current",
  },
  {
    key: "correct-close-reason",
    fromState: "done",
    toState: "done",
    reasonLabel: "修正結案原因",
    nextAction: "確認結案資訊",
    nextActionKey: "confirm-close-info",
    assigneePolicy: "keep-current",
  },
] as const satisfies readonly {
  key: string;
  fromState: FixedIssueStatusKey;
  toState: FixedIssueStatusKey;
  reasonLabel: string;
  nextAction: string;
  nextActionKey: string;
  assigneePolicy: AssigneePolicy;
}[];

export type StatusAction = (typeof STATUS_ACTIONS)[number];
export type StatusActionKey = StatusAction["key"];
export const statusActionLabel = (key: StatusActionKey): string =>
  `status-action:${key}`;
