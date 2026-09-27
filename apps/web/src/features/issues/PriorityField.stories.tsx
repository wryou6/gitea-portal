import type { Meta, StoryObj } from "@storybook/react";
import { PriorityField } from "./PriorityField";

const meta = {
  title: "Issues/PriorityField",
  component: PriorityField,
  args: {
    id: "priority-story",
    value: "high",
    onChange: () => undefined,
  },
} satisfies Meta<typeof PriorityField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Selected: Story = {};

export const Required: Story = { args: { value: "" } };

export const MissingExistingPriority: Story = {
  args: { value: "", labels: [] },
};

export const ConflictingExistingPriority: Story = {
  args: {
    value: "",
    labels: [{ name: "priority:high" }, { name: "priority:urgent" }],
  },
};
