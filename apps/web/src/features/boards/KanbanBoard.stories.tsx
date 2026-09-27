import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "../../components/layout/PageHeader";
import { KanbanColumn } from "./KanbanColumn";
import type { BoardCard } from "./types";
import { demoIssue } from "../../stories/fixtures";

const todo: BoardCard = {
  ...demoIssue,
  workflowState: "todo",
  nextAction: "釐清需求",
  lastActionKey: "clarify-requirements",
  visibleLabels: demoIssue.labels,
};
const inProgress: BoardCard = {
  ...demoIssue,
  workflowState: "in-progress",
  nextAction: "開始實作",
  visibleLabels: demoIssue.labels,
};
const done: BoardCard = {
  ...demoIssue,
  number: 63,
  title: "完成第一輪需求驗收",
  state: "closed",
  workflowState: "done",
  currentOwner: null,
  nextAction: "確認完成結果",
  visibleLabels: demoIssue.labels,
};

function KanbanScreen() {
  const columns = [
    { stateKey: "todo", displayName: "待辦", cards: [todo] },
    { stateKey: "in-progress", displayName: "處理中", cards: [inProgress] },
    { stateKey: "done", displayName: "已完成", cards: [done] },
  ];
  return (
    <section>
      <PageHeader
        eyebrow="KANBAN WORKSPACE"
        title="工程工作看板"
        description="移動卡片時選擇原因，畫面會顯示該狀態的下一步動作。"
      />
      <div className="kanban-board">
        {columns.map((column) => (
          <KanbanColumn
            key={column.stateKey}
            column={column}
            destinations={columns}
            dragged={undefined}
            onDragStart={() => undefined}
            onDropCard={() => undefined}
          />
        ))}
      </div>
    </section>
  );
}

const meta = {
  title: "Screens/Kanban",
  component: KanbanScreen,
} satisfies Meta<typeof KanbanScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
