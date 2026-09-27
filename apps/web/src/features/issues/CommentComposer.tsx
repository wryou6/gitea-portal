import { FormEvent, useState } from "react";
import { api, toUserFacingError, type UserFacingError } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/Field";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
import { useTranslation } from "react-i18next";
export function CommentComposer({
  owner,
  repo,
  number,
  onSaved,
}: {
  owner: string;
  repo: string;
  number: number;
  onSaved: () => Promise<void>;
}) {
  const { t } = useTranslation("issues");
  const [body, setBody] = useState("");
  const [error, setError] = useState<UserFacingError>();
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return setError(t("commentRequired"));
    setPending(true);
    setError(undefined);
    try {
      await api(`/api/issues/${owner}/${repo}/${number}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      await onSaved();
    } catch (cause) {
      setError(toUserFacingError(cause, t("createCommentFailed")));
    } finally {
      setPending(false);
    }
  };
  return (
    <form onSubmit={submit} className="stack">
      <label htmlFor="comment-body">{t("addComment")}</label>
      <Textarea
        id="comment-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("commentPlaceholder")}
      />
      <Button disabled={pending} type="submit">
        {pending ? t("submitting") : t("submitComment")}
      </Button>
      {error && <ErrorNotice message={error} />}
    </form>
  );
}
