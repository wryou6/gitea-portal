import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { formatCalendarDate } from "../../i18n/format";
import {
  addCalendarDays,
  calendarDayOrdinal,
  countCalendarDays,
  type GanttScale,
  type GanttTimelineCell,
  timelinePosition,
} from "./gantt-timeline";

export const GANTT_SCALE_WIDTH: Record<GanttScale, number> = {
  day: 36,
  week: 112,
  "two-weeks": 126,
  month: 132,
};

function formatDate(value: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00.000Z`));
}

function cellLabel(cell: GanttTimelineCell, scale: GanttScale, locale: string): string {
  if (scale === "day") return formatDate(cell.start, locale, { day: "numeric" });
  const lastDay = addCalendarDays(cell.end, -1);
  if (scale === "month") {
    return `${formatDate(cell.start, locale, { day: "numeric" })}–${formatDate(lastDay, locale, { day: "numeric" })}`;
  }
  return `${formatDate(cell.start, locale, { month: "short", day: "numeric" })}–${formatDate(lastDay, locale, { month: "short", day: "numeric" })}`;
}

export function GanttCalendarHeader({
  cells,
  scale,
  today,
  visibleDate,
}: {
  cells: GanttTimelineCell[];
  scale: GanttScale;
  today: string;
  visibleDate: string;
}) {
  const { t, i18n } = useTranslation("work-views");
  const unitWidth = GANTT_SCALE_WIDTH[scale];
  const totalWidth = cells.length * unitWidth;
  const monthSegments = useMemo(() => {
    if (!cells.length) return [];
    const firstDate = cells[0]!.start;
    const rangeEnd = cells[cells.length - 1]!.end;
    const [firstYear, firstMonth] = firstDate.split("-").map(Number);
    let monthStart = `${firstYear}-${String(firstMonth).padStart(2, "0")}-01`;
    const segments: Array<{ key: string; label: string; left: number; width: number }> = [];
    while (monthStart < rangeEnd) {
      const [year, month] = monthStart.split("-").map(Number);
      const nextMonth = month === 12
        ? `${year! + 1}-01-01`
        : `${year}-${String(month! + 1).padStart(2, "0")}-01`;
      const segmentStart = monthStart < firstDate ? firstDate : monthStart;
      const segmentEnd = nextMonth < rangeEnd ? nextMonth : rangeEnd;
      const left = timelinePosition(segmentStart, cells) * unitWidth;
      const width = (timelinePosition(segmentEnd, cells) - timelinePosition(segmentStart, cells)) * unitWidth;
      segments.push({
        key: monthStart,
        label: formatDate(monthStart, i18n.language, { month: "short", year: "numeric" }),
        left,
        width,
      });
      monthStart = nextMonth;
    }
    return segments;
  }, [cells, i18n.language, unitWidth]);
  const overlays = useMemo(() => {
    if (!cells.length) return [];
    const first = cells[0]!.start;
    const end = cells[cells.length - 1]!.end;
    return Array.from({ length: countCalendarDays(first, end) }, (_, index) => {
      const date = addCalendarDays(first, index);
      const position = timelinePosition(date, cells);
      const left = position * unitWidth;
      const cell = cells[Math.min(Math.floor(position), cells.length - 1)];
      const width = unitWidth / Math.max(1, countCalendarDays(cell?.start ?? date, cell?.end ?? addCalendarDays(date, 1)));
      const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay();
      return {
        date,
        left,
        width,
        weekend: weekday === 0 || weekday === 6,
      };
    });
  }, [cells, unitWidth]);
  const todayPosition = timelinePosition(today, cells) * unitWidth;
  const todayWidth =
    (timelinePosition(addCalendarDays(today, 1), cells) - timelinePosition(today, cells)) * unitWidth;

  return (
    <div
      className="gantt-calendar-header"
      style={{ width: `${totalWidth}px`, "--gantt-unit-width": `${unitWidth}px` } as React.CSSProperties}
      aria-label={t("timeline")}
    >
      <div className="gantt-calendar-month-row" aria-label={t("monthHeader")}>
        <span className="gantt-calendar-month-current" role="img" aria-label={formatDate(visibleDate, i18n.language, { month: "long", year: "numeric" })}>
          {formatDate(visibleDate, i18n.language, { month: "long", year: "numeric" })}
        </span>
        {monthSegments.map((segment) => (
          <div className="gantt-calendar-month" key={segment.key} style={{ left: `${segment.left}px`, width: `${segment.width}px` }}>
            <span className="gantt-calendar-month-label">{segment.label}</span>
          </div>
        ))}
      </div>
      <div className={`gantt-calendar-date-row gantt-calendar-date-row--${scale}`} aria-label={t("dateHeader")} style={{ gridTemplateColumns: `repeat(${cells.length}, ${unitWidth}px)` }}>
        {cells.map((cell) => {
          const weekday = new Date(`${cell.start}T00:00:00.000Z`).getUTCDay();
          const isWeekend = weekday === 0 || weekday === 6;
          const accessibleDate = formatCalendarDate(cell.start);
          return (
            <div
              className="gantt-calendar-date"
              key={cell.key}
              aria-label={isWeekend ? `${accessibleDate}, ${t("weekend")}` : accessibleDate}
              title={isWeekend ? `${accessibleDate} · ${t("weekend")}` : accessibleDate}
            >
              {cellLabel(cell, scale, i18n.language)}
            </div>
          );
        })}
        {overlays.filter((overlay) => overlay.weekend).map((overlay) => (
          <span
            className="gantt-calendar-weekend"
            key={overlay.date}
            style={{ left: `${overlay.left}px`, width: `${overlay.width}px` }}
            role="img"
            aria-label={`${formatCalendarDate(overlay.date)} ${t("weekend")}`}
            title={`${formatCalendarDate(overlay.date)} ${t("weekend")}`}
          />
        ))}
        {today >= (cells[0]?.start ?? today) && today < (cells.at(-1)?.end ?? today) && (
          <span
            className="gantt-calendar-today"
            style={{ left: `${todayPosition}px`, width: `${todayWidth}px` }}
            role="img"
            aria-label={t("todayMarker")}
          >
            <span>{t("todayMarker")}</span>
          </span>
        )}
      </div>
    </div>
  );
}
