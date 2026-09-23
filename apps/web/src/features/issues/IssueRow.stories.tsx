import type { Meta, StoryObj } from "@storybook/react";
import { IssueRow } from "./IssueRow";
import { demoIssue } from "../../stories/fixtures";

const meta = { title: "Issues/IssueRow", component: IssueRow } satisfies Meta<
  typeof IssueRow
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { issue: demoIssue } };
export const NoOptionalMetadata: Story = {
  args: {
    issue: { ...demoIssue, assignee: null, milestone: null, labels: [] },
  },
};
