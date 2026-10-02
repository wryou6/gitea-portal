import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "../../components/layout/PageHeader";
import { AppShell } from "../../components/layout/AppShell";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { LoadingState } from "../../components/feedback/LoadingState";
import { GanttBoard } from "./GanttBoard";
import { demoIssue } from "../../stories/fixtures";
import { DEFAULT_GANTT_COLUMN_ORDER, GANTT_FIXED_FIELDS } from "./gantt-view-preference";
import type { Issue, IssueSortField } from "../../lib/api";
import { useTranslation } from "react-i18next";
import { IssueTypeBadge } from "../../components/ui/IssueTypeBadge";
import { PriorityBadge } from "../../components/ui/PriorityBadge";
import { ScheduleDates, formatScheduleDate } from "../issues/ScheduleDates";
import { issueStatusTranslationKey } from "../../i18n/status";
import { addCalendarDays, localCalendarDate } from "./gantt-timeline";
import { useState } from "react";
import { WorkViewFilterBar } from "./WorkViewFilterBar";
import { defaultWorkViewFilters, type WorkViewFilters } from "./work-view-filters";

const baselineIssues: Issue[] = [
  demoIssue,
  { ...demoIssue, number: 49, title: "Recently completed planning task", state: "closed", status: "done", closedAt: new Date().toISOString() },
  { ...demoIssue, owner: "platform", name: "service-api", title: "Same issue number in another repository", startDate: "2026-07-08", dueDate: "2026-07-15" },
  { ...demoIssue, owner: "platform", name: "service-api", number: 43, title: "Improve API request validation", startDate: "2026-07-10", dueDate: "2026-07-14" },
  { ...demoIssue, owner: "frontend", name: "portal", number: 44, title: "Refine repository navigation", startDate: "2026-07-12", dueDate: "2026-07-18" },
  { ...demoIssue, owner: "platform", name: "service-api", number: 45, title: "Document the deployment workflow", startDate: "2026-07-16", dueDate: "2026-07-22" },
  { ...demoIssue, owner: "frontend", name: "portal", number: 46, title: "Add compact issue filtering controls", startDate: "2026-07-19", dueDate: "2026-07-23" },
  { ...demoIssue, owner: "platform", name: "service-api", number: 47, title: "Review service health reporting", startDate: "2026-07-24", dueDate: "2026-07-28" },
  { ...demoIssue, owner: "frontend", name: "portal", number: 48, title: "Improve timeline keyboard navigation", startDate: "2026-07-26", dueDate: "2026-07-30" },
];

function GanttBeforeReference() {
  const { t: tViews, i18n } = useTranslation("work-views");
  const { t: tIssues } = useTranslation("issues");
  const minDay = Date.parse("2026-07-08T00:00:00Z");
  const maxDay = Date.parse("2026-09-30T00:00:00Z");
  const daySpan = maxDay - minDay;
  return (
    <section className="gantt-view" style={{ gap: "1.25rem" }}>
      <PageHeader eyebrow={tViews("ganttEyebrow")} title={tViews("allRepositories")} description={tViews("ganttDescription")} />
      <div className="gantt-filters" style={{ padding: "0.9rem" }}>
        <label className="field"><span>{tViews("currentAssignee")}</span><select><option>{tViews("currentUserAssignee", { login: "（engineer）" })}</option></select></label>
        <fieldset><legend>{tViews("issueState")}</legend><label><input type="checkbox" checked readOnly /> {tViews("open")}</label><label><input type="checkbox" checked readOnly /> {tViews("closed")}</label></fieldset>
      </div>
      <section style={{ display: "grid", gap: "0.55rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(13rem, 0.8fr) minmax(20rem, 1.2fr)", gap: "1rem", color: "var(--muted-foreground)", fontSize: "0.78rem" }}>
          <span>{formatScheduleDate("2026-07-08")}</span><span style={{ textAlign: "right" }}>{formatScheduleDate("2026-09-30")}</span>
        </div>
        {baselineIssues.map((issue) => {
          const start = Date.parse(`${issue.startDate}T00:00:00Z`);
          const end = Date.parse(`${issue.dueDate}T00:00:00Z`);
          return (
            <article key={`${issue.owner}/${issue.name}#${issue.number}`} style={{ display: "grid", gridTemplateColumns: "minmax(13rem, 0.8fr) minmax(20rem, 1.2fr)", gap: "1rem", alignItems: "center", minHeight: "4.7rem", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)", padding: "0.7rem 0.8rem" }}>
              <div style={{ display: "grid", gap: "0.15rem", minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.35rem 0.55rem", minWidth: 0 }}>
                  <a href="#" style={{ minWidth: 0, overflowWrap: "anywhere", fontWeight: 700, color: "var(--foreground)" }}>{issue.title}</a>
                  <IssueTypeBadge type={issue.type} labels={issue.labels} /><PriorityBadge priority={issue.priority} labels={issue.labels} />
                </div>
                <small style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.35rem 0.65rem", color: "var(--muted-foreground)" }}>
                  <span>{issue.owner}/{issue.name} #{issue.number}</span>
                  <span className={`issue-status issue-status--${issue.status}`}>{tIssues(issueStatusTranslationKey(issue.status))}</span>
                  <span>{tViews("currentAssignee")}: {issue.currentOwner}</span>
                </small>
                <small style={{ color: "var(--foreground)", fontWeight: 600 }}>{tViews("nextAction", { action: tIssues("implement") })}</small>
                <ScheduleDates startDate={issue.startDate} dueDate={issue.dueDate} scheduleAnomaly={issue.scheduleAnomaly} className="schedule-dates--compact" />
              </div>
              <div style={{ position: "relative", minHeight: "1.5rem", borderBottom: "1px solid var(--border)", background: "repeating-linear-gradient(90deg, transparent 0, transparent calc(10% - 1px), var(--border) 10%)" }}>
                <span style={{ position: "absolute", top: "0.25rem", left: `${((start - minDay) / daySpan) * 100}%`, width: `${((end - start) / daySpan) * 100}%`, height: "1rem", minWidth: "0.25rem", borderRadius: "999px", background: "var(--primary)" }} />
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
}

function GanttScreen({
  scale = "day",
  startDate = addCalendarDays(localCalendarDate(), -7),
  viewOptionsOpen = false,
  longTitle = false,
  fillViewport = false,
  longList = false,
  includeUnscheduled = true,
  statusColors = false,
  repositoryScoped = false,
  visibleFields = GANTT_FIXED_FIELDS,
  columnOrder = DEFAULT_GANTT_COLUMN_ORDER,
  pendingOrder,
  keyboardDraggedField,
}: {
  scale?: "day" | "week" | "two-weeks" | "month";
  startDate?: string;
  viewOptionsOpen?: boolean;
  longTitle?: boolean;
  fillViewport?: boolean;
  longList?: boolean;
  includeUnscheduled?: boolean;
  statusColors?: boolean;
  repositoryScoped?: boolean;
  visibleFields?: typeof GANTT_FIXED_FIELDS;
  columnOrder?: IssueSortField[];
  pendingOrder?: IssueSortField[];
  keyboardDraggedField?: IssueSortField;
}) {
  const { t: tCommon } = useTranslation("common");
  const issues = longTitle
    ? baselineIssues.map((issue, index) => index === 0
      ? { ...issue, title: "Improve cross repository issue filtering and timeline navigation with a deliberately long title that should stay on one line and end with a clean ellipsis" }
      : issue)
    : baselineIssues;
  const displayedIssues = longList
    ? Array.from({ length: 24 }, (_, index) => {
      const issue = issues[index % issues.length]!;
      const issueStart = new Date(`${startDate}T00:00:00Z`);
      issueStart.setUTCDate(issueStart.getUTCDate() + index - 7);
      const dueDate = new Date(issueStart);
      dueDate.setUTCDate(dueDate.getUTCDate() + 4);
      return {
        ...issue,
        number: 100 + index,
        title: `${issue.title} ${index + 1}`,
        startDate: issueStart.toISOString().slice(0, 10),
        dueDate: dueDate.toISOString().slice(0, 10),
      };
    })
    : issues;
  const scopedIssues = repositoryScoped
    ? displayedIssues.filter((issue) => issue.owner === "frontend" && issue.name === "portal")
    : displayedIssues;
  const statusColorIssues: Issue[] = [
    { ...demoIssue, number: 61, title: "Todo schedule", status: "todo" },
    { ...demoIssue, number: 62, title: "In Progress schedule", status: "in-progress" },
    { ...demoIssue, number: 63, title: "Done schedule", status: "done", state: "closed", closedAt: new Date().toISOString() },
    {
      ...demoIssue,
      number: 64,
      title: "Status and schedule anomaly",
      status: "anomaly",
      statusAnomaly: { reason: "missing_status", labels: [] },
      scheduleStatus: "invalid",
      scheduleAnomaly: "invalid_due_date",
      dueDate: null,
    },
  ];

  return (
    <section className={fillViewport ? "gantt-story-shell" : undefined}>
      <PageHeader
        title={repositoryScoped ? "frontend/portal" : tCommon("gantt")}
        compact
      />
      <GanttBoard
        demo
        demoInitialDate={startDate}
        demoScale={scale}
        demoViewOptionsOpen={viewOptionsOpen}
        demoPendingOrder={pendingOrder}
        demoKeyboardDraggedField={keyboardDraggedField}
        demoPreference={{
          version: 1,
          visibleFields: [...visibleFields],
          columnOrder: [...columnOrder],
        }}
        repository={repositoryScoped ? { owner: "frontend", name: "portal" } : undefined}
        issues={[
          ...(statusColors ? statusColorIssues : scopedIssues),
          ...(includeUnscheduled ? [{
            ...demoIssue,
            ...(repositoryScoped ? { owner: "frontend", name: "portal" } : {}),
            number: 51,
            title: "尚未安排日期的工作",
            startDate: null,
            dueDate: null,
            scheduleStatus: "unscheduled" as const,
          }] : []),
        ]}
      />
    </section>
  );
}

function GanttEmptyState() {
  const { t } = useTranslation("work-views");
  return <EmptyState>{t("noFilteredIssues")}</EmptyState>;
}

function GanttErrorState() {
  const { t } = useTranslation("work-views");
  return <><ErrorNotice message={t("viewLoadError")} /><button type="button">{t("retry")}</button></>;
}

const meta = { title: "Work views/Gantt", component: GanttScreen } satisfies Meta<
  typeof GanttScreen
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const BeforeReference: Story = { render: () => <GanttBeforeReference /> };
export const Default: Story = {};
export const DesktopWorkspace: Story = {
  parameters: { layout: "fullscreen" },
  args: { longList: true, fillViewport: true },
  decorators: [(Story) => <AppShell login="engineer" routePathname="/" routeSearch="" workspaceRepositories={[]}><Story /></AppShell>],
};
export const DesktopWorkspaceDark: Story = { ...DesktopWorkspace, globals: { theme: "dark" } };
export const StatusColors: Story = { args: { statusColors: true } };
export const StatusColorsDarkTheme: Story = {
  args: { statusColors: true },
  globals: { theme: "dark" },
};
export const StatusColorsNarrow: Story = {
  args: { statusColors: true },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
export const RepositoryScoped: Story = { args: { repositoryScoped: true } };
export const WeekScale: Story = { args: { scale: "week" } };
export const TwoWeekScale: Story = { args: { scale: "two-weeks" } };
export const MonthScale: Story = { args: { scale: "month" } };
export const CustomStartDate: Story = { args: { startDate: "2026-07-08", scale: "day" } };
export const OptionalColumns: Story = { args: { visibleFields: [...GANTT_FIXED_FIELDS, "type", "priority"] } };
export const KeyColumnVisible: Story = { args: { visibleFields: [...GANTT_FIXED_FIELDS, "key"] } };
export const PendingColumnOrder: Story = {
  args: { pendingOrder: ["assignee", "title", "status", "type", "key", "priority", "createdAt", "author"] },
};
export const SavedColumnOrder: Story = {
  args: { columnOrder: ["assignee", "title", "status", "type", "key", "priority", "createdAt", "author"] },
};
export const KeyboardReordering: Story = { args: { keyboardDraggedField: "assignee" } };
export const ViewOptionsOpen: Story = { args: { viewOptionsOpen: true } };
export const LongTitle: Story = { args: { longTitle: true } };
export const NarrowViewOptionsOpen: Story = {
  args: { viewOptionsOpen: true },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
export const ScrollableRows: Story = { args: { fillViewport: true, longList: true } };
export const NoUnscheduledIssues: Story = { args: { fillViewport: true, longList: true, includeUnscheduled: false } };
export const NarrowHorizontalScroll: Story = {
  args: { scale: "day" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
export const DarkTheme: Story = {
  globals: { theme: "dark" },
};
export const Loading: Story = { render: () => <LoadingState /> };
export const Empty: Story = { render: () => <GanttEmptyState /> };
export const ErrorWithRetry: Story = { render: () => <GanttErrorState /> };

export const SharedFiltersAndGantt: Story = {
  render: () => <SharedFiltersGanttComposition />,
};

function SharedFiltersGanttComposition() {
  const [filters, setFilters] = useState<WorkViewFilters>(() => ({ ...defaultWorkViewFilters, assignee: "engineer" }));
  const [recentDoneOnly, setRecentDoneOnly] = useState(true);
  return <section>
      <GanttBoard issues={baselineIssues} filters={filters} recentDoneOnly={recentDoneOnly} onRecentDoneOnlyChange={setRecentDoneOnly} filterControls={<WorkViewFilterBar filters={filters} onChange={setFilters} assignees={["engineer"]} currentUserLogin="engineer" recentDoneOnly={recentDoneOnly} onRecentDoneOnlyChange={setRecentDoneOnly} />} demo demoInitialDate={localCalendarDate()} demoScale="week" />
  </section>;
}
