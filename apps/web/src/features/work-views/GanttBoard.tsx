import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { api, toUserFacingError, type Issue, type IssueSortField, type UserFacingError } from "../../lib/api";
import { routePaths } from "../../app/routes";
import { formatNumber } from "../../i18n/format";
import { useTranslation } from "react-i18next";
import { GanttIssueRow, type GanttColumn, type GanttIssueRowVariant } from "./GanttIssueRow";
import { GanttCalendarHeader, GANTT_SCALE_WIDTH } from "./GanttCalendarHeader";
import { GanttViewOptionsDialog } from "./GanttViewOptionsDialog";
import {
  DEFAULT_GANTT_COLUMN_ORDER,
  GANTT_FIXED_FIELDS,
  GANTT_VIEW_FIELDS,
  defaultGanttViewPreference,
  readGanttViewPreference,
  writeGanttViewPreference,
  type GanttViewPreference,
} from "./gantt-view-preference";
import {
  addCalendarDays,
  buildTimelineCells,
  countCalendarDays,
  isCalendarDate,
  localCalendarDate,
  parseGanttScale,
  timelinePosition,
  type GanttScale,
} from "./gantt-timeline";

function compareGanttStartDate(left: Issue, right: Issue): number {
  const dateOrder = (left.startDate ?? left.dueDate ?? "").localeCompare(right.startDate ?? right.dueDate ?? "");
  if (dateOrder !== 0) return dateOrder;
  const repositoryOrder = `${left.owner}/${left.name}`.localeCompare(`${right.owner}/${right.name}`);
  return repositoryOrder || left.number - right.number;
}

function reorderVisibleFields(
  order: IssueSortField[],
  visibleFields: IssueSortField[],
  from: IssueSortField,
  to: IssueSortField,
): IssueSortField[] {
  const visibleOrder = order.filter((field) => visibleFields.includes(field));
  const fromIndex = visibleOrder.indexOf(from);
  const toIndex = visibleOrder.indexOf(to);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return order;
  visibleOrder.splice(fromIndex, 1);
  visibleOrder.splice(toIndex, 0, from);
  let visibleIndex = 0;
  return order.map((field) => visibleFields.includes(field)
    ? visibleOrder[visibleIndex++] ?? field
    : field);
}

function sameOrder(left: IssueSortField[], right: IssueSortField[]): boolean {
  return left.length === right.length && left.every((field, index) => field === right[index]);
}

function getIssueHref(issue: Issue, returnTo: string) {
  return routePaths.issueDetailFrom(issue.owner, issue.name, issue.number, returnTo);
}

function columnsForTranslation(
  order: IssueSortField[],
  visibleFields: IssueSortField[],
  tIssues: (key: string) => string,
): GanttColumn[] {
  return order
    .filter((field) => visibleFields.includes(field))
    .map((field) => ({
      field,
      label: tIssues(field === "priority" ? "priorityLabel" : field),
    }));
}

function dateAtTimelinePosition(position: number, cells: ReturnType<typeof buildTimelineCells>): string {
  if (!cells.length) return localCalendarDate();
  const bounded = Math.min(Math.max(position, 0), cells.length - Number.EPSILON);
  const index = Math.floor(bounded);
  const cell = cells[index]!;
  const daySpan = countCalendarDays(cell.start, cell.end);
  return addCalendarDays(cell.start, Math.min(daySpan - 1, Math.floor((bounded - index) * daySpan)));
}

export function GanttBoard({
  issues,
  returnTo,
  demo = false,
  demoInitialDate,
  demoScale,
  demoViewOptionsOpen = false,
  demoPreference,
  demoPendingOrder,
  demoKeyboardDraggedField,
  emptyMessage,
  repository,
}: {
  issues: Issue[];
  returnTo?: string;
  demo?: boolean;
  demoInitialDate?: string;
  demoScale?: GanttScale;
  demoViewOptionsOpen?: boolean;
  demoPreference?: GanttViewPreference;
  demoPendingOrder?: IssueSortField[];
  demoKeyboardDraggedField?: IssueSortField;
  emptyMessage?: string;
  repository?: { owner: string; name: string };
}) {
  const { t, i18n } = useTranslation("work-views");
  const { t: tIssues } = useTranslation("issues");
  const initialQuery = new URLSearchParams(window.location.search);
  const [login, setLogin] = useState<string>();
  const [sessionError, setSessionError] = useState<UserFacingError>();
  const [assignee, setAssignee] = useState(initialQuery.get("gantt_assignee") ?? "self");
  const [showOpen, setShowOpen] = useState(initialQuery.get("gantt_open") !== "false");
  const [showClosed, setShowClosed] = useState(initialQuery.get("gantt_closed") !== "false");
  const [initialDate, setInitialDate] = useState(() => {
    if (demoInitialDate && isCalendarDate(demoInitialDate)) return demoInitialDate;
    const query = initialQuery.get("gantt_start");
    return query && isCalendarDate(query) ? query : addCalendarDays(localCalendarDate(), -7);
  });
  const [scale, setScale] = useState<GanttScale>(() => demoScale ?? parseGanttScale(initialQuery.get("gantt_scale")));
  const [preference, setPreference] = useState<GanttViewPreference>(() => demoPreference ?? defaultGanttViewPreference());
  const [pendingOrder, setPendingOrder] = useState<IssueSortField[] | undefined>(demoPendingOrder ? [...demoPendingOrder] : undefined);
  const [keyboardDraggedField, setKeyboardDraggedField] = useState<IssueSortField | undefined>(demoKeyboardDraggedField);
  const [keyboardOrderBeforeDrag, setKeyboardOrderBeforeDrag] = useState<IssueSortField[] | undefined>();
  const [columnAnnouncement, setColumnAnnouncement] = useState("");
  const [optionsOpen, setOptionsOpen] = useState(demoViewOptionsOpen);
  const [fieldsWidth, setFieldsWidth] = useState(0);
  const [chartMaxScroll, setChartMaxScroll] = useState(0);
  const [chartScrollLeft, setChartScrollLeft] = useState(0);
  const [maxContentColumnWidths, setMaxContentColumnWidths] = useState<Record<string, number>>({});
  const [isNarrowViewport, setIsNarrowViewport] = useState(() => window.matchMedia("(max-width: 720px)").matches);
  const [visibleDate, setVisibleDate] = useState(initialDate);
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const defaultDate = addCalendarDays(localCalendarDate(), -7);

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
        if (!cancelled) setSessionError(toUserFacingError(cause, t("currentUserUnavailable")));
      });
    return () => { cancelled = true; };
  }, [demo, t]);

  useEffect(() => {
    if (!login) {
      setPreference(defaultGanttViewPreference());
      return;
    }
    setPreference(demoPreference ?? readGanttViewPreference(login));
    setPendingOrder(demoPendingOrder ? [...demoPendingOrder] : undefined);
  }, [login, demoPreference, demoPendingOrder]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (assignee === "self") params.delete("gantt_assignee");
    else params.set("gantt_assignee", assignee);
    if (showOpen) params.delete("gantt_open");
    else params.set("gantt_open", "false");
    if (showClosed) params.delete("gantt_closed");
    else params.set("gantt_closed", "false");
    params.set("gantt_start", initialDate);
    params.set("gantt_scale", scale);
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [assignee, showOpen, showClosed, initialDate, scale]);

  const assignees = useMemo(
    () => [...new Set(issues.map((issue) => issue.currentOwner).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b)),
    [issues],
  );
  const visibleIssues = issues.filter((issue) => {
    const assigneeMatches = assignee === "all" || (assignee === "self"
      ? Boolean(login && issue.currentOwner === login)
      : assignee === "unassigned"
        ? issue.currentOwner === null
        : issue.currentOwner === assignee);
    const stateMatches = issue.state === "open" ? showOpen : showClosed;
    return assigneeMatches && stateMatches;
  });
  const sortedIssues = [...visibleIssues].sort(compareGanttStartDate);
  const scheduledIssues = sortedIssues.filter((issue) => issue.scheduleStatus === "scheduled");
  const unscheduledIssues = sortedIssues.filter((issue) => issue.scheduleStatus === "unscheduled");
  const anomalousIssues = sortedIssues.filter((issue) => issue.scheduleStatus === "invalid");
  const today = localCalendarDate();
  const scheduledDates = scheduledIssues
    .flatMap((issue) => [issue.startDate, issue.dueDate])
    .filter((date): date is string => date !== null && isCalendarDate(date));
  const firstScheduleDate = scheduledDates.sort()[0];
  const lastScheduleDate = scheduledDates.at(-1);
  const timelineStartDates = [firstScheduleDate, initialDate, today].filter((date): date is string => Boolean(date));
  const timelineEndDates = [lastScheduleDate, initialDate, today].filter((date): date is string => Boolean(date));
  const axisStart = timelineStartDates.sort()[0] ?? initialDate;
  const latestDate = timelineEndDates.sort().at(-1) ?? initialDate;
  const axisEnd = addCalendarDays(latestDate, 43);
  const cells = buildTimelineCells(axisStart, axisEnd, scale, initialDate);
  const columnOrder = pendingOrder ?? preference.columnOrder;
  const visibleOrder = columnOrder.filter((field) => preference.visibleFields.includes(field));
  const allRepositories = !repository;
  const columns: GanttColumn[] = [
    ...(allRepositories ? [{ field: "repository" as const, label: tIssues("repository") }] : []),
    ...columnsForTranslation(visibleOrder, preference.visibleFields, tIssues),
  ];
  const fieldGridTemplate = columns.map(({ field }) => isNarrowViewport
    ? field === "title"
      ? "7.5rem"
      : field === "assignee" || field === "status" || field === "repository"
        ? `${maxContentColumnWidths[field] ?? "max-content"}${typeof maxContentColumnWidths[field] === "number" ? "px" : ""}`
        : "4.5rem"
    : field === "title"
      ? "minmax(13rem, 2fr)"
        : field === "assignee" || field === "status" || field === "repository"
          ? `${maxContentColumnWidths[field] ?? "max-content"}${typeof maxContentColumnWidths[field] === "number" ? "px" : ""}`
            : "minmax(7rem, 0.9fr)").join(" ");
  const unitWidth = GANTT_SCALE_WIDTH[scale];
  const timelineWidth = cells.length * unitWidth;
  const selectedPosition = timelinePosition(initialDate, cells) * unitWidth;
  const hasPendingOrder = !sameOrder(pendingOrder ?? preference.columnOrder, preference.columnOrder);
  const needsRestore = !sameOrder(preference.columnOrder, DEFAULT_GANTT_COLUMN_ORDER) ||
    !sameFields(preference.visibleFields, GANTT_FIXED_FIELDS) ||
    !sameOrder(columnOrder, DEFAULT_GANTT_COLUMN_ORDER);
  const returnParams = new URLSearchParams(window.location.search);
  if (assignee === "self") returnParams.delete("gantt_assignee");
  else returnParams.set("gantt_assignee", assignee);
  if (showOpen) returnParams.delete("gantt_open");
  else returnParams.set("gantt_open", "false");
  if (showClosed) returnParams.delete("gantt_closed");
  else returnParams.set("gantt_closed", "false");
  returnParams.set("gantt_start", initialDate);
  returnParams.set("gantt_scale", scale);
  const detailReturnTo = `${window.location.pathname}?${returnParams.toString()}`;
  useEffect(() => {
    const chart = chartScrollRef.current;
    const fields = chart?.querySelector<HTMLElement>(".gantt-header-fields");
    if (!chart || !fields) return;
    const updateLayout = () => {
      setFieldsWidth(fields.getBoundingClientRect().width);
      setChartMaxScroll(Math.max(0, chart.scrollWidth - chart.clientWidth));
      setIsNarrowViewport(window.matchMedia("(max-width: 720px)").matches);
      const nextWidths: Record<string, number> = {};
      for (const field of ["assignee", "status", ...(allRepositories ? ["repository"] : [])]) {
        const cells = [...chart.querySelectorAll<HTMLElement>(`.gantt-cell--${field}`)];
        nextWidths[field] = Math.ceil(Math.max(0, ...cells.map(measureIntrinsicWidth)));
      }
      setMaxContentColumnWidths((current) => Object.keys(nextWidths).length === Object.keys(current).length &&
        Object.entries(nextWidths).every(([field, width]) => current[field] === width)
        ? current
        : nextWidths);
    };
    const observer = new ResizeObserver(updateLayout);
    observer.observe(chart);
    observer.observe(fields);
    window.addEventListener("resize", updateLayout);
    updateLayout();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [allRepositories, fieldGridTemplate, i18n.language, issues, scheduledIssues.length, unscheduledIssues.length, anomalousIssues.length]);

  useEffect(() => {
    if (!chartScrollRef.current) return;
    chartScrollRef.current.scrollLeft = selectedPosition;
    setChartScrollLeft(chartScrollRef.current.scrollLeft);
    setVisibleDate(initialDate);
  }, [selectedPosition, timelineWidth, fieldGridTemplate, fieldsWidth, isNarrowViewport, initialDate]);

  function updatePreference(next: GanttViewPreference) {
    setPreference(next);
    if (login) writeGanttViewPreference(login, next);
  }

  function restoreDefaults() {
    const next = defaultGanttViewPreference();
    updatePreference(next);
    setPendingOrder(undefined);
    setKeyboardDraggedField(undefined);
    setKeyboardOrderBeforeDrag(undefined);
  }

  function handleOrderMove(field: IssueSortField, target: IssueSortField) {
    const next = reorderVisibleFields(columnOrder, visibleOrder, field, target);
    if (!sameOrder(next, columnOrder)) setPendingOrder(next);
  }

  function handleOrderKeyDown(event: KeyboardEvent<HTMLButtonElement>, field: IssueSortField) {
    if (event.key === "Escape" && keyboardDraggedField === field) {
      event.preventDefault();
      setPendingOrder(keyboardOrderBeforeDrag);
      setKeyboardOrderBeforeDrag(undefined);
      setKeyboardDraggedField(undefined);
      setColumnAnnouncement(t("ganttColumnMoveHelp"));
      return;
    }
    if (event.key === " " && !keyboardDraggedField) {
      event.preventDefault();
      setKeyboardOrderBeforeDrag([...columnOrder]);
      setKeyboardDraggedField(field);
      return;
    }
    if (event.key === " " && keyboardDraggedField === field) {
      event.preventDefault();
      setKeyboardDraggedField(undefined);
      setKeyboardOrderBeforeDrag(undefined);
      setColumnAnnouncement(t("ganttColumnMoved", { column: columns.find((column) => column.field === field)?.label, position: visibleOrder.indexOf(field) + 1 }));
      return;
    }
    if (keyboardDraggedField !== field || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const index = visibleOrder.indexOf(field);
    const target = visibleOrder[index + (event.key === "ArrowLeft" ? -1 : 1)];
    if (target) {
      handleOrderMove(field, target);
      setColumnAnnouncement(t("ganttColumnMoved", {
        column: columns.find((column) => column.field === field)?.label,
        position: visibleOrder.indexOf(target) + 1,
      }));
    }
  }

  function renderIssueRow(issue: Issue, variant: GanttIssueRowVariant) {
    return (
      <GanttIssueRow
        key={`${issue.owner}/${issue.name}#${issue.number}`}
        issue={issue}
        href={getIssueHref(issue, detailReturnTo)}
        variant={variant}
        columns={columns}
        fieldGridTemplate={fieldGridTemplate}
        cells={cells}
        scale={scale}
        today={today}
      />
    );
  }

  return (
    <section className="gantt-view" aria-label={t("ganttLabel")}>
      <div className="gantt-filters">
        <label className="field" htmlFor="gantt-assignee">
          <span>{t("currentAssignee")}</span>
          <select id="gantt-assignee" value={assignee} onChange={(event) => setAssignee(event.target.value)}>
            <option value="self">{t("currentUserAssignee", { login: login ? `（${login}）` : "" })}</option>
            <option value="all">{t("allAssignees")}</option>
            <option value="unassigned">{t("unassigned")}</option>
            {assignees.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <fieldset>
          <legend>{t("issueState")}</legend>
          <label><input type="checkbox" checked={showOpen} onChange={(event) => setShowOpen(event.target.checked)} /> {t("open")}</label>
          <label><input type="checkbox" checked={showClosed} onChange={(event) => setShowClosed(event.target.checked)} /> {t("closed")}</label>
        </fieldset>
        <div className="gantt-toolbar" aria-label={t("ganttLabel")}>
          <label className="gantt-start-date" htmlFor="gantt-start-date">
            <span>{t("ganttStartDate")}</span>
            <input id="gantt-start-date" type="date" value={initialDate} onChange={(event) => {
              if (isCalendarDate(event.target.value)) setInitialDate(event.target.value);
            }} />
          </label>
          <button className="secondary" type="button" onClick={() => setInitialDate(defaultDate)}>{t("today")}</button>
          <label className="gantt-scale" htmlFor="gantt-scale">
            <span>{t("scale")}</span>
            <select id="gantt-scale" value={scale} onChange={(event) => setScale(parseGanttScale(event.target.value))}>
              <option value="day">{t("scaleDay")}</option>
              <option value="week">{t("scaleWeek")}</option>
              <option value="two-weeks">{t("scaleTwoWeeks")}</option>
              <option value="month">{t("scaleMonth")}</option>
            </select>
          </label>
          {hasPendingOrder && <button type="button" onClick={() => updatePreference({ ...preference, columnOrder: [...columnOrder] })}>{t("ganttSaveColumnOrder")}</button>}
          {needsRestore && <button className="secondary" type="button" onClick={restoreDefaults}>{t("ganttRestoreColumnDefaults")}</button>}
          <button className="secondary" type="button" onClick={() => setOptionsOpen(true)}>{t("ganttViewOptions")}</button>
        </div>
      </div>
      {sessionError && <ErrorNotice message={sessionError} />}
      {scheduledIssues.length > 0 && (
        <div
          ref={chartScrollRef}
          className="gantt-chart-scroll"
          role="grid"
          aria-label={t("ganttLabel")}
          style={{ "--gantt-fields-template": fieldGridTemplate, "--gantt-timeline-width": `${timelineWidth}px`, "--gantt-fields-width": `${fieldsWidth}px` } as CSSProperties}
          onScroll={(event) => {
            setChartScrollLeft(event.currentTarget.scrollLeft);
            setVisibleDate(dateAtTimelinePosition(event.currentTarget.scrollLeft / unitWidth, cells));
          }}
        >
          <div className="gantt-chart-header" role="row">
            <div className="gantt-header-fields" role="presentation">
              {columns.map(({ field, label }) => (
                <div className="gantt-column-heading" role="columnheader" key={field}>
                  {field === "repository" ? label : (
                  <button
                    type="button"
                    draggable
                    aria-label={`${label}. ${t("ganttColumnMoveHelp")}`}
                    aria-pressed={keyboardDraggedField === field}
                    onKeyDown={(event) => handleOrderKeyDown(event, field)}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", field);
                    }}
                    onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
                    onDragEnd={() => setColumnAnnouncement("")}
                    onDrop={(event) => {
                      event.preventDefault();
                      const source = event.dataTransfer.getData("text/plain") as IssueSortField;
                      handleOrderMove(source, field);
                      setColumnAnnouncement(t("ganttColumnMoved", {
                        column: columns.find((column) => column.field === source)?.label,
                        position: visibleOrder.indexOf(field) + 1,
                      }));
                    }}
                  >{label}</button>
                  )}
                </div>
              ))}
            </div>
            <div className="gantt-calendar-cell" role="columnheader">
              <GanttCalendarHeader cells={cells} scale={scale} today={today} visibleDate={visibleDate} />
            </div>
          </div>
          <div className="gantt-row-group" role="rowgroup" aria-label={t("scheduledIssues")}>
            {scheduledIssues.map((issue) => renderIssueRow(issue, "scheduled"))}
          </div>
          {unscheduledIssues.length > 0 && (
            <div className="gantt-row-section" role="rowgroup" aria-label={`${t("unscheduled")} (${formatNumber(unscheduledIssues.length, i18n.language)})`}>
              <h2>{t("unscheduled")} <span>（{formatNumber(unscheduledIssues.length, i18n.language)}）</span></h2>
              {unscheduledIssues.map((issue) => renderIssueRow(issue, "unscheduled"))}
            </div>
          )}
          {anomalousIssues.length > 0 && (
            <div className="gantt-row-section" role="rowgroup" aria-label={`${t("dateAnomalies")} (${formatNumber(anomalousIssues.length, i18n.language)})`}>
              <h2>{t("dateAnomalies")} <span>（{formatNumber(anomalousIssues.length, i18n.language)}）</span></h2>
              {anomalousIssues.map((issue) => renderIssueRow(issue, "anomaly"))}
            </div>
          )}
        </div>
      )}
      {scheduledIssues.length > 0 && (
        <input
          className="gantt-horizontal-scrollbar"
          type="range"
          aria-label={t("timeline")}
          aria-valuetext={visibleDate}
          min={0}
          max={chartMaxScroll}
          step={1}
          value={Math.min(chartScrollLeft, chartMaxScroll)}
          disabled={chartMaxScroll === 0}
          onChange={(event) => {
            if (chartScrollRef.current) chartScrollRef.current.scrollLeft = Number(event.target.value);
          }}
        />
      )}
      {scheduledIssues.length === 0 && visibleIssues.length > 0 && (
        <div ref={chartScrollRef} className="gantt-chart-scroll gantt-chart-scroll--empty" role="grid" aria-label={t("ganttLabel")} style={{ "--gantt-fields-template": fieldGridTemplate, "--gantt-timeline-width": `${timelineWidth}px`, "--gantt-fields-width": `${fieldsWidth}px` } as CSSProperties} onScroll={(event) => setChartScrollLeft(event.currentTarget.scrollLeft)}>
          <div className="gantt-chart-header" role="row">
            <div className="gantt-header-fields" role="presentation">
              {columns.map(({ field, label }) => <div className="gantt-column-heading" role="columnheader" key={field}>{label}</div>)}
            </div>
            <div className="gantt-calendar-cell" role="columnheader"><GanttCalendarHeader cells={cells} scale={scale} today={today} visibleDate={initialDate} /></div>
          </div>
          <p className="gantt-no-timeline-dates">{t("noTimelineDates")}</p>
          {unscheduledIssues.length > 0 && (
            <div className="gantt-row-section" role="rowgroup" aria-label={`${t("unscheduled")} (${formatNumber(unscheduledIssues.length, i18n.language)})`}>
              <h2>{t("unscheduled")} <span>（{formatNumber(unscheduledIssues.length, i18n.language)}）</span></h2>
              {unscheduledIssues.map((issue) => renderIssueRow(issue, "unscheduled"))}
            </div>
          )}
          {anomalousIssues.length > 0 && (
            <div className="gantt-row-section" role="rowgroup" aria-label={`${t("dateAnomalies")} (${formatNumber(anomalousIssues.length, i18n.language)})`}>
              <h2>{t("dateAnomalies")} <span>（{formatNumber(anomalousIssues.length, i18n.language)}）</span></h2>
              {anomalousIssues.map((issue) => renderIssueRow(issue, "anomaly"))}
            </div>
          )}
        </div>
      )}
      {scheduledIssues.length === 0 && visibleIssues.length > 0 && (
        <input
          className="gantt-horizontal-scrollbar"
          type="range"
          aria-label={t("timeline")}
          aria-valuetext={visibleDate}
          min={0}
          max={chartMaxScroll}
          step={1}
          value={Math.min(chartScrollLeft, chartMaxScroll)}
          disabled={chartMaxScroll === 0}
          onChange={(event) => {
            if (chartScrollRef.current) chartScrollRef.current.scrollLeft = Number(event.target.value);
          }}
        />
      )}
      {visibleIssues.length === 0 && (
        <EmptyState>{emptyMessage ?? (assignee === "self" && !login ? t("loadingCurrentUserIssues") : t("noFilteredIssues"))}</EmptyState>
      )}
      <div className="sr-only" role="status" aria-live="polite">{columnAnnouncement}</div>
      <GanttViewOptionsDialog
        open={optionsOpen}
        preference={preference}
        onClose={() => setOptionsOpen(false)}
        onChange={updatePreference}
      />
    </section>
  );
}

function measureIntrinsicWidth(element: HTMLElement): number {
  const probe = element.cloneNode(true) as HTMLElement;
  probe.style.position = "fixed";
  probe.style.left = "-10000px";
  probe.style.top = "0";
  probe.style.width = "max-content";
  probe.style.minWidth = "0";
  probe.style.maxWidth = "none";
  probe.style.whiteSpace = "nowrap";
  probe.style.overflow = "visible";
  probe.style.visibility = "hidden";
  document.body.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width;
}

function sameFields(left: IssueSortField[], right: IssueSortField[]): boolean {
  return left.length === right.length && left.every((field) => right.includes(field));
}
