import type { Meta, StoryObj } from "@storybook/react";
import { ScheduleDates } from "./ScheduleDates";

const meta = {
  title: "Issues/ScheduleDates",
  component: ScheduleDates,
  args: {
    startDate: "2026-09-24",
    dueDate: "2026-09-30",
  },
} satisfies Meta<typeof ScheduleDates>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BothDates: Story = {};

export const StartOnly: Story = {
  args: { startDate: "2026-09-24", dueDate: null },
};

export const DueOnly: Story = {
  args: { startDate: null, dueDate: "2026-09-30" },
};

export const OverdueDueDate: Story = {
  args: { startDate: "2026-09-24", dueDate: "2026-09-25", overdue: true },
};

export const DueToday: Story = {
  args: { startDate: null, dueDate: "2026-09-29", overdue: false },
};

export const FutureDueDate: Story = {
  args: { startDate: null, dueDate: "2026-10-02", overdue: false },
};

export const Unscheduled: Story = {
  args: { startDate: null, dueDate: null },
};

export const InvalidStartDate: Story = {
  args: {
    startDate: null,
    dueDate: "2026-09-30",
    scheduleAnomaly: "invalid_start_date",
  },
};

export const MultipleStartDates: Story = {
  args: {
    startDate: null,
    dueDate: "2026-09-30",
    scheduleAnomaly: "multiple_start_dates",
  },
};

export const InvalidDueDate: Story = {
  args: {
    startDate: "2026-09-24",
    dueDate: null,
    scheduleAnomaly: "invalid_due_date",
  },
};

export const ReversedDateRange: Story = {
  args: {
    startDate: "2026-09-30",
    dueDate: "2026-09-24",
    scheduleAnomaly: "date_range_reversed",
    overdue: true,
  },
};

export const StartDateAnomalyWithOverdueDueDate: Story = {
  args: {
    startDate: null,
    dueDate: "2026-09-25",
    scheduleAnomaly: "invalid_start_date",
    overdue: true,
  },
};
