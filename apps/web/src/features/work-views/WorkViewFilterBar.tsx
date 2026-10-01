import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Repository } from "../../lib/api";
import { countActiveWorkViewFilters, defaultWorkViewFilters, type WorkViewFilters } from "./work-view-filters";
import { useWorkViewFilterLabels } from "./work-view-filter-labels";

export function WorkViewFilterBar({
  filters,
  onChange,
  repositories = [],
  assignees = [],
  repositoryFixed = false,
}: {
  filters: WorkViewFilters;
  onChange: (next: WorkViewFilters) => void;
  repositories?: Repository[];
  assignees?: string[];
  repositoryFixed?: boolean;
}) {
  const { t } = useTranslation(["work-views", "issues"]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const count = countActiveWorkViewFilters(repositoryFixed ? { ...filters, repository: "all" } : filters);
  const { activeFilters: chips, labelFor, filterHeading } = useWorkViewFilterLabels(filters, repositoryFixed);
  const advancedCount = Number(!repositoryFixed && filters.repository !== "all") + Number(Boolean(filters.label.trim())) + Number(Boolean(filters.milestone.trim()));
  const update = <K extends keyof WorkViewFilters>(key: K, value: WorkViewFilters[K]) =>
    onChange({ ...filters, [key]: value });
  const clear = () => onChange({ ...defaultWorkViewFilters, repository: repositoryFixed ? filters.repository : "all" });
  return (
    <section className="work-view-filters" aria-label={t("filterIssues")}>
      <h3 className="work-view-controls-section-title">{t("commonFilters")}</h3>
      <div className="work-view-filters-primary">
        <label className="work-view-filter"><span>{t("priorityLabel", { ns: "issues" })}</span><select value={filters.priority} onChange={(event) => update("priority", event.target.value as WorkViewFilters["priority"])}><option value="all">{t("allFilterValues")}</option>{["critical", "high", "medium", "low"].map((value) => <option key={value} value={value}>{labelFor("priority", value)}</option>)}</select></label>
        <label className="work-view-filter"><span>{t("type", { ns: "issues" })}</span><select value={filters.issueType} onChange={(event) => update("issueType", event.target.value as WorkViewFilters["issueType"])}><option value="all">{t("allFilterValues")}</option>{["bug", "feature", "task"].map((value) => <option key={value} value={value}>{labelFor("issueType", value)}</option>)}</select></label>
        <label className="work-view-filter"><span>{t("status", { ns: "issues" })}</span><select value={filters.state} onChange={(event) => update("state", event.target.value as WorkViewFilters["state"])}><option value="all">{t("allFilterValues")}</option>{["todo", "in-progress", "done"].map((value) => <option key={value} value={value}>{labelFor("state", value)}</option>)}</select></label>
        <label className="work-view-filter"><span>{t("assignee", { ns: "issues" })}</span><input list="work-view-assignees" value={filters.assignee === "all" ? "" : filters.assignee} onChange={(event) => update("assignee", event.target.value || "all")} /><datalist id="work-view-assignees"><option value="unassigned" label={String(t("unassigned", { ns: "work-views" }))} />{assignees.map((login) => <option key={login} value={login} />)}</datalist></label>
        <button type="button" className="work-view-filter-clear" onClick={clear} disabled={!count}>{t("clearFilters")}</button>
      </div>
      <details className="work-view-filters-advanced" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
        <summary>{t("advancedFilters")} {advancedCount > 0 && <span className="work-view-filter-count">{advancedCount}</span>}</summary>
        <div className="work-view-filters-advanced-fields">
          {!repositoryFixed && <label className="work-view-filter"><span>{t("repository", { ns: "issues" })}</span><select value={filters.repository} onChange={(event) => update("repository", event.target.value)}><option value="all">{t("allRepositories", { ns: "work-views" })}</option>{repositories.map((repository) => <option key={`${repository.owner}/${repository.name}`} value={`${repository.owner}/${repository.name}`}>{repository.fullName}</option>)}</select></label>}
          <label className="work-view-filter"><span>{t("label", { ns: "issues" })}</span><input value={filters.label} onChange={(event) => update("label", event.target.value)} /></label>
          <label className="work-view-filter"><span>{t("milestone", { ns: "issues" })}</span><input value={filters.milestone} onChange={(event) => update("milestone", event.target.value)} /></label>
        </div>
      </details>
      {chips.length > 0 && <ul className="work-view-filter-chips" aria-label={t("activeFilters")}>
        {chips.map(([key, value]) => <li key={key}><span>{filterHeading(key)}: {labelFor(key, String(value))}</span><button type="button" aria-label={t("removeFilter", { filter: labelFor(key, String(value)) })} onClick={() => update(key as keyof WorkViewFilters, key === "label" || key === "milestone" ? "" : "all" as never)}>×</button></li>)}
      </ul>}
    </section>
  );
}
