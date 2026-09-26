export type WorkflowRepair = {
  outcome: "repaired" | "failed";
  sourceState: "unconfigured" | "conflict";
  errorCode?: string;
  message?: string;
};
export type Issue = {
  owner: string;
  name: string;
  number: number;
  title: string;
  state: "open" | "closed";
  body?: string;
  assignee: string | null;
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
  workflowState: string;
  workflowRepair?: WorkflowRepair;
};
export type Repository = {
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  conventionId?: string | null;
  conventionVersion?: string | null;
};
export type WorkflowConvention = {
  id: string;
  version: string;
  name: string;
  states: Array<{
    key: string;
    labelName: string;
    displayName: string;
    order: number;
  }>;
  repositories?: string[];
};
export type Board = {
  id: string;
  name: string;
  repositoryRefs: Array<{ owner: string; name: string }>;
  workflowConventionId: string;
  workflowConventionVersion: string;
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
  conventionId: string;
  conventionVersion: string;
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
      try {
        const payload = JSON.parse(text) as { error?: string; detail?: string };
        throw new Error(
          [payload.error, payload.detail].filter(Boolean).join(": ") || text,
        );
      } catch (cause) {
        if (cause instanceof Error && cause.message !== text) throw cause;
        throw new Error(
          text || `Request failed with status ${response.status}`,
        );
      }
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

export function transitionRepositoryCard(
  owner: string,
  repo: string,
  issue: Issue,
  stateKey: string,
): Promise<Issue> {
  return api(
    `/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issue.number}/transition`,
    {
      method: "POST",
      body: JSON.stringify({ stateKey }),
    },
  );
}
