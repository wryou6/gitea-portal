import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { WorkViewFilterBar } from "./WorkViewFilterBar";
import { createDefaultWorkViewFilters, defaultWorkViewFilters, matchesRecentDoneVisibility, parseWorkViewFilters, type WorkViewFilters } from "./work-view-filters";
import { WorkViewLayout } from "./WorkViewLayout";
import { demoIssue } from "../../stories/fixtures";

function FilterBarStory({ repositoryFixed = false }: { repositoryFixed?: boolean }) {
  const currentUserLogin = "alex";
  const [filters, setFilters] = useState<WorkViewFilters>(() => parseWorkViewFilters("?assignee=me"));
  return <WorkViewFilterBar filters={filters} onChange={setFilters} assignees={["alex", "mei"]} currentUserLogin={currentUserLogin} repositoryFixed={repositoryFixed} />;
}

const meta = {
  title: "Work views/Shared filters",
  component: FilterBarStory,
  args: { repositoryFixed: false },
} satisfies Meta<typeof FilterBarStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllRepositories: Story = {};
export const RepositoryWorkspace: Story = { args: { repositoryFixed: true } };
export const SharedFiltersActive: Story = {
  render: () => <WorkViewFilterBar
    filters={{ ...createDefaultWorkViewFilters(), assignee: "me", priority: "high", issueType: "bug", state: "in-progress" }}
    onChange={() => undefined}
    assignees={["alex", "mei"]}
    currentUserLogin="alex"
  />,
};
export const RestoredSharedUrl: Story = {
  render: () => <WorkViewFilterBar filters={parseWorkViewFilters("?priority=invalid&issueType=bug&state=done&assignee=mei&repository=old%2Frepo&label=legacy&milestone=legacy")} onChange={() => undefined} assignees={["alex", "mei"]} currentUserLogin="alex" />,
};
export const ExplicitAllAssignees: Story = {
  render: () => <WorkViewFilterBar filters={{ ...defaultWorkViewFilters, assignee: "all" }} onChange={() => undefined} assignees={["alex", "mei"]} currentUserLogin="alex" />,
};
export const QuerylessAllAssignees: Story = {
  render: () => <WorkViewFilterBar filters={parseWorkViewFilters("")} onChange={() => undefined} assignees={["alex", "mei"]} currentUserLogin="alex" />,
};
export const NarrowLayout: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };

function localClosedAt(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

const recentDoneExamples = [
  { ...demoIssue, number: 101, title: "今天完成", status: "done" as const, state: "closed" as const, closedAt: localClosedAt(0) },
  { ...demoIssue, number: 102, title: "起始日完成（第 30 天）", status: "done" as const, state: "closed" as const, closedAt: localClosedAt(29) },
  { ...demoIssue, number: 103, title: "超出範圍一天", status: "done" as const, state: "closed" as const, closedAt: localClosedAt(30) },
  { ...demoIssue, number: 104, title: "沒有完成時間", status: "done" as const, state: "closed" as const, closedAt: null },
  { ...demoIssue, number: 105, title: "未完成項目不受日期限制", status: "todo" as const, closedAt: null },
];

function RecentDoneSummaryDemo() {
  const [recentDoneOnly, setRecentDoneOnly] = useState(true);
  const visible = recentDoneExamples.filter((issue) => matchesRecentDoneVisibility(issue, recentDoneOnly));
  return (
    <WorkViewLayout
      controls={<WorkViewFilterBar filters={defaultWorkViewFilters} onChange={() => undefined} recentDoneOnly={recentDoneOnly} onRecentDoneOnlyChange={setRecentDoneOnly} />}
      filters={defaultWorkViewFilters}
      resultCount={visible.length}
      recentDoneOnly={recentDoneOnly}
    >
      <ul>{visible.map((issue) => <li key={issue.number}>{issue.title}</li>)}</ul>
    </WorkViewLayout>
  );
}

export const RecentDoneSummary: Story = {
  render: () => <RecentDoneSummaryDemo />,
  parameters: { layout: "fullscreen" },
};
