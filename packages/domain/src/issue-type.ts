export const ISSUE_TYPES = ["bug", "feature", "task"] as const;

export type IssueType = (typeof ISSUE_TYPES)[number];
export type IssueTypeStatus = "valid" | "missing" | "conflict";

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  bug: "type:bug",
  feature: "type:feature",
  task: "type:task",
};

export const ISSUE_TYPE_DISPLAY_NAMES: Record<IssueType, string> = {
  bug: "Bug",
  feature: "Feature",
  task: "Task",
};

const ISSUE_TYPE_BY_LABEL: Record<string, IssueType> = {
  "type:bug": "bug",
  "type:feature": "feature",
  "type:task": "task",
};

export function isIssueType(value: unknown): value is IssueType {
  return (
    typeof value === "string" && ISSUE_TYPES.some((type) => type === value)
  );
}

export function issueTypeLabelName(type: IssueType): string {
  return ISSUE_TYPE_LABELS[type];
}

export function issueTypeDisplayName(type: IssueType): string {
  return ISSUE_TYPE_DISPLAY_NAMES[type];
}

export function issueTypeFromLabels(
  labels: readonly { name: string }[],
): IssueType | null {
  const typeLabels = labels.filter((label) => label.name.startsWith("type:"));
  if (typeLabels.length !== 1) return null;
  const label = typeLabels[0];
  return label ? (ISSUE_TYPE_BY_LABEL[label.name] ?? null) : null;
}

export function issueTypeStatusFromLabels(
  labels: readonly { name: string }[],
): IssueTypeStatus {
  const typeLabels = labels.filter((label) => label.name.startsWith("type:"));
  if (typeLabels.length === 0) return "missing";
  return issueTypeFromLabels(typeLabels) ? "valid" : "conflict";
}

export function isIssueTypeLabelName(name: string): boolean {
  return name.startsWith("type:");
}
