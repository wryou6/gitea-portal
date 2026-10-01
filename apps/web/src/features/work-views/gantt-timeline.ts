export type GanttScale = "day" | "week" | "two-weeks" | "month";

export type GanttTimelineCell = {
  key: string;
  start: string;
  end: string;
};

const DAY_MS = 86_400_000;

export function parseGanttScale(value: string | null): GanttScale {
  return value === "week" || value === "two-weeks" || value === "month"
    ? value
    : "day";
}

export function localCalendarDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day;
}

export function addCalendarDays(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day! + days));
  return date.toISOString().slice(0, 10);
}

function addCalendarMonths(value: string, months: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const target = new Date(Date.UTC(year!, month! - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day!, lastDay));
  return target.toISOString().slice(0, 10);
}

export function shiftTimelineStartDate(value: string, scale: GanttScale, direction: -1 | 1): string {
  if (scale === "month") return addCalendarMonths(value, direction);
  const days = scale === "day" ? 1 : scale === "week" ? 7 : 14;
  return addCalendarDays(value, days * direction);
}

export function calendarDayOrdinal(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return Math.floor(Date.UTC(year!, month! - 1, day!) / DAY_MS);
}

export function getTimelineCell(
  date: string,
  scale: GanttScale,
  anchor: string,
): GanttTimelineCell {
  if (scale === "day") {
    return { key: date, start: date, end: addCalendarDays(date, 1) };
  }
  if (scale === "month") {
    const [year, month] = date.split("-").map(Number);
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = month === 12
      ? `${year! + 1}-01-01`
      : `${year}-${String(month! + 1).padStart(2, "0")}-01`;
    return { key: start, start, end };
  }

  const intervalDays = scale === "week" ? 7 : 14;
  let intervalAnchor = anchor;
  if (scale === "week") {
    const weekday = (new Date(`${date}T00:00:00.000Z`).getUTCDay() + 6) % 7;
    intervalAnchor = addCalendarDays(date, -weekday);
  }
  const offset = calendarDayOrdinal(date) - calendarDayOrdinal(intervalAnchor);
  const start = addCalendarDays(intervalAnchor, Math.floor(offset / intervalDays) * intervalDays);
  const end = addCalendarDays(start, intervalDays);
  return { key: start, start, end };
}

export function buildTimelineCells(
  start: string,
  endExclusive: string,
  scale: GanttScale,
  anchor: string,
): GanttTimelineCell[] {
  const cells: GanttTimelineCell[] = [];
  let cell = getTimelineCell(start, scale, anchor);
  while (cell.start < endExclusive) {
    cells.push(cell);
    cell = getTimelineCell(cell.end, scale, anchor);
  }
  return cells;
}

export function timelinePosition(
  value: string,
  cells: GanttTimelineCell[],
): number {
  const day = calendarDayOrdinal(value);
  let low = 0;
  let high = cells.length - 1;
  let index = -1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const cell = cells[middle]!;
    if (value < cell.start) high = middle - 1;
    else if (value >= cell.end) low = middle + 1;
    else {
      index = middle;
      break;
    }
  }
  if (index < 0) return low === 0 ? 0 : cells.length;
  const cell = cells[index]!;
  const span = calendarDayOrdinal(cell.end) - calendarDayOrdinal(cell.start);
  const fraction = (day - calendarDayOrdinal(cell.start)) / span;
  return index + fraction;
}

export function countCalendarDays(start: string, end: string): number {
  return calendarDayOrdinal(end) - calendarDayOrdinal(start);
}
