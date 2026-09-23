import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
import { Badge } from "../../components/ui/Badge";
export function IssueDetailHeader({ issue }: { issue: Issue }) {
  return (
    <>
      <p className="eyebrow">
        {issue.owner}/{issue.name} #{issue.number}
      </p>
      <h1>{issue.title}</h1>
      <p className="meta">
        <Badge className={issue.state}>
          {issue.state === "open" ? "Open" : "Closed"}
        </Badge>
        <span>Assignee：{issue.assignee ?? "未指派"}</span>
        <span>Milestone：{issue.milestone ?? "未設定 Milestone"}</span>
        <time dateTime={issue.updatedAt}>
          更新於 {new Date(issue.updatedAt).toLocaleString("zh-TW")}
        </time>
      </p>
      <LabelList labels={issue.labels} />
    </>
  );
}
