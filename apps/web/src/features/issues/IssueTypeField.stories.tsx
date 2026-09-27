import type { Meta, StoryObj } from "@storybook/react";
import { IssueTypeField } from "./IssueTypeField";

const meta = {
  title: "Issues/IssueTypeField",
  component: IssueTypeField,
  args: { id: "issue-type", value: "feature", onChange: () => undefined },
} satisfies Meta<typeof IssueTypeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { value: "" } };
export const Bug: Story = { args: { value: "bug" } };
export const Feature: Story = { args: { value: "feature" } };
export const Task: Story = { args: { value: "task" } };
export const MissingOnEdit: Story = {
  args: { value: "", status: "missing" },
};
export const ConflictOnEdit: Story = {
  args: { value: "", status: "conflict" },
};
