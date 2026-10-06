import type { Meta, StoryObj } from "@storybook/react";
import { IssueDetailHeader } from "./IssueDetailHeader";
import { demoIssue } from "../../stories/fixtures";

function localDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const meta = {
  title: "Issues/IssueDetailHeader",
  component: IssueDetailHeader,
  args: { issue: demoIssue },
} satisfies Meta<typeof IssueDetailHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OverdueDueDate: Story = {
  args: { issue: { ...demoIssue, dueDate: localDateOffset(-1) } },
};

export const DueToday: Story = {
  args: { issue: { ...demoIssue, dueDate: localDateOffset(0) } },
};

export const FutureDueDate: Story = {
  args: { issue: { ...demoIssue, dueDate: localDateOffset(2) } },
};

export const ClosedIssueWithPastDueDate: Story = {
  args: { issue: { ...demoIssue, state: "closed", status: "done", dueDate: localDateOffset(-1) } },
};

export const StartDateAnomalyWithOverdueDueDate: Story = {
  args: {
    issue: {
      ...demoIssue,
      startDate: null,
      dueDate: localDateOffset(-1),
      scheduleStatus: "invalid",
      scheduleAnomaly: "invalid_start_date",
    },
  },
};

export const StartDateOnly: Story = {
  args: {
    issue: {
      ...demoIssue,
      dueDate: null,
      scheduleStatus: "scheduled",
      labels: [
        { name: "type:feature" },
        { name: "priority:high" },
        { name: "start-date:2026-09-24" },
      ],
    },
  },
};

export const Unscheduled: Story = {
  args: {
    issue: {
      ...demoIssue,
      startDate: null,
      dueDate: null,
      scheduleStatus: "unscheduled",
      labels: [{ name: "type:feature" }, { name: "team:frontend" }],
    },
  },
};

export const InternalScheduleLabelHidden: Story = {
  args: {
    issue: {
      ...demoIssue,
      labels: [
        { name: "type:feature" },
        { name: "start-date:2026-09-24" },
        { name: "priority:high" },
      ],
    },
  },
};

export const Bug: Story = {
  args: {
    issue: {
      ...demoIssue,
      type: "bug",
      labels: [{ name: "type:bug" }, { name: "priority:high" }],
    },
  },
};

export const MissingType: Story = {
  args: {
    issue: {
      ...demoIssue,
      type: null,
      labels: [{ name: "priority:high" }],
    },
  },
};

export const ConflictingType: Story = {
  args: {
    issue: {
      ...demoIssue,
      type: null,
      labels: [{ name: "type:bug" }, { name: "type:feature" }],
    },
  },
};

export const MissingPriority: Story = {
  args: {
    issue: {
      ...demoIssue,
      priority: null,
      labels: [{ name: "type:feature" }],
    },
  },
};

export const ConflictingPriority: Story = {
  args: {
    issue: {
      ...demoIssue,
      priority: null,
      labels: [{ name: "type:feature" }, { name: "priority:urgent" }],
    },
  },
};
