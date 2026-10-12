import { useLayoutEffect, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { Issue } from "../../lib/api";
import { IssueDetailPage } from "./IssueDetailPage";

const issue: Issue = {
  owner: "engineering",
  name: "portal",
  number: 42,
  title: "Improve issue navigation",
  author: "alex",
  createdAt: "2026-10-01T08:00:00Z",
  state: "open",
  type: "feature",
  priority: "medium",
  body: "Keep work-view context visible while reviewing a complete issue.",
  assignee: "sam",
  assignees: ["sam"],
  currentOwner: "sam",
  labels: [{ name: "frontend" }, { name: "status:todo" }],
  startDate: null,
  dueDate: null,
  scheduleStatus: "unscheduled",
  milestone: null,
  closedAt: null,
  updatedAt: "2026-10-10T08:00:00Z",
  htmlUrl: "https://gitea.example/engineering/portal/issues/42",
  status: "todo",
  lastActionKey: null,
  nextAction: "Start work",
  nextActionKey: "start_work",
};

const statusDefinition = {
  states: [
    { key: "todo", labelName: "status:todo", displayName: "To do", order: 1, giteaState: "open" },
    { key: "in-progress", labelName: "status:in-progress", displayName: "In progress", order: 2, giteaState: "open" },
    { key: "done", labelName: null, displayName: "Done", order: 3, giteaState: "closed" },
  ],
  actions: [
    { key: "start", fromState: "todo", toState: "in-progress", reasonLabel: "status-action:start", nextAction: "Continue", nextActionKey: "continue", assigneePolicy: "keep-current", labelName: "status:in-progress" },
  ],
};

function MockIssueApi({ mode, children }: { mode: "loaded" | "error" | "loading"; children: ReactNode }) {
  useLayoutEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input) => {
      if (mode === "loading") return new Promise<Response>(() => undefined);
      if (mode === "error") return new Response(JSON.stringify({ error: "Issue unavailable" }), { status: 503 });
      const path = String(input);
      const payload = path.endsWith("/comments")
        ? [{ id: 1, user: { login: "sam", fullName: "Sam Lee" }, body: "I will review the interaction details.", createdAt: "2026-10-10T09:00:00Z" }]
        : path.endsWith("/status-definition")
          ? statusDefinition
          : path.endsWith("/assignees")
            ? [{ login: "sam", fullName: "Sam Lee" }]
            : issue;
      return new Response(JSON.stringify(payload), { headers: { "Content-Type": "application/json" } });
    };
    return () => { window.fetch = originalFetch; };
  }, [mode]);
  return children;
}

function IssueDetailStory({ mode = "loaded", presentation = "dialog" }: { mode?: "loaded" | "error" | "loading"; presentation?: "dialog" | "page" }) {
  return (
    <MockIssueApi mode={mode}>
      <IssueDetailPage
        owner={issue.owner}
        repo={issue.name}
        number={issue.number}
        presentation={presentation}
        returnToOverride="/kanban?status=todo"
        onClose={() => undefined}
        onExpand={() => undefined}
      />
    </MockIssueApi>
  );
}

const meta = { title: "Issues/Issue detail dialog", component: IssueDetailStory } satisfies Meta<typeof IssueDetailStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { mode: "loading" } };
export const LoadedWithDetailsAndActions: Story = { args: { mode: "loaded" } };
export const Error: Story = { args: { mode: "error" } };
export const NestedStatusDialogAndFocus: Story = {
  args: { mode: "loaded" },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    canvasElement.querySelectorAll<HTMLButtonElement>("button")[3]?.click();
  },
};
export const DirectFullPage: Story = { args: { mode: "loaded", presentation: "page" } };
