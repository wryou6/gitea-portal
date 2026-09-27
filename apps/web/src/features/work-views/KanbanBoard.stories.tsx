import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "../../components/layout/PageHeader";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { KanbanColumn } from "./KanbanColumn";
import type { WorkViewCard } from "./types";
import { demoIssue } from "../../stories/fixtures";

const todo: WorkViewCard = {
  ...demoIssue,
  workflowState: "todo",
  nextAction: "釐清需求",
  lastActionKey: "clarify-requirements",
  visibleLabels: demoIssue.labels,
};
const inProgress: WorkViewCard = {
  ...demoIssue,
  workflowState: "in-progress",
  nextAction: "開始實作",
  visibleLabels: demoIssue.labels,
};
const done: WorkViewCard = {
  ...demoIssue,
  number: 63,
  title: "完成第一輪需求驗收",
  state: "closed",
  workflowState: "done",
  currentOwner: null,
  nextAction: "確認完成結果",
  visibleLabels: demoIssue.labels,
};
const collidingIssueNumber: WorkViewCard = {
  ...todo,
  owner: "platform",
  name: "service-api",
  number: todo.number,
  title: "Same issue number from a different repository",
};

function KanbanScreen() {
  const columns = [
    { stateKey: "todo", displayName: "待辦", cards: [todo, collidingIssueNumber] },
    { stateKey: "in-progress", displayName: "處理中", cards: [inProgress] },
    { stateKey: "done", displayName: "已完成", cards: [done] },
  ];
  return (
    <section>
      <PageHeader
        eyebrow="ALL REPOS · KANBAN"
        title="工程工作 Kanban"
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
  title: "Work views/Kanban",
  component: KanbanScreen,
} satisfies Meta<typeof KanbanScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { render: () => <LoadingState /> };
export const Empty: Story = { render: () => <EmptyState>No issues in readable repositories.</EmptyState> };
export const ErrorWithRetry: Story = { render: () => <><ErrorNotice message="Repository data could not be loaded." /><button type="button">Retry</button></> };
