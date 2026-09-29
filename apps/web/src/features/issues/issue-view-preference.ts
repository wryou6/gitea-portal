import type { IssueSortField, SortDirection } from "../../lib/api";

export const ISSUE_VIEW_FIELDS: IssueSortField[] = [
  "type",
  "key",
  "title",
  "assignee",
  "status",
  "priority",
  "createdAt",
  "startDate",
  "dueDate",
  "author",
];

export const DEFAULT_ISSUE_COLUMN_ORDER: IssueSortField[] = [
  "type",
  "key",
  "title",
  "assignee",
  "status",
  "priority",
  "startDate",
  "dueDate",
  "createdAt",
  "author",
];

export type IssueViewPreference = {
  version: 1;
  visibleFields: IssueSortField[];
  columnOrder: IssueSortField[];
  defaultSortField: IssueSortField;
  defaultSortDirection: SortDirection;
};

export function defaultIssueViewPreference(): IssueViewPreference {
  return {
    version: 1,
    visibleFields: [...ISSUE_VIEW_FIELDS],
    columnOrder: [...DEFAULT_ISSUE_COLUMN_ORDER],
    defaultSortField: "key",
    defaultSortDirection: "asc",
  };
}

function cookieName(login: string): string {
  return `gitea-portal-issue-view-${encodeURIComponent(login)}`;
}

function isIssueSortField(value: unknown): value is IssueSortField {
  return typeof value === "string" && ISSUE_VIEW_FIELDS.includes(value as IssueSortField);
}

function isPreference(value: unknown): value is IssueViewPreference {
  if (typeof value !== "object" || value === null) return false;
  const preference = value as Partial<IssueViewPreference>;
  if (
    preference.version !== 1 ||
    !Array.isArray(preference.visibleFields) ||
    !Array.isArray(preference.columnOrder) ||
    !preference.visibleFields.every(isIssueSortField) ||
    !preference.columnOrder.every(isIssueSortField) ||
    !isIssueSortField(preference.defaultSortField) ||
    (preference.defaultSortDirection !== "asc" && preference.defaultSortDirection !== "desc")
  ) return false;

  const visible = preference.visibleFields;
  const order = preference.columnOrder;
  return (
    visible.includes("key") &&
    visible.includes("title") &&
    new Set(visible).size === visible.length &&
    order.length === ISSUE_VIEW_FIELDS.length &&
    new Set(order).size === ISSUE_VIEW_FIELDS.length &&
    ISSUE_VIEW_FIELDS.every((field) => order.includes(field))
  );
}

export function readIssueViewPreference(login?: string): IssueViewPreference {
  if (!login) return defaultIssueViewPreference();

  try {
    const prefix = `${cookieName(login)}=`;
    const entry = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(prefix));
    if (!entry) return defaultIssueViewPreference();

    const value: unknown = JSON.parse(decodeURIComponent(entry.slice(prefix.length)));
    return isPreference(value)
      ? {
          ...value,
          visibleFields: [...value.visibleFields],
          columnOrder: [...value.columnOrder],
        }
      : defaultIssueViewPreference();
  } catch {
    return defaultIssueViewPreference();
  }
}

export function writeIssueViewPreference(
  login: string | undefined,
  preference: IssueViewPreference,
): boolean {
  if (!login || !isPreference(preference)) return false;

  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${cookieName(login)}=${encodeURIComponent(JSON.stringify(preference))}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    return true;
  } catch {
    return false;
  }
}
