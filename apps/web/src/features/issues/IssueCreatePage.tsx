import { FormEvent, useEffect, useState } from "react";
import { api, toUserFacingError, type Issue, type Repository, type UserFacingError } from "../../lib/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input, Textarea } from "../../components/ui/Field";
import { Select } from "../../components/ui/Select";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { routePaths, safeReturnTo } from "../../app/routes";
import type { IssuePriority, IssueType } from "@gitea-portal/domain";
import { IssueTypeField } from "./IssueTypeField";
import { PriorityField } from "./PriorityField";
import { ScheduleDateFields } from "./ScheduleDateFields";
import { useTranslation } from "react-i18next";

export function IssueCreatePage({ initialRepositories, initialRepository }: { initialRepositories?: Repository[]; initialRepository?: string } = {}) {
  const { t } = useTranslation("issues");
  const params = new URLSearchParams(window.location.search);
  const requestedRepository = params.get("repository") ?? "";
  const returnTo = safeReturnTo(params.get("returnTo")) ?? routePaths.issues;
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [repository, setRepository] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<IssueType | "">("");
  const [priority, setPriority] = useState<IssuePriority | "">("");
  const [body, setBody] = useState("");
  const [assignee, setAssignee] = useState("");
  const [labels, setLabels] = useState("");
  const [milestone, setMilestone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<UserFacingError>();

  useEffect(() => {
    const setAvailableRepositories = (items: Repository[]) => {
        setRepositories(items);
        const preferredRepository = initialRepository ?? requestedRepository;
        if (
          preferredRepository &&
          items.some((item) => item.fullName === preferredRepository)
        ) {
          setRepository(preferredRepository);
        } else if (requestedRepository) {
          setError(t("issueRepositoryRequired"));
        }
    };
    if (initialRepositories) {
      setAvailableRepositories(initialRepositories);
      return;
    }
    void api<Repository[]>("/api/repositories")
      .then(setAvailableRepositories)
      .catch((cause) =>
        setError(
          toUserFacingError(cause, t("repositoriesUnavailable")),
        ),
      );
  }, [initialRepositories, initialRepository, requestedRepository, t]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const [owner, name] = repository.split("/");
    if (!owner || !name || !title.trim() || !type || !priority) {
      setError(t("requiredIssueFields"));
      return;
    }
    if (
      labels.split(",").some((label) => label.trim().startsWith("priority:"))
    ) {
      setError(t("priorityLabelConflict"));
      return;
    }
    try {
      const issue = await api<Issue>(
        `/api/repositories/${owner}/${name}/issues`,
        {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            type,
            priority,
            body,
            assignee: assignee.trim() || null,
            labels: labels
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            milestone: milestone.trim() || null,
            startDate: startDate || null,
            dueDate: dueDate || null,
          }),
        },
      );
      window.location.href = routePaths.issueDetailFrom(
        issue.owner,
        issue.name,
        issue.number,
        returnTo,
      );
    } catch (cause) {
      setError(toUserFacingError(cause, t("createIssueFailed")));
    }
  };

  return (
    <section>
      <a href={returnTo}>← {t("returnToWorkspace")}</a>
      <div className="detail-card">
        <PageHeader
          eyebrow={t("createIssueEyebrow")}
          title={t("createIssue")}
          description={t("createIssueDescription")}
        />
        <form className="stack" onSubmit={submit}>
          <Field>
            <FieldLabel htmlFor="new-repository">{t("repository")}</FieldLabel>
            <Select
              id="new-repository"
              value={repository}
              onChange={(event) => setRepository(event.target.value)}
              required
            >
              <option value="">{t("selectRepository")}</option>
              {repositories.map((item) => (
                <option key={item.fullName} value={item.fullName}>
                  {item.fullName}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="new-title">{t("title")}</FieldLabel>
            <Input
              id="new-title"
              placeholder={t("title")}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </Field>
          <IssueTypeField id="new-type" value={type} onChange={setType} />
          <PriorityField
            id="new-priority"
            value={priority}
            onChange={setPriority}
          />
          <Field>
            <FieldLabel htmlFor="new-description">{t("description")}</FieldLabel>
            <Textarea
              id="new-description"
              placeholder={t("description")}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="new-assignee">{t("assigneeOptional")}</FieldLabel>
            <Input
              id="new-assignee"
              placeholder={t("assigneeLogin")}
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="new-labels">{t("labelsOptional")}</FieldLabel>
            <Input
              id="new-labels"
              placeholder={t("commaSeparated")}
              value={labels}
              onChange={(event) => setLabels(event.target.value)}
            />
          </Field>
          <ScheduleDateFields
            startDate={startDate}
            dueDate={dueDate}
            startDateId="new-start-date"
            dueDateId="new-due-date"
            onStartDateChange={setStartDate}
            onDueDateChange={setDueDate}
          />
          <Field>
            <FieldLabel htmlFor="new-milestone">{t("milestoneOptional")}</FieldLabel>
            <Input
              id="new-milestone"
              placeholder={t("milestoneTitleOrId")}
              value={milestone}
              onChange={(event) => setMilestone(event.target.value)}
            />
          </Field>
          <Button type="submit">{t("createIssue")}</Button>
          {error && <ErrorNotice message={error} />}
        </form>
      </div>
    </section>
  );
}
