import type { Comment } from "./types";
export function IssueComments({ comments }: { comments: Comment[] }) {
  if (!comments.length) return <div className="empty">尚未有 Comment</div>;
  return (
    <div className="comments">
      {comments.map((item) => (
        <article className="comment" key={item.id}>
          <header>
            <strong>{item.user.login}</strong>
            <time dateTime={item.createdAt}>
              {new Date(item.createdAt).toLocaleString("zh-TW")}
            </time>
          </header>
          <p className="prose">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
