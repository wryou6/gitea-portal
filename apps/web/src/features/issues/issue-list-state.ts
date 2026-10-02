import { useCallback, useState } from "react";
import { queryIssues, toUserFacingError, type Issue, type IssueSearchResult, type IssueSortField, type SortDirection, type UserFacingError } from "../../lib/api";
import { useTranslation } from "react-i18next";
import type { WorkViewFilters } from "../work-views/work-view-filters";
import { serializeWorkViewFilters } from "../work-views/work-view-filters";

export type IssueFiltersValue = WorkViewFilters;
export type IssueListLoader = (
  filters: Record<string, string>,
) => Promise<IssueSearchResult>;

export function useIssueListState(
  initial: IssueFiltersValue,
  initialSort: IssueSortField = "key",
  initialDirection: SortDirection = "asc",
  loader: IssueListLoader = queryIssues,
  currentUserLogin?: string,
): {
  issues: Issue[];
  filters: IssueFiltersValue;
  sort: IssueSortField;
  direction: SortDirection;
  loading: boolean;
  error?: UserFacingError;
  load: (next?: IssueFiltersValue, sort?: IssueSortField, direction?: SortDirection) => Promise<void>;
} {
  const { t } = useTranslation("issues");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState<IssueSortField>(initialSort);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserFacingError>();
  const load = useCallback(
    async (next = filters, requestedSort = sort, requestedDirection = direction) => {
      setFilters(next);
      setSort(requestedSort);
      setDirection(requestedDirection);
      const params = new URLSearchParams(serializeWorkViewFilters(next, window.location.search));
      params.delete("page");
      params.set("sort", requestedSort);
      params.set("direction", requestedDirection);
      window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
      setLoading(true);
      setError(undefined);
      try {
        const requestFilters = Object.fromEntries(Object.entries(next).filter(([, value]) => value && value !== "all"));
        if (next.assignee === "me" && currentUserLogin) requestFilters.assignee = currentUserLogin;
        const result = await loader({
          ...requestFilters,
          sort: requestedSort,
          direction: requestedDirection,
        });
        setIssues(result.items);
      } catch (cause) {
        setIssues([]);
        setError(toUserFacingError(cause, t("issueListLoadError")));
      } finally {
        setLoading(false);
      }
    },
    [currentUserLogin, direction, filters, loader, sort, t],
  );
  return { issues, filters, sort, direction, loading, error, load };
}
