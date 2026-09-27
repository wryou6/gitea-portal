import type { Meta, StoryObj } from "@storybook/react";
import { ISSUE_PRIORITIES, type IssuePriority } from "@gitea-portal/domain";
import { PriorityBadge } from "./PriorityBadge";

const meta = {
  title: "Issues/PriorityBadge",
  component: PriorityBadge,
  args: {
    priority: "high",
    labels: [{ name: "priority:high" }],
  },
} satisfies Meta<typeof PriorityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const High: Story = {};

export const AllLevels: Story = {
  render: () => (
    <div className="labels" aria-label="Priority levels">
      {ISSUE_PRIORITIES.map((priority: IssuePriority) => (
        <PriorityBadge
          key={priority}
          priority={priority}
          labels={[{ name: `priority:${priority}` }]}
        />
      ))}
    </div>
  ),
};

export const Missing: Story = {
  args: { priority: null, labels: [] },
};

export const Conflicting: Story = {
  args: {
    priority: null,
    labels: [{ name: "priority:critical" }, { name: "priority:high" }],
  },
};

export const UnknownValue: Story = {
  args: { priority: null, labels: [{ name: "priority:urgent" }] },
};
