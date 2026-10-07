import type { Meta, StoryObj } from "@storybook/react";
import { SessionExpiredNotice } from "./SessionExpiredNotice";

const meta = {
  title: "Auth/Session expired notice",
  component: SessionExpiredNotice,
} satisfies Meta<typeof SessionExpiredNotice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Reauthenticated: Story = {};

export const NarrowViewport: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
