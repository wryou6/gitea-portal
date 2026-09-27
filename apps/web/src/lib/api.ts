import {
  isPortalApiErrorCode,
  type IssuePriority,
  type IssueType,
  type PortalApiErrorCode,
  type PortalApiErrorParams,
} from "@gitea-portal/domain";

export class PortalApiError extends Error {
  constructor(
    public readonly code: PortalApiErrorCode,
    message: string,
    public readonly params?: PortalApiErrorParams,
    public readonly detail?: string,
  ) {
    super(message);
    this.name = "PortalApiError";
  }
}

export type UserFacingError = string | PortalApiError;

function isErrorParams(value: unknown): value is PortalApiErrorParams {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (entry) =>
        typeof entry === "string" ||
        typeof entry === "number" ||
        typeof entry === "boolean",
    )
  );
}

export function toUserFacingError(
  cause: unknown,
  fallback: string,
): UserFacingError {
  return cause instanceof PortalApiError
    ? cause
    : cause instanceof Error
      ? cause.message
      : fallback;
}

export type Issue = {
  owner: string;
  name: string;
  number: number;
  title: string;
  state: "open" | "closed";
  type: IssueType | null;
  priority: IssuePriority | null;
  body?: string;
  assignee: string | null;
  assignees: string[];
  currentOwner: string | null;
  labels: Array<{ name: string }>;
  startDate: string | null;
  dueDate: string | null;
  scheduleStatus: "scheduled" | "unscheduled" | "invalid";
  scheduleAnomaly?:
    | "invalid_start_date"
    | "multiple_start_dates"
    | "invalid_due_date"
    | "date_range_reversed";
  milestone: string | null;
  updatedAt: string;
  htmlUrl: string;
  workflowState: "todo" | "in-progress" | "done" | "anomaly";
  workflowAnomaly?: { reason: string; labels: string[] };
  lastActionKey: string | null;
  nextAction: string;
  nextActionKey: string;
};
export type Repository = {
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
};
export type WorkflowDefinition = {
  states: Array<{
    key: "todo" | "in-progress" | "done";
    labelName: string | null;
    displayName: string;
    order: number;
    giteaState: "open" | "closed";
  }>;
  actions: Array<{
    key: string;
    fromState: "todo" | "in-progress" | "done";
    toState: "todo" | "in-progress" | "done";
    reasonLabel: string;
    nextAction: string;
    nextActionKey: string;
    assigneePolicy:
      | "required-handoff"
      | "optional-reviewer"
      | "keep-current"
      | "require-if-unassigned";
    labelName: string;
  }>;
};
export type Board = {
  id: string;
  name: string;
  repositoryRefs: Array<{ owner: string; name: string }>;
  createdAt: string;
  updatedAt: string;
};
export type IssuePage = {
  items: Issue[];
  page: number;
  limit: number;
  hasNext: boolean;
};
export type BoardIssuePage = IssuePage & { board: Board };
export type RepositoryKanbanView = {
  repository: Repository;
  columns: Array<{
    stateKey: string;
    displayName: string;
    cards: Array<Issue & { visibleLabels: Issue["labels"] }>;
  }>;
};
export type RepositoryGanttView = { repository: Repository; issues: Issue[] };

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const startedAt = performance.now();
  const csrf = document.cookie.match(/(?:^|;\s*)portal_csrf=([^;]+)/)?.[1];
  try {
    const response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
        ...init?.headers,
      },
    });
    if (!response.ok) {
      const text = await response.text();
      let payload: {
        error?: unknown;
        code?: unknown;
        params?: unknown;
        detail?: unknown;
      } | undefined;
      try {
        payload = JSON.parse(text) as typeof payload;
      } catch {
        // Non-JSON server responses still get a localized generic summary.
      }
      const legacyMessage =
        typeof payload?.error === "string" ? payload.error : "";
      const upstreamDetail =
        typeof payload?.detail === "string" ? payload.detail : "";
      throw new PortalApiError(
        isPortalApiErrorCode(payload?.code)
          ? payload.code
          : "server.internal_error",
        legacyMessage,
        isErrorParams(payload?.params) ? payload.params : undefined,
        [upstreamDetail, payload?.code && !isPortalApiErrorCode(payload.code) ? `Unknown error code: ${String(payload.code)}` : "", !payload ? text || `Request failed with status ${response.status}` : ""]
          .filter(Boolean)
          .join("\n\n") || undefined,
      );
    }
    return response.status === 204
      ? (undefined as T)
      : (response.json() as Promise<T>);
  } finally {
    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
    console.debug("[portal-timing]", { name: path, durationMs });
  }
}

export function queryIssues(
  filters: Record<string, string>,
): Promise<IssuePage> {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value),
  );
  return api(`/api/issues?${params}`);
}

export function queryBoardIssues(
  boardId: string,
  filters: Record<string, string>,
): Promise<BoardIssuePage> {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value),
  );
  return api(`/api/boards/${encodeURIComponent(boardId)}/issues?${params}`);
}

export function queryRepositoryKanban(
  owner: string,
  repo: string,
): Promise<RepositoryKanbanView> {
  return api(
    `/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/kanban`,
  );
}

export function queryRepositoryGantt(
  owner: string,
  repo: string,
): Promise<RepositoryGanttView> {
  return api(
    `/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/gantt`,
  );
}

export function transitionIssue(
  owner: string,
  repo: string,
  issue: Issue,
  actionKey: string,
  selectedAssignee?: string,
): Promise<Issue> {
  return api(
    `/api/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${issue.number}/transition`,
    {
      method: "POST",
      body: JSON.stringify({
        actionKey,
        selectedAssignee,
        expectedUpdatedAt: issue.updatedAt,
      }),
    },
  );
}
