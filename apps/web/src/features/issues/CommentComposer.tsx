import { FormEvent, useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/Field";
import { ErrorNotice } from "../../components/feedback/ErrorNotice";
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
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return setError("Comment 不可為空白");
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
      setError(cause instanceof Error ? cause.message : "新增 Comment 失敗");
    } finally {
      setPending(false);
    }
  };
  return (
    <form onSubmit={submit} className="stack">
      <label htmlFor="comment-body">新增 Comment</label>
      <Textarea
        id="comment-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="新增 Comment"
      />
      <Button disabled={pending} type="submit">
        {pending ? "送出中…" : "送出 Comment"}
      </Button>
      {error && <ErrorNotice message={error} />}
    </form>
  );
}
