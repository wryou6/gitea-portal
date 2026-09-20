import { FormEvent, useEffect, useState } from 'react';
import { api, type Repository } from '../../lib/api';

export function IssueCreatePage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [repository, setRepository] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [assignee, setAssignee] = useState('');
  const [labels, setLabels] = useState('');
  const [milestone, setMilestone] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => { void api<Repository[]>('/api/repositories').then((items) => { setRepositories(items); if (items[0]) setRepository(items[0].fullName); }).catch((cause) => setError(cause instanceof Error ? cause.message : '無法取得可用 Repository')); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const [owner, name] = repository.split('/');
    if (!owner || !name || !title.trim()) { setError('請選擇 Repository 並輸入 Title'); return; }
    try {
      const issue = await api<{ htmlUrl: string }>(`/api/repositories/${owner}/${name}/issues`, { method: 'POST', body: JSON.stringify({ title: title.trim(), body, assignee: assignee.trim() || null, labels: labels.split(',').map((item) => item.trim()).filter(Boolean), milestone: milestone.trim() || null }) });
      window.location.href = issue.htmlUrl;
    } catch (cause) { setError(cause instanceof Error ? cause.message : '建立 Issue 失敗'); }
  };

  return <section><a href="/">← 回到 Issues</a><div className="detail-card"><p className="eyebrow">NEW GITEA ISSUE</p><h1>建立 Issue</h1><form className="create-form" onSubmit={submit}>
    <select aria-label="Repository" value={repository} onChange={(event) => setRepository(event.target.value)} required><option value="">選擇 Repository</option>{repositories.map((item) => <option key={item.fullName} value={item.fullName}>{item.fullName}</option>)}</select>
    <input aria-label="Title" placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
    <textarea aria-label="Description" placeholder="Description" value={body} onChange={(event) => setBody(event.target.value)} />
    <input aria-label="Assignee" placeholder="Assignee login（可選）" value={assignee} onChange={(event) => setAssignee(event.target.value)} />
    <input aria-label="Labels" placeholder="Labels，以逗號分隔（可選）" value={labels} onChange={(event) => setLabels(event.target.value)} />
    <input aria-label="Milestone" placeholder="Milestone title 或 ID（可選）" value={milestone} onChange={(event) => setMilestone(event.target.value)} />
    <button type="submit">建立 Issue</button>{error && <div className="error" role="alert">{error}</div>}
  </form></div></section>;
}
