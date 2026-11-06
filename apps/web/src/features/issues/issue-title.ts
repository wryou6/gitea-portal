export function issueTitleForDisplay(
  title: string,
  number: number,
  showIssueNumber = false,
): string {
  if (!showIssueNumber) return title;
  const prefix = `#${number}`;
  if (title === prefix || title.startsWith(`${prefix} `)) return title;
  return `${prefix} ${title}`;
}
