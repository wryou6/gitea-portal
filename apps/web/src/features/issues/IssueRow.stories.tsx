import type { Meta, StoryObj } from "@storybook/react";
import { IssueRow } from "./IssueRow";
import {
  demoCompletedIssueWithMultipleAssignees,
  demoIssue,
  demoIssueWithMultipleAssignees,
  demoIssueWithThreeAssignees,
} from "../../stories/fixtures";
import { Table } from "../../components/ui/Table";

function localDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const meta = {
  title: "Issues/IssueRow",
  component: IssueRow,
  render: (args) => <Table className="issues-table"><tbody><IssueRow {...args} /></tbody></Table>,
} satisfies Meta<typeof IssueRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { issue: demoIssue } };
export const MultipleAssignees: Story = {
  args: { issue: demoIssueWithThreeAssignees },
};
export const AssigneeOverflow: Story = {
  args: { issue: demoIssueWithMultipleAssignees },
};
export const CompletedWithMultipleAssignees: Story = {
  args: { issue: demoCompletedIssueWithMultipleAssignees },
};
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
  args: {
    issue: {
      ...demoCompletedIssueWithMultipleAssignees,
      dueDate: localDateOffset(-1),
    },
  },
};
export const InvalidDueDate: Story = {
  args: {
    issue: {
      ...demoIssue,
      dueDate: null,
      scheduleStatus: "invalid",
      scheduleAnomaly: "invalid_due_date",
    },
  },
};
export const ReversedRange: Story = {
  args: {
    issue: {
      ...demoIssue,
      startDate: localDateOffset(2),
      dueDate: localDateOffset(-1),
      scheduleStatus: "invalid",
      scheduleAnomaly: "date_range_reversed",
    },
  },
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
export const NoOptionalMetadata: Story = {
  args: {
    issue: {
      ...demoIssue,
      assignee: null,
      milestone: null,
      labels: [{ name: "type:feature" }],
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

export const DueDateOnly: Story = {
  args: {
    issue: {
      ...demoIssue,
      startDate: null,
      scheduleStatus: "scheduled",
      labels: [{ name: "type:feature" }, { name: "priority:high" }],
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

export const ReversedDateRange: Story = {
  args: {
    issue: {
      ...demoIssue,
      startDate: "2026-09-30",
      dueDate: "2026-09-24",
      scheduleStatus: "invalid",
      scheduleAnomaly: "date_range_reversed",
      labels: [{ name: "type:feature" }, { name: "priority:high" }],
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

export const Task: Story = {
  args: {
    issue: {
      ...demoIssue,
      type: "task",
      labels: [{ name: "type:task" }, { name: "team:frontend" }],
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

export const InvalidType: Story = {
  args: {
    issue: {
      ...demoIssue,
      type: null,
      labels: [{ name: "type:unknown" }],
    },
  },
};

export const AllPriorityLevels: Story = {
  args: { issue: demoIssue },
  render: () => (
    <Table className="issues-table"><tbody>
      {(["critical", "high", "medium", "low"] as const).map((priority) => (
        <IssueRow
          key={priority}
          issue={{
            ...demoIssue,
            priority,
            labels: [
              { name: "type:feature" },
              { name: `priority:${priority}` },
            ],
          }}
        />
      ))}
    </tbody></Table>
  ),
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
      labels: [
        { name: "type:feature" },
        { name: "priority:critical" },
        { name: "priority:high" },
      ],
    },
  },
};
