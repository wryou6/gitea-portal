import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input } from "../../components/ui/Field";
import { Select } from "../../components/ui/Select";

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
}: {
  initial: IssueFiltersValue;
  onSubmit: (filters: IssueFiltersValue) => void;
}) {
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
        <FieldLabel htmlFor="issue-search">關鍵字</FieldLabel>
        <Input
          id="issue-search"
          placeholder="搜尋 Issue"
          value={filters.q}
          onChange={(e) => update("q", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="issue-repository">Repository</FieldLabel>
        <Input
          id="issue-repository"
          placeholder="owner/repository"
          value={filters.repository}
          onChange={(e) => update("repository", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="issue-state">狀態</FieldLabel>
        <Select
          id="issue-state"
          value={filters.state}
          onChange={(e) => update("state", e.target.value)}
        >
          <option value="all">全部</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="issue-assignee">Assignee</FieldLabel>
        <Input
          id="issue-assignee"
          placeholder="Assignee"
          value={filters.assignee}
          onChange={(e) => update("assignee", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="issue-label">Label</FieldLabel>
        <Input
          id="issue-label"
          placeholder="workflow 或一般分類"
          value={filters.label}
          onChange={(e) => update("label", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="issue-milestone">Milestone</FieldLabel>
        <Input
          id="issue-milestone"
          placeholder="Milestone"
          value={filters.milestone}
          onChange={(e) => update("milestone", e.target.value)}
        />
      </Field>
      <Button type="submit">搜尋</Button>
    </form>
  );
}
