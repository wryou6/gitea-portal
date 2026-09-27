import { useEffect } from "react";
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
import { routePaths } from "../../app/routes";
import type { Issue } from "../../lib/api";

const defaults: IssueFiltersValue = {
  q: "",
  repository: "",
  state: "all",
  assignee: "",
  label: "",
  milestone: "",
};
export function filtersFromUrl(): IssueFiltersValue {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [
      key,
      params.get(key) ?? defaults[key as keyof IssueFiltersValue],
    ]),
  ) as IssueFiltersValue;
}

export function IssueListPage({
  repository,
  demoIssues,
}: {
  repository?: { owner: string; name: string };
  demoIssues?: Issue[];
} = {}) {
  const { t, i18n } = useTranslation("issues");
  const initialFilters = filtersFromUrl();
  if (repository)
    initialFilters.repository = `${repository.owner}/${repository.name}`;
  const {
    issues: loadedIssues,
    filters,
    page,
    hasNext,
    loading: isLoading,
    error,
    load,
  } = useIssueListState(initialFilters);
  const issues = demoIssues ?? loadedIssues;
  const loading = demoIssues ? false : isLoading;
  useEffect(() => {
    if (demoIssues) return;
    void load(
      repository
        ? { ...filters, repository: `${repository.owner}/${repository.name}` }
        : filters,
      Number(new URLSearchParams(window.location.search).get("page") ?? 1),
    );
  }, [repository?.owner, repository?.name, demoIssues]);
  const returnTo = `${window.location.pathname}${window.location.search}`;
  return (
    <section>
      <PageHeader
        eyebrow={t(repository ? "repositoryWorkspaceEyebrow" : "crossRepositoryEyebrow")}
        title={repository ? `${repository.owner}/${repository.name}` : t("issueListTitle")}
        description={
          repository
            ? t("repositoryIssueDescription")
            : t("crossRepositoryIssueDescription")
        }
        action={
          <a
            className="button"
            href={
              repository
                ? routePaths.issueCreateForRepository(
                    repository.owner,
                    repository.name,
                    returnTo,
                  )
                : routePaths.issueCreate
            }
          >
            {t("createIssue")}
          </a>
        }
      />
      {!demoIssues && (
        <IssueFilters
          initial={filters}
          onSubmit={(next) =>
            load(
              repository
                ? {
                    ...next,
                    repository: `${repository.owner}/${repository.name}`,
                  }
                : next,
              1,
            )
          }
          showRepository={!repository}
        />
      )}
      {error && <ErrorNotice message={error} />}
      {loading && <LoadingState />}
      <div className="issue-list">
        {issues.map((issue) => (
          <IssueRow
            key={`${issue.owner}/${issue.name}#${issue.number}`}
            issue={issue}
            returnTo={repository ? returnTo : undefined}
          />
        ))}
        {!issues.length && !loading && !error && (
          <EmptyState>{t("noMatchingIssues")}</EmptyState>
        )}
      </div>
      {!demoIssues && (
        <div className="actions pagination">
          <Button
            variant="secondary"
            type="button"
            disabled={loading || page <= 1}
            onClick={() => load(filters, page - 1)}
          >
            {t("previousPage")}
          </Button>
          <span>{t("pageNumber", { page: formatNumber(page, i18n.language) })}</span>
          <Button
            variant="secondary"
            type="button"
            disabled={loading || !hasNext}
            onClick={() => load(filters, page + 1)}
          >
            {t("nextPage")}
          </Button>
        </div>
      )}
    </section>
  );
}
