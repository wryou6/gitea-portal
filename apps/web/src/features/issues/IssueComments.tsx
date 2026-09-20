import type { Comment } from './types';
export function IssueComments({ comments }: { comments: Comment[] }) { return <div className="comments">{comments.map((item) => <article className="comment" key={item.id}><strong>{item.user.login}</strong><time>{new Date(item.createdAt).toLocaleString()}</time><p>{item.body}</p></article>)}</div>; }
