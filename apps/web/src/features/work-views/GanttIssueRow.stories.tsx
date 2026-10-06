import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useTranslation } from "react-i18next";
import { GanttIssueRow } from "./GanttIssueRow";
import {
  demoCompletedIssueWithMultipleAssignees,
  demoIssue,
  demoIssueWithMultipleAssignees,
  demoIssueWithThreeAssignees,
} from "../../stories/fixtures";
import { buildTimelineCells } from "./gantt-timeline";
import { GANTT_FIXED_FIELDS } from "./gantt-view-preference";

const cells = buildTimelineCells("2026-09-01", "2026-10-15", "day", "2026-09-15");
const columns = [
  { field: "repository" as const, label: "Repository" },
  ...GANTT_FIXED_FIELDS.map((field) => ({ field, label: field })),
];

function LocalizedGanttIssueRow(props: ComponentProps<typeof GanttIssueRow>) {
  const { t } = useTranslation("issues");
  const localizedColumns = props.columns.map(({ field }) => ({
    field,
    label: field === "repository" ? t("repository") : t(field === "priority" ? "priorityLabel" : field),
  }));
  return <GanttIssueRow {...props} columns={localizedColumns} />;
}

const meta = {
  title: "Work views/Gantt issue row",
  component: LocalizedGanttIssueRow,
  args: {
    issue: demoIssue,
    href: "/issues/demo/frontend/42",
    variant: "scheduled",
    columns,
    cells,
    scale: "day",
    today: "2026-09-29",
  },
} satisfies Meta<typeof GanttIssueRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scheduled: Story = {};

export const OverdueDueDate: Story = {
  args: { issue: { ...demoIssue, dueDate: "2026-09-24" } },
};

export const DueToday: Story = {
  args: { issue: { ...demoIssue, dueDate: "2026-09-29" } },
};

export const FutureDueDate: Story = {
  args: { issue: { ...demoIssue, dueDate: "2026-10-02" } },
};

export const ClosedIssueWithPastDueDate: Story = {
  args: { issue: { ...demoCompletedIssueWithMultipleAssignees, dueDate: "2026-09-24" } },
};

export const MultipleAssignees: Story = {
  args: { issue: demoIssueWithThreeAssignees },
};

export const AssigneeOverflow: Story = {
  args: { issue: demoIssueWithMultipleAssignees },
};

export const CompletedWithMultipleAssignees: Story = {
  args: { issue: demoCompletedIssueWithMultipleAssignees },
};

export const Unscheduled: Story = {
  args: {
    variant: "unscheduled",
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
    issue: {
      ...demoIssue,
      startDate: "2026-09-30",
      dueDate: "2026-09-24",
      scheduleStatus: "invalid",
      scheduleAnomaly: "date_range_reversed",
    },
  },
};

export const StartDateAnomalyWithOverdueDueDate: Story = {
  args: {
    variant: "anomaly",
    issue: {
      ...demoIssue,
      startDate: null,
      dueDate: "2026-09-24",
      scheduleStatus: "invalid",
      scheduleAnomaly: "invalid_start_date",
    },
  },
};

export const StartDateOnly: Story = {
  args: { issue: { ...demoIssue, dueDate: null, scheduleStatus: "scheduled" } },
};

export const DueDateOnly: Story = {
  args: { issue: { ...demoIssue, startDate: null, scheduleStatus: "scheduled" } },
};

export const MissingType: Story = {
  args: { issue: { ...demoIssue, type: null, labels: [] } },
};

export const ConflictingTypeInDateAnomaly: Story = {
  args: {
    variant: "anomaly",
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
  args: { issue: { ...demoIssue, priority: null, labels: [{ name: "type:feature" }] } },
};

export const UnknownPriority: Story = {
  args: {
    issue: {
      ...demoIssue,
      priority: null,
      labels: [{ name: "type:feature" }, { name: "priority:urgent" }],
    },
  },
};
