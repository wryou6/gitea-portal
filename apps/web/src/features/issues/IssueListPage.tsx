import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../i18n/format";
import { IssueFilters } from "./IssueFilters";
import { IssueRow } from "./IssueRow";
import { useIssueListState, type IssueFiltersValue } from "./issue-list-state";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/feedback/LoadingState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { Table } from "../../components/ui/Table";
import { routePaths } from "../../app/routes";
import type { Issue, IssueSortField, SortDirection, UserFacingError } from "../../lib/api";

const defaults: IssueFiltersValue = {
  q: "",
  repository: "",
  state: "all",
  assignee: "",
  label: "",
  milestone: "",
};
const sortableFields: IssueSortField[] = [
  "type", "key", "title", "assignee", "status", "priority", "createdAt", "startDate", "dueDate", "author",
];

export function filtersFromUrl(): IssueFiltersValue {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [
      key,
      params.get(key) ?? defaults[key as keyof IssueFiltersValue],
    ]),
  ) as IssueFiltersValue;
}

function sortFromUrl(): IssueSortField {
  const value = new URLSearchParams(window.location.search).get("sort");
  return sortableFields.includes(value as IssueSortField)
    ? (value as IssueSortField)
    : "key";
}

function directionFromUrl(): SortDirection {
  return new URLSearchParams(window.location.search).get("direction") === "desc"
    ? "desc"
    : "asc";
}

export function IssueListPage({
  repository,
  demoIssues,
  demoState,
  demoSort: initialDemoSort,
}: {
  repository?: { owner: string; name: string };
  demoIssues?: Issue[];
  demoState?: "loading" | "error";
  demoSort?: { sort: IssueSortField; direction: SortDirection };
} = {}) {
  const { t, i18n } = useTranslation("issues");
  const initialFilters = filtersFromUrl();
  if (repository)
    initialFilters.repository = `${repository.owner}/${repository.name}`;
  const {
    issues: loadedIssues,
    filters,
    page,
    sort,
    direction,
    hasNext,
    loading: isLoading,
    error,
    load,
  } = useIssueListState(initialFilters, sortFromUrl(), directionFromUrl());
  const [demoSort, setDemoSort] = useState<{ sort: IssueSortField; direction: SortDirection }>(initialDemoSort ?? { sort: "key", direction: "asc" });
  const activeSort = demoIssues ? demoSort.sort : sort;
  const activeDirection = demoIssues ? demoSort.direction : direction;
  const issues = demoIssues ? [...demoIssues].sort((a, b) => compareIssues(a, b, activeSort, activeDirection)) : loadedIssues;
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
      Number(new URLSearchParams(window.location.search).get("page") ?? 1),
      sortFromUrl(),
      directionFromUrl(),
    );
  }, [repository?.owner, repository?.name, demoIssues]);
  const returnTo = `${window.location.pathname}${window.location.search}`;
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

  function sortBy(field: IssueSortField) {
    const nextDirection: SortDirection = field === activeSort
      ? activeDirection === "asc" ? "desc" : "asc"
      : "asc";
    if (demoIssues) setDemoSort({ sort: field, direction: nextDirection });
    else void load(filters, 1, field, nextDirection);
  }

  return (
    <section>
      <PageHeader
        eyebrow={t(repository ? "repositoryWorkspaceEyebrow" : "allReposEyebrow")}
        title={repository ? `${repository.owner}/${repository.name}` : t("issueListTitle")}
        description={repository ? t("repositoryIssueDescription") : t("allReposIssueDescription")}
        action={
          <a
            className="button"
            href={repository
              ? routePaths.issueCreateForRepository(repository.owner, repository.name, returnTo)
              : routePaths.issueCreate}
          >
            {t("createIssue")}
          </a>
        }
      />
      {!demoIssues && (
        <IssueFilters
          initial={filters}
          onSubmit={(next) => load(
            repository
              ? { ...next, repository: `${repository.owner}/${repository.name}` }
              : next,
            1,
          )}
          showRepository={!repository}
        />
      )}
      {displayedError && <><ErrorNotice message={displayedError} />{!demoIssues && <Button variant="secondary" type="button" onClick={() => void load(filters, page)}>{t("retry")}</Button>}</>}
      {loading && <LoadingState />}
      {(issues.length > 0 || (!loading && !displayedError) || demoState === "loading" || demoState === "error") && (
        <Table className="issues-table" ariaLabel={t("issueTable") }>
          <thead>
            <tr>
              {headings.map(({ field, label }) => (
                <th key={field} scope="col" aria-sort={activeSort === field ? activeDirection === "asc" ? "ascending" : "descending" : "none"}>
                  <button
                    className="issues-table-sort"
                    type="button"
                    aria-label={t("sortByColumn", { column: label, direction: activeSort === field ? t(activeDirection) : t("notSorted") })}
                    onClick={() => sortBy(field)}
                  >
                    <span>{label}</span>
                    <span className="sort-indicator" aria-hidden="true">
                      {activeSort === field ? activeDirection === "asc" ? "↑" : "↓" : "↕"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <IssueRow key={`${issue.owner}/${issue.name}#${issue.number}`} issue={issue} returnTo={returnTo} />
            ))}
            {!issues.length && !loading && !displayedError && (
              <tr><td className="issues-table-empty" colSpan={10}><EmptyState>{t("noMatchingIssues")}</EmptyState></td></tr>
            )}
          </tbody>
        </Table>
      )}
      {!demoIssues && (
        <div className="actions pagination">
          <Button variant="secondary" type="button" disabled={loading || page <= 1} onClick={() => load(filters, page - 1)}>
            {t("previousPage")}
          </Button>
          <span>{t("pageNumber", { page: formatNumber(page, i18n.language) })}</span>
          <Button variant="secondary" type="button" disabled={loading || !hasNext} onClick={() => load(filters, page + 1)}>
            {t("nextPage")}
          </Button>
        </div>
      )}
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
