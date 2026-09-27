import type { Meta, StoryObj } from "@storybook/react";
import { IssueCreatePage } from "./IssueCreatePage";

const repositories = [
  { owner: "engineering", name: "portal", fullName: "engineering/portal", htmlUrl: "#" },
  { owner: "platform", name: "service-api", fullName: "platform/service-api", htmlUrl: "#" },
];

function IssueCreateStory({ repository }: { repository?: string }) {
  return <IssueCreatePage initialRepositories={repositories} initialRepository={repository} />;
}

const meta = { title: "Issues/Create issue workspace selection", component: IssueCreateStory } satisfies Meta<typeof IssueCreateStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllReposRequiresSelection: Story = {};
export const RepositoryPreselected: Story = { args: { repository: "platform/service-api" } };
