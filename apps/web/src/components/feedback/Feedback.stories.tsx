import type { Meta, StoryObj } from "@storybook/react";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorNotice } from "./ErrorNotice";
import { PermissionDenied } from "./PermissionDenied";

const meta = { title: "Feedback/States" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = { render: () => <LoadingState /> };
export const Empty: Story = {
  render: () => <EmptyState>沒有符合條件的 Issue</EmptyState>,
};
export const Error: Story = {
  render: () => <ErrorNotice message="Gitea 暫時無法使用，請稍後重試。" />,
};
export const Permission: Story = { render: () => <PermissionDenied /> };
