import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { api, type Issue } from "../../lib/api";
import { routePaths } from "../../app/routes";

function displayStart(issue: Issue): string | null {
  return issue.startDate ?? issue.dueDate;
}

function displayEnd(issue: Issue): string | null {
  return issue.dueDate ?? issue.startDate;
}

function dayNumber(value: string): number {
  return Date.parse(`${value}T00:00:00.000Z`);
}

export function GanttBoard({
  issues,
  returnTo,
}: {
  issues: Issue[];
  returnTo?: string;
}) {
  const initialQuery = new URLSearchParams(window.location.search);
  const [login, setLogin] = useState<string>();
  const [sessionError, setSessionError] = useState<string>();
  const [assignee, setAssignee] = useState(
    initialQuery.get("gantt_assignee") ?? "self",
  );
  const [showOpen, setShowOpen] = useState(
    initialQuery.get("gantt_open") !== "false",
  );
  const [showClosed, setShowClosed] = useState(
    initialQuery.get("gantt_closed") !== "false",
  );

  useEffect(() => {
    let cancelled = false;
    void api<{ login: string }>("/api/session")
      .then((session) => {
        if (!cancelled) setLogin(session.login);
      })
      .catch((cause) => {
        if (!cancelled)
          setSessionError(
            cause instanceof Error ? cause.message : "無法取得目前使用者",
          );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (assignee === "self") params.delete("gantt_assignee");
    else params.set("gantt_assignee", assignee);
    if (showOpen) params.delete("gantt_open");
    else params.set("gantt_open", "false");
    if (showClosed) params.delete("gantt_closed");
    else params.set("gantt_closed", "false");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [assignee, showOpen, showClosed]);

  const assignees = useMemo(
    () =>
      [
        ...new Set(
          issues
            .map((issue) => issue.assignee)
            .filter((value): value is string => Boolean(value)),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [issues],
  );
  const visibleIssues = issues.filter((issue) => {
    const assigneeMatches =
      assignee === "all" ||
      (assignee === "self"
        ? Boolean(login && issue.assignee === login)
        : assignee === "unassigned"
          ? issue.assignee === null
          : issue.assignee === assignee);
    const stateMatches = issue.state === "open" ? showOpen : showClosed;
    return assigneeMatches && stateMatches;
  });
  const scheduledIssues = visibleIssues.filter(
    (issue) => issue.scheduleStatus === "scheduled",
  );
  const unscheduledIssues = visibleIssues.filter(
    (issue) => issue.scheduleStatus === "unscheduled",
  );
  const anomalousIssues = visibleIssues.filter(
    (issue) => issue.scheduleStatus === "invalid",
  );
  const axisDays = scheduledIssues
    .flatMap((issue) => [displayStart(issue), displayEnd(issue)])
    .filter((date): date is string => Boolean(date))
    .map(dayNumber);
  const minDay = Math.min(...axisDays);
  const maxDay = Math.max(...axisDays);
  const daySpan = axisDays.length
    ? Math.max(maxDay - minDay, 86_400_000)
    : 86_400_000;
  const detailReturnTo = (() => {
    const params = new URLSearchParams(window.location.search);
    if (assignee === "self") params.delete("gantt_assignee");
    else params.set("gantt_assignee", assignee);
    if (showOpen) params.delete("gantt_open");
    else params.set("gantt_open", "false");
    if (showClosed) params.delete("gantt_closed");
    else params.set("gantt_closed", "false");
    const query = params.toString();
    return `${window.location.pathname}${query ? `?${query}` : ""}`;
  })();

  const renderIssueRow = (issue: Issue, showBar: boolean) => {
    const start = showBar ? displayStart(issue) : null;
    const end = showBar ? displayEnd(issue) : null;
    const left = start ? ((dayNumber(start) - minDay) / daySpan) * 100 : 0;
    const width =
      start && end
        ? Math.max(((dayNumber(end) - dayNumber(start)) / daySpan) * 100, 0.35)
        : 0;
    return (
      <article
        className="gantt-row"
        key={`${issue.owner}/${issue.name}#${issue.number}`}
      >
        <div className="gantt-issue">
          <a
            href={
              detailReturnTo || returnTo
                ? routePaths.issueDetailFrom(
                    issue.owner,
                    issue.name,
                    issue.number,
                    detailReturnTo || returnTo!,
                  )
                : routePaths.issueDetail(issue.owner, issue.name, issue.number)
            }
          >
            {issue.title}
          </a>
          <small>
            {issue.owner}/{issue.name} #{issue.number} ·{" "}
            {issue.assignee ?? "未指派"}
          </small>
          <small>{start && end ? `${start} — ${end}` : "沒有排程日期"}</small>
        </div>
        <div
          className="gantt-track"
          aria-label={
            start && end ? `${issue.title}：${start} 至 ${end}` : undefined
          }
        >
          {start && end && (
            <span
              className="gantt-bar"
              aria-hidden="true"
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="gantt-view" aria-label="工作區甘特圖">
      <div className="gantt-filters">
        <label className="field" htmlFor="gantt-assignee">
          <span>Assignee</span>
          <select
            id="gantt-assignee"
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
          >
            <option value="self">
              目前使用者{login ? `（${login}）` : ""}
            </option>
            <option value="all">所有負責人</option>
            <option value="unassigned">未指派</option>
            {assignees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Issue 狀態</legend>
          <label>
            <input
              type="checkbox"
              checked={showOpen}
              onChange={(event) => setShowOpen(event.target.checked)}
            />{" "}
            Open
          </label>
          <label>
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(event) => setShowClosed(event.target.checked)}
            />{" "}
            Closed
          </label>
        </fieldset>
      </div>
      {sessionError && <ErrorNotice message={sessionError} />}
      {scheduledIssues.length > 0 && (
        <section className="gantt-scheduled" aria-label="已排程 Issues">
          <div className="gantt-axis" aria-hidden="true">
            <span>{new Date(minDay).toISOString().slice(0, 10)}</span>
            <span>{new Date(maxDay).toISOString().slice(0, 10)}</span>
          </div>
          {scheduledIssues.map((issue) => renderIssueRow(issue, true))}
        </section>
      )}
      <section
        className="gantt-issue-section"
        aria-labelledby="gantt-unscheduled-title"
      >
        <h2 id="gantt-unscheduled-title">
          未排程 <span>（{unscheduledIssues.length}）</span>
        </h2>
        {unscheduledIssues.length ? (
          unscheduledIssues.map((issue) => renderIssueRow(issue, false))
        ) : (
          <EmptyState>沒有未排程 Issue</EmptyState>
        )}
      </section>
      {anomalousIssues.length > 0 && (
        <section
          className="gantt-issue-section"
          aria-labelledby="gantt-anomaly-title"
        >
          <h2 id="gantt-anomaly-title">
            日期異常 <span>（{anomalousIssues.length}）</span>
          </h2>
          {anomalousIssues.map((issue) => (
            <article
              className="gantt-anomaly"
              key={`${issue.owner}/${issue.name}#${issue.number}`}
            >
              <a
                href={
                  detailReturnTo || returnTo
                    ? routePaths.issueDetailFrom(
                        issue.owner,
                        issue.name,
                        issue.number,
                        detailReturnTo || returnTo!,
                      )
                    : routePaths.issueDetail(
                        issue.owner,
                        issue.name,
                        issue.number,
                      )
                }
              >
                {issue.owner}/{issue.name} #{issue.number} · {issue.title}
              </a>
              <span role="status">{issue.scheduleAnomaly ?? "日期異常"}</span>
            </article>
          ))}
        </section>
      )}
      {visibleIssues.length === 0 && (
        <EmptyState>
          {assignee === "self" && !login
            ? "載入目前使用者的 Issues…"
            : "沒有符合篩選條件的 Issue"}
        </EmptyState>
      )}
    </section>
  );
}
