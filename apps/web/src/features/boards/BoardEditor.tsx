import type { Board } from './types';
export function BoardEditor({ board }: { board?: Board }) { return <section className="detail-card"><h2>{board ? '編輯 Board' : '建立 Board'}</h2><p>Board 共享設定使用 exact Workflow Convention version；Repository compatibility 由後端驗證。</p><small>Workflow Labels 只代表工作狀態；priority:*、team:* 與 bug 等一般 Labels 仍保留為獨立分類，不會被誤判為狀態。</small></section>; }
