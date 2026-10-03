import { useCallback, useState } from "react";
import { queryIssues, toUserFacingError, type Issue, type IssueSearchResult, type IssueSortField, type SortDirection, type UserFacingError } from "../../lib/api";
import { useTranslation } from "react-i18next";
import type { WorkViewFilters } from "../work-views/work-view-filters";
import { serializeWorkViewFilters } from "../work-views/work-view-filters";
import { useLocation, useNavigate } from "react-router";

export type IssueFiltersValue = WorkViewFilters;
export type IssueListLoader = (
  filters: Record<string, string | string[]>,
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
  load: (next?: IssueFiltersValue, sort?: IssueSortField, direction?: SortDirection, addHistoryEntry?: boolean) => Promise<void>;
} {
  const { t } = useTranslation("issues");
  const location = useLocation();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState<IssueSortField>(initialSort);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserFacingError>();
  const load = useCallback(
    async (next = filters, requestedSort = sort, requestedDirection = direction, addHistoryEntry = false) => {
      setFilters(next);
      setSort(requestedSort);
      setDirection(requestedDirection);
      const params = new URLSearchParams(serializeWorkViewFilters(next, location.search, "issues"));
      params.delete("page");
      params.set("sort", requestedSort);
      params.set("direction", requestedDirection);
      const url = `${location.pathname}?${params}`;
      navigate(url, { replace: !addHistoryEntry });
      setLoading(true);
      setError(undefined);
      try {
        const requestFilters: Record<string, string | string[]> = {};
        for (const [key, value] of Object.entries(next)) {
          if (Array.isArray(value)) {
            if (value.length > 0) requestFilters[key] = value;
          } else if (value && value !== "all") {
            requestFilters[key] = value;
          }
        }
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
    [currentUserLogin, direction, filters, loader, location.pathname, location.search, navigate, sort, t],
  );
  return { issues, filters, sort, direction, loading, error, load };
}
