import type { Meta, StoryObj } from "@storybook/react";
import { IssueTypeBadge } from "./IssueTypeBadge";

const meta = {
  title: "Issues/IssueTypeBadge",
  component: IssueTypeBadge,
  args: {
    type: "feature",
    labels: [{ name: "type:feature" }],
  },
} satisfies Meta<typeof IssueTypeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bug: Story = {
  args: { type: "bug", labels: [{ name: "type:bug" }] },
};

export const Feature: Story = {
  args: { type: "feature", labels: [{ name: "type:feature" }] },
};

export const Task: Story = {
  args: { type: "task", labels: [{ name: "type:task" }] },
};

export const Missing: Story = {
  args: { type: null, labels: [] },
};

export const Conflicting: Story = {
  args: {
    type: null,
    labels: [{ name: "type:bug" }, { name: "type:feature" }],
  },
};

export const Invalid: Story = {
  args: { type: null, labels: [{ name: "type:unknown" }] },
};
