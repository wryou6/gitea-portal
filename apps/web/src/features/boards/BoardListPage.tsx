import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Board } from './types';
import { BoardEditor } from './BoardEditor';
export function BoardListPage() { const [boards, setBoards] = useState<Board[]>([]); useEffect(() => { void api<Board[]>('/api/boards').then(setBoards); }, []); return <section><div className="page-heading"><div><p className="eyebrow">SHARED WORKSPACE</p><h1>Boards</h1></div></div><BoardEditor /><div className="board-list">{boards.map((board) => <a className="detail-card board-link" key={board.id} href={`/boards/${board.id}`}><h2>{board.name}</h2><p>{board.repositoryRefs.map((repo) => `${repo.owner}/${repo.name}`).join(' · ')}</p><small>{board.workflowConventionId}@{board.workflowConventionVersion}</small></a>)}{!boards.length && <div className="empty">尚未建立 Board</div>}</div></section>; }
