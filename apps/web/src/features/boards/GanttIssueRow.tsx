import type { Issue } from "../../lib/api";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { ScheduleDates } from "../issues/ScheduleDates";

export type GanttIssueRowVariant = "scheduled" | "unscheduled" | "anomaly";

export function GanttIssueRow({
  issue,
  href,
  variant,
  start,
  end,
  left = 0,
  width = 0,
  anomaly,
}: {
  issue: Issue;
  href: string;
  variant: GanttIssueRowVariant;
  start?: string | null;
  end?: string | null;
  left?: number;
  width?: number;
  anomaly?: string;
}) {
  const heading = (
    <div className="gantt-issue-heading">
      <a href={href}>{issue.title}</a>
      <IssueTypeBadge type={issue.type} labels={issue.labels} />
      <PriorityBadge priority={issue.priority} labels={issue.labels} />
    </div>
  );
  const details = (
    <>
      <small>
        {issue.owner}/{issue.name} #{issue.number} ·{" "}
        {issue.assignee ?? "未指派"}
      </small>
      <ScheduleDates
        startDate={issue.startDate}
        dueDate={issue.dueDate}
        scheduleAnomaly={issue.scheduleAnomaly}
        className="schedule-dates--compact"
      />
      {variant === "anomaly" && (
        <span className="schedule-anomaly" role="status">
          {anomaly ?? "排程日期異常"}
        </span>
      )}
    </>
  );

  if (variant === "anomaly") {
    return (
      <article className="gantt-anomaly">
        <div className="gantt-issue">
          {heading}
          {details}
        </div>
      </article>
    );
  }

  return (
    <article className="gantt-row">
      <div className="gantt-issue">
        {heading}
        {details}
      </div>
      <div className="gantt-track" aria-hidden="true">
        {start && end && (
          <span
            className="gantt-bar"
            aria-hidden="true"
            style={{ left: `${left}%`, width: `${width}%` }}
          />
        )}
      </div>
    </article>
  );
}
