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
    <AppShell>
      <PageHeader
        eyebrow="CROSS-REPOSITORY"
        title="Issues"
        description="Layout primitives 的 isolated showcase。"
        action={<Button>建立 Issue</Button>}
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
