import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../components/ui/Badge";
import type { Repository } from "../../lib/api";
import { countActiveWorkViewFilters, createClearedWorkViewFilters, type WorkViewFilters } from "./work-view-filters";
import { useWorkViewFilterLabels } from "./work-view-filter-labels";

const priorities = ["critical", "high", "medium", "low"] as const;
const issueTypes = ["bug", "feature", "task"] as const;
const statuses = ["todo", "in-progress", "done"] as const;

function ChoiceFilter<T extends string>({
  label,
  value,
  options,
  allLabel,
  optionLabel,
  badgeClassName,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  allLabel: string;
  optionLabel: (value: T) => string;
  badgeClassName: (value: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="work-view-filter work-view-filter--choice">
      <legend>{label}</legend>
      <div className="work-view-choice-buttons" role="group" aria-label={label}>
        <button type="button" className="work-view-filter-badge-button" aria-pressed={value === "all"} onClick={() => onChange("all" as T)}><Badge className="work-view-filter-option-badge">{allLabel}</Badge></button>
        {options.map((option) => (
          <button key={option} type="button" className="work-view-filter-badge-button" aria-pressed={value === option} onClick={() => onChange(option)}><Badge className={`work-view-filter-option-badge ${badgeClassName(option)}`}>{optionLabel(option)}</Badge></button>
        ))}
      </div>
    </fieldset>
  );
}

export function WorkViewFilterBar({
  filters,
  onChange,
  repositories = [],
  assignees = [],
  currentUserLogin,
  repositoryFixed = false,
}: {
  filters: WorkViewFilters;
  onChange: (next: WorkViewFilters) => void;
  repositories?: Repository[];
  assignees?: string[];
  currentUserLogin?: string;
  repositoryFixed?: boolean;
}) {
  const { t } = useTranslation(["work-views", "issues"]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const count = countActiveWorkViewFilters(repositoryFixed ? { ...filters, repository: "all" } : filters);
  const { activeFilters: chips, labelFor, filterHeading } = useWorkViewFilterLabels(filters, repositoryFixed);
  const advancedCount = Number(!repositoryFixed && filters.repository !== "all") + Number(Boolean(filters.label.trim())) + Number(Boolean(filters.milestone.trim()));
  const update = <K extends keyof WorkViewFilters>(key: K, value: WorkViewFilters[K]) =>
    onChange({ ...filters, [key]: value });
  const clear = () => onChange({ ...createClearedWorkViewFilters(), repository: repositoryFixed ? filters.repository : "all" });
  const selectedAssignee = filters.assignee === "all" || filters.assignee === "me" ? "" : filters.assignee;
  const selectableAssignees = [...new Set([
    ...assignees.filter((login) => login !== "unassigned"),
    ...(selectedAssignee && !assignees.includes(selectedAssignee) && selectedAssignee !== "unassigned" ? [selectedAssignee] : []),
  ])].sort((left, right) => left.localeCompare(right));
  return (
    <section className="work-view-filters" aria-label={t("filterIssues")}>
      <h3 className="work-view-controls-section-title">{t("commonFilters")}</h3>
      <div className="work-view-filters-primary">
        <ChoiceFilter label={String(t("priorityLabel", { ns: "issues" }))} value={filters.priority} options={priorities} allLabel={String(t("allFilterValues"))} optionLabel={(value) => labelFor("priority", value)} badgeClassName={(value) => `priority-badge priority-badge--${value}`} onChange={(value) => update("priority", value)} />
        <ChoiceFilter label={String(t("type", { ns: "issues" }))} value={filters.issueType} options={issueTypes} allLabel={String(t("allFilterValues"))} optionLabel={(value) => labelFor("issueType", value)} badgeClassName={(value) => `issue-type-badge issue-type-badge--${value}`} onChange={(value) => update("issueType", value)} />
        <ChoiceFilter label={String(t("status", { ns: "issues" }))} value={filters.state} options={statuses} allLabel={String(t("allFilterValues"))} optionLabel={(value) => labelFor("state", value)} badgeClassName={(value) => `issue-status issue-status--${value}`} onChange={(value) => update("state", value)} />
        <div className="work-view-filter work-view-filter--assignee">
          <label htmlFor="work-view-assignee-input">{t("assignee", { ns: "issues" })}</label>
          <div className="work-view-assignee-shortcuts" role="group" aria-label={t("assigneeShortcuts")}>
            <button type="button" className="work-view-assignee-shortcut" aria-pressed={filters.assignee === "me"} disabled={!currentUserLogin} onClick={() => update("assignee", "me")}>{t("assigneeSelf")}</button>
            <button type="button" className="work-view-assignee-shortcut" aria-pressed={filters.assignee === "all"} onClick={() => update("assignee", "all")}>{t("allAssignees")}</button>
          </div>
          <select id="work-view-assignee-input" className="work-view-assignee-select" value={selectedAssignee} onChange={(event) => update("assignee", event.target.value || "all")}>
            <option value="">{t("selectAssignee")}</option>
            <option value="unassigned">{t("unassigned", { ns: "work-views" })}</option>
            {selectableAssignees.map((login) => <option key={login} value={login}>{login}</option>)}
          </select>
        </div>
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
