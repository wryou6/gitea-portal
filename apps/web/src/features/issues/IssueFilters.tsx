import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input } from "../../components/ui/Field";
import { Select } from "../../components/ui/Select";
import { useTranslation } from "react-i18next";

export type IssueFiltersValue = {
  q: string;
  repository: string;
  state: string;
  assignee: string;
  label: string;
  milestone: string;
};

export function IssueFilters({
  initial,
  onSubmit,
  showRepository = true,
}: {
  initial: IssueFiltersValue;
  onSubmit: (filters: IssueFiltersValue) => void;
  showRepository?: boolean;
}) {
  const { t } = useTranslation("issues");
  const [filters, setFilters] = useState<IssueFiltersValue>(initial);
  const update = (key: keyof IssueFiltersValue, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  return (
    <form
      className="filters"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(filters);
      }}
    >
      <Field>
        <FieldLabel htmlFor="issue-search">{t("searchKeyword")}</FieldLabel>
        <Input
          id="issue-search"
          placeholder={t("searchIssues")}
          value={filters.q}
          onChange={(e) => update("q", e.target.value)}
        />
      </Field>
      {showRepository && (
        <Field>
          <FieldLabel htmlFor="issue-repository">{t("repository")}</FieldLabel>
          <Input
            id="issue-repository"
            placeholder={t("repositoryPlaceholder")}
            value={filters.repository}
            onChange={(e) => update("repository", e.target.value)}
          />
        </Field>
      )}
      <Field>
        <FieldLabel htmlFor="issue-state">{t("stateLabel")}</FieldLabel>
        <Select
          id="issue-state"
          value={filters.state}
          onChange={(e) => update("state", e.target.value)}
        >
          <option value="all">{t("allStatuses")}</option>
          <option value="todo">{t("workflowTodo")}</option>
          <option value="in-progress">{t("workflowInProgress")}</option>
          <option value="done">{t("workflowDone")}</option>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="issue-assignee">{t("assignee")}</FieldLabel>
        <Input
          id="issue-assignee"
          placeholder={t("assignee")}
          value={filters.assignee}
          onChange={(e) => update("assignee", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="issue-label">{t("label")}</FieldLabel>
        <Input
          id="issue-label"
          placeholder={t("labelFilterPlaceholder")}
          value={filters.label}
          onChange={(e) => update("label", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="issue-milestone">{t("milestone")}</FieldLabel>
        <Input
          id="issue-milestone"
          placeholder={t("milestone")}
          value={filters.milestone}
          onChange={(e) => update("milestone", e.target.value)}
        />
      </Field>
      <Button type="submit">{t("search")}</Button>
    </form>
  );
}
