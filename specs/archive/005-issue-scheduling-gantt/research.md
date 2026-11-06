# Research: Issue 排程日期與甘特圖

## Decision 1: 將 schedule fields 正規化到共用 Issue contract

- **Decision**: 在 Gitea contract、domain 與 API Issue mapper 加入 nullable `startDate`、`dueDate`，日期值用 `YYYY-MM-DD` calendar-date 語意。API client 讀寫 Gitea 原生 `due_date`，start date parser 讀寫專用 Issue Label。
- **Rationale**: 現有 `GiteaApiIssue`、`GiteaIssue` 與 `IssueSummary` 均不含日期欄位；列表、詳情與 Board view 已共用這些資料型別，統一 mapper 可避免各頁分別解讀 Gitea payload。
- **Alternatives considered**: 只在 Board Gantt response 裡解析日期，會使 Issue create/edit/list/detail 產生第二套 parsing；新增 Portal schedule store 違反 Gitea Source of Truth。
- **Evidence**: `apps/api/src/gitea/client.ts`, `packages/gitea-contracts/src/gitea.ts`, `packages/domain/src/issue.ts`；Gitea Issue schema documents `due_date` as date-time: [Get an issue](https://docs.gitea.com/api/operations/issue-get-issue/), [Edit an issue](https://docs.gitea.com/api/1.25/operations/issue-edit-issue/), [Create an issue](https://docs.gitea.com/enterprise/api/operations/issue-create-issue/).

## Decision 2: Gantt data is a Board-scoped read-through endpoint that exhausts each configured Repository's Issue pages

- **Decision**: Add `GET /api/boards/:id/gantt`; use the Board's configured `repositoryRefs`, Gitea caller's delegated access, `state=all`, and per-Repository page iteration until a short page. Any required page failure fails the response rather than returning a partial success.
- **Rationale**: Current `getBoardView` reads one 100-item page per Repository. The Gantt requirement explicitly has no fixed Issue cap. Using Board refs avoids a separate all-repositories enumeration cap and leaves existing Kanban transition/repair behavior alone.
- **Alternatives considered**: Reuse current Board GET, which has workflow repair side effects and one-page results; use `/repos/issues/search`, which scans all accessible repos beyond the Board scope.
- **Evidence**: `apps/api/src/boards/board-view-service.ts`, `apps/api/src/issues/issue-search-service.ts`, `apps/api/src/gitea/client.ts`; Gitea repository issue listing documents `page`, `limit`, and `assigned_by` filters: [List a repository's issues](https://docs.gitea.com/enterprise/api/operations/issue-list-issues/).

## Decision 3: Use accessible semantic DOM/CSS for the Gantt timeline

- **Decision**: Render date ranges and single-day items as semantic HTML rows with CSS positioning/grid, plus a readable issue/date list at narrow widths. Do not add a chart dependency.
- **Rationale**: `chart.js` is already present, but the project has no Chart.js usage, React wrapper, or date adapter. Canvas would require extra keyboard and non-canvas equivalents; DOM issue links and date labels satisfy these directly and support the required narrow-screen list.
- **Alternatives considered**: Chart.js floating bars can express `[start, end]` values but are canvas-based and need a parallel accessible list; adding a time adapter introduces an unnecessary dependency for date-only data.
- **Evidence**: `apps/web/package.json`, `apps/web/src/features/boards/KanbanBoard.tsx`, `apps/web/src/index.css`; Chart.js range support: [Floating Bars](https://www.chartjs.org/docs/latest/samples/bar/floating.html).

## Decision 4: Update start-date Labels with the existing atomic replacement/concurrency strategy

- **Decision**: Reuse `replaceIssueLabelsAtomically` for Issue Label replacement. Resolve all retained and target label IDs, re-read and compare updatedAt plus exact Label set, make one labels PUT, then re-read and verify exact persistence. Preserve workflow and general labels.
- **Rationale**: Existing project rules prohibit remove-then-add fallback and current board transitions already implement optimistic concurrency and post-write verification.
- **Alternatives considered**: Reuse `updateIssue` generic labels flow, which patches Issue fields and replaces labels in a separate non-atomic step without the workflow helper's verification; remove then add creates a transient empty state and can lose labels.
- **Evidence**: `apps/api/src/gitea/label-replacement.ts`, `apps/api/src/boards/transition-service.ts`, `apps/api/src/issues/issue-command-service.ts`.

## Decision 5: Label value format is `start-date:YYYY-MM-DD`; definitions are retained

- **Decision**: User confirmed `start-date:YYYY-MM-DD`; look up the Repository-scoped definition and create/reuse it under the current user's Gitea permissions. Keep unused definitions when clearing an Issue's start date; never auto-delete them. Treat date Labels as managed by the date field and preserve them during generic label edits.
- **Rationale**: Gitea Issue Labels reference Repository label IDs; an Issue cannot carry an arbitrary label string before a definition exists. A date value on a Label implies definitions per distinct date in each Repository. Existing Gitea client currently only lists labels and replaces issue-label assignments.
- **Alternatives considered**: Store start date in Issue body/comment (not the user-approved Label source); encode into a single reusable label definition's description (description is shared across all Issues and cannot hold per-Issue dates); silently overwrite arbitrary Labels (unsafe).
- **Status**: The clarification is recorded in `spec.md`; exact visible color/description are presentation details and unused definitions remain by user decision.
- **Evidence**: Gitea Issue response includes Label objects with names and IDs; Issue Labels API assigns Repository-defined Label IDs. Existing types and methods are in `apps/api/src/gitea/client.ts`.

## Decision 6: Due date and start-date updates can partially succeed

- **Decision**: Treat the two Gitea writes as independent remote operations. On partial failure, re-read Gitea and return/display actual per-field values plus the write error; do not claim both dates succeeded or attempt a compensating rollback.
- **Rationale**: Gitea's Issue PATCH and Label PUT are separate operations with no cross-field transaction. A Portal rollback could overwrite concurrent user edits.
- **Alternatives considered**: Claim atomic save despite separate endpoints; compensate by restoring a previous value, risking data loss under concurrent edits.
- **Evidence**: `apps/api/src/issues/issue-command-service.ts`, `apps/api/src/gitea/label-replacement.ts`; Gitea documents `due_date` as an Issue edit field and Labels as a separate endpoint.
