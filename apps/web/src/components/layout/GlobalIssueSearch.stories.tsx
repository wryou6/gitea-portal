import type { Meta, StoryObj } from "@storybook/react";
import { GlobalIssueSearch } from "./GlobalIssueSearch";
import { demoIssue } from "../../stories/fixtures";
import type { IssueSearchResult } from "../../lib/api";

const result = (items: typeof demoIssue[]): IssueSearchResult => ({ items, sort: "key", direction: "asc" });
const delay = (value: IssueSearchResult) => new Promise<IssueSearchResult>((resolve) => window.setTimeout(() => resolve(value), 600));
const meta = {
  title: "Layout/Global Issue search",
  component: GlobalIssueSearch,
  args: { returnTo: "/issues?state=todo", initialQuery: "timeline", search: async () => delay(result([demoIssue])) },
} satisfies Meta<typeof GlobalIssueSearch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { search: async () => delay(result([])) } };
export const SearchError: Story = { args: { search: async () => { await delay(result([])); throw new globalThis.Error("search error"); } } };
export const NarrowLayout: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
