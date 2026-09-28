import type { Meta, StoryObj } from "@storybook/react";
import { SessionUnavailable } from "./SessionUnavailable";

const meta = {
  title: "Auth/Session unavailable",
  component: SessionUnavailable,
  args: { onRetry: () => undefined },
} satisfies Meta<typeof SessionUnavailable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ServiceUnavailable: Story = {};
