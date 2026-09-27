import type { Meta, StoryObj } from "@storybook/react";
import { IssueListPage } from "./IssueListPage";
import { demoIssue } from "../../stories/fixtures";

const meta = {
  title: "Screens/Issue List",
  component: IssueListPage,
} satisfies Meta<typeof IssueListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    demoIssues: [
      demoIssue,
      {
        ...demoIssue,
        number: 51,
        title: "補上工作狀態轉換原因",
        workflowState: "todo",
        assignee: null,
        assignees: [],
        currentOwner: null,
        lastActionKey: null,
        nextAction: "指派負責人",
        type: "task",
        priority: "medium",
        startDate: null,
        dueDate: null,
        scheduleStatus: "unscheduled",
      },
      {
        ...demoIssue,
        number: 63,
        title: "完成第一輪需求驗收",
        state: "closed",
        workflowState: "done",
        currentOwner: null,
        assignee: "engineer",
        lastActionKey: "work-complete",
        nextAction: "確認完成結果",
      },
    ],
  },
};
