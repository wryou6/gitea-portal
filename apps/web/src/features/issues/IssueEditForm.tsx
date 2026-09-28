import { FormEvent, useState } from "react";
import type { Issue } from "../../lib/api";
import { api, toUserFacingError, type UserFacingError } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input, Textarea } from "../../components/ui/Field";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import {
  issueTypeStatusFromLabels,
  type IssuePriority,
  type IssueType,
} from "@gitea-portal/domain";
import { IssueTypeField } from "./IssueTypeField";
import { PriorityField } from "./PriorityField";
import { ScheduleDateFields } from "./ScheduleDateFields";
import { useTranslation } from "react-i18next";

export function IssueEditForm({
  issue,
  onSaved,
}: {
  issue: Issue;
  onSaved: () => Promise<void>;
}) {
  const { t } = useTranslation("issues");
  const [title, setTitle] = useState(issue.title);
  const [body, setBody] = useState(issue.body ?? "");
  const [type, setType] = useState<IssueType | "">(issue.type ?? "");
  const [priority, setPriority] = useState<IssuePriority | "">(
    issue.priority ?? "",
  );
  const [labels, setLabels] = useState(
    issue.labels
      .filter(
        (label) =>
          !label.name.startsWith("start-date:") &&
          !label.name.startsWith("type:") &&
          !label.name.startsWith("priority:") &&
          !label.name.startsWith("status:") &&
          !label.name.startsWith("status-action:") &&
          !label.name.startsWith("workflow:") &&
          !label.name.startsWith("workflow-action:"),
      )
      .map((label) => label.name)
      .join(", "),
  );
  const [milestone, setMilestone] = useState(issue.milestone ?? "");
  const [startDate, setStartDate] = useState(issue.startDate ?? "");
  const [dueDate, setDueDate] = useState(issue.dueDate ?? "");
  const [error, setError] = useState<UserFacingError>();
  const [saving, setSaving] = useState(false);
  const issueTypeStatus = issueTypeStatusFromLabels(issue.labels);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return setError(t("titleRequired"));
    if (!type) return setError(t("typeRequired"));
    if (!priority) return setError(t("priorityRequired"));
    if (
      labels.split(",").some((label) => label.trim().startsWith("priority:"))
    ) {
      return setError(
        t("priorityLabelConflict"),
      );
    }
    setSaving(true);
    setError(undefined);
    try {
      await api(`/api/issues/${issue.owner}/${issue.name}/${issue.number}`, {
        method: "PATCH",
        body: JSON.stringify({
          expectedUpdatedAt: issue.updatedAt,
          title: title.trim(),
          type,
          priority,
          body,
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
      setError(toUserFacingError(cause, t("updateIssueFailed")));
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="stack" onSubmit={submit}>
      <h2>{t("editIssueTitle")}</h2>
      <Field>
        <FieldLabel htmlFor="edit-title">{t("title")}</FieldLabel>
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
      <PriorityField
        id="edit-priority"
        value={priority}
        onChange={setPriority}
        labels={issue.labels}
      />
      <Field>
        <FieldLabel htmlFor="edit-body">{t("description")}</FieldLabel>
        <Textarea
          id="edit-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="edit-labels">{t("labels")}</FieldLabel>
        <Input
          id="edit-labels"
          placeholder={t("labelsPlaceholder")}
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
        <FieldLabel htmlFor="edit-milestone">{t("milestone")}</FieldLabel>
        <Input
          id="edit-milestone"
          placeholder={t("milestone")}
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
        />
      </Field>
      <Button disabled={saving} type="submit">
        {saving ? t("saving") : t("saveChanges")}
      </Button>
      {error && <ErrorNotice message={error} />}
    </form>
  );
}
