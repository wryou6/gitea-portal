import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "../../components/layout/PageHeader";
import { GanttBoard } from "./GanttBoard";
import { demoIssue } from "../../stories/fixtures";

function GanttScreen() {
  return (
    <section>
      <PageHeader
        eyebrow="GANTT WORKSPACE"
        title="工程排程"
        description="依負責人與日期檢視開放及已完成工作。"
      />
      <GanttBoard
        demo
        issues={[
          demoIssue,
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

const meta = { title: "Screens/Gantt", component: GanttScreen } satisfies Meta<
  typeof GanttScreen
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
