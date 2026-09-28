import type { Meta, StoryObj } from "@storybook/react";
import { LoginPage } from "./LoginPage";

const meta = {
  title: "Auth/Login page",
  component: LoginPage,
  args: { returnTo: "/repositories/platform/service-api/kanban" },
} satisfies Meta<typeof LoginPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Anonymous: Story = {};
export const AuthorizationDenied: Story = { args: { error: "denied" } };
export const SignInFailed: Story = { args: { error: "failed" } };
export const SessionExpired: Story = { args: { sessionExpired: true } };
