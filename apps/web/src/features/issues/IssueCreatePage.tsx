import { FormEvent, useState } from 'react';
import { api } from '../../lib/api';

export function IssueCreatePage() {
  const [repository, setRepository] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string>();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const [owner, name] = repository.split('/');
    if (!owner || !name || !title.trim()) { setError('請輸入 owner/repository 與 Title'); return; }
    try { const issue = await api<{ number: number; htmlUrl: string }>(`/api/repositories/${owner}/${name}/issues`, { method: 'POST', body: JSON.stringify({ title, body }) }); window.location.href = issue.htmlUrl; } catch (cause) { setError(cause instanceof Error ? cause.message : '建立 Issue 失敗'); }
  };
  return <section><a href="/">← 回到 Issues</a><div className="detail-card"><p className="eyebrow">NEW GITEA ISSUE</p><h1>建立 Issue</h1><form className="create-form" onSubmit={submit}><input aria-label="Repository" placeholder="owner/repository" value={repository} onChange={(event) => setRepository(event.target.value)} required /><input aria-label="Title" placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} required /><textarea aria-label="Description" placeholder="Description" value={body} onChange={(event) => setBody(event.target.value)} /><button type="submit">建立 Issue</button>{error && <div className="error" role="alert">{error}</div>}</form></div></section>;
}
