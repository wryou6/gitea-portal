import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { routePaths } from "../../app/routes";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { IssueStatusBadge } from "../../components/ui/IssueStatusBadge";
import { formatCalendarDate, formatDateTime } from "../../i18n/format";
import type { Issue, IssueSortField } from "../../lib/api";
import { scheduleAnomalyTranslationKey } from "../issues/ScheduleDates";
import { addCalendarDays, calendarDayOrdinal, dateAtTimelinePosition, type GanttTimelineCell } from "./gantt-timeline";
import { GANTT_SCALE_WIDTH } from "./GanttCalendarHeader";
import type { GanttScale } from "./gantt-timeline";
import { UserIdentity } from "../../components/ui/UserIdentity";
import { AssigneeIdentityGroup } from "../../components/ui/AssigneeIdentityGroup";
import { assigneeLoginsForDisplay } from "../../lib/assignee-display";
import { profileFor } from "../../lib/user-profiles";
import { OverdueIndicator } from "../issues/OverdueIndicator";
import { isIssueOverdue } from "../issues/overdue-date";

export type GanttIssueRowVariant = "scheduled" | "unscheduled" | "anomaly";

export type GanttColumn = {
  field: IssueSortField | "repository";
  label: string;
};

export type GanttScheduleChange = {
  startDate?: string | null;
  dueDate?: string | null;
};

type SchedulePreview = { startDate: string | null; dueDate: string | null };
type DragMode = "resize-start" | "resize-due" | "move-range" | "create-range";

type ActiveDrag = {
  pointerId: number;
  mode: DragMode;
  originDate: string;
  initial: SchedulePreview;
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
  onScheduleSave,
  onTimelineEdge,
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
  onScheduleSave?: (issue: Issue, change: GanttScheduleChange) => Promise<void>;
  onTimelineEdge?: (direction: -1 | 1) => number;
}) {
  const { t } = useTranslation("work-views");
  const { t: tIssues } = useTranslation("issues");
  const [preview, setPreview] = useState<SchedulePreview>();
  const [announcement, setAnnouncement] = useState("");
  const activeDrag = useRef<ActiveDrag | undefined>(undefined);
  const previewRef = useRef<SchedulePreview | undefined>(undefined);
  const lastEdgeExtension = useRef(0);
  const assigneeUsers = assigneeLoginsForDisplay(issue).map((login) =>
    profileFor(issue.userProfiles, login),
  );
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
  const scheduleStart = preview ? preview.startDate ?? preview.dueDate : issue.startDate ?? issue.dueDate;
  const scheduleEnd = preview ? preview.dueDate ?? preview.startDate : issue.dueDate ?? issue.startDate;
  const barStart = scheduleStart && (variant === "scheduled" || Boolean(preview))
    ? positionForDate(scheduleStart, cells) * unitWidth
    : undefined;
  const barEnd = scheduleEnd && (variant === "scheduled" || Boolean(preview))
    ? positionForDate(addCalendarDays(scheduleEnd, 1), cells) * unitWidth
    : undefined;
  const todayPosition = positionForDate(today, cells) * unitWidth;
  const todayWidth =
    (positionForDate(addCalendarDays(today, 1), cells) - positionForDate(today, cells)) * unitWidth;
  const overdue = isIssueOverdue(issue, today);

  function pointerDate(clientX: number, track: HTMLElement) {
    const rect = track.getBoundingClientRect();
    return dateAtTimelinePosition((clientX - rect.left) / unitWidth, cells);
  }

  function updatePreview(next: SchedulePreview | undefined) {
    previewRef.current = next;
    setPreview(next);
  }

  function scheduleForMode(mode: DragMode, active: ActiveDrag, date: string): SchedulePreview {
    if (mode === "create-range") {
      return date <= active.originDate
        ? { startDate: date, dueDate: active.originDate }
        : { startDate: active.originDate, dueDate: date };
    }
    if (mode === "move-range") {
      const offset = calendarDayOrdinal(date) - calendarDayOrdinal(active.originDate);
      return {
        startDate: active.initial.startDate ? addCalendarDays(active.initial.startDate, offset) : null,
        dueDate: active.initial.dueDate ? addCalendarDays(active.initial.dueDate, offset) : null,
      };
    }
    if (mode === "resize-start") {
      return {
        ...active.initial,
        startDate: active.initial.dueDate && date > active.initial.dueDate
          ? active.initial.dueDate
          : date,
      };
    }
    return {
      ...active.initial,
      dueDate: active.initial.startDate && date < active.initial.startDate
        ? active.initial.startDate
        : date,
    };
  }

  async function savePreview(next: SchedulePreview) {
    const change: GanttScheduleChange = {};
    if (next.startDate !== issue.startDate) change.startDate = next.startDate;
    if (next.dueDate !== issue.dueDate) change.dueDate = next.dueDate;
    if (!Object.keys(change).length || !onScheduleSave) return;
    try {
      await onScheduleSave(issue, change);
      setAnnouncement(t("ganttScheduleSaved"));
    } catch {
      setAnnouncement(t("ganttScheduleSaveFailed"));
    } finally {
      updatePreview(undefined);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (variant === "anomaly" || !onScheduleSave) return;
    const target = event.target instanceof HTMLElement
      ? event.target.closest<HTMLElement>("[data-drag-mode]")
      : null;
    const mode = variant === "unscheduled"
      ? "create-range"
      : target?.dataset.dragMode as DragMode | undefined;
    if (!mode) return;
    event.preventDefault();
    const initial = { startDate: issue.startDate, dueDate: issue.dueDate };
    const track = event.currentTarget;
    activeDrag.current = {
      pointerId: event.pointerId,
      mode,
      originDate: pointerDate(event.clientX, track),
      initial,
    };
    track.setPointerCapture(event.pointerId);
    setAnnouncement("");
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const active = activeDrag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const targetDate = pointerDate(event.clientX, event.currentTarget);
    if (targetDate === active.originDate) {
      updatePreview(undefined);
      return;
    }
    updatePreview(scheduleForMode(active.mode, active, targetDate));

    const scroller = event.currentTarget.closest<HTMLElement>(".gantt-chart-scroll");
    if (!scroller) return;
    const viewport = scroller.getBoundingClientRect();
    const nearLeft = event.clientX < viewport.left + 32;
    const nearRight = event.clientX > viewport.right - 32;
    if (nearLeft && scroller.scrollLeft > 0) {
      scroller.scrollLeft = Math.max(0, scroller.scrollLeft - 12);
    } else if (nearLeft && onTimelineEdge && Date.now() - lastEdgeExtension.current > 600) {
      lastEdgeExtension.current = Date.now();
      onTimelineEdge(-1);
    } else if (nearRight && scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1) {
      scroller.scrollLeft = Math.min(scroller.scrollWidth, scroller.scrollLeft + 12);
    } else if (nearRight && onTimelineEdge && Date.now() - lastEdgeExtension.current > 600) {
      lastEdgeExtension.current = Date.now();
      const extensionWidth = onTimelineEdge(1);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        scroller.scrollLeft = Math.min(
          scroller.scrollWidth - scroller.clientWidth,
          scroller.scrollLeft + extensionWidth,
        );
      }));
    }
  }

  async function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const active = activeDrag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    activeDrag.current = undefined;
    const next = previewRef.current;
    if (next) await savePreview(next);
    else updatePreview(undefined);
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (activeDrag.current?.pointerId !== event.pointerId) return;
    activeDrag.current = undefined;
    updatePreview(undefined);
  }

  function handleHandleKeyDown(event: KeyboardEvent<HTMLSpanElement>, mode: "resize-start" | "resize-due") {
    if (!onScheduleSave) return;
    if (event.key === "Escape") {
      event.preventDefault();
      updatePreview(undefined);
      return;
    }
    if (event.key === "Enter") {
      if (!preview) return;
      event.preventDefault();
      void savePreview(preview);
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const current = preview ?? { startDate: issue.startDate, dueDate: issue.dueDate };
    const currentDate = mode === "resize-start"
      ? current.startDate ?? current.dueDate
      : current.dueDate ?? current.startDate;
    if (!currentDate) return;
    const nextDate = addCalendarDays(currentDate, event.key === "ArrowLeft" ? -1 : 1);
    const active: ActiveDrag = {
      pointerId: -1,
      mode,
      originDate: currentDate,
      initial: current,
    };
    updatePreview(scheduleForMode(mode, active, nextDate));
  }
  const values: Record<IssueSortField | "repository", ReactNode> = {
    type: <IssueTypeBadge type={issue.type} labels={issue.labels} />,
    key: (
      <Link to={issueHref} className="gantt-key">
        {issue.owner}/{issue.name}#{issue.number}
      </Link>
    ),
    title: (
      <div className="gantt-title-cell">
        <Link to={issueHref} title={issue.title}>{issue.title}</Link>
        {overdue && <OverdueIndicator />}
        {variant === "anomaly" && (
          <span className="schedule-anomaly" role="status">
            {tIssues(scheduleAnomalyTranslationKey(issue.scheduleAnomaly))}
          </span>
        )}
      </div>
    ),
    repository: <span className="gantt-repository-value" title={`${issue.owner}/${issue.name}`}>{issue.owner}/{issue.name}</span>,
    assignee: <AssigneeIdentityGroup users={assigneeUsers} emptyLabel={t("noAssignee")} />,
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
      <div
        className={`gantt-track${variant === "unscheduled" && onScheduleSave ? " gantt-track--create-range" : ""}`}
        role="cell"
        aria-label={t("timeline")}
        style={{ width: `${totalWidth}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
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
            style={{ left: `${todayPosition}px`, width: `${todayWidth}px` }}
            role="img"
            aria-label={`${formatCalendarDate(today)} ${t("todayMarker")}`}
          />
        )}
        {scheduleStart && scheduleEnd && barStart !== undefined && barEnd !== undefined && (
          <div
            className="gantt-bar"
            style={{ left: `${barStart}px`, width: `${Math.max(barEnd - barStart, 4)}px` }}
            aria-label={`${formatCalendarDate(scheduleStart)} – ${formatCalendarDate(scheduleEnd)}`}
          >
            <span className="gantt-bar-move" data-drag-mode="move-range" aria-hidden="true" />
            {onScheduleSave && variant !== "anomaly" && (
              <>
                <span
                  className="gantt-bar-handle gantt-bar-handle--start"
                  role="slider"
                  tabIndex={0}
                  data-drag-mode="resize-start"
                  aria-label={t("ganttStartHandle", { title: issue.title })}
                  aria-valuemin={calendarDayOrdinal(cells[0]?.start ?? today)}
                  aria-valuemax={calendarDayOrdinal(cells.at(-1)?.end ?? today)}
                  aria-valuenow={calendarDayOrdinal(preview ? preview.startDate ?? preview.dueDate ?? today : issue.startDate ?? issue.dueDate ?? today)}
                  aria-valuetext={`${formatCalendarDate(preview ? preview.startDate ?? preview.dueDate ?? today : issue.startDate ?? issue.dueDate ?? today)}. ${t("ganttDragKeyboardHelp")}`}
                  onKeyDown={(event) => handleHandleKeyDown(event, "resize-start")}
                />
                <span
                  className="gantt-bar-handle gantt-bar-handle--due"
                  role="slider"
                  tabIndex={0}
                  data-drag-mode="resize-due"
                  aria-label={t("ganttDueHandle", { title: issue.title })}
                  aria-valuemin={calendarDayOrdinal(cells[0]?.start ?? today)}
                  aria-valuemax={calendarDayOrdinal(cells.at(-1)?.end ?? today)}
                  aria-valuenow={calendarDayOrdinal(preview ? preview.dueDate ?? preview.startDate ?? today : issue.dueDate ?? issue.startDate ?? today)}
                  aria-valuetext={`${formatCalendarDate(preview ? preview.dueDate ?? preview.startDate ?? today : issue.dueDate ?? issue.startDate ?? today)}. ${t("ganttDragKeyboardHelp")}`}
                  onKeyDown={(event) => handleHandleKeyDown(event, "resize-due")}
                />
              </>
            )}
          </div>
        )}
      </div>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
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
