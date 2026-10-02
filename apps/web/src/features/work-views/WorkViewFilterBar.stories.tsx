import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { Repository } from "../../lib/api";
import { WorkViewFilterBar } from "./WorkViewFilterBar";
import { createDefaultWorkViewFilters, defaultWorkViewFilters, parseWorkViewFilters, type WorkViewFilters } from "./work-view-filters";

const repositories: Repository[] = [
  { owner: "engineering", name: "portal", fullName: "engineering/portal", htmlUrl: "#" },
  { owner: "platform", name: "service-api", fullName: "platform/service-api", htmlUrl: "#" },
];

function FilterBarStory({ repositoryFixed = false }: { repositoryFixed?: boolean }) {
  const currentUserLogin = "alex";
  const [filters, setFilters] = useState<WorkViewFilters>(() => parseWorkViewFilters("?assignee=me"));
  return <WorkViewFilterBar filters={filters} onChange={setFilters} repositories={repositories} assignees={["alex", "mei"]} currentUserLogin={currentUserLogin} repositoryFixed={repositoryFixed} />;
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
export const AdvancedFiltersActive: Story = {
  render: () => <WorkViewFilterBar
    filters={{ ...createDefaultWorkViewFilters(), assignee: "me", priority: "high", issueType: "bug", state: "in-progress", label: "team:portal", milestone: "Iteration 12" }}
    onChange={() => undefined}
    repositories={repositories}
    assignees={["alex", "mei"]}
    currentUserLogin="alex"
  />,
};
export const RestoredSharedUrl: Story = {
  render: () => <WorkViewFilterBar filters={parseWorkViewFilters("?priority=invalid&issueType=bug&state=done&assignee=mei&label=team%3Aportal")} onChange={() => undefined} repositories={repositories} assignees={["alex", "mei"]} currentUserLogin="alex" />,
};
export const ExplicitAllAssignees: Story = {
  render: () => <WorkViewFilterBar filters={{ ...defaultWorkViewFilters, assignee: "all" }} onChange={() => undefined} repositories={repositories} assignees={["alex", "mei"]} currentUserLogin="alex" />,
};
export const QuerylessAllAssignees: Story = {
  render: () => <WorkViewFilterBar filters={parseWorkViewFilters("")} onChange={() => undefined} repositories={repositories} assignees={["alex", "mei"]} currentUserLogin="alex" />,
};
export const NarrowLayout: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
