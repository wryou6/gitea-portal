import type { Issue } from "../../lib/api";
import { sanitizeWorkViewSearch, type WorkViewURLView } from "./work-view-url-state";

export type WorkViewFilters = {
  priority: ("critical" | "high" | "medium" | "low")[];
  issueType: ("bug" | "feature" | "task")[];
  state: ("todo" | "in-progress" | "done")[];
  assignee: "all" | "unassigned" | string;
  repository: "all" | string;
};

export const defaultWorkViewFilters: WorkViewFilters = {
  priority: [],
  issueType: [],
  state: [],
  assignee: "all",
  repository: "all",
};

function localDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function matchesRecentDoneVisibility(
  issue: Issue,
  recentDoneOnly: boolean,
  today = localDateValue(new Date()),
): boolean {
  if (!recentDoneOnly || issue.status !== "done") return true;
  if (!issue.closedAt) return false;
  const closedAt = new Date(issue.closedAt);
  if (!Number.isFinite(closedAt.getTime())) return false;
  const closedDate = localDateValue(closedAt);
  const [year, month, day] = today.split("-").map(Number);
  const startDate = new Date(year!, month! - 1, day!);
  startDate.setDate(startDate.getDate() - 29);
  return closedDate >= localDateValue(startDate) && closedDate <= today;
}

export function createDefaultWorkViewFilters(): WorkViewFilters {
  return {
    ...defaultWorkViewFilters,
    assignee: "all",
  };
}

export function createClearedWorkViewFilters(): WorkViewFilters {
  return {
    ...defaultWorkViewFilters,
    assignee: "me",
  };
}

const priorityOptions = ["critical", "high", "medium", "low"] as const;
const issueTypeOptions = ["bug", "feature", "task"] as const;
const statusOptions = ["todo", "in-progress", "done"] as const;

function selectedValues<T extends string>(
  params: URLSearchParams,
  key: string,
  options: readonly T[],
): T[] {
  const supplied = new Set(params.getAll(key));
  return options.filter((option) => supplied.has(option));
}

export function parseWorkViewFilters(search: string): WorkViewFilters {
  const params = new URLSearchParams(search);
  const assigneeValue = params.get("assignee")?.trim() ?? "";
  const assignee = assigneeValue === "" || assigneeValue === "all" ? "all" : assigneeValue;
  return {
    priority: selectedValues(params, "priority", priorityOptions),
    issueType: selectedValues(params, "issueType", issueTypeOptions),
    state: selectedValues(params, "state", statusOptions),
    assignee: assignee === "unassigned" || assignee === "me" || (assignee !== "all" && assignee.trim()) ? assignee : "all",
    repository: "all",
  };
}

export function serializeWorkViewFilters(
  filters: WorkViewFilters,
  existingSearch = "",
  view: WorkViewURLView = "issues",
): string {
  const params = new URLSearchParams(existingSearch);
  for (const key of ["priority", "issueType", "state", "assignee", "repository", "label", "milestone"])
    params.delete(key);
  for (const key of ["gantt_open", "gantt_closed", "gantt_assignee"]) params.delete(key);
  for (const priority of priorityOptions)
    if (filters.priority.includes(priority)) params.append("priority", priority);
  for (const issueType of issueTypeOptions)
    if (filters.issueType.includes(issueType)) params.append("issueType", issueType);
  for (const state of statusOptions)
    if (filters.state.includes(state)) params.append("state", state);
  if (filters.assignee !== "all") params.set("assignee", filters.assignee);
  return sanitizeWorkViewSearch(params.toString(), view);
}

export function countActiveWorkViewFilters(filters: WorkViewFilters): number {
  return filters.priority.length +
    filters.issueType.length +
    filters.state.length +
    Number(filters.assignee !== "all" && filters.assignee !== "me");
}

export function matchesWorkViewFilters(issue: Issue, filters: WorkViewFilters, currentUserLogin?: string): boolean {
  if (filters.priority.length > 0 && (!issue.priority || !filters.priority.includes(issue.priority))) return false;
  if (filters.issueType.length > 0 && (!issue.type || !filters.issueType.includes(issue.type))) return false;
  if (filters.state.length > 0 && !filters.state.includes(issue.status as (typeof filters.state)[number])) return false;
  if (filters.assignee === "me") {
    if (!currentUserLogin || !issue.assignees.includes(currentUserLogin)) return false;
  } else {
    if (filters.assignee === "unassigned" && issue.assignees.length > 0) return false;
    if (filters.assignee !== "all" && filters.assignee !== "unassigned" && !issue.assignees.includes(filters.assignee)) return false;
  }
  return true;
}
