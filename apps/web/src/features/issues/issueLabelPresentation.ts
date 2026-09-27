type LabelName = { name: string };

const presentationOnlyPrefixes = ["type:", "start-date:", "priority:"] as const;

export function visibleIssueLabels<T extends LabelName>(labels: T[]): T[] {
  return labels.filter(
    (label) =>
      !presentationOnlyPrefixes.some((prefix) => label.name.startsWith(prefix)),
  );
}
