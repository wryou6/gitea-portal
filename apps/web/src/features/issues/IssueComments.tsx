import type { Comment } from "./types";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "../../i18n/format";
export function IssueComments({ comments }: { comments: Comment[] }) {
  const { t, i18n } = useTranslation("issues");
  if (!comments.length) return <div className="empty">{t("noComments")}</div>;
  return (
    <div className="comments">
      {comments.map((item) => (
        <article className="comment" key={item.id}>
          <header>
            <strong>{item.user.login}</strong>
            <time dateTime={item.createdAt}>
              {formatDateTime(item.createdAt, i18n.language)}
            </time>
          </header>
          <p className="prose">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
