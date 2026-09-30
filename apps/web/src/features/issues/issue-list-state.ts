import { useCallback, useState } from "react";
import { queryIssues, toUserFacingError, type Issue, type IssueSortField, type SortDirection, type UserFacingError } from "../../lib/api";
import type { IssuePage } from "../../lib/api";
import { useTranslation } from "react-i18next";
import type { WorkViewFilters } from "../work-views/work-view-filters";
import { serializeWorkViewFilters } from "../work-views/work-view-filters";

export type IssueFiltersValue = WorkViewFilters;
export type IssuePageLoader = (
  filters: Record<string, string>,
) => Promise<IssuePage>;
export function useIssueListState(
  initial: IssueFiltersValue,
  initialSort: IssueSortField = "key",
  initialDirection: SortDirection = "asc",
  loader: IssuePageLoader = queryIssues,
): {
  issues: Issue[];
  filters: IssueFiltersValue;
  page: number;
  sort: IssueSortField;
  direction: SortDirection;
  hasNext: boolean;
  loading: boolean;
  error?: UserFacingError;
  load: (next?: IssueFiltersValue, page?: number, sort?: IssueSortField, direction?: SortDirection) => Promise<void>;
} {
  const { t } = useTranslation("issues");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState(initial);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<IssueSortField>(initialSort);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserFacingError>();
  const load = useCallback(
    async (next = filters, requestedPage = 1, requestedSort = sort, requestedDirection = direction) => {
      setFilters(next);
      setSort(requestedSort);
      setDirection(requestedDirection);
      const params = new URLSearchParams(serializeWorkViewFilters(next, window.location.search));
      if (requestedPage > 1) params.set("page", String(requestedPage));
      else params.delete("page");
      params.set("sort", requestedSort);
      params.set("direction", requestedDirection);
      window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
      setLoading(true);
      setError(undefined);
      try {
        const result = await loader({
          ...Object.fromEntries(Object.entries(next).filter(([, value]) => value && value !== "all")),
          page: String(requestedPage), sort: requestedSort, direction: requestedDirection, limit: "50",
        });
        setIssues(result.items);
        setPage(result.page);
        setHasNext(result.hasNext);
      } catch (cause) {
        setIssues([]);
        setHasNext(false);
        setError(toUserFacingError(cause, t("issueListLoadError")));
      } finally {
        setLoading(false);
      }
    },
    [direction, filters, loader, sort, t],
  );
  return { issues, filters, page, sort, direction, hasNext, loading, error, load };
}
