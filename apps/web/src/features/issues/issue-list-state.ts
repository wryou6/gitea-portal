import { useCallback, useState } from "react";
import { queryIssues, toUserFacingError, type Issue, type UserFacingError } from "../../lib/api";
import type { IssuePage } from "../../lib/api";
import { useTranslation } from "react-i18next";

export type IssueFiltersValue = {
  q: string;
  repository: string;
  state: string;
  assignee: string;
  label: string;
  milestone: string;
};
export type IssuePageLoader = (
  filters: Record<string, string>,
) => Promise<IssuePage>;
export function useIssueListState(
  initial: IssueFiltersValue,
  loader: IssuePageLoader = queryIssues,
): {
  issues: Issue[];
  filters: IssueFiltersValue;
  page: number;
  hasNext: boolean;
  loading: boolean;
  error?: UserFacingError;
  load: (next?: IssueFiltersValue, page?: number) => Promise<void>;
} {
  const { t } = useTranslation("issues");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState(initial);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<UserFacingError>();
  const load = useCallback(
    async (next = filters, requestedPage = 1) => {
      setFilters(next);
      setLoading(true);
      setError(undefined);
      try {
        const result = await loader({ ...next, page: String(requestedPage) });
        setIssues(result.items);
        setPage(result.page);
        setHasNext(result.hasNext);
        const params = new URLSearchParams(
          Object.entries(next).filter(([, value]) => value),
        );
        params.set("page", String(result.page));
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}?${params}`,
        );
      } catch (cause) {
        setIssues([]);
        setHasNext(false);
        setError(toUserFacingError(cause, t("issueListLoadError")));
      } finally {
        setLoading(false);
      }
    },
    [filters, loader, t],
  );
  return { issues, filters, page, hasNext, loading, error, load };
}
