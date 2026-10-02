import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { routePaths } from "../../app/routes";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { IssueStatusBadge } from "../../components/ui/IssueStatusBadge";
import { formatCalendarDate, formatDateTime } from "../../i18n/format";
import type { Issue, IssueSortField } from "../../lib/api";
import { scheduleAnomalyTranslationKey } from "../issues/ScheduleDates";
import type { GanttTimelineCell } from "./gantt-timeline";
import { GANTT_SCALE_WIDTH } from "./GanttCalendarHeader";
import type { GanttScale } from "./gantt-timeline";
import { UserIdentity } from "../../components/ui/UserIdentity";
import { profileFor } from "../../lib/user-profiles";

export type GanttIssueRowVariant = "scheduled" | "unscheduled" | "anomaly";

export type GanttColumn = {
  field: IssueSortField | "repository";
  label: string;
};

export function GanttIssueRow({
  issue,
  href,
  variant,
  columns,
  fieldGridTemplate,
  returnTo,
  cells,
  scale,
  today,
}: {
  issue: Issue;
  href?: string;
  returnTo?: string;
  variant: GanttIssueRowVariant;
  columns: GanttColumn[];
  fieldGridTemplate?: string;
  cells: GanttTimelineCell[];
  scale: GanttScale;
  today: string;
}) {
  const { t } = useTranslation("work-views");
  const { t: tIssues } = useTranslation("issues");
  const issueHref = href ?? (returnTo
    ? routePaths.issueDetailFrom(issue.owner, issue.name, issue.number, returnTo)
    : routePaths.issueDetail(issue.owner, issue.name, issue.number));
  const unitWidth = GANTT_SCALE_WIDTH[scale];
  const totalWidth = cells.length * unitWidth;
  const weekendOverlays: Array<{ date: string; left: number; width: number }> = [];
  cells.forEach((cell, index) => {
    const days = Math.max(1, Math.round((Date.parse(`${cell.end}T00:00:00Z`) - Date.parse(`${cell.start}T00:00:00Z`)) / 86_400_000));
    for (let day = 0; day < days; day += 1) {
      const date = new Date(Date.parse(`${cell.start}T00:00:00Z`) + day * 86_400_000);
      const weekday = date.getUTCDay();
      if (weekday === 0 || weekday === 6) {
        weekendOverlays.push({
          date: date.toISOString().slice(0, 10),
          left: (index + day / days) * unitWidth,
          width: unitWidth / days,
        });
      }
    }
  });
  const vars = {
    "--gantt-unit-width": `${unitWidth}px`,
    "--gantt-timeline-width": `${totalWidth}px`,
    "--gantt-fields-template": fieldGridTemplate ?? columns.map(({ field }) => field === "title"
      ? "minmax(13rem, 2fr)"
      : field === "assignee" || field === "status" || field === "repository"
        ? "max-content"
        : "minmax(7rem, 0.9fr)").join(" "),
  } as CSSProperties;
  const scheduleStart = issue.startDate ?? issue.dueDate;
  const scheduleEnd = issue.dueDate ?? issue.startDate;
  const barStart = scheduleStart && variant === "scheduled"
    ? positionForDate(scheduleStart, cells) * unitWidth
    : undefined;
  const barEnd = scheduleEnd && variant === "scheduled"
    ? positionForDate(addDay(scheduleEnd), cells) * unitWidth
    : undefined;
  const todayPosition = positionForDate(today, cells) * unitWidth;
  const values: Record<IssueSortField | "repository", ReactNode> = {
    type: <IssueTypeBadge type={issue.type} labels={issue.labels} />,
    key: (
      <a href={issueHref} className="gantt-key">
        {issue.owner}/{issue.name}#{issue.number}
      </a>
    ),
    title: (
      <div className="gantt-title-cell">
        <a href={issueHref} title={issue.title}>{issue.title}</a>
        {variant === "anomaly" && (
          <span className="schedule-anomaly" role="status">
            {tIssues(scheduleAnomalyTranslationKey(issue.scheduleAnomaly))}
          </span>
        )}
      </div>
    ),
    repository: <span className="gantt-repository-value" title={`${issue.owner}/${issue.name}`}>{issue.owner}/{issue.name}</span>,
    assignee: issue.assignee ? <UserIdentity user={profileFor(issue.userProfiles, issue.assignee)} /> : t("noAssignee"),
    status: <IssueStatusBadge status={issue.status} />,
    priority: <PriorityBadge priority={issue.priority} labels={issue.labels} />,
    createdAt: <time dateTime={issue.createdAt}>{formatDateTime(issue.createdAt)}</time>,
    startDate: null,
    dueDate: null,
    author: issue.author ? <UserIdentity user={profileFor(issue.userProfiles, issue.author)} /> : tIssues("notSet"),
  };

  return (
    <div className={`gantt-row gantt-row--${variant}`} data-status={issue.status} role="row" style={vars}>
      <div className="gantt-row-fields" role="presentation">
        {columns.map((column) => (
          <div
            className={`gantt-cell gantt-cell--${column.field}`}
            role="cell"
            key={column.field}
          >
            {values[column.field]}
          </div>
        ))}
      </div>
      <div className="gantt-track" role="cell" aria-label={t("timeline")} style={{ width: `${totalWidth}px` }}>
        {weekendOverlays.map((overlay) => (
          <span
            className="gantt-weekend"
            key={overlay.date}
            style={{ left: `${overlay.left}px`, width: `${overlay.width}px` }}
            aria-hidden="true"
          />
        ))}
        {today >= (cells[0]?.start ?? today) && today < (cells.at(-1)?.end ?? today) && (
          <span
            className="gantt-track-today"
            style={{ left: `${todayPosition}px` }}
            role="img"
            aria-label={`${formatCalendarDate(today)} ${t("todayMarker")}`}
          />
        )}
        {scheduleStart && scheduleEnd && barStart !== undefined && barEnd !== undefined && (
          <span
            className="gantt-bar"
            style={{ left: `${barStart}px`, width: `${Math.max(barEnd - barStart, 4)}px` }}
            role="img"
            aria-label={`${formatCalendarDate(scheduleStart)} – ${formatCalendarDate(scheduleEnd)}`}
          />
        )}
      </div>
    </div>
  );
}

function positionForDate(value: string, cells: GanttTimelineCell[]): number {
  const target = Date.parse(`${value}T00:00:00Z`);
  const index = cells.findIndex((cell) => Date.parse(`${cell.start}T00:00:00Z`) <= target && target < Date.parse(`${cell.end}T00:00:00Z`));
  if (index < 0) return value < (cells[0]?.start ?? value) ? 0 : cells.length;
  const cell = cells[index]!;
  const start = Date.parse(`${cell.start}T00:00:00Z`);
  const end = Date.parse(`${cell.end}T00:00:00Z`);
  return index + (target - start) / (end - start);
}

function addDay(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
