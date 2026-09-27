import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { api, toUserFacingError, type Issue, type UserFacingError } from "../../lib/api";
import { routePaths } from "../../app/routes";
import { GanttIssueRow } from "./GanttIssueRow";
import {
  formatScheduleDate,
  scheduleAnomalyTranslationKey,
} from "../issues/ScheduleDates";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../i18n/format";

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
  demo = false,
  emptyMessage,
}: {
  issues: Issue[];
  returnTo?: string;
  demo?: boolean;
  emptyMessage?: string;
}) {
  const { t, i18n } = useTranslation("work-views");
  const { t: tIssues } = useTranslation("issues");
  const initialQuery = new URLSearchParams(window.location.search);
  const [login, setLogin] = useState<string>();
  const [sessionError, setSessionError] = useState<UserFacingError>();
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
    if (demo) {
      setLogin("engineer");
      return;
    }
    let cancelled = false;
    void api<{ login: string }>("/api/session")
      .then((session) => {
        if (!cancelled) setLogin(session.login);
      })
      .catch((cause) => {
        if (!cancelled)
          setSessionError(
            toUserFacingError(cause, t("currentUserUnavailable")),
          );
      });
    return () => {
      cancelled = true;
    };
  }, [demo, t]);

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
            .map((issue) => issue.currentOwner)
            .filter((value): value is string => Boolean(value)),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [issues],
  );
  const visibleIssues = issues.filter((issue) => {
    const assigneeMatches =
      assignee === "all" ||
      (assignee === "self"
        ? Boolean(login && issue.currentOwner === login)
        : assignee === "unassigned"
          ? issue.currentOwner === null
          : issue.currentOwner === assignee);
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
    const href =
      detailReturnTo || returnTo
        ? routePaths.issueDetailFrom(
            issue.owner,
            issue.name,
            issue.number,
            detailReturnTo || returnTo!,
          )
        : routePaths.issueDetail(issue.owner, issue.name, issue.number);
    return (
      <GanttIssueRow
        key={`${issue.owner}/${issue.name}#${issue.number}`}
        issue={issue}
        href={href}
        variant={showBar ? "scheduled" : "unscheduled"}
        start={start}
        end={end}
        left={left}
        width={width}
      />
    );
  };

  return (
    <section className="gantt-view" aria-label={t("ganttLabel")}>
      <div className="gantt-filters">
        <label className="field" htmlFor="gantt-assignee">
          <span>{t("currentAssignee")}</span>
          <select
            id="gantt-assignee"
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
          >
            <option value="self">
              {t("currentUserAssignee", { login: login ? `（${login}）` : "" })}
            </option>
            <option value="all">{t("allAssignees")}</option>
            <option value="unassigned">{t("unassigned")}</option>
            {assignees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>{t("issueState")}</legend>
          <label>
            <input
              type="checkbox"
              checked={showOpen}
              onChange={(event) => setShowOpen(event.target.checked)}
            />{" "}
            {t("open")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(event) => setShowClosed(event.target.checked)}
            />{" "}
            {t("closed")}
          </label>
        </fieldset>
      </div>
      {sessionError && <ErrorNotice message={sessionError} />}
      {scheduledIssues.length > 0 && (
        <section className="gantt-scheduled" aria-label={t("scheduledIssues")}>
          <div className="gantt-axis" aria-hidden="true">
            <span>
              {formatScheduleDate(new Date(minDay).toISOString().slice(0, 10), i18n.language)}
            </span>
            <span>
              {formatScheduleDate(new Date(maxDay).toISOString().slice(0, 10), i18n.language)}
            </span>
          </div>
          {scheduledIssues.map((issue) => renderIssueRow(issue, true))}
        </section>
      )}
      <section
        className="gantt-issue-section"
        aria-labelledby="gantt-unscheduled-title"
      >
        <h2 id="gantt-unscheduled-title">
          {t("unscheduled")} <span>（{formatNumber(unscheduledIssues.length, i18n.language)}）</span>
        </h2>
        {unscheduledIssues.length ? (
          unscheduledIssues.map((issue) => renderIssueRow(issue, false))
        ) : (
          <EmptyState>{t("noUnscheduledIssues")}</EmptyState>
        )}
      </section>
      {anomalousIssues.length > 0 && (
        <section
          className="gantt-issue-section"
          aria-labelledby="gantt-anomaly-title"
        >
          <h2 id="gantt-anomaly-title">
            {t("dateAnomalies")} <span>（{formatNumber(anomalousIssues.length, i18n.language)}）</span>
          </h2>
          {anomalousIssues.map((issue) => {
            const href =
              detailReturnTo || returnTo
                ? routePaths.issueDetailFrom(
                    issue.owner,
                    issue.name,
                    issue.number,
                    detailReturnTo || returnTo!,
                  )
                : routePaths.issueDetail(issue.owner, issue.name, issue.number);
            return (
              <GanttIssueRow
                key={`${issue.owner}/${issue.name}#${issue.number}`}
                issue={issue}
                href={href}
                variant="anomaly"
                anomaly={tIssues(scheduleAnomalyTranslationKey(issue.scheduleAnomaly))}
              />
            );
          })}
        </section>
      )}
      {visibleIssues.length === 0 && (
        <EmptyState>
          {emptyMessage ?? (assignee === "self" && !login
            ? t("loadingCurrentUserIssues")
            : t("noFilteredIssues"))}
        </EmptyState>
      )}
    </section>
  );
}
