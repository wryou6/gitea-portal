import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../i18n/format";
import { issueStatusTranslationKey } from "../../i18n/status";
import { PageHeader } from "../../components/layout/PageHeader";
import { AppShell } from "../../components/layout/AppShell";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { KanbanColumn } from "./KanbanColumn";
import type { WorkViewCard } from "./types";
import { demoIssue } from "../../stories/fixtures";
import { WorkViewFilterBar } from "./WorkViewFilterBar";
import { WorkViewLayout } from "./WorkViewLayout";
import { defaultWorkViewFilters, matchesWorkViewFilters, type WorkViewFilters } from "./work-view-filters";

const todo: WorkViewCard = {
  ...demoIssue,
  status: "todo",
  nextAction: "釐清需求",
  lastActionKey: "clarify-requirements",
  visibleLabels: demoIssue.labels,
};
const inProgress: WorkViewCard = {
  ...demoIssue,
  status: "in-progress",
  nextAction: "開始實作",
  visibleLabels: demoIssue.labels,
};
const done: WorkViewCard = {
  ...demoIssue,
  number: 63,
  title: "完成第一輪需求驗收",
  state: "closed",
  status: "done",
  assignee: "engineer",
  assignees: ["engineer"],
  currentOwner: null,
  nextAction: "確認完成結果",
  visibleLabels: demoIssue.labels,
};
const anomaly: WorkViewCard = {
  ...demoIssue,
  number: 64,
  title: "檢查排程日期異常",
  status: "anomaly",
  scheduleStatus: "invalid",
  scheduleAnomaly: "date_range_reversed",
  visibleLabels: demoIssue.labels,
};
const collidingIssueNumber: WorkViewCard = {
  ...todo,
  owner: "platform",
  name: "service-api",
  number: todo.number,
  title: "Same issue number from a different repository",
};

function KanbanScreen({ includeAnomaly = false }: { includeAnomaly?: boolean }) {
  const { t, i18n } = useTranslation("work-views");
  const { t: tCommon } = useTranslation("common");
  const { t: tIssues } = useTranslation("issues");
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => window.matchMedia("(max-width: 720px)").matches,
  );
  const [activeColumnKey, setActiveColumnKey] = useState("todo");
  const [filters, setFilters] = useState<WorkViewFilters>(defaultWorkViewFilters);
  const columns = [
    { stateKey: "todo", displayName: "待辦", cards: [todo, collidingIssueNumber] },
    { stateKey: "in-progress", displayName: "處理中", cards: [inProgress] },
    { stateKey: "done", displayName: "已完成", cards: [done] },
    ...(includeAnomaly
      ? [{ stateKey: "anomaly", displayName: "異常", cards: [anomaly] }]
      : []),
  ];
  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const updateViewport = () => setIsMobileViewport(media.matches);
    media.addEventListener("change", updateViewport);
    updateViewport();
    return () => media.removeEventListener("change", updateViewport);
  }, []);
  const visibleColumns = isMobileViewport
    ? columns.filter((column) => column.stateKey === activeColumnKey)
    : columns;
  const filteredColumns = visibleColumns.map((column) => ({
    ...column,
    cards: column.cards.filter((issue) => matchesWorkViewFilters(issue, filters)),
  }));
  return (
    <section className="workspace-view">
      <PageHeader
        title={tCommon("kanban")}
        compact
      />
      <WorkViewLayout filters={filters} resultCount={columns.flatMap((column) => column.cards).filter((issue) => matchesWorkViewFilters(issue, filters)).length} controls={<WorkViewFilterBar filters={filters} onChange={setFilters} assignees={["engineer"]} />}>
      {isMobileViewport && (
        <div className="field kanban-lane-picker">
          <label htmlFor="storybook-kanban-active-column">{t("statusColumn")}</label>
          <select
            id="storybook-kanban-active-column"
            value={activeColumnKey}
            onChange={(event) => setActiveColumnKey(event.target.value)}
          >
            {columns.map((column) => (
              <option key={column.stateKey} value={column.stateKey}>
                {tIssues(issueStatusTranslationKey(column.stateKey))}（{formatNumber(column.cards.length, i18n.language)}）
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="kanban-board">
        {filteredColumns.map((column) => (
          <KanbanColumn
            key={column.stateKey}
            column={column}
            dragged={undefined}
            onDragStart={() => undefined}
            onDropCard={() => undefined}
          />
        ))}
      </div>
      </WorkViewLayout>
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
export const DesktopWorkspace: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <AppShell login="engineer" routePathname="/kanban" routeSearch="" workspaceRepositories={[]}><Story /></AppShell>],
};
export const DesktopWorkspaceDark: Story = { ...DesktopWorkspace, globals: { theme: "dark" } };
export const WithAnomaly: Story = { args: { includeAnomaly: true } };
export const Loading: Story = { render: () => <LoadingState /> };
export const Empty: Story = { render: () => <EmptyState>No issues in readable repositories.</EmptyState> };
export const ErrorWithRetry: Story = { render: () => <><ErrorNotice message="Repository data could not be loaded." /><button type="button">Retry</button></> };
