import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { WorkspaceSelector } from "./WorkspaceSelector";

const repositories = [
  { owner: "engineering", name: "portal", fullName: "engineering/portal", htmlUrl: "#" },
  { owner: "platform", name: "service-api", fullName: "platform/service-api", htmlUrl: "#" },
];

function SelectorStory({ pathname }: { pathname: string }) {
  const [currentPath, setCurrentPath] = useState(pathname);
  useEffect(() => setCurrentPath(pathname), [pathname]);
  return <WorkspaceSelector initialRepositories={repositories} initialPathname={currentPath} onNavigate={setCurrentPath} />;
}

const meta = {
  title: "Workspaces/Workspace selector",
  component: SelectorStory,
  args: { pathname: "/issues" },
} satisfies Meta<typeof SelectorStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllRepositories: Story = {};
export const RepositoryWorkspace: Story = { args: { pathname: "/repositories/platform/service-api/kanban" } };
export const NarrowLayout: Story = { args: { pathname: "/gantt" }, parameters: { viewport: { defaultViewport: "mobile1" } } };
