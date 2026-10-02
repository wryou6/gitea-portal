import { ISSUE_SORT_FIELDS } from "@gitea-portal/domain";

export type WorkViewURLView = "issues" | "kanban" | "gantt";

const sharedFilterKeys = ["priority", "issueType", "state", "assignee"] as const;
const ganttKeys = ["gantt_start", "gantt_scale"] as const;
const listKeys = ["sort", "direction"] as const;
const retiredGanttKeys = ["gantt_open", "gantt_closed", "gantt_assignee"] as const;
const priorities = new Set(["critical", "high", "medium", "low"]);
const issueTypes = new Set(["bug", "feature", "task"]);
const statuses = new Set(["todo", "in-progress", "done"]);
const scales = new Set(["day", "week", "two-weeks", "month"]);

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function copySharedFilters(source: URLSearchParams, target: URLSearchParams): void {
  const priority = source.get("priority");
  if (priority && priorities.has(priority)) target.set("priority", priority);

  const issueType = source.get("issueType");
  if (issueType && issueTypes.has(issueType)) target.set("issueType", issueType);

  const state = source.get("state");
  if (state && statuses.has(state)) target.set("state", state);

  const assignee = source.get("assignee")?.trim();
  if (assignee && assignee !== "all") target.set("assignee", assignee);
}

function copyGanttState(source: URLSearchParams, target: URLSearchParams): void {
  const start = source.get("gantt_start");
  if (start && isCalendarDate(start)) target.set("gantt_start", start);

  const scale = source.get("gantt_scale");
  if (scale && scales.has(scale)) target.set("gantt_scale", scale);
}

function copyListSort(source: URLSearchParams, target: URLSearchParams): void {
  const sort = source.get("sort");
  const direction = source.get("direction");
  if (
    sort && ISSUE_SORT_FIELDS.includes(sort as (typeof ISSUE_SORT_FIELDS)[number]) &&
    (direction === "asc" || direction === "desc")
  ) {
    target.set("sort", sort);
    target.set("direction", direction);
  }
}

/** Select only query state that is valid for the source and destination views. */
export function buildWorkViewSearch(
  sourceSearch: string,
  sourceView: WorkViewURLView | undefined,
  targetView: WorkViewURLView,
): string {
  const source = new URLSearchParams(sourceSearch);
  const target = new URLSearchParams();

  if (sourceView) copySharedFilters(source, target);
  else target.set("assignee", "me");

  if (sourceView === "gantt" && targetView === "gantt") copyGanttState(source, target);
  if (sourceView === "issues" && targetView === "issues") copyListSort(source, target);

  return target.toString();
}

/** Remove query keys that do not belong on the current view. */
export function sanitizeWorkViewSearch(
  search: string,
  view: WorkViewURLView,
): string {
  const params = new URLSearchParams(search);
  for (const key of retiredGanttKeys) params.delete(key);
  if (view !== "gantt") for (const key of ganttKeys) params.delete(key);
  if (view !== "issues") for (const key of listKeys) params.delete(key);

  const priority = params.get("priority");
  if (priority && !priorities.has(priority)) params.delete("priority");
  const issueType = params.get("issueType");
  if (issueType && !issueTypes.has(issueType)) params.delete("issueType");
  const state = params.get("state");
  if (state && !statuses.has(state)) params.delete("state");
  const assignee = params.get("assignee")?.trim();
  if (!assignee || assignee === "all") params.delete("assignee");
  else params.set("assignee", assignee);

  if (view === "gantt") {
    const start = params.get("gantt_start");
    const scale = params.get("gantt_scale");
    if (start && !isCalendarDate(start)) params.delete("gantt_start");
    if (scale && !scales.has(scale)) params.delete("gantt_scale");
  }
  if (view === "issues") {
    const sort = params.get("sort");
    const direction = params.get("direction");
    if (
      (sort && !ISSUE_SORT_FIELDS.includes(sort as (typeof ISSUE_SORT_FIELDS)[number])) ||
      (direction && direction !== "asc" && direction !== "desc") ||
      Boolean(sort) !== Boolean(direction)
    ) {
      params.delete("sort");
      params.delete("direction");
    }
  }

  return params.toString();
}

/** Preserve a work-view URL for an Issue return target without leaking other views' state. */
export function buildWorkViewReturnTo(
  pathname: string,
  search: string,
  view: WorkViewURLView,
): string {
  const query = sanitizeWorkViewSearch(search, view);
  return `${pathname}${query ? `?${query}` : ""}`;
}

export const WORK_VIEW_QUERY_KEYS = {
  sharedFilters: sharedFilterKeys,
  gantt: ganttKeys,
  list: listKeys,
  retiredGantt: retiredGanttKeys,
} as const;
