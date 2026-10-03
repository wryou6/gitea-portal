import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { WorkViewFilterBar } from "../work-views/WorkViewFilterBar";
import { WorkViewLayout } from "../work-views/WorkViewLayout";
import { defaultWorkViewFilters, matchesRecentDoneVisibility, matchesWorkViewFilters, parseWorkViewFilters } from "../work-views/work-view-filters";
import type { WorkViewFilters } from "../work-views/work-view-filters";
import { IssueRow } from "./IssueRow";
import { useIssueListState, type IssueFiltersValue } from "./issue-list-state";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/feedback/LoadingState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { Table } from "../../components/ui/Table";
import { api, type Issue, type IssueSortField, type SortDirection, type UserFacingError } from "../../lib/api";
import { IssueViewOptionsDialog } from "./IssueViewOptionsDialog";
import {
  ISSUE_VIEW_FIELDS,
  defaultIssueViewPreference,
  readIssueViewPreference,
  writeIssueViewPreference,
  type IssueViewPreference,
} from "./issue-view-preference";
import { useReorderAnimation } from "../../lib/use-reorder-animation";
import { mergeUserProfiles } from "../../lib/user-profiles";
import { buildWorkViewReturnTo } from "../work-views/work-view-url-state";

export function filtersFromUrl(): IssueFiltersValue {
  return parseWorkViewFilters(window.location.search);
}

function sortFromUrl(fallback: IssueSortField): IssueSortField {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("sort");
  return ISSUE_VIEW_FIELDS.includes(value as IssueSortField) &&
      (params.get("direction") === "asc" || params.get("direction") === "desc")
    ? value as IssueSortField
    : fallback;
}

function directionFromUrl(fallback: SortDirection): SortDirection {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("sort");
  const direction = params.get("direction");
  return ISSUE_VIEW_FIELDS.includes(value as IssueSortField) &&
      (direction === "asc" || direction === "desc")
    ? direction
    : fallback;
}

function reorderVisibleFields(
  order: IssueSortField[],
  visibleFields: IssueSortField[],
  from: IssueSortField,
  to: IssueSortField,
): IssueSortField[] {
  const visibleOrder = visibleFields.filter((field) => order.includes(field));
  const fromIndex = visibleOrder.indexOf(from);
  const toIndex = visibleOrder.indexOf(to);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return order;
  visibleOrder.splice(fromIndex, 1);
  visibleOrder.splice(toIndex, 0, from);
  const visibleSet = new Set(visibleFields);
  let visibleIndex = 0;
  return order.map((field) => {
    if (!visibleSet.has(field)) return field;
    const nextField = visibleOrder[visibleIndex++];
    return nextField ?? field;
  });
}

function sameFieldOrder(left: IssueSortField[], right: IssueSortField[]): boolean {
  return left.length === right.length && left.every((field, index) => field === right[index]);
}

export function IssueListPage({
  repository,
  login,
  demoIssues,
  demoState,
  demoSort: initialDemoSort,
  demoViewPreference,
  demoColumnOrder,
  onDemoViewPreferenceChange,
  demoOptionsOpen,
  demoFilterValues,
}: {
  repository?: { owner: string; name: string };
  login?: string;
  demoIssues?: Issue[];
  demoState?: "loading" | "error";
  demoSort?: { sort: IssueSortField; direction: SortDirection };
  demoViewPreference?: IssueViewPreference;
  demoColumnOrder?: IssueSortField[];
  onDemoViewPreferenceChange?: (preference: IssueViewPreference) => void;
  demoOptionsOpen?: boolean;
  demoFilterValues?: WorkViewFilters;
} = {}) {
  const { t } = useTranslation("issues");
  const [preference, setPreference] = useState<IssueViewPreference>(
    () => demoViewPreference ?? readIssueViewPreference(login),
  );
  const initialFilters = { ...defaultWorkViewFilters, ...(demoFilterValues ?? filtersFromUrl()) };
  if (repository)
    initialFilters.repository = `${repository.owner}/${repository.name}`;
  const [demoFilters, setDemoFilters] = useState(initialFilters);
  const {
    issues: loadedIssues,
    filters,
    sort,
    direction,
    loading: isLoading,
    error,
    load,
  } = useIssueListState(
    initialFilters,
    sortFromUrl(preference.defaultSortField),
    directionFromUrl(preference.defaultSortDirection),
    undefined,
    login,
  );
  const [demoSort, setDemoSort] = useState<{ sort: IssueSortField; direction: SortDirection }>(
    initialDemoSort ?? {
      sort: preference.defaultSortField,
      direction: preference.defaultSortDirection,
    },
  );
  const [recentDoneOnly, setRecentDoneOnly] = useState(true);
  const [sessionColumnOrder, setSessionColumnOrder] = useState<IssueSortField[] | undefined>(demoColumnOrder);
  const [draggedField, setDraggedField] = useState<IssueSortField>();
  const [dragOverField, setDragOverField] = useState<IssueSortField>();
  const [keyboardDraggedField, setKeyboardDraggedField] = useState<IssueSortField>();
  const [columnAnnouncement, setColumnAnnouncement] = useState("");
  const keyboardOrderBeforeDrag = useRef<IssueSortField[] | undefined>(undefined);
  const [optionsOpen, setOptionsOpen] = useState(demoOptionsOpen ?? false);
  const optionsTriggerRef = useRef<HTMLButtonElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const wasOptionsOpen = useRef(false);
  const activeSort = demoIssues ? demoSort.sort : sort;
  const activeDirection = demoIssues ? demoSort.direction : direction;
  const visibleFields = preference.visibleFields;
  const columnOrder = sessionColumnOrder ?? preference.columnOrder;
  const visibleOrder = columnOrder.filter((field) => visibleFields.includes(field));
  const defaultPreference = defaultIssueViewPreference();
  const hasCustomView =
    !sameFieldOrder(preference.visibleFields, defaultPreference.visibleFields) ||
    !sameFieldOrder(preference.columnOrder, defaultPreference.columnOrder) ||
    preference.defaultSortField !== defaultPreference.defaultSortField ||
    preference.defaultSortDirection !== defaultPreference.defaultSortDirection ||
    !sameFieldOrder(columnOrder, defaultPreference.columnOrder) ||
    activeSort !== defaultPreference.defaultSortField ||
    activeDirection !== defaultPreference.defaultSortDirection;
  useReorderAnimation(tableRef, visibleOrder.join("|"));
  const issues = (demoIssues
    ? demoIssues.filter((issue) => matchesWorkViewFilters(issue, demoFilters, login))
    : loadedIssues
  ).filter((issue) => matchesRecentDoneVisibility(issue, recentDoneOnly))
    .sort((a, b) => compareIssues(a, b, activeSort, activeDirection));
  const userProfiles = mergeUserProfiles((demoIssues ?? loadedIssues).map((issue) => issue.userProfiles));
  const loading = demoIssues ? demoState === "loading" : isLoading;
  const displayedError: UserFacingError | undefined = demoIssues && demoState === "error"
    ? t("issueListLoadError")
    : error;

  useEffect(() => {
    if (demoIssues) return;
    void load(
      repository
        ? { ...filters, repository: `${repository.owner}/${repository.name}` }
        : filters,
      sortFromUrl(preference.defaultSortField),
      directionFromUrl(preference.defaultSortDirection),
    );
  }, [repository?.owner, repository?.name, demoIssues]);

  useEffect(() => {
    if (demoIssues) return;
    const restoreFilters = () => {
      const restored = {
        ...parseWorkViewFilters(window.location.search),
        ...(repository ? { repository: `${repository.owner}/${repository.name}` } : {}),
      };
      void load(
        restored,
        sortFromUrl(preference.defaultSortField),
        directionFromUrl(preference.defaultSortDirection),
      );
    };
    window.addEventListener("popstate", restoreFilters);
    return () => window.removeEventListener("popstate", restoreFilters);
  }, [demoIssues, load, preference.defaultSortDirection, preference.defaultSortField, repository?.name, repository?.owner]);

  useEffect(() => {
    setRecentDoneOnly(true);
  }, [repository?.owner, repository?.name]);

  useEffect(() => {
    if (wasOptionsOpen.current && !optionsOpen) optionsTriggerRef.current?.focus();
    wasOptionsOpen.current = optionsOpen;
  }, [optionsOpen]);

  const returnTo = buildWorkViewReturnTo(window.location.pathname, window.location.search, "issues");
  const headings: Array<{ field: IssueSortField; label: string }> = [
    { field: "type", label: t("type") },
    { field: "key", label: t("key") },
    { field: "title", label: t("title") },
    { field: "assignee", label: t("assignee") },
    { field: "status", label: t("status") },
    { field: "priority", label: t("priorityLabel") },
    { field: "createdAt", label: t("createdAt") },
    { field: "startDate", label: t("startDate") },
    { field: "dueDate", label: t("dueDate") },
    { field: "author", label: t("author") },
  ];
  const headingByField = new Map(headings.map((heading) => [heading.field, heading.label]));

  function sortBy(field: IssueSortField) {
    const nextDirection: SortDirection = field === activeSort
      ? activeDirection === "asc" ? "desc" : "asc"
      : "asc";
    if (demoIssues) setDemoSort({ sort: field, direction: nextDirection });
    else void load(filters, field, nextDirection);
  }

  function savePreference(next: IssueViewPreference) {
    setPreference(next);
    if (demoIssues) onDemoViewPreferenceChange?.(next);
    else writeIssueViewPreference(login, next);
  }

  function restoreDefaults() {
    const next = defaultIssueViewPreference();
    savePreference(next);
    setSessionColumnOrder(undefined);
    if (demoIssues) setDemoSort({ sort: next.defaultSortField, direction: next.defaultSortDirection });
    else void load(filters, next.defaultSortField, next.defaultSortDirection);
  }

  function handleColumnMoveKeyDown(event: KeyboardEvent<HTMLButtonElement>, field: IssueSortField) {
    if (event.key === "Escape" && keyboardDraggedField === field) {
      event.preventDefault();
      event.stopPropagation();
      setSessionColumnOrder(keyboardOrderBeforeDrag.current);
      keyboardOrderBeforeDrag.current = undefined;
      setKeyboardDraggedField(undefined);
      setColumnAnnouncement(t("columnMoveCanceled", { column: headingByField.get(field) ?? field }));
      return;
    }

    if (event.key === " " && (keyboardDraggedField === field || event.shiftKey)) {
      event.preventDefault();
      if (keyboardDraggedField === field) {
        keyboardOrderBeforeDrag.current = undefined;
        setKeyboardDraggedField(undefined);
        setColumnAnnouncement(t("columnDropped", {
          column: headingByField.get(field) ?? field,
          position: visibleOrder.indexOf(field) + 1,
        }));
      } else if (!keyboardDraggedField) {
        keyboardOrderBeforeDrag.current = [...columnOrder];
        setKeyboardDraggedField(field);
        setColumnAnnouncement(t("columnPickedUp", { column: headingByField.get(field) ?? field }));
      }
      return;
    }

    if (keyboardDraggedField === field && event.key === "Enter") {
      event.preventDefault();
      return;
    }

    if (keyboardDraggedField && keyboardDraggedField !== field && (event.key === " " || event.key === "Enter")) {
      event.preventDefault();
      return;
    }

    if (keyboardDraggedField !== field || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const index = visibleOrder.indexOf(field);
    const target = visibleOrder[index + (event.key === "ArrowLeft" ? -1 : 1)];
    if (!target) return;
    setSessionColumnOrder(reorderVisibleFields(columnOrder, visibleOrder, field, target));
    setColumnAnnouncement(t("columnMovedPosition", {
      column: headingByField.get(field) ?? field,
      position: visibleOrder.indexOf(target) + 1,
    }));
  }

  return (
    <section className="workspace-view workspace-view--issues">
      <PageHeader
        title={repository ? `${repository.owner}/${repository.name}` : t("issueListTitle")}
        compact
      />
      <WorkViewLayout
        filters={demoIssues ? demoFilters : filters}
        resultCount={issues.length}
        recentDoneOnly={recentDoneOnly}
        repositoryFixed={Boolean(repository)}
        loading={loading}
        error={Boolean(displayedError)}
        userProfiles={userProfiles}
        controls={<>
      <WorkViewFilterBar
        filters={demoIssues ? demoFilters : filters}
        repositoryFixed={Boolean(repository)}
        assignees={[...new Set((demoIssues ?? loadedIssues).flatMap((issue) => issue.assignees))].sort((a, b) => a.localeCompare(b))}
        userProfiles={userProfiles}
        currentUserLogin={login}
        recentDoneOnly={recentDoneOnly}
        onRecentDoneOnlyChange={setRecentDoneOnly}
        onChange={(next) => {
          const fixed = repository ? { ...next, repository: `${repository.owner}/${repository.name}` } : next;
          if (demoIssues) {
            setDemoFilters(fixed);
            return;
          }
          void load(fixed, sort, direction, true);
        }}
      />
      <div className="issues-table-toolbar">
        <h3 className="work-view-controls-section-title">{t("viewOptions")}</h3>
        <div className="issues-table-toolbar-actions">
          {!sameFieldOrder(columnOrder, preference.columnOrder) && (
            <button className="issues-table-toolbar-save" type="button" onClick={() => {
              savePreference({ ...preference, columnOrder });
              setSessionColumnOrder(undefined);
            }}>
              {t("setDefaultPropertyOrder")}
            </button>
          )}
          {(activeSort !== preference.defaultSortField || activeDirection !== preference.defaultSortDirection) && (
            <button className="issues-table-toolbar-save" type="button" onClick={() => savePreference({
              ...preference,
              defaultSortField: activeSort,
              defaultSortDirection: activeDirection,
            })}>
              {t("setDefaultSort")}
            </button>
          )}
          {hasCustomView && (
            <button className="issues-table-toolbar-reset" type="button" onClick={restoreDefaults}>
              {t("restoreViewDefaults")}
            </button>
          )}
        </div>
        <button ref={optionsTriggerRef} className="secondary" type="button" onClick={() => setOptionsOpen(true)}>
          {t("viewOptions")}
        </button>
      </div>
        </>}
      >
      {displayedError && <><ErrorNotice message={displayedError} />{!demoIssues && <Button variant="secondary" type="button" onClick={() => void load(filters)}>{t("retry")}</Button>}</>}
      {loading && <LoadingState />}
      {(issues.length > 0 || (!loading && !displayedError) || demoState === "loading" || demoState === "error") && (
        <Table
          ref={tableRef}
          className="issues-table"
          ariaLabel={t("issueTable")}
          style={{ minWidth: `${Math.max(460, visibleOrder.length * 116)}px` }}
        >
          <thead>
            <tr>
              {visibleOrder.map((field) => {
                const label = headingByField.get(field) ?? field;
                return (
                  <th
                    key={field}
                    data-column-field={field}
                    data-reorder-key={field}
                    data-column-align={field === "type" || field === "status" || field === "priority" ? "center" : undefined}
                    scope="col"
                    draggable
                    aria-sort={activeSort === field ? activeDirection === "asc" ? "ascending" : "descending" : "none"}
                    className={[
                      dragOverField === field && "issues-table-drop-target",
                      draggedField === field && "issues-table-dragging",
                      keyboardDraggedField === field && "issues-table-keyboard-dragging",
                    ].filter(Boolean).join(" ") || undefined}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", field);
                      setDraggedField(field);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setDragOverField(field);
                    }}
                    onDragLeave={() => setDragOverField(undefined)}
                    onDrop={(event) => {
                      event.preventDefault();
                      const source = draggedField ?? event.dataTransfer.getData("text/plain") as IssueSortField;
                      const nextOrder = reorderVisibleFields(columnOrder, visibleOrder, source, field);
                      setSessionColumnOrder(nextOrder);
                      setColumnAnnouncement(t("columnDropped", {
                        column: headingByField.get(source) ?? source,
                        position: nextOrder.filter((candidate) => visibleFields.includes(candidate)).indexOf(source) + 1,
                      }));
                      setDraggedField(undefined);
                      setDragOverField(undefined);
                    }}
                    onDragEnd={() => {
                      setDraggedField(undefined);
                      setDragOverField(undefined);
                    }}
                  >
                    <div className="issues-table-header-controls">
                      <button
                        className="issues-table-sort"
                        type="button"
                        aria-label={t("sortByColumn", { column: label, direction: activeSort === field ? t(activeDirection) : t("notSorted") })}
                        aria-description={t("columnReorderHelp")}
                        aria-pressed={keyboardDraggedField === field}
                        onKeyDown={(event) => handleColumnMoveKeyDown(event, field)}
                        onClick={() => sortBy(field)}
                      >
                        <span className="issues-table-drag-label">{label}</span>
                        {activeSort === field && (
                          <span className="sort-indicator" aria-hidden="true">
                            {activeDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <IssueRow
                key={`${issue.owner}/${issue.name}#${issue.number}`}
                issue={issue}
                returnTo={returnTo}
                columnOrder={columnOrder}
                visibleFields={visibleFields}
                showRepositoryIdentity={!repository}
              />
            ))}
            {!issues.length && !loading && !displayedError && (
              <tr><td className="issues-table-empty" colSpan={visibleOrder.length}><EmptyState>{t("noMatchingIssues")}</EmptyState></td></tr>
            )}
          </tbody>
        </Table>
      )}
      <IssueViewOptionsDialog
        open={optionsOpen}
        preference={preference}
        onClose={() => setOptionsOpen(false)}
        onChange={savePreference}
      />
      <p className="sr-only" role="status" aria-live="polite">{columnAnnouncement}</p>
      </WorkViewLayout>
    </section>
  );
}

function compareIssues(a: Issue, b: Issue, field: IssueSortField, direction: SortDirection): number {
  const get = (issue: Issue): string | number | null => {
    switch (field) {
      case "type": return issue.type;
      case "key": return `${issue.owner}/${issue.name}#${String(issue.number).padStart(8, "0")}`;
      case "title": return issue.title;
      case "assignee": return issue.assignee;
      case "status": return issue.status;
      case "priority": return issue.priority;
      case "createdAt": return issue.createdAt;
      case "startDate": return issue.startDate;
      case "dueDate": return issue.dueDate;
      case "author": return issue.author;
    }
  };
  const left = get(a);
  const right = get(b);
  if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1;
  const compared = typeof left === "number" && typeof right === "number"
    ? left - right
    : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
  return direction === "asc" ? compared : -compared;
}
