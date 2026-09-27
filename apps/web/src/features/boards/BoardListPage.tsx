import { useCallback, useEffect, useState } from "react";
import { api, toUserFacingError, type Repository, type UserFacingError } from "../../lib/api";
import { BoardEditor } from "./BoardEditor";
import type { Board } from "./types";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { routePaths } from "../../app/routes";
import { useTranslation } from "react-i18next";

export function BoardListPage({
  viewIntent,
}: {
  viewIntent?: "kanban" | "gantt";
}) {
  const { t } = useTranslation("boards");
  const [boards, setBoards] = useState<Board[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [editing, setEditing] = useState<Board>();
  const [error, setError] = useState<UserFacingError>();
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const [nextBoards, nextRepositories] = await Promise.all([
        api<Board[]>("/api/boards"),
        api<Repository[]>("/api/repositories"),
      ]);
      setBoards(nextBoards);
      setRepositories(nextRepositories);
      setError(undefined);
    } catch (cause) {
      setError(toUserFacingError(cause, t("boardLoadError")));
    } finally {
      setLoading(false);
    }
  }, [t]);
  useEffect(() => {
    void load();
  }, [load]);

  const readableRepositories = new Set(
    repositories.map((repository) => `${repository.owner}/${repository.name}`),
  );
  const visibleBoards = boards.filter(
    (board) =>
      board.repositoryRefs.length >= 2 &&
      board.repositoryRefs.every((repository) =>
        readableRepositories.has(`${repository.owner}/${repository.name}`),
      ),
  );

  return (
    <section>
      <PageHeader
        eyebrow={t(viewIntent ? "selectionEyebrow" : "workspaceEyebrow")}
        title={t(viewIntent ? "selectBoard" : "boardListTitle")}
        description={
          viewIntent
            ? viewIntent === "gantt"
              ? t("selectGanttBoardDescription")
              : t("selectKanbanBoardDescription")
            : t("boardDescription")
        }
      />
      {error && <ErrorNotice message={error} />}
      {loading && <LoadingState />}
      {!viewIntent && !error && (
        <BoardEditor
          key={editing?.id ?? "new"}
          board={editing}
          repositories={repositories}
          onSaved={async () => {
            setEditing(undefined);
            await load();
          }}
          onCancelled={() => setEditing(undefined)}
        />
      )}
      <div className="board-list">
        {visibleBoards.map((board) => (
          <article className="board-link" key={board.id}>
            <a href={routePaths.boardView(board.id, viewIntent ?? "kanban")}>
              <h2>{board.name}</h2>
              <p>
                {board.repositoryRefs
                  .map((repo) => `${repo.owner}/${repo.name}`)
                  .join(" · ")}
              </p>
            </a>
            {!viewIntent && (
              <>
                <nav
                  className="board-view-links"
                  aria-label={t("boardViews", { board: board.name })}
                >
                  <a href={routePaths.boardView(board.id, "kanban")}>{t("kanban")}</a>
                  <a href={routePaths.boardView(board.id, "gantt")}>{t("gantt")}</a>
                </nav>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setEditing(board)}
                >
                  {t("edit")}
                </Button>
              </>
            )}
          </article>
        ))}
        {!loading && !error && !visibleBoards.length && (
          <EmptyState>
            {viewIntent ? (
              <>
                {t("noBoardsWithLink")} {" "}
                <a href={routePaths.boardSettings}>{t("createBoardLink")}</a>{" "}
                {t("createBoardSuffix")}
              </>
            ) : (
              t("noBoards")
            )}
          </EmptyState>
        )}
      </div>
    </section>
  );
}
