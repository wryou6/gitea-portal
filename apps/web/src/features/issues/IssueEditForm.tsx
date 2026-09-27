import { FormEvent, useState } from "react";
import type { Issue } from "../../lib/api";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input, Textarea } from "../../components/ui/Field";
import { Select } from "../../components/ui/Select";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import {
  issueTypeStatusFromLabels,
  type IssueType,
} from "@gitea-portal/domain";
import { IssueTypeField } from "./IssueTypeField";
import { ScheduleDateFields } from "./ScheduleDateFields";

export function IssueEditForm({
  issue,
  onSaved,
}: {
  issue: Issue;
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState(issue.title);
  const [body, setBody] = useState(issue.body ?? "");
  const [type, setType] = useState<IssueType | "">(issue.type ?? "");
  const [assignee, setAssignee] = useState(issue.assignee ?? "");
  const [labels, setLabels] = useState(
    issue.labels
      .filter(
        (label) =>
          !label.name.startsWith("start-date:") &&
          !label.name.startsWith("type:"),
      )
      .map((label) => label.name)
      .join(", "),
  );
  const [milestone, setMilestone] = useState(issue.milestone ?? "");
  const [startDate, setStartDate] = useState(issue.startDate ?? "");
  const [dueDate, setDueDate] = useState(issue.dueDate ?? "");
  const [state, setState] = useState(issue.state);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const issueTypeStatus = issueTypeStatusFromLabels(issue.labels);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return setError("Title 不可為空白");
    if (!type) return setError("請選擇一種 Issue Type");
    setSaving(true);
    setError(undefined);
    try {
      await api(`/api/issues/${issue.owner}/${issue.name}/${issue.number}`, {
        method: "PATCH",
        body: JSON.stringify({
          expectedUpdatedAt: issue.updatedAt,
          title: title.trim(),
          type,
          body,
          state,
          assignee: assignee || null,
          labels: labels
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          milestone: milestone || null,
          startDate: startDate || null,
          dueDate: dueDate || null,
        }),
      });
      await onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "更新 Issue 失敗");
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="stack" onSubmit={submit}>
      <h2>編輯 Issue</h2>
      <Field>
        <FieldLabel htmlFor="edit-title">Title</FieldLabel>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <IssueTypeField
        id="edit-type"
        value={type}
        onChange={setType}
        status={issueTypeStatus}
      />
      <Field>
        <FieldLabel htmlFor="edit-body">Description</FieldLabel>
        <Textarea
          id="edit-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="edit-state">State</FieldLabel>
        <Select
          id="edit-state"
          value={state}
          onChange={(e) => setState(e.target.value as Issue["state"])}
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="edit-assignee">Assignee</FieldLabel>
        <Input
          id="edit-assignee"
          placeholder="Assignee login"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="edit-labels">Labels</FieldLabel>
        <Input
          id="edit-labels"
          placeholder="label-a, label-b"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
        />
      </Field>
      <ScheduleDateFields
        startDate={startDate}
        dueDate={dueDate}
        startDateId="edit-start-date"
        dueDateId="edit-due-date"
        onStartDateChange={setStartDate}
        onDueDateChange={setDueDate}
        showClearButtons
        disabled={saving}
      />
      <Field>
        <FieldLabel htmlFor="edit-milestone">Milestone</FieldLabel>
        <Input
          id="edit-milestone"
          placeholder="Milestone"
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
        />
      </Field>
      <Button disabled={saving} type="submit">
        {saving ? "儲存中…" : "儲存變更"}
      </Button>
      {error && <ErrorNotice message={error} />}
    </form>
  );
}
