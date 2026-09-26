---
description: "Repository 工作區與跨庫看板實作任務"
---

# Tasks: Repository 工作區與跨庫看板

**Input**: Design documents from `specs/007-repository-workspaces/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/repository-workspaces.md`

**Tests**: 本 feature spec 未要求新增自動化測試；執行型別檢查、build、format check 與 quickstart 手動驗收。

## Phase 1: Setup（共用 API 契約）

**Purpose**: 先定義 Repository 與 scoped view 的共用型別，讓 API 與 Web 使用同一契約。

- [x] T001 [P] 在 `packages/domain/src/repository.ts` 定義 Repository workspace 與 Kanban/Gantt view metadata，並由 `packages/domain/src/index.ts` 匯出。
- [x] T002 [P] 在 `packages/gitea-contracts/src/portal.ts` 定義 Board Issues 分頁回應與 Repository workspace API response，並由 `packages/gitea-contracts/src/index.ts` 匯出。

---

## Phase 2: Foundational（阻塞性基礎）

**Purpose**: 完成所有 scoped workspace 共用的路由、完整分頁與 URL 脈絡基礎。

- [x] T003 在 `apps/api/src/gitea/client.ts` 讓 `repositories()` 逐頁讀取 `/user/repos`，並讓 Repository Issue 查詢可取回完整分頁及指定篩選條件。
- [x] T004 在 `apps/web/src/app/routes.ts` 加入 Repository/Board Issues、Repository Kanban/Gantt 與 Board Issues 路由解析及 URL builders，保留現有 aliases 的語意。
- [x] T005 在 `apps/web/src/lib/api.ts` 加入 Repository workspace 與 Board Issues API 的型別化呼叫，統一錯誤回報。
- [x] T006 在 `apps/web/src/features/issues/IssueDetailPage.tsx` 加入受限的 app-local `returnTo` 驗證與返回連結；無效或缺少值時返回 `/issues`。

**Checkpoint**: domain/contracts、API 分頁與 URL 上下文可供各故事接續實作。

---

## Phase 3: User Story 1 - 單一 Repository 工作區（Priority: P1）

**Goal**: 使用者可從單一 Repository 進入 Issues、Kanban、甘特圖與 Issue 建立流程；所有結果只含該 Repository。

**Independent Test**: 選一個可讀 Repository，逐一開啟三種檢視並建立 Issue；確認 Repository 範圍、Convention 提示、完整分頁及返回脈絡。

### Implementation

- [x] T007 [US1] 在 `apps/api/src/repositories/repository-workspace-service.ts` 解析目前 Repository 與 workflow YAML 的 exact Convention assignment，並集中處理不存在、未指派及版本不相符狀態。
- [x] T008 [US1] 在 `apps/api/src/repositories/repository-routes.ts` 實作 Repository Kanban、Gantt 與 Workflow Label transition endpoints；讀取及寫入一律使用目前使用者 delegated Gitea 權限。
- [x] T009 [US1] 在 `apps/api/src/boards/transition-service.ts` 抽出可供 Repository route 重用的 atomic Workflow Label replacement，保留 optimistic concurrency、membership/permission 檢查及非 Workflow Labels。
- [x] T010 [US1] 在 `apps/api/src/app.ts` 註冊 Repository workspace routes，並於 `packages/gitea-contracts/src/portal.ts` 對齊 response 與 transition request 型別。
- [x] T011 [US1] 在 `apps/web/src/features/issues/IssueListPage.tsx` 支援 Repository scope 與 query/page URL state，維持完整 Labels、錯誤/空狀態及現有全域 `/issues` 行為。
- [x] T012 [US1] 在 `apps/web/src/features/repositories/RepositoryWorkspacePage.tsx` 實作 Repository Issues、Kanban、Gantt 檢視切換、Repository 標示、legacy Convention 不一致提示與無有效 Convention 設定提示；legacy 值只用於提示，不覆蓋 YAML assignment。
- [x] T013 [US1] 在 `apps/web/src/features/issues/IssueCreatePage.tsx` 支援由 Repository workspace 預選目標 Repository，並在建立後返回原 Repository 檢視。
- [x] T014 [US1] 在 `apps/web/src/features/issues/IssueRow.tsx` 與 `apps/web/src/features/boards/GanttBoard.tsx` 為 Repository scope 的 Issue detail links 加入當前篩選、頁碼與檢視 `returnTo`。

---

## Phase 4: User Story 2 - 跨庫看板（Priority: P1）

**Goal**: 多 repo Board 提供 Issues、Kanban、甘特圖與範圍/儲存驗證；舊單 repo Board 設定原樣保留並歸入 Repository 工作區。

**Independent Test**: 開啟至少涵蓋兩個 repo 的 Board，確認三檢視完整涵蓋其範圍、合併 Issues 可分辨 repo、單 repo Board 被隱藏且舊網址顯示重新分類說明並要求重新選 Repository。

### Implementation

- [x] T015 [US2] 在 `apps/api/src/boards/board-compatibility.ts` 要求新增與更新 Board 至少有兩個不同 `repositoryRefs`，但不改寫或拒絕讀取既有單 repo JSON records。
- [x] T016 [US2] 在 `apps/api/src/boards/board-view-service.ts` 讓 Board Kanban 讀取每個 repo 的全部 Issue pages；任何必要 page 失敗時整個 view 失敗，並保留 repair/anomaly/error 行為。
- [x] T017 [US2] 在 `apps/api/src/boards/board-issue-service.ts` 聚合所有 Board repos 的 Issue pages、套用 filters、依 `updatedAt` 遞減及 repo/number 穩定排序後再分頁；任一 repo/page 失敗時拒絕整體回應。
- [x] T018 [US2] 在 `apps/api/src/boards/board-routes.ts` 加入 `GET /api/boards/:id/issues`，執行 repository read permission 檢查並回傳 Board Issues 分頁契約。
- [x] T019 [US2] 在 `apps/web/src/features/boards/BoardListPage.tsx` 與 `apps/web/src/features/boards/BoardEditor.tsx` 隱藏單 repo legacy records，並在新增/編輯時阻止少於兩個不同 repo 的 Board 儲存及顯示欄位提示。
- [x] T020 [US2] 在 `apps/web/src/features/boards/BoardIssuesPage.tsx` 實作 Board scoped Issues 清單、篩選/分頁、完整 Labels 與 Repository + Issue number 身分呈現。
- [x] T021 [US2] 在 `apps/web/src/features/boards/KanbanBoard.tsx` 和 `apps/api/src/boards/gantt-service.ts` 維持 Board Kanban/Gantt 的完整 repo scope，顯示 Board identity 並保留既有 error/repair/schedule semantics。
- [x] T022 [US2] 在 `apps/web/src/app/App.tsx` 與 `apps/web/src/features/boards/LegacyBoardNoticePage.tsx` 對 legacy 單 repo Board URL（`/boards/:id`、`/boards/:id/kanban`、`/boards/:id/gantt`）先查 Board metadata，再顯示重新分類說明並要求使用者從工作區選擇器重新選 Repository；不自動導向 Repository、不呼叫 Board view API。
- [x] T023 [US2] 在 `apps/web/src/features/issues/IssueRow.tsx` 與 `apps/web/src/features/boards/GanttBoard.tsx` 為 Board scope 的 Issue detail links 加入 Board、檢視、篩選與頁碼 `returnTo`。

---

## Phase 5: User Story 3 - 工作區切換與可用狀態（Priority: P2）

**Goal**: 使用者能從頂部選擇器辨識並切換 Repository/跨庫看板；鍵盤、窄螢幕、載入/錯誤/空狀態均可理解。

**Independent Test**: 用鍵盤及 375 px 視窗操作選擇器和檢視導覽；確認可讀 repos、可用跨庫 Boards、全部 Issues 入口與資源錯誤狀態。

### Implementation

- [x] T024 [US3] 在 `apps/web/src/components/layout/WorkspaceSelector.tsx` 新增可鍵盤操作的工作區選擇器，載入可讀 Repository 及可完整存取的跨庫 Board，排除單 repo legacy Board。
- [x] T025 [US3] 在 `apps/web/src/components/layout/AppShell.tsx` 整合頂部工作區選擇器及 context-aware Issues/Kanban/Gantt links，保留全部 Issues 與 Board 管理入口。
- [x] T026 [US3] 在 `apps/web/src/app/App.tsx` 依 Repository/Board route context 顯示對應 workspace page，並為未知資源、權限變更及路由錯誤呈現可返回工作區選擇的狀態。
- [x] T027 [US3] 在 `apps/web/src/index.css` 為工作區選擇器、檢視導覽與狀態提示補上窄螢幕排列、可見 focus、選取狀態及 375 px 無水平溢位樣式。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 完成跨故事的回歸與專案品質閘門。

- [x] T028 在 `specs/007-repository-workspaces/quickstart.md` 對照實際 route、API 與錯誤狀態更新手動驗收步驟，涵蓋 >100 Issues、legacy route、權限拒絕及鍵盤/窄螢幕。
- [x] T029 執行 `pnpm.cmd typecheck` 與 `pnpm.cmd build`，並修正本 feature 導致的型別或打包錯誤。
- [x] T030 執行 `pnpm.cmd format:check` 與 `git diff --check`，修正本 feature 的格式或 whitespace 問題；本次變更檔案均通過 Prettier targeted check 與 diff check，repo-wide format check 仍有 91 個未變更檔案不符合格式。

## Dependencies & Execution Order

### Phase Dependencies

- Setup 契約（Phase 1）先於共用路由/API 基礎（Phase 2）。
- Foundational 完成後，US1、US2、US3 的核心工作可分開實作；US3 頂部導覽整合需使用 US1/US2 的 route builders 與 API。
- Polish 依賴三個 user stories 完成。

### User Story Dependencies

- **US1 (P1)**: 依賴 Phase 1–2；不依賴 US2。提供 Repository page/view 作為獨立增量。
- **US2 (P1)**: 依賴 Phase 1–2；沿用既有 Board services，不依賴 US1 UI；與 US1 共用 Issue link 檔案，序列整合。
- **US3 (P2)**: 依賴 Phase 1–2 及 US1/US2 的 route/API contracts 才能完整呈現可選工作區。

### Parallel Opportunities

- T001 與 T002 修改不同 package，可平行。
- Phase 2 的 T003、T004 可在契約定義後平行；T005 依賴契約與 route/API shape，T006 可獨立。
- US1 API tasks T007–T010 可與不同檔案的 Issue list UI T011 平行；Repository workspace page T012 依賴 T008/T010。
- US2 的 T015–T018 API 與 T019 Board 管理 UI 使用不同檔案，可在 Phase 2 後分組平行；Issue detail link tasks T014/T023 必須序列修改共用檔案。

## Implementation Strategy

1. 先完成 Phase 1–2 的 API types、pagination 與路由上下文。
2. MVP 先完成 US1，讓單 Repository workspace 的三檢視可用，再完成同為 P1 的 US2，保留並區分跨庫 Board。
3. 完成 US3 後進行 quickstart 人工驗收與 typecheck/build/format check。

## Notes

- 不新增測試框架或 persistence；Gitea 是 Issue source of truth，Board JSON store schema/atomic/flush/lock 保持不變。
- 舊單 repo Board 舊 URL 依 `spec.md` 的重新分類說明流程處理；Repository Convention 以目前 YAML 為準，保留的 legacy 值只供 mismatch 提示。
- `[P]` 只用於可在不同檔案並行的任務；Story phase 任務均附 `[US#]` 和明確檔案路徑。

## Phase 7: Convergence

- [x] T031 [US3] 在 `apps/web/src/components/layout/AppShell.tsx` 與 `WorkspaceSelector.tsx` 同步目前選中的有效跨庫看板狀態，只有選中該狀態時顯示「跨庫看板設定」側欄項目；Repository、全部 Issues、legacy 或無效上下文時隱藏，依 FR-015、SC-011（partial）。

## Phase 8: Follow-up

- [x] T032 [US3] 從 `apps/web/src/features/boards/KanbanBoard.tsx` 移除 Kanban 與甘特圖互相切換的頁內導覽，保留全域側邊切換並依 quickstart 驗收，符合 FR-016、SC-012。
