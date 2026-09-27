import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "../../components/layout/PageHeader";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { GanttBoard } from "./GanttBoard";
import { demoIssue } from "../../stories/fixtures";

function GanttScreen() {
  return (
    <section>
      <PageHeader
        eyebrow="ALL REPOS · GANTT"
        title="工程排程"
        description="依負責人與日期檢視開放及已完成工作。"
      />
      <GanttBoard
        demo
        issues={[
          demoIssue,
          {
            ...demoIssue,
            owner: "platform",
            name: "service-api",
            number: demoIssue.number,
            title: "Same issue number in another repository",
            startDate: "2026-07-08",
            dueDate: "2026-07-15",
          },
          {
            ...demoIssue,
            number: 51,
            title: "尚未安排日期的工作",
            startDate: null,
            dueDate: null,
            scheduleStatus: "unscheduled",
          },
        ]}
      />
    </section>
  );
}

const meta = { title: "Work views/Gantt", component: GanttScreen } satisfies Meta<
  typeof GanttScreen
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { render: () => <LoadingState /> };
export const Empty: Story = { render: () => <EmptyState>No scheduled issues across readable repositories.</EmptyState> };
export const ErrorWithRetry: Story = { render: () => <><ErrorNotice message="Repository data could not be loaded." /><button type="button">Retry</button></> };
