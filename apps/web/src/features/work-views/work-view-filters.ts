import type { Issue } from "../../lib/api";

export type WorkViewFilters = {
  priority: "all" | "critical" | "high" | "medium" | "low";
  issueType: "all" | "bug" | "feature" | "task";
  state: "all" | "todo" | "in-progress" | "done";
  assignee: "all" | "unassigned" | string;
  repository: "all" | string;
  label: string;
  milestone: string;
};

export const defaultWorkViewFilters: WorkViewFilters = {
  priority: "all",
  issueType: "all",
  state: "all",
  assignee: "all",
  repository: "all",
  label: "",
  milestone: "",
};

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
  const repository = params.get("repository") ?? "all";
  return {
    priority: priorities.has(priority) ? priority as WorkViewFilters["priority"] : "all",
    issueType: issueTypes.has(issueType) ? issueType as WorkViewFilters["issueType"] : "all",
    state: statuses.has(state) ? state as WorkViewFilters["state"] : "all",
    assignee: assignee === "unassigned" || assignee === "me" || (assignee !== "all" && assignee.trim()) ? assignee : "all",
    repository: repository === "all" || /^[^/]+\/[^/]+$/.test(repository) ? repository : "all",
    label: params.get("label")?.trim() ?? "",
    milestone: params.get("milestone")?.trim() ?? "",
  };
}

export function serializeWorkViewFilters(
  filters: WorkViewFilters,
  existingSearch = "",
): string {
  const params = new URLSearchParams(existingSearch);
  for (const key of ["priority", "issueType", "state", "assignee", "repository", "label", "milestone"])
    params.delete(key);
  for (const key of ["gantt_open", "gantt_closed", "gantt_assignee"]) params.delete(key);
  if (filters.priority !== "all") params.set("priority", filters.priority);
  if (filters.issueType !== "all") params.set("issueType", filters.issueType);
  if (filters.state !== "all") params.set("state", filters.state);
  if (filters.assignee !== "all") params.set("assignee", filters.assignee);
  if (filters.repository !== "all") params.set("repository", filters.repository);
  if (filters.label.trim()) params.set("label", filters.label.trim());
  if (filters.milestone.trim()) params.set("milestone", filters.milestone.trim());
  return params.toString();
}

export function countActiveWorkViewFilters(filters: WorkViewFilters): number {
  return Number(filters.priority !== "all") +
    Number(filters.issueType !== "all") +
    Number(filters.state !== "all") +
    Number(filters.assignee !== "all" && filters.assignee !== "me") +
    Number(filters.repository !== "all") +
    Number(Boolean(filters.label.trim())) +
    Number(Boolean(filters.milestone.trim()));
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
  if (filters.repository !== "all" && `${issue.owner}/${issue.name}` !== filters.repository) return false;
  if (filters.label && !issue.labels.some((label) => label.name === filters.label)) return false;
  if (filters.milestone && issue.milestone !== filters.milestone) return false;
  return true;
}
