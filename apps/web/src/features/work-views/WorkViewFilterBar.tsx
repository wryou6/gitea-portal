import { useTranslation } from "react-i18next";
import { Badge } from "../../components/ui/Badge";
import { countActiveWorkViewFilters, createClearedWorkViewFilters, type WorkViewFilters } from "./work-view-filters";
import { useWorkViewFilterLabels } from "./work-view-filter-labels";
import { profileFor, userOptionLabel } from "../../lib/user-profiles";
import type { UserProfiles } from "../../lib/user-profiles";

const priorities = ["critical", "high", "medium", "low"] as const;
const issueTypes = ["bug", "feature", "task"] as const;
const statuses = ["todo", "in-progress", "done"] as const;

export function WorkViewRecentDoneFilter({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const { t } = useTranslation("work-views");
  return (
    <label className="work-view-filter work-view-filter--checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span>{t("recentDoneOnly")}</span>
    </label>
  );
}

function ChoiceFilter<T extends string>({
  label,
  values,
  options,
  allLabel,
  optionLabel,
  badgeClassName,
  onToggle,
  onClear,
  shortcut,
}: {
  label: string;
  values: readonly T[];
  options: readonly T[];
  allLabel: string;
  optionLabel: (value: T) => string;
  badgeClassName: (value: T) => string;
  onToggle: (value: T) => void;
  onClear: () => void;
  shortcut?: { label: string; accessibleName: string; pressed: boolean; onSelect: () => void };
}) {
  return (
    <div className="work-view-filter work-view-filter--choice" role="group" aria-label={label}>
      <span className="work-view-filter-label">{label}</span>
      <div className="work-view-choice-buttons">
        <button type="button" className="work-view-filter-badge-button" aria-pressed={values.length === 0} onClick={onClear}><Badge className="work-view-filter-option-badge">{allLabel}</Badge></button>
        {shortcut && <button type="button" className="work-view-filter-badge-button" aria-label={shortcut.accessibleName} aria-pressed={shortcut.pressed} onClick={shortcut.onSelect}><Badge className="work-view-filter-option-badge">{shortcut.label}</Badge></button>}
        {options.map((option) => (
          <button key={option} type="button" className="work-view-filter-badge-button" aria-pressed={values.includes(option)} onClick={() => onToggle(option)}><Badge className={`work-view-filter-option-badge ${badgeClassName(option)}`}>{optionLabel(option)}</Badge></button>
        ))}
      </div>
    </div>
  );
}

export function WorkViewFilterBar({
  filters,
  onChange,
  assignees = [],
  userProfiles,
  currentUserLogin,
  repositoryFixed = false,
}: {
  filters: WorkViewFilters;
  onChange: (next: WorkViewFilters) => void;
  assignees?: string[];
  userProfiles?: UserProfiles;
  currentUserLogin?: string;
  repositoryFixed?: boolean;
}) {
  const { t } = useTranslation(["work-views", "issues"]);
  const count = countActiveWorkViewFilters(repositoryFixed ? { ...filters, repository: "all" } : filters);
  const { activeFilters: chips, labelFor, filterHeading } = useWorkViewFilterLabels(filters, repositoryFixed, userProfiles);
  const update = <K extends keyof WorkViewFilters>(key: K, value: WorkViewFilters[K]) =>
    onChange({ ...filters, [key]: value });
  const toggleValue = <K extends "priority" | "issueType" | "state">(
    key: K,
    value: WorkViewFilters[K][number],
  ) => {
    const selected = filters[key] as string[];
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    update(key, next as WorkViewFilters[K]);
  };
  const removeChip = (key: string, value: string) => {
    if (key === "priority" || key === "issueType" || key === "state") {
      const selected = filters[key] as string[];
      update(key, selected.filter((item) => item !== value) as WorkViewFilters[typeof key]);
      return;
    }
    update(key as keyof WorkViewFilters, "all" as never);
  };
  const clear = () => onChange({ ...createClearedWorkViewFilters(), repository: repositoryFixed ? filters.repository : "all" });
  const selectedAssignee = filters.assignee === "all" || filters.assignee === "me" ? "" : filters.assignee;
  const selectableAssignees = [...new Set([
    ...assignees.filter((login) => login !== "unassigned"),
    ...(selectedAssignee && !assignees.includes(selectedAssignee) && selectedAssignee !== "unassigned" ? [selectedAssignee] : []),
  ])].sort((left, right) => left.localeCompare(right));
  return (
    <section className="work-view-filters" aria-label={t("filterIssues")}>
      <div className="work-view-filters-primary">
        <div className="work-view-filter work-view-filter--assignee">
          <label htmlFor="work-view-assignee-input">{t("assignee", { ns: "issues" })}</label>
          <div className="work-view-assignee-shortcuts" role="group" aria-label={t("assigneeShortcuts")}>
            <button type="button" className="work-view-assignee-shortcut" aria-pressed={filters.assignee === "me"} disabled={!currentUserLogin} onClick={() => update("assignee", "me")}>{t("assigneeSelf")}</button>
            <button type="button" className="work-view-assignee-shortcut" aria-pressed={filters.assignee === "all"} onClick={() => update("assignee", "all")}>{t("allAssignees")}</button>
          </div>
          <select id="work-view-assignee-input" className="work-view-assignee-select" value={selectedAssignee} onChange={(event) => update("assignee", event.target.value || "all")}>
            <option value="">{t("selectAssignee")}</option>
            <option value="unassigned">{t("unassigned", { ns: "work-views" })}</option>
            {selectableAssignees.map((login) => <option key={login} value={login}>{userOptionLabel(profileFor(userProfiles, login))}</option>)}
          </select>
        </div>
        <ChoiceFilter label={String(t("status", { ns: "issues" }))} values={filters.state} options={statuses} allLabel={String(t("allFilterValues"))} optionLabel={(value) => labelFor("state", value)} badgeClassName={(value) => `issue-status issue-status--${value}`} onToggle={(value) => toggleValue("state", value)} onClear={() => update("state", [])} shortcut={{ label: String(t("unfinishedFilter")), accessibleName: String(t("unfinishedFilterAccessibleName")), pressed: filters.state.includes("todo") && filters.state.includes("in-progress"), onSelect: () => update("state", ["todo", "in-progress"]) }} />
        <ChoiceFilter label={String(t("priorityLabel", { ns: "issues" }))} values={filters.priority} options={priorities} allLabel={String(t("allFilterValues"))} optionLabel={(value) => labelFor("priority", value)} badgeClassName={(value) => `priority-badge priority-badge--${value}`} onToggle={(value) => toggleValue("priority", value)} onClear={() => update("priority", [])} />
        <ChoiceFilter label={String(t("type", { ns: "issues" }))} values={filters.issueType} options={issueTypes} allLabel={String(t("allFilterValues"))} optionLabel={(value) => labelFor("issueType", value)} badgeClassName={(value) => `issue-type-badge issue-type-badge--${value}`} onToggle={(value) => toggleValue("issueType", value)} onClear={() => update("issueType", [])} />
      </div>
      {(chips.length > 0 || count > 0) && <div className="work-view-filter-meta">
        {chips.length > 0 && <ul className="work-view-filter-chips" aria-label={t("activeFilters")}>
          {chips.map(([key, value]) => <li key={`${key}:${value}`}><span>{filterHeading(key)}: {labelFor(key, String(value))}</span><button type="button" aria-label={t("removeFilter", { filter: labelFor(key, String(value)) })} onClick={() => removeChip(key, String(value))}>×</button></li>)}
        </ul>}
        {count > 0 && <button type="button" className="work-view-filter-clear" onClick={clear}>{t("clearFilters")}</button>}
      </div>}
    </section>
  );
}
