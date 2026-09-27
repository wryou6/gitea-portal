export const ISSUE_PRIORITIES = ["critical", "high", "medium", "low"] as const;

export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];
export type IssuePriorityStatus = "valid" | "missing" | "conflict";

export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, string> = {
  critical: "priority:critical",
  high: "priority:high",
  medium: "priority:medium",
  low: "priority:low",
};

export const ISSUE_PRIORITY_DISPLAY_NAMES: Record<IssuePriority, string> = {
  critical: "緊急",
  high: "高",
  medium: "中",
  low: "低",
};

const ISSUE_PRIORITY_BY_LABEL = Object.fromEntries(
  Object.entries(ISSUE_PRIORITY_LABELS).map(([priority, label]) => [
    label,
    priority,
  ]),
) as Record<string, IssuePriority>;

export function isIssuePriority(value: unknown): value is IssuePriority {
  return (
    typeof value === "string" &&
    ISSUE_PRIORITIES.some((priority) => priority === value)
  );
}

export function issuePriorityLabelName(priority: IssuePriority): string {
  return ISSUE_PRIORITY_LABELS[priority];
}

export function issuePriorityDisplayName(priority: IssuePriority): string {
  return ISSUE_PRIORITY_DISPLAY_NAMES[priority];
}

export function isIssuePriorityLabelName(name: string): boolean {
  return name.startsWith("priority:");
}

export function issuePriorityFromLabels(
  labels: readonly { name: string }[],
): IssuePriority | null {
  const priorityLabels = labels.filter((label) =>
    isIssuePriorityLabelName(label.name),
  );
  if (priorityLabels.length !== 1) return null;
  const label = priorityLabels[0];
  return label ? (ISSUE_PRIORITY_BY_LABEL[label.name] ?? null) : null;
}

export function issuePriorityStatusFromLabels(
  labels: readonly { name: string }[],
): IssuePriorityStatus {
  const priorityLabels = labels.filter((label) =>
    isIssuePriorityLabelName(label.name),
  );
  if (priorityLabels.length === 0) return "missing";
  return issuePriorityFromLabels(priorityLabels) ? "valid" : "conflict";
}
