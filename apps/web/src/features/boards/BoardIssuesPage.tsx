import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { EmptyState } from "../../components/feedback/EmptyState";
import { IssueFilters } from "../issues/IssueFilters";
import { IssueRow } from "../issues/IssueRow";
import { filtersFromUrl } from "../issues/IssueListPage";
import { useIssueListState } from "../issues/issue-list-state";
import { api, queryBoardIssues, toUserFacingError, type Board, type UserFacingError } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { routePaths } from "../../app/routes";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../i18n/format";

export function BoardIssuesPage({ boardId }: { boardId: string }) {
  const { t, i18n } = useTranslation("boards");
  const [board, setBoard] = useState<Board>();
  const [boardError, setBoardError] = useState<UserFacingError>();
  const loader = useCallback(
    (filters: Record<string, string>) => queryBoardIssues(boardId, filters),
    [boardId],
  );
  const { issues, filters, page, hasNext, loading, error, load } =
    useIssueListState(filtersFromUrl(), loader);

  useEffect(() => {
    let cancelled = false;
    void api<Board[]>("/api/boards")
      .then((boards) => {
        const match = boards.find((item) => item.id === boardId);
        if (!match) throw new Error(t("boardUnavailable"));
        if (!cancelled) setBoard(match);
      })
      .catch((cause) => {
        if (!cancelled)
          setBoardError(
            toUserFacingError(cause, t("boardLoadError")),
          );
      });
    return () => {
      cancelled = true;
    };
  }, [boardId, t]);

  useEffect(() => {
    void load(
      filtersFromUrl(),
      Number(new URLSearchParams(window.location.search).get("page") ?? 1),
    );
  }, [boardId]);

  const returnTo = `${window.location.pathname}${window.location.search}`;
  if (boardError) return <ErrorNotice message={boardError} />;
  return (
    <section>
      <PageHeader
        eyebrow={t("boardSettingsEyebrow")}
        title={board?.name ?? t("issues")}
        description={
          board?.repositoryRefs
            .map((repository) => `${repository.owner}/${repository.name}`)
            .join(" · ") ?? t("boardIssuesDescription")
        }
      />
      <IssueFilters
        initial={filters}
        onSubmit={(next) => load(next, 1)}
        showRepository={false}
      />
      {error && <ErrorNotice message={error} />}
      {loading && <LoadingState />}
      <div className="issue-list">
        {issues.map((issue) => (
          <IssueRow
            key={`${issue.owner}/${issue.name}#${issue.number}`}
            issue={issue}
            returnTo={returnTo}
          />
        ))}
        {!issues.length && !loading && !error && (
          <EmptyState>{t("boardIssuesEmpty")}</EmptyState>
        )}
      </div>
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
      <nav className="board-view-toggle" aria-label={t("boardViewNavigation")}>
        <a href={routePaths.boardIssues(boardId)} aria-current="page">
          {t("issues")}
        </a>
        <a href={routePaths.boardView(boardId, "kanban")}>{t("kanban")}</a>
          <a href={routePaths.boardView(boardId, "gantt")}>{t("gantt")}</a>
      </nav>
    </section>
  );
}
