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
