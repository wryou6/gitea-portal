import type { Meta, StoryObj } from "@storybook/react";
import { GlobalIssueSearch } from "./GlobalIssueSearch";
import { demoIssue } from "../../stories/fixtures";
import type { IssuePage } from "../../lib/api";

const page = (items: typeof demoIssue[]): IssuePage => ({ items, page: 1, limit: 8, hasNext: false, sort: "key", direction: "asc" });
const delay = (value: IssuePage) => new Promise<IssuePage>((resolve) => window.setTimeout(() => resolve(value), 600));
const meta = {
  title: "Layout/Global Issue search",
  component: GlobalIssueSearch,
  args: { returnTo: "/issues?state=todo", initialQuery: "timeline", search: async () => delay(page([demoIssue])) },
} satisfies Meta<typeof GlobalIssueSearch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { search: async () => delay(page([])) } };
export const SearchError: Story = { args: { search: async () => { await delay(page([])); throw new globalThis.Error("search error"); } } };
export const NarrowLayout: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
