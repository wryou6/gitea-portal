import type { Meta, StoryObj } from "@storybook/react";
import { KanbanCard } from "./KanbanCard";
import { demoIssue } from "../../stories/fixtures";

const card = { ...demoIssue, visibleLabels: demoIssue.labels };
const meta = {
  title: "Work views/Kanban card",
  component: KanbanCard,
} satisfies Meta<typeof KanbanCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    issue: card,
    onDragStart: () => undefined,
  },
};

export const StartDateOnly: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      dueDate: null,
      scheduleStatus: "scheduled",
      labels: [
        { name: "type:feature" },
        { name: "priority:high" },
        { name: "start-date:2026-09-24" },
      ],
      visibleLabels: [
        { name: "type:feature" },
        { name: "priority:high" },
        { name: "start-date:2026-09-24" },
      ],
    },
  },
};

export const Unscheduled: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      startDate: null,
      dueDate: null,
      scheduleStatus: "unscheduled",
      labels: [{ name: "type:feature" }, { name: "team:frontend" }],
      visibleLabels: [{ name: "type:feature" }, { name: "team:frontend" }],
    },
  },
};

export const InternalScheduleLabelHidden: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      labels: [
        { name: "type:feature" },
        { name: "start-date:2026-09-24" },
        { name: "priority:high" },
      ],
      visibleLabels: [
        { name: "type:feature" },
        { name: "start-date:2026-09-24" },
        { name: "priority:high" },
      ],
    },
  },
};
export const BugType: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      type: "bug",
      labels: [{ name: "type:bug" }, { name: "priority:high" }],
      visibleLabels: [{ name: "type:bug" }, { name: "priority:high" }],
    },
  },
};

export const MissingType: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      type: null,
      labels: [{ name: "priority:high" }],
      visibleLabels: [{ name: "priority:high" }],
    },
  },
};

export const ConflictingType: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      type: null,
      labels: [{ name: "type:bug" }, { name: "type:feature" }],
      visibleLabels: [{ name: "type:bug" }, { name: "type:feature" }],
    },
  },
};

export const MissingPriority: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      priority: null,
      labels: [{ name: "type:feature" }],
      visibleLabels: [{ name: "type:feature" }],
    },
  },
};

export const ConflictingPriority: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      priority: null,
      labels: [
        { name: "type:feature" },
        { name: "priority:critical" },
        { name: "priority:high" },
      ],
      visibleLabels: [
        { name: "type:feature" },
        { name: "priority:critical" },
        { name: "priority:high" },
      ],
    },
  },
};

export const LongMetadata: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      owner: "platform-engineering-and-developer-experience",
      name: "a-repository-with-a-deliberately-long-name-for-wrapping",
      title:
        "確認跨 Repository 狀態轉換時長標題、日文負責人與下一步文字仍能完整換行顯示",
      currentOwner: "長い担当者名を持つエンジニア",
      nextAction: "先確認影響範圍，再更新各 Repository 的相依套件",
    },
  },
};

export const CompletedWithLastAssignee: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      state: "closed",
      status: "done",
      assignee: "completed-by",
      assignees: ["completed-by", "previous-assignee"],
      currentOwner: null,
      nextAction: "確認完成結果",
      nextActionKey: "no-follow-up",
    },
  },
};

export const CompletedWithoutLastAssignee: Story = {
  args: {
    ...CompletedWithLastAssignee.args,
    issue: {
      ...card,
      state: "closed",
      status: "done",
      assignee: null,
      assignees: [],
      currentOwner: null,
      nextAction: "確認完成結果",
      nextActionKey: "no-follow-up",
    },
  },
};

export const MissingOwnerAndDueDate: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      currentOwner: null,
      dueDate: null,
      scheduleStatus: "unscheduled",
    },
  },
};

export const ScheduleAnomaly: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      dueDate: null,
      scheduleStatus: "invalid",
      scheduleAnomaly: "invalid_due_date",
    },
  },
};
