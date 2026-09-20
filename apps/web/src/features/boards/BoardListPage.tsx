import { useCallback, useEffect, useState } from 'react';
import { api, type Repository, type WorkflowConvention } from '../../lib/api';
import { BoardEditor } from './BoardEditor';
import type { Board } from './types';

export function BoardListPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [conventions, setConventions] = useState<WorkflowConvention[]>([]);
  const [editing, setEditing] = useState<Board>();
  const [error, setError] = useState<string>();
  const load = useCallback(async () => {
    try {
      const [nextBoards, nextRepositories, nextConventions] = await Promise.all([api<Board[]>('/api/boards'), api<Repository[]>('/api/repositories'), api<WorkflowConvention[]>('/api/workflow-conventions')]);
      setBoards(nextBoards); setRepositories(nextRepositories); setConventions(nextConventions); setError(undefined);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Board 無法載入'); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return <section>
    <div className="page-heading"><div><p className="eyebrow">SHARED WORKSPACE</p><h1>Boards</h1></div></div>
    {error && <div className="error" role="alert">{error}</div>}
    <BoardEditor key={editing?.id ?? 'new'} board={editing} repositories={repositories} conventions={conventions} onSaved={async () => { setEditing(undefined); await load(); }} onCancelled={() => setEditing(undefined)} />
    <div className="board-list">{boards.map((board) => <article className="detail-card board-link" key={board.id}><a href={`/boards/${board.id}`}><h2>{board.name}</h2><p>{board.repositoryRefs.map((repo) => `${repo.owner}/${repo.name}`).join(' · ')}</p><small>{board.workflowConventionId}@{board.workflowConventionVersion}</small></a><button type="button" onClick={() => setEditing(board)}>編輯</button></article>)}{!boards.length && <div className="empty">尚未建立 Board</div>}</div>
  </section>;
}
