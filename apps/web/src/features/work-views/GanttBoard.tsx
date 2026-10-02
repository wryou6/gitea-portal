import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { WorkViewLayout } from "./WorkViewLayout";
import { WorkViewFilterBar } from "./WorkViewFilterBar";
import { EmptyState } from "../../components/feedback/EmptyState";
import { api, type Issue, type IssueSortField } from "../../lib/api";
import { routePaths } from "../../app/routes";
import { formatNumber } from "../../i18n/format";
import { useTranslation } from "react-i18next";
import { GanttIssueRow, type GanttColumn, type GanttIssueRowVariant } from "./GanttIssueRow";
import { GanttCalendarHeader, GANTT_SCALE_WIDTH } from "./GanttCalendarHeader";
import { matchesRecentDoneVisibility, matchesWorkViewFilters, parseWorkViewFilters, type WorkViewFilters } from "./work-view-filters";
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
  shiftTimelineStartDate,
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
  filters: providedFilters,
  filterControls,
  currentUserLogin,
  recentDoneOnly: providedRecentDoneOnly,
  onRecentDoneOnlyChange,
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
  filters?: WorkViewFilters;
  filterControls?: ReactNode;
  currentUserLogin?: string;
  recentDoneOnly?: boolean;
  onRecentDoneOnlyChange?: (checked: boolean) => void;
}) {
  const { t, i18n } = useTranslation("work-views");
  const { t: tIssues } = useTranslation("issues");
  const [localRecentDoneOnly, setLocalRecentDoneOnly] = useState(true);
  const recentDoneOnly = providedRecentDoneOnly ?? localRecentDoneOnly;
  const updateRecentDoneOnly = onRecentDoneOnlyChange ?? setLocalRecentDoneOnly;
  const initialQuery = new URLSearchParams(window.location.search);
  const [login, setLogin] = useState<string>();
  const [localFilters, setLocalFilters] = useState(() => parseWorkViewFilters(window.location.search));
  const filters = providedFilters ?? localFilters;
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
    void api<{ login: string }>("/api/session").then((session) => {
      if (!cancelled) setLogin(session.login);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [demo]);

  useEffect(() => {
    if (!login) {
      setPreference(defaultGanttViewPreference());
      return;
    }
    setPreference(demoPreference ?? readGanttViewPreference(login));
    setPendingOrder(demoPendingOrder ? [...demoPendingOrder] : undefined);
  }, [login, demoPreference, demoPendingOrder]);

  useEffect(() => {
    if (demo) return;
    const params = new URLSearchParams(window.location.search);
    params.set("gantt_start", initialDate);
    params.set("gantt_scale", scale);
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [demo, initialDate, scale]);

  const visibleIssues = issues.filter((issue) => matchesWorkViewFilters(issue, filters, currentUserLogin ?? login) && matchesRecentDoneVisibility(issue, recentDoneOnly));
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
      <WorkViewLayout filters={filters} resultCount={visibleIssues.length} recentDoneOnly={recentDoneOnly} repositoryFixed={Boolean(repository)} controls={<>
      {filterControls ?? <WorkViewFilterBar filters={filters} onChange={setLocalFilters} repositoryFixed={Boolean(repository)} assignees={[...new Set(issues.flatMap((issue) => issue.assignees))].sort()} currentUserLogin={currentUserLogin ?? login} recentDoneOnly={recentDoneOnly} onRecentDoneOnlyChange={updateRecentDoneOnly} />}
      <div className="gantt-toolbar" role="group" aria-label={t("timelineControls")}>
        <h3 className="work-view-controls-section-title">{t("timeline")}</h3>
        <div className="gantt-date-navigation">
          <button
            className="secondary gantt-period-button"
            type="button"
            aria-label={t("previousTimelinePeriod")}
            onClick={() => setInitialDate((date) => shiftTimelineStartDate(date, scale, -1))}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <label className="gantt-start-date" htmlFor="gantt-start-date">
            <span>{t("ganttStartDate")}</span>
            <input id="gantt-start-date" type="date" value={initialDate} onChange={(event) => {
              if (isCalendarDate(event.target.value)) setInitialDate(event.target.value);
            }} />
          </label>
          <button className="secondary gantt-today-button" type="button" onClick={() => setInitialDate(defaultDate)}>{t("today")}</button>
          <button
            className="secondary gantt-period-button"
            type="button"
            aria-label={t("nextTimelinePeriod")}
            onClick={() => setInitialDate((date) => shiftTimelineStartDate(date, scale, 1))}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
        <label className="gantt-scale" htmlFor="gantt-scale">
          <span>{t("scale")}</span>
          <select id="gantt-scale" value={scale} onChange={(event) => setScale(parseGanttScale(event.target.value))}>
            <option value="day">{t("scaleDay")}</option>
            <option value="week">{t("scaleWeek")}</option>
            <option value="two-weeks">{t("scaleTwoWeeks")}</option>
            <option value="month">{t("scaleMonth")}</option>
          </select>
        </label>
        <h3 className="work-view-controls-section-title">{tIssues("viewOptions")}</h3>
        <div className="gantt-toolbar-actions">
          {hasPendingOrder && <button type="button" onClick={() => updatePreference({ ...preference, columnOrder: [...columnOrder] })}>{t("ganttSaveColumnOrder")}</button>}
          {needsRestore && <button className="secondary" type="button" onClick={restoreDefaults}>{t("ganttRestoreColumnDefaults")}</button>}
          <button
            className="secondary gantt-view-options-button"
            type="button"
            aria-label={t("ganttViewOptions")}
            aria-haspopup="dialog"
            title={t("ganttViewOptions")}
            onClick={() => setOptionsOpen(true)}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
              <path d="M5 2.5v3M10.5 6.5v3M7.5 10.5v3" />
            </svg>
            <span>{t("ganttViewOptions")}</span>
          </button>
        </div>
      </div>
      </>}>
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
        <EmptyState>{emptyMessage ?? t("noFilteredIssues")}</EmptyState>
      )}
      <div className="sr-only" role="status" aria-live="polite">{columnAnnouncement}</div>
      <GanttViewOptionsDialog
        open={optionsOpen}
        preference={preference}
        onClose={() => setOptionsOpen(false)}
        onChange={updatePreference}
      />
      </WorkViewLayout>
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
