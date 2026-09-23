import { useEffect } from "react";
import { IssueFilters } from "./IssueFilters";
import { IssueRow } from "./IssueRow";
import { useIssueListState, type IssueFiltersValue } from "./issue-list-state";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/feedback/LoadingState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";

const defaults: IssueFiltersValue = {
  q: "",
  repository: "",
  state: "all",
  assignee: "",
  label: "",
  milestone: "",
};
function filtersFromUrl(): IssueFiltersValue {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [
      key,
      params.get(key) ?? defaults[key as keyof IssueFiltersValue],
    ]),
  ) as IssueFiltersValue;
}

export function IssueListPage() {
  const { issues, filters, page, hasNext, loading, error, load } =
    useIssueListState(filtersFromUrl());
  useEffect(() => {
    void load(
      filters,
      Number(new URLSearchParams(window.location.search).get("page") ?? 1),
    );
  }, []);
  return (
    <section>
      <PageHeader
        eyebrow="CROSS-REPOSITORY"
        title="Issues"
        description="從單一入口管理不同 Repository 的 Gitea Issues。"
        action={
          <a className="button" href="/issue/new">
            建立 Issue
          </a>
        }
      />
      <IssueFilters initial={filters} onSubmit={(next) => load(next, 1)} />
      {error && <ErrorNotice message={error} />}
      {loading && <LoadingState />}
      <div className="issue-list">
        {issues.map((issue) => (
          <IssueRow
            key={`${issue.owner}/${issue.name}#${issue.number}`}
            issue={issue}
          />
        ))}
        {!issues.length && !loading && !error && (
          <EmptyState>沒有符合條件的 Issue</EmptyState>
        )}
      </div>
      <div className="actions pagination">
        <Button
          variant="secondary"
          type="button"
          disabled={loading || page <= 1}
          onClick={() => load(filters, page - 1)}
        >
          上一頁
        </Button>
        <span>第 {page} 頁</span>
        <Button
          variant="secondary"
          type="button"
          disabled={loading || !hasNext}
          onClick={() => load(filters, page + 1)}
        >
          下一頁
        </Button>
      </div>
    </section>
  );
}
