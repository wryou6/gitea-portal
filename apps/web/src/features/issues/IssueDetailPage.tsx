import { FormEvent, useEffect, useState } from 'react';
import { api, type Issue } from '../../lib/api';

type Comment = { id: number; user: { login: string }; body: string; createdAt: string };

export function IssueDetailPage({ owner, repo, number }: { owner: string; repo: string; number: number }) {
  const [issue, setIssue] = useState<Issue>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string>();
  const load = async () => {
    try { setError(undefined); const [nextIssue, nextComments] = await Promise.all([api<Issue>(`/api/issues/${owner}/${repo}/${number}`), api<Comment[]>(`/api/issues/${owner}/${repo}/${number}/comments`)]); setIssue(nextIssue); setComments(nextComments); } catch (cause) { setError(cause instanceof Error ? cause.message : '無法取得 Issue'); }
  };
  useEffect(() => { void load(); }, [owner, repo, number]);
  const submitComment = async (event: FormEvent) => { event.preventDefault(); if (!comment.trim()) return; await api(`/api/issues/${owner}/${repo}/${number}/comments`, { method: 'POST', body: JSON.stringify({ body: comment }) }); setComment(''); await load(); };
  if (error) return <div className="error" role="alert">{error}</div>;
  if (!issue) return <div className="empty">載入中…</div>;
  return <section><a href="/">← 回到 Issues</a><div className="detail-card"><p className="eyebrow">{owner}/{repo} #{number}</p><h1>{issue.title}</h1><p>{issue.state} · {issue.assignee ?? '未指派'} · {issue.milestone ?? '未設定 Milestone'}</p><div className="labels">{issue.labels.map((label) => <span className="label" key={label.name}>{label.name}</span>)}</div><div className="issue-body">{issue.title}</div><a className="button" href={issue.htmlUrl} target="_blank" rel="noreferrer">在 Gitea 開啟</a></div><section className="comments"><h2>Comments</h2>{comments.map((item) => <article className="comment" key={item.id}><strong>{item.user.login}</strong><time>{new Date(item.createdAt).toLocaleString()}</time><p>{item.body}</p></article>)}<form onSubmit={submitComment} className="comment-form"><textarea aria-label="新增 Comment" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="新增 Comment" required /><button type="submit">送出 Comment</button></form></section></section>;
}
