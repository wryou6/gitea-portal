import type { Meta, StoryObj } from "@storybook/react";
import { IssueListPage } from "./IssueListPage";
import { demoIssue } from "../../stories/fixtures";
import { AppShell } from "../../components/layout/AppShell";
import { defaultIssueViewPreference, type IssueViewPreference } from "./issue-view-preference";

const meta = {
  title: "Screens/Issue List",
  component: IssueListPage,
} satisfies Meta<typeof IssueListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

function localDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const Default: Story = {
  args: {
    demoIssues: [
      demoIssue,
      {
        ...demoIssue,
        owner: "platform",
        name: "service-api",
        title: "相同 Issue 編號來自另一個 Repository",
      },
      {
        ...demoIssue,
        number: 51,
        title: "補上工作狀態轉換原因",
        status: "todo",
        assignee: null,
        assignees: [],
        currentOwner: null,
        lastActionKey: null,
        nextAction: "指派負責人",
        type: "task",
        priority: "medium",
        startDate: null,
        dueDate: null,
        scheduleStatus: "unscheduled",
      },
      {
        ...demoIssue,
        number: 63,
        title: "完成第一輪需求驗收",
        state: "closed",
        status: "done",
        currentOwner: null,
        assignee: "engineer",
        lastActionKey: "work-complete",
        nextAction: "確認完成結果",
      },
    ],
  },
};

export const DesktopWorkspace: Story = {
  ...Default,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <AppShell login="engineer" routePathname="/issues" routeSearch="" workspaceRepositories={[]}><Story /></AppShell>],
};
export const DesktopWorkspaceDark: Story = { ...DesktopWorkspace, globals: { theme: "dark" } };

export const AlternatingRows: Story = {
  args: {
    demoIssues: [
      { ...demoIssue, number: 41, status: "todo" },
      { ...demoIssue, number: 42, status: "in-progress" },
      { ...demoIssue, number: 43, status: "done", state: "closed" },
      {
        ...demoIssue,
        number: 44,
        status: "anomaly",
        statusAnomaly: { reason: "missing_status", labels: [] },
      },
    ],
  },
};
export const AlternatingRowsDarkTheme: Story = {
  ...AlternatingRows,
  globals: { theme: "dark" },
};
export const AlternatingRowsNarrow: Story = {
  ...AlternatingRows,
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const SortedByPriorityDescending: Story = {
  args: {
    demoSort: { sort: "priority", direction: "desc" },
    demoIssues: [
      { ...demoIssue, number: 7, priority: "low" },
      { ...demoIssue, number: 23, priority: "critical" },
      { ...demoIssue, number: 12, priority: "high" },
    ],
  },
};

export const SingleRepository: Story = {
  args: { repository: { owner: "demo", name: "frontend" }, demoIssues: [demoIssue] },
};

export const LongTitleAndMissingMetadata: Story = {
  args: {
    demoIssues: [{
      ...demoIssue,
      title: "跨多個 Repository 的整合工作需要持續檢查相依服務、相容性、權限邊界與回歸風險，並在發布前留下完整驗證紀錄",
      assignee: null,
      author: "",
      type: null,
      priority: null,
      startDate: null,
      dueDate: null,
      scheduleStatus: "unscheduled",
      status: "anomaly",
      statusAnomaly: { reason: "missing_status", labels: [] },
      labels: [{ name: "team:frontend" }],
    }],
  },
};

export const OverdueDueDate: Story = {
  args: { demoIssues: [{ ...demoIssue, dueDate: localDateOffset(-1) }] },
};

export const DueToday: Story = {
  args: { demoIssues: [{ ...demoIssue, dueDate: localDateOffset(0) }] },
};

export const FutureDueDate: Story = {
  args: { demoIssues: [{ ...demoIssue, dueDate: localDateOffset(2) }] },
};

export const ClosedIssueWithPastDueDate: Story = {
  args: { demoIssues: [{ ...demoIssue, state: "closed", status: "done", dueDate: localDateOffset(-1) }] },
};

export const InvalidDueDate: Story = {
  args: {
    demoIssues: [{ ...demoIssue, dueDate: null, scheduleStatus: "invalid", scheduleAnomaly: "invalid_due_date" }],
  },
};

export const Empty: Story = { args: { demoIssues: [] } };

export const Loading: Story = { args: { demoIssues: [], demoState: "loading" } };

export const ReadError: Story = { args: { demoIssues: [], demoState: "error" } };

export const NarrowViewport: Story = {
  args: { demoIssues: [demoIssue] },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const ViewOptionsDefault: Story = {
  args: {
    demoIssues: [demoIssue],
    demoViewPreference: defaultIssueViewPreference(),
  },
};

const compactViewPreference: IssueViewPreference = {
  ...defaultIssueViewPreference(),
  visibleFields: ["key", "title", "priority", "author"],
  columnOrder: ["type", "key", "title", "author", "assignee", "status", "priority", "startDate", "dueDate", "createdAt"],
  defaultSortField: "createdAt",
  defaultSortDirection: "desc",
};

export const ViewOptionsCustomized: Story = {
  args: {
    demoIssues: [demoIssue],
    demoSort: { sort: "createdAt", direction: "desc" },
    demoViewPreference: compactViewPreference,
  },
};

export const ViewOrderNeedsSave: Story = {
  args: {
    demoIssues: [demoIssue],
    demoViewPreference: compactViewPreference,
    demoColumnOrder: ["type", "key", "priority", "title", "author", "assignee", "status", "startDate", "dueDate", "createdAt"],
  },
};

export const ViewOptionsOpen: Story = {
  args: {
    demoIssues: [demoIssue],
    demoViewPreference: compactViewPreference,
    demoOptionsOpen: true,
  },
};

export const ViewOptionsVisibility: Story = {
  args: {
    demoIssues: [demoIssue],
    demoViewPreference: compactViewPreference,
    demoOptionsOpen: true,
  },
};

export const SortNeedsSave: Story = {
  args: {
    demoIssues: [demoIssue],
    demoViewPreference: compactViewPreference,
    demoSort: { sort: "key", direction: "asc" },
  },
};

export const OrderAndSortNeedSave: Story = {
  args: {
    demoIssues: [demoIssue],
    demoViewPreference: compactViewPreference,
    demoColumnOrder: ["type", "key", "priority", "title", "author", "assignee", "status", "startDate", "dueDate", "createdAt"],
    demoSort: { sort: "key", direction: "asc" },
  },
};

export const ViewOptionsNarrow: Story = {
  args: {
    demoIssues: [demoIssue],
    demoViewPreference: compactViewPreference,
    demoOptionsOpen: true,
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const ViewOptionsVisibilityNarrow: Story = {
  args: {
    demoIssues: [demoIssue],
    demoViewPreference: compactViewPreference,
    demoOptionsOpen: true,
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const OrderAndSortNeedSaveNarrow: Story = {
  args: {
    demoIssues: [demoIssue],
    demoViewPreference: compactViewPreference,
    demoColumnOrder: ["type", "key", "priority", "title", "author", "assignee", "status", "startDate", "dueDate", "createdAt"],
    demoSort: { sort: "key", direction: "asc" },
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
