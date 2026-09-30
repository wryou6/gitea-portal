import type { IssueSortField } from "../../lib/api";

export const GANTT_VIEW_FIELDS: IssueSortField[] = [
  "type",
  "key",
  "title",
  "assignee",
  "status",
  "priority",
  "createdAt",
  "author",
];

export const GANTT_FIXED_FIELDS: IssueSortField[] = [
  "title",
  "assignee",
  "status",
];

export const DEFAULT_GANTT_COLUMN_ORDER: IssueSortField[] = [
  "title",
  "assignee",
  "status",
  "type",
  "key",
  "priority",
  "createdAt",
  "author",
];

export type GanttViewPreference = {
  version: 1;
  visibleFields: IssueSortField[];
  columnOrder: IssueSortField[];
};

export function defaultGanttViewPreference(): GanttViewPreference {
  return {
    version: 1,
    visibleFields: [...GANTT_FIXED_FIELDS],
    columnOrder: [...DEFAULT_GANTT_COLUMN_ORDER],
  };
}

function cookieName(login: string): string {
  return `gitea-portal-gantt-view-${encodeURIComponent(login)}`;
}

function isGanttField(value: unknown): value is IssueSortField {
  return typeof value === "string" && GANTT_VIEW_FIELDS.includes(value as IssueSortField);
}

function isGanttPreference(value: unknown): value is GanttViewPreference {
  if (typeof value !== "object" || value === null) return false;
  const preference = value as Partial<GanttViewPreference>;
  if (
    preference.version !== 1 ||
    !Array.isArray(preference.visibleFields) ||
    !Array.isArray(preference.columnOrder) ||
    !preference.visibleFields.every(isGanttField) ||
    !preference.columnOrder.every(isGanttField)
  ) return false;

  const visible = preference.visibleFields;
  const order = preference.columnOrder;
  return (
    GANTT_FIXED_FIELDS.every((field) => visible.includes(field)) &&
    new Set(visible).size === visible.length &&
    order.length === GANTT_VIEW_FIELDS.length &&
    new Set(order).size === GANTT_VIEW_FIELDS.length &&
    GANTT_VIEW_FIELDS.every((field) => order.includes(field))
  );
}

export function readGanttViewPreference(login?: string): GanttViewPreference {
  if (!login) return defaultGanttViewPreference();

  try {
    const prefix = `${cookieName(login)}=`;
    const entry = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(prefix));
    if (!entry) return defaultGanttViewPreference();

    const value: unknown = JSON.parse(decodeURIComponent(entry.slice(prefix.length)));
    return isGanttPreference(value)
      ? {
          ...value,
          visibleFields: [...value.visibleFields],
          columnOrder: [...value.columnOrder],
        }
      : defaultGanttViewPreference();
  } catch {
    return defaultGanttViewPreference();
  }
}

export function writeGanttViewPreference(
  login: string | undefined,
  preference: GanttViewPreference,
): boolean {
  if (!login || !isGanttPreference(preference)) return false;

  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${cookieName(login)}=${encodeURIComponent(JSON.stringify(preference))}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    return true;
  } catch {
    return false;
  }
}
