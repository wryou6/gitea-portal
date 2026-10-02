import type { Issue } from "../../lib/api";
import { sanitizeWorkViewSearch, type WorkViewURLView } from "./work-view-url-state";

export type WorkViewFilters = {
  priority: "all" | "critical" | "high" | "medium" | "low";
  issueType: "all" | "bug" | "feature" | "task";
  state: "all" | "todo" | "in-progress" | "done";
  assignee: "all" | "unassigned" | string;
  repository: "all" | string;
};

export const defaultWorkViewFilters: WorkViewFilters = {
  priority: "all",
  issueType: "all",
  state: "all",
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

const priorities = new Set(["critical", "high", "medium", "low"]);
const issueTypes = new Set(["bug", "feature", "task"]);
const statuses = new Set(["todo", "in-progress", "done"]);

export function parseWorkViewFilters(search: string): WorkViewFilters {
  const params = new URLSearchParams(search);
  const priority = params.get("priority") ?? "all";
  const issueType = params.get("issueType") ?? "all";
  const state = params.get("state") ?? "all";
  const assigneeValue = params.get("assignee")?.trim() ?? "";
  const assignee = assigneeValue === "" || assigneeValue === "all" ? "all" : assigneeValue;
  return {
    priority: priorities.has(priority) ? priority as WorkViewFilters["priority"] : "all",
    issueType: issueTypes.has(issueType) ? issueType as WorkViewFilters["issueType"] : "all",
    state: statuses.has(state) ? state as WorkViewFilters["state"] : "all",
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
  if (filters.priority !== "all") params.set("priority", filters.priority);
  if (filters.issueType !== "all") params.set("issueType", filters.issueType);
  if (filters.state !== "all") params.set("state", filters.state);
  if (filters.assignee !== "all") params.set("assignee", filters.assignee);
  return sanitizeWorkViewSearch(params.toString(), view);
}

export function countActiveWorkViewFilters(filters: WorkViewFilters): number {
  return Number(filters.priority !== "all") +
    Number(filters.issueType !== "all") +
    Number(filters.state !== "all") +
    Number(filters.assignee !== "all" && filters.assignee !== "me");
}

export function matchesWorkViewFilters(issue: Issue, filters: WorkViewFilters, currentUserLogin?: string): boolean {
  if (filters.priority !== "all" && issue.priority !== filters.priority) return false;
  if (filters.issueType !== "all" && issue.type !== filters.issueType) return false;
  if (filters.state !== "all" && issue.status !== filters.state) return false;
  if (filters.assignee === "me") {
    if (!currentUserLogin || !issue.assignees.includes(currentUserLogin)) return false;
  } else {
    if (filters.assignee === "unassigned" && issue.assignees.length > 0) return false;
    if (filters.assignee !== "all" && filters.assignee !== "unassigned" && !issue.assignees.includes(filters.assignee)) return false;
  }
  return true;
}
