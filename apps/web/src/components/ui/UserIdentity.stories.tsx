import type { Meta, StoryObj } from "@storybook/react";
import { UserIdentity } from "./UserIdentity";

const meta = {
  title: "UI/User identity",
  component: UserIdentity,
} satisfies Meta<typeof UserIdentity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NamedAccount: Story = {
  args: { user: { login: "alex.lin", fullName: "Alex Lin" } },
};

export const LoginOnly: Story = {
  args: { user: { login: "build-bot" } },
};

export const AvatarLoadFailure: Story = {
  args: {
    user: {
      login: "mei",
      fullName: "Mei Wang",
      avatarUrl: "https://gitea.invalid/avatars/mei",
    },
  },
};

export const DuplicateNames: Story = {
  args: { user: { login: "alex.lin", fullName: "Alex Lin" } },
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <UserIdentity user={{ login: "alex.lin", fullName: "Alex Lin" }} />
      <UserIdentity user={{ login: "alex.chen", fullName: "Alex Lin" }} />
    </div>
  ),
};

export const LongName: Story = {
  args: {
    user: {
      login: "mei-wang",
      fullName: "王美玲・ソフトウェアプラットフォームエンジニア",
    },
  },
};
