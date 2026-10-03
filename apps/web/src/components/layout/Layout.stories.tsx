import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from "./AppShell";
import { PageHeader } from "./PageHeader";
import { ResponsiveToolbar } from "./ResponsiveToolbar";
import { Button } from "../ui/Button";
import { Field, FieldLabel, Input } from "../ui/Field";

const meta = { title: "Layout/Portal shell" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const PageComposition: Story = {
  render: () => (
    <AppShell
      login="admin"
      routePathname="/issues"
      routeSearch=""
      workspaceRepositories={[
        { owner: "engineering", name: "portal", fullName: "engineering/portal", htmlUrl: "#" },
        { owner: "platform", name: "service-api", fullName: "platform/service-api", htmlUrl: "#" },
      ]}
    >
      <PageHeader
        eyebrow="所有儲存庫"
        title="Issues"
        description="Layout primitives 的 isolated showcase。"
      />
      <ResponsiveToolbar>
        <Field>
          <FieldLabel htmlFor="layout-search">搜尋</FieldLabel>
          <Input id="layout-search" placeholder="Issue title" />
        </Field>
        <Button>套用篩選</Button>
      </ResponsiveToolbar>
    </AppShell>
  ),
};

export const RepositoryWorkspace: Story = {
  render: () => (
    <AppShell
      login="admin"
      routePathname="/repositories/engineering/portal/kanban"
      routeSearch=""
      workspaceRepositories={[
        { owner: "engineering", name: "portal", fullName: "engineering/portal", htmlUrl: "#" },
      ]}
    >
      <PageHeader
        eyebrow="engineering/portal"
        title="Kanban"
        description="Repository 工作區的全域建立入口沿用目前 Repository。"
      />
    </AppShell>
  ),
};

export const SidebarOverlayInteraction: Story = {
  render: () => (
    <AppShell
      login="admin"
      routePathname="/repositories/engineering/portal/gantt"
      routeSearch="?gantt_scale=week"
      workspaceRepositories={[
        { owner: "engineering", name: "portal", fullName: "engineering/portal", htmlUrl: "#" },
      ]}
    >
      <div className="work-view-layout">
        <PageHeader
          eyebrow="engineering/portal"
          title="Gantt Chart"
          description="移入左側圖示列或以 Tab 將焦點移入，確認標籤覆蓋此內容且不推動控制面板。"
        />
        <ResponsiveToolbar>
          <Button>工作檢視控制</Button>
        </ResponsiveToolbar>
      </div>
    </AppShell>
  ),
  parameters: {
    docs: {
      description: {
        story: "可將 viewport 調窄，再以滑鼠 hover 或鍵盤 focus 檢視 sidebar overlay。",
      },
    },
  },
};

export const AllReposCreateRoute: Story = {
  render: () => (
    <AppShell
      login="admin"
      routePathname="/issues/new"
      routeSearch="?returnTo=%2Fissues"
      workspaceRepositories={[
        { owner: "engineering", name: "portal", fullName: "engineering/portal", htmlUrl: "#" },
        { owner: "platform", name: "service-api", fullName: "platform/service-api", htmlUrl: "#" },
      ]}
    >
      <PageHeader
        eyebrow="所有儲存庫"
        title="建立問題"
        description="All repos 維持既有的 Repository 選擇流程。"
      />
    </AppShell>
  ),
};

export const RepositoryCreateRoute: Story = {
  render: () => (
    <AppShell
      login="admin"
      routePathname="/issues/new"
      routeSearch="?repository=engineering%2Fportal&returnTo=%2Frepositories%2Fengineering%2Fportal%2Fkanban"
      workspaceRepositories={[
        { owner: "engineering", name: "portal", fullName: "engineering/portal", htmlUrl: "#" },
      ]}
    >
      <PageHeader
        eyebrow="engineering/portal"
        title="建立問題"
        description="Repository 建立流程保留 Repository 與返回位置。"
      />
    </AppShell>
  ),
};
