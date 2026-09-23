import type { Issue } from "../../lib/api";
import { LabelList } from "./LabelList";
export function IssueRow({ issue }: { issue: Issue }) {
  return (
    <article className="issue-row">
      <div style={{ minWidth: 0 }}>
        <a
          href={`/issue/${issue.owner}/${issue.name}/${issue.number}`}
          className="issue-title"
        >
          {issue.title}
        </a>
        <div className="meta">
          <span>
            {issue.owner}/{issue.name} #{issue.number}
          </span>
          <span className={issue.state}>
            {issue.state === "open" ? "Open" : "Closed"}
          </span>
          <span>{issue.assignee ?? "未指派"}</span>
          <span>{issue.milestone ?? "未設定 Milestone"}</span>
          <time dateTime={issue.updatedAt}>
            {new Date(issue.updatedAt).toLocaleString("zh-TW")}
          </time>
        </div>
      </div>
      <LabelList labels={issue.labels} />
    </article>
  );
}
