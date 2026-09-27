import type { Meta, StoryObj } from "@storybook/react";
import { ScheduleDateFields } from "./ScheduleDateFields";

const meta = {
  title: "Issues/ScheduleDateFields",
  component: ScheduleDateFields,
  args: {
    startDate: "",
    dueDate: "",
    startDateId: "story-start-date",
    dueDateId: "story-due-date",
    onStartDateChange: () => undefined,
    onDueDateChange: () => undefined,
  },
} satisfies Meta<typeof ScheduleDateFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateIssue: Story = {};

export const EditIssue: Story = {
  args: {
    startDate: "2026-09-24",
    dueDate: "2026-09-30",
    showClearButtons: true,
  },
};

export const ClearDates: Story = {
  args: { showClearButtons: true },
};

export const Saving: Story = {
  args: {
    startDate: "2026-09-24",
    dueDate: "2026-09-30",
    showClearButtons: true,
    disabled: true,
  },
};
