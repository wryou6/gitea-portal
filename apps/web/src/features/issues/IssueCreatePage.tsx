import { FormEvent, useEffect, useState } from "react";
import { api, type Issue, type Repository } from "../../lib/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input, Textarea } from "../../components/ui/Field";
import { Select } from "../../components/ui/Select";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";

export function IssueCreatePage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [repository, setRepository] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [assignee, setAssignee] = useState("");
  const [labels, setLabels] = useState("");
  const [milestone, setMilestone] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    void api<Repository[]>("/api/repositories")
      .then((items) => {
        setRepositories(items);
        if (items[0]) setRepository(items[0].fullName);
      })
      .catch((cause) =>
        setError(
          cause instanceof Error ? cause.message : "無法取得可用 Repository",
        ),
      );
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const [owner, name] = repository.split("/");
    if (!owner || !name || !title.trim()) {
      setError("請選擇 Repository 並輸入 Title");
      return;
    }
    try {
      const issue = await api<Issue>(
        `/api/repositories/${owner}/${name}/issues`,
        {
          method: "POST",
          body: JSON.stringify({
            title: title.trim(),
            body,
            assignee: assignee.trim() || null,
            labels: labels
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            milestone: milestone.trim() || null,
          }),
        },
      );
      window.location.href = `/issue/${issue.owner}/${issue.name}/${issue.number}`;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "建立 Issue 失敗");
    }
  };

  return (
    <section>
      <a href="/">← 回到 Issues</a>
      <div className="detail-card">
        <PageHeader
          eyebrow="NEW GITEA ISSUE"
          title="建立 Issue"
          description="建立後這會是選定 Repository 中的正式 Gitea Issue。"
        />
        <form className="stack" onSubmit={submit}>
          <Field>
            <FieldLabel htmlFor="new-repository">Repository</FieldLabel>
            <Select
              id="new-repository"
              value={repository}
              onChange={(event) => setRepository(event.target.value)}
              required
            >
              <option value="">選擇 Repository</option>
              {repositories.map((item) => (
                <option key={item.fullName} value={item.fullName}>
                  {item.fullName}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="new-title">Title</FieldLabel>
            <Input
              id="new-title"
              placeholder="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="new-description">Description</FieldLabel>
            <Textarea
              id="new-description"
              placeholder="Description"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="new-assignee">Assignee（可選）</FieldLabel>
            <Input
              id="new-assignee"
              placeholder="Assignee login"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="new-labels">Labels（可選）</FieldLabel>
            <Input
              id="new-labels"
              placeholder="以逗號分隔"
              value={labels}
              onChange={(event) => setLabels(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="new-milestone">Milestone（可選）</FieldLabel>
            <Input
              id="new-milestone"
              placeholder="Milestone title 或 ID"
              value={milestone}
              onChange={(event) => setMilestone(event.target.value)}
            />
          </Field>
          <Button type="submit">建立 Issue</Button>
          {error && <ErrorNotice message={error} />}
        </form>
      </div>
    </section>
  );
}
