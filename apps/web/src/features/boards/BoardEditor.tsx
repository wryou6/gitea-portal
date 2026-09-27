import { FormEvent, useEffect, useState } from "react";
import { api, toUserFacingError, type Repository, type UserFacingError } from "../../lib/api";
import type { Board } from "./types";
import { Button } from "../../components/ui/Button";
import { Field, FieldLabel, Input } from "../../components/ui/Field";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("boards");
  const [name, setName] = useState(board?.name ?? "");
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>(
    board?.repositoryRefs.map((repo) => `${repo.owner}/${repo.name}`) ?? [],
  );
  const [error, setError] = useState<UserFacingError>();
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
      setError(t("boardNameAndRepositoriesRequired"));
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
      setError(toUserFacingError(cause, t("boardSaveError")));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!board || !window.confirm(t("confirmDeleteBoard", { name: board.name })))
      return;
    setSaving(true);
    try {
      await api(`/api/boards/${board.id}`, { method: "DELETE" });
      await onSaved();
    } catch (cause) {
      setError(toUserFacingError(cause, t("boardDeleteError")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="detail-card board-form" onSubmit={submit}>
      <div className="page-heading">
        <div>
          <h2>{board ? t("editBoard") : t("createBoard")}</h2>
          <p className="muted">
            {t("boardSettingsDescription")}
          </p>
        </div>
        {board && (
          <Button
            variant="danger"
            type="button"
            onClick={remove}
            disabled={saving}
          >
            {t("deleteBoard")}
          </Button>
        )}
      </div>
      <Field>
        <FieldLabel htmlFor="board-name">{t("boardName")}</FieldLabel>
        <Input
          id="board-name"
          placeholder={t("boardName")}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <fieldset className="repo-picker">
        <legend>{t("includeRepositories")}</legend>
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
          <small>{t("noReadableRepositories")}</small>
        )}
      </fieldset>
      <div className="actions">
        <Button type="submit" disabled={saving}>
          {saving ? t("saving") : board ? t("saveBoard") : t("createBoardAction")}
        </Button>
        {board && onCancelled && (
          <Button variant="secondary" type="button" onClick={onCancelled}>
            {t("cancel")}
          </Button>
        )}
      </div>
      {error && <ErrorNotice message={error} />}
    </form>
  );
}
