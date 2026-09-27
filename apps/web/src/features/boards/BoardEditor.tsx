import { FormEvent, useEffect, useState } from "react";
import { api, type Repository } from "../../lib/api";
import type { Board } from "./types";
import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input } from "../../components/ui/Field";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";

type Props = {
  board?: Board;
  repositories: Repository[];
  onSaved: () => Promise<void>;
  onCancelled?: () => void;
};

export function BoardEditor({
  board,
  repositories,
  onSaved,
  onCancelled,
}: Props) {
  const [name, setName] = useState(board?.name ?? "");
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>(
    board?.repositoryRefs.map((repo) => `${repo.owner}/${repo.name}`) ?? [],
  );
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(board?.name ?? "");
    setSelectedRepositories(
      board?.repositoryRefs.map((repo) => `${repo.owner}/${repo.name}`) ?? [],
    );
  }, [board]);
  const toggleRepository = (repository: string) =>
    setSelectedRepositories((current) =>
      current.includes(repository)
        ? current.filter((item) => item !== repository)
        : [...current, repository],
    );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || selectedRepositories.length < 2) {
      setError("請輸入跨庫看板名稱，並選擇至少兩個不同的 Repository");
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await api(`/api/boards${board ? `/${board.id}` : ""}`, {
        method: board ? "PATCH" : "POST",
        body: JSON.stringify({
          name: name.trim(),
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
    if (!board || !window.confirm(`確定刪除跨庫看板「${board.name}」？`))
      return;
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
          <h2>{board ? "編輯跨庫看板" : "建立跨庫看板"}</h2>
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
        <FieldLabel htmlFor="board-name">跨庫看板名稱</FieldLabel>
        <Input
          id="board-name"
          placeholder="跨庫看板名稱"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <fieldset className="repo-picker">
        <legend>納入看板的 Repository</legend>
        {repositories.length ? (
          repositories.map((repository) => {
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
          <small>目前沒有可讀取的 Repository。</small>
        )}
      </fieldset>
      <div className="actions">
        <Button type="submit" disabled={saving}>
          {saving ? "儲存中…" : board ? "儲存跨庫看板" : "建立跨庫看板"}
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
