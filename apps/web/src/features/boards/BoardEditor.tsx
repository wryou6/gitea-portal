import { FormEvent, useEffect, useMemo, useState } from "react";
import { api, type Repository, type WorkflowConvention } from "../../lib/api";
import type { Board } from "./types";
import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input } from "../../components/ui/Field";
import { Select } from "../../components/ui/Select";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";

type Props = {
  board?: Board;
  repositories: Repository[];
  conventions: WorkflowConvention[];
  onSaved: () => Promise<void>;
  onCancelled?: () => void;
};

export function BoardEditor({
  board,
  repositories,
  conventions,
  onSaved,
  onCancelled,
}: Props) {
  const [name, setName] = useState(board?.name ?? "");
  const [conventionKey, setConventionKey] = useState(
    board
      ? `${board.workflowConventionId}@${board.workflowConventionVersion}`
      : "",
  );
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>(
    board?.repositoryRefs.map((repo) => `${repo.owner}/${repo.name}`) ?? [],
  );
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(board?.name ?? "");
    setConventionKey(
      board
        ? `${board.workflowConventionId}@${board.workflowConventionVersion}`
        : conventions[0]
          ? `${conventions[0].id}@${conventions[0].version}`
          : "",
    );
    setSelectedRepositories(
      board?.repositoryRefs.map((repo) => `${repo.owner}/${repo.name}`) ?? [],
    );
  }, [board, conventions]);

  const convention = conventions.find(
    (item) => `${item.id}@${item.version}` === conventionKey,
  );
  const compatibleRepositories = useMemo(
    () =>
      repositories.filter(
        (repository) =>
          repository.conventionId === convention?.id &&
          repository.conventionVersion === convention?.version,
      ),
    [convention, repositories],
  );
  const toggleRepository = (repository: string) =>
    setSelectedRepositories((current) =>
      current.includes(repository)
        ? current.filter((item) => item !== repository)
        : [...current, repository],
    );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !convention || selectedRepositories.length === 0) {
      setError(
        "請輸入 Board 名稱、選擇 Workflow Convention 與至少一個相容 Repository",
      );
      return;
    }
    setSaving(true);
    setError(undefined);
    const [workflowConventionId, workflowConventionVersion] =
      conventionKey.split("@");
    try {
      await api(`/api/boards${board ? `/${board.id}` : ""}`, {
        method: board ? "PATCH" : "POST",
        body: JSON.stringify({
          name: name.trim(),
          workflowConventionId,
          workflowConventionVersion,
          repositoryRefs: selectedRepositories.map((value) => {
            const [owner, repo] = value.split("/");
            return { owner, name: repo };
          }),
        }),
      });
      await onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Board 儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!board || !window.confirm(`確定刪除 Board「${board.name}」？`)) return;
    setSaving(true);
    try {
      await api(`/api/boards/${board.id}`, { method: "DELETE" });
      await onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Board 刪除失敗");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="detail-card board-form" onSubmit={submit}>
      <div className="page-heading">
        <div>
          <h2>{board ? "編輯 Board" : "建立 Board"}</h2>
          <p className="muted">
            Board 設定共享保存；Issue 資料仍以 Gitea 為準。
          </p>
        </div>
        {board && (
          <Button
            variant="danger"
            type="button"
            onClick={remove}
            disabled={saving}
          >
            刪除 Board
          </Button>
        )}
      </div>
      <Field>
        <FieldLabel htmlFor="board-name">Board 名稱</FieldLabel>
        <Input
          id="board-name"
          placeholder="Board 名稱"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="board-convention">Workflow Convention</FieldLabel>
        <Select
          id="board-convention"
          value={conventionKey}
          onChange={(event) => {
            setConventionKey(event.target.value);
            setSelectedRepositories([]);
          }}
        >
          <option value="">選擇 Workflow Convention</option>
          {conventions.map((item) => (
            <option
              key={`${item.id}@${item.version}`}
              value={`${item.id}@${item.version}`}
            >
              {item.name} ({item.id}@{item.version})
            </option>
          ))}
        </Select>
      </Field>
      <fieldset className="repo-picker">
        <legend>相容 Repository</legend>
        {compatibleRepositories.length ? (
          compatibleRepositories.map((repository) => {
            const key = `${repository.owner}/${repository.name}`;
            return (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={selectedRepositories.includes(key)}
                  onChange={() => toggleRepository(key)}
                />{" "}
                {key}
              </label>
            );
          })
        ) : (
          <small>目前沒有被指定到此 Convention 的 Repository。</small>
        )}
      </fieldset>
      <div className="actions">
        <Button type="submit" disabled={saving}>
          {saving ? "儲存中…" : board ? "儲存 Board" : "建立 Board"}
        </Button>
        {board && onCancelled && (
          <Button variant="secondary" type="button" onClick={onCancelled}>
            取消
          </Button>
        )}
      </div>
      {error && <ErrorNotice message={error} />}
    </form>
  );
}
