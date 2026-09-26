import type { IssueLabel, IssueSchedule, IssueScheduleAnomaly } from './issue.js';

export const START_DATE_LABEL_PREFIX = 'start-date:';

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function startDateLabelName(date: string): string {
  if (!isCalendarDate(date)) throw new Error('Start date must be a valid YYYY-MM-DD calendar date');
  return `${START_DATE_LABEL_PREFIX}${date}`;
}

export function issueScheduleFromLabels(labels: IssueLabel[], dueDate: string | null, invalidDueDate = false): IssueSchedule {
  const dateLabels = labels.filter((label) => label.name.startsWith(START_DATE_LABEL_PREFIX));
  let startDate: string | null = null;
  let scheduleAnomaly: IssueScheduleAnomaly | undefined;

  if (dateLabels.length > 1) scheduleAnomaly = 'multiple_start_dates';
  else if (dateLabels.length === 1) {
    const value = dateLabels[0]!.name.slice(START_DATE_LABEL_PREFIX.length);
    if (!isCalendarDate(value)) scheduleAnomaly = 'invalid_start_date';
    else startDate = value;
  }

  if (!scheduleAnomaly && invalidDueDate) scheduleAnomaly = 'invalid_due_date';
  if (!scheduleAnomaly && startDate && dueDate && startDate > dueDate) scheduleAnomaly = 'date_range_reversed';

  if (scheduleAnomaly) return { startDate, dueDate, scheduleStatus: 'invalid', scheduleAnomaly };
  if (!startDate && !dueDate) return { startDate: null, dueDate: null, scheduleStatus: 'unscheduled' };
  return { startDate, dueDate, scheduleStatus: 'scheduled' };
}
