import { useCallback, useEffect, useState } from "react";
import { api, type Issue } from "../../lib/api";
import { CommentComposer } from "./CommentComposer";
import { IssueComments } from "./IssueComments";
import { IssueDetailHeader } from "./IssueDetailHeader";
import { IssueEditForm } from "./IssueEditForm";
import type { Comment } from "./types";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { Button } from "../../components/ui/Button";
import { routePaths, safeReturnTo } from "../../app/routes";
import { WorkflowTransitionDialog } from "./WorkflowTransitionDialog";

export function IssueDetailPage({
  owner,
  repo,
  number,
}: {
  owner: string;
  repo: string;
  number: number;
}) {
  const returnTo =
    safeReturnTo(new URLSearchParams(window.location.search).get("returnTo")) ??
    routePaths.issues;
  const [issue, setIssue] = useState<Issue>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string>();
  const [editing, setEditing] = useState(false);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const load = useCallback(async () => {
    setError(undefined);
    try {
      const [nextIssue, nextComments] = await Promise.all([
        api<Issue>(`/api/issues/${owner}/${repo}/${number}`),
        api<Comment[]>(`/api/issues/${owner}/${repo}/${number}/comments`),
      ]);
      setIssue(nextIssue);
      setComments(nextComments);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Issue 已不存在、無權限或 Gitea 無法使用",
      );
      setIssue(undefined);
    }
  }, [owner, repo, number]);
  useEffect(() => {
    void load();
  }, [load]);
  if (error)
    return (
      <section>
        <a href={returnTo}>← 返回工作區</a>
        <ErrorNotice message={error} />
      </section>
    );
  if (!issue) return <LoadingState />;
  return (
    <section>
      <a href={returnTo}>← 返回工作區</a>
      <div className="detail-grid">
        <div className="detail-card">
          <IssueDetailHeader issue={issue} />
          <div className="prose" style={{ margin: "1.5rem 0" }}>
            {issue.body || "沒有 Description"}
          </div>
          <div className="actions">
            <a
              className="button"
              href={issue.htmlUrl}
              target="_blank"
              rel="noreferrer"
            >
              在 Gitea 開啟
            </a>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEditing((value) => !value)}
            >
              {editing ? "取消編輯" : "編輯 Issue"}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setTransitionOpen(true)}
              disabled={issue.workflowState === "anomaly"}
            >
              記錄狀態動作
            </Button>
          </div>
          {editing && (
            <div style={{ marginTop: "1.5rem" }}>
              <IssueEditForm
                issue={issue}
                onSaved={async () => {
                  setEditing(false);
                  await load();
                }}
              />
            </div>
          )}
        </div>
        <aside className="detail-card">
          <h2>Comments</h2>
          <IssueComments comments={comments} />
          <CommentComposer
            owner={owner}
            repo={repo}
            number={number}
            onSaved={load}
          />
        </aside>
      </div>
      {transitionOpen && (
        <WorkflowTransitionDialog
          issue={issue}
          onClose={() => setTransitionOpen(false)}
          onSubmit={async (actionKey, selectedAssignee) => {
            await api(
              `/api/issues/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${number}/transition`,
              {
                method: "POST",
                body: JSON.stringify({
                  actionKey,
                  selectedAssignee,
                  expectedUpdatedAt: issue.updatedAt,
                }),
              },
            );
            await load();
          }}
        />
      )}
    </section>
  );
}
