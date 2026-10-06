import { isCalendarDate, type IssueScheduleAnomaly, type IssueState } from "@gitea-portal/domain";

export type OverdueDateInput = {
  state: IssueState;
  dueDate: string | null;
  scheduleAnomaly?: IssueScheduleAnomaly;
};

export function localCalendarDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isIssueOverdue(
  issue: OverdueDateInput,
  today = localCalendarDate(),
): boolean {
  return issue.state === "open" &&
    issue.dueDate !== null &&
    isCalendarDate(issue.dueDate) &&
    issue.scheduleAnomaly !== "invalid_due_date" &&
    issue.scheduleAnomaly !== "date_range_reversed" &&
    issue.dueDate < today;
}
