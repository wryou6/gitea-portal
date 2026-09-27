import type { Meta, StoryObj } from "@storybook/react";
import { KanbanCard } from "./KanbanCard";
import { demoIssue } from "../../stories/fixtures";

const card = { ...demoIssue, visibleLabels: demoIssue.labels };
const meta = {
  title: "Boards/KanbanCard",
  component: KanbanCard,
} satisfies Meta<typeof KanbanCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    issue: card,
    destinations: [{ stateKey: "done", displayName: "Done" }],
    onDragStart: () => undefined,
    onMove: () => undefined,
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
export const RepairFailure: Story = {
  args: {
    ...Default.args,
    issue: {
      ...card,
      workflowRepair: {
        outcome: "failed",
        sourceState: "conflict",
        errorCode: "WORKFLOW_CONFLICT",
        message: "請移動至有效狀態。",
      },
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
