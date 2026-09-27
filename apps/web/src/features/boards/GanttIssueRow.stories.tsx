import type { Meta, StoryObj } from "@storybook/react";
import { GanttIssueRow } from "./GanttIssueRow";
import { demoIssue } from "../../stories/fixtures";

const meta = {
  title: "Boards/GanttIssueRow",
  component: GanttIssueRow,
  args: {
    issue: demoIssue,
    href: "/issues/demo/frontend/42",
    start: demoIssue.startDate,
    end: demoIssue.dueDate,
    left: 20,
    width: 35,
  },
} satisfies Meta<typeof GanttIssueRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scheduled: Story = { args: { variant: "scheduled" } };

export const Unscheduled: Story = {
  args: {
    variant: "unscheduled",
    start: null,
    end: null,
    left: 0,
    width: 0,
    issue: {
      ...demoIssue,
      startDate: null,
      dueDate: null,
      scheduleStatus: "unscheduled",
    },
  },
};

export const DateAnomaly: Story = {
  args: {
    variant: "anomaly",
    anomaly: "開始日期晚於到期日期",
    issue: {
      ...demoIssue,
      startDate: "2026-09-30",
      dueDate: "2026-09-24",
      scheduleStatus: "invalid",
      scheduleAnomaly: "date_range_reversed",
    },
  },
};

export const StartDateOnly: Story = {
  args: {
    variant: "scheduled",
    start: demoIssue.startDate,
    end: demoIssue.startDate,
    issue: { ...demoIssue, dueDate: null, scheduleStatus: "scheduled" },
  },
};

export const DueDateOnly: Story = {
  args: {
    variant: "scheduled",
    start: demoIssue.dueDate,
    end: demoIssue.dueDate,
    issue: { ...demoIssue, startDate: null, scheduleStatus: "scheduled" },
  },
};

export const MissingType: Story = {
  args: {
    variant: "scheduled",
    issue: { ...demoIssue, type: null, labels: [] },
  },
};

export const ConflictingTypeInDateAnomaly: Story = {
  args: {
    variant: "anomaly",
    anomaly: "開始日期晚於到期日期",
    issue: {
      ...demoIssue,
      type: null,
      scheduleStatus: "invalid",
      scheduleAnomaly: "date_range_reversed",
      startDate: "2026-09-30",
      dueDate: "2026-09-24",
      labels: [{ name: "type:bug" }, { name: "type:feature" }],
    },
  },
};

export const MissingPriority: Story = {
  args: {
    variant: "scheduled",
    issue: {
      ...demoIssue,
      priority: null,
      labels: [{ name: "type:feature" }],
    },
  },
};

export const UnknownPriority: Story = {
  args: {
    variant: "scheduled",
    issue: {
      ...demoIssue,
      priority: null,
      labels: [{ name: "type:feature" }, { name: "priority:urgent" }],
    },
  },
};
