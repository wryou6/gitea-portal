import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { BoardCard, BoardView } from './types';
import { KanbanColumn } from './KanbanColumn';
import { transitionCard } from './card-transition';
import { ErrorNotice } from '../../components/ErrorNotice';

export function KanbanBoard({ boardId }: { boardId: string }) {
  const [view, setView] = useState<BoardView>();
  const [dragged, setDragged] = useState<BoardCard>();
  const [error, setError] = useState<string>();
  const load = useCallback(async (clearError = true) => {
    try {
      setView(await api<BoardView>(`/api/boards/${boardId}`));
      if (clearError) setError(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Board 無法載入');
    }
  }, [boardId]);

  useEffect(() => { void load(); }, [load]);
  if (error && !view) return <ErrorNotice message={error} />;
  if (!view) return <div className="loading">載入中…</div>;

  const move = async (issue: BoardCard, stateKey: string) => {
    setDragged(undefined);
    try {
      await transitionCard(boardId, issue, stateKey);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '狀態轉換被拒絕');
      await load(false);
    }
  };

  return <section>
    <a href="/boards">← 回到 Boards</a>
    {error && <ErrorNotice message={error} />}
    <div className="page-heading"><h1>{view.board.name}</h1><span>{view.board.workflowConventionId}@{view.board.workflowConventionVersion}</span></div>
    <div className="kanban-board">
      {view.columns.map((column) => <KanbanColumn key={column.stateKey} column={column} dragged={dragged} onDragStart={setDragged} onDropCard={move} />)}
    </div>
  </section>;
}
