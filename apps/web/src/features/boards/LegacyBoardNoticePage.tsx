import { PageHeader } from "../../components/layout/PageHeader";
import { routePaths } from "../../app/routes";
import type { Board } from "./types";

export function LegacyBoardNoticePage({ board }: { board: Board }) {
  const repository = board.repositoryRefs[0]!;
  return (
    <section>
      <PageHeader
        eyebrow="工作區已調整"
        title="請重新選擇 Repository"
        description={`「${board.name}」只涵蓋 ${repository.owner}/${repository.name}，已改由 Repository 工作區提供檢視。`}
      />
      <div className="workspace-notice" role="status">
        此舊 Board
        設定已保留，但不再作為跨庫看板使用。請使用上方「工作區」選擇器，重新選取
        Repository。
      </div>
      <p>
        <a href={routePaths.issues}>前往全部 Issues</a>，再從工作區選擇器選取
        Repository。
      </p>
    </section>
  );
}
