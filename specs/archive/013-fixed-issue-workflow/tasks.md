# Tasks: 固定 Issue 工作流

**Input**: Design documents from `specs/013-fixed-issue-workflow/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/workflow-api.md`

**Tests**: 本 feature 未要求新增自動化測試；依 quickstart 執行手動驗收及既有 `typecheck`、`build`、`format:check`。

**Organization**: 依 spec 的三個 P1 使用者故事分組。所有 Gitea API 呼叫沿用目前登入者權限。

## Phase 1: Setup (Shared Workflow Contract)

**Purpose**: 建立所有故事共用的固定狀態、原因、Issue DTO 與驗證規則。

- [x] T001 [P] 在 `packages/domain/src/workflow.ts` 定義固定三狀態、24 個 action、繁體中文名稱、Label key 與 Assignee policy，逐項對齊 `spec.md` 的轉換表。
- [x] T002 [P] 在 `packages/gitea-contracts/src/gitea.ts` 加入 Gitea `assignees[]` 完整有序資料型別，保留 API 回傳的 singular `assignee` 相容處理直到呼叫端完成遷移。
- [x] T003 在 `packages/domain/src/workflow-state-resolver.ts` 實作固定狀態解析：Todo/In Progress 必須各有唯一對應狀態 Label 且為 Open；Done 必須 Closed；缺少、衝突或不一致一律回傳 anomaly。

---

## Phase 2: Foundational (Shared API and Gitea Operations)

**Purpose**: 提供各故事使用的完整 Gitea Issue 型別及安全的更新基礎。

- [x] T004 在 `apps/api/src/gitea/client.ts` 解析 Issue 的 `assignees[]` 順序，新增以目前請求使用者權限更新 Assignees、讀回驗證及完整 Issue 讀取的方法，並提供 repository-scoped Label 查找/建立 helper。
- [x] T005 在 `apps/api/src/gitea/label-replacement.ts` 保留既有 atomic replacement/optimistic concurrency 契約，支援一次替換 status 與唯一最新 action Labels 並讀回驗證。
- [x] T006 在 `packages/domain/src/issue.ts` 與 `packages/domain/src/repository.ts` 定義新 workflow state、action、完整 assignees/currentOwner 欄位，移除對 Convention 派生欄位的型別依賴。

**Checkpoint**: 共用 Domain 規則與 Gitea DTO 可供三個故事使用。

---

## Phase 3: User Story 1 - 以固定狀態檢視工作 (Priority: P1)

**Goal**: Repository、Issue 與 Board 一律呈現固定的 Todo、In Progress、Done，不再讀取 Convention。

**Independent Test**: 在至少兩個 Repository 檢視三種狀態，確認狀態及順序相同，並從 Gitea 驗證 Open/Closed 與狀態 Labels 一致。

### Implementation for User Story 1

- [x] T007 [P] [US1] 刪除 `apps/api/src/workflows/convention-loader.ts`，固定狀態與原因定義改由 `packages/domain/src/workflow.ts` 提供。
- [x] T008 [P] [US1] 刪除舊 `workflow-convention-routes.ts`，在 `apps/api/src/http/workflow-definition-routes.ts` 提供 `GET /api/workflow-definition` 與 24 個 actions。
- [x] T009 [US1] 在 `apps/api/src/issues/issue-service.ts`、`apps/api/src/issues/issue-routes.ts`、`apps/api/src/issues/issue-command-service.ts`、`apps/api/src/issues/issue-schedule-service.ts`、`apps/api/src/gitea/client.ts` 將 Issue summary/detail 改由固定 resolver 產生 workflow 欄位，回傳有序 roster 欄位；建立新 Issue 前以目前使用者權限確保 `workflow:todo` Label 存在，再以 Open + 該 Label 建立且不附 action Label。
- [x] T010 [P] [US1] 在 `apps/api/src/repositories/repository-workspace-service.ts`、`apps/api/src/repositories/repository-service.ts`、`apps/api/src/repositories/repository-routes.ts`、`apps/api/src/issues/issue-routes.ts` 移除 Repository Convention 欄位與未設定 Convention 的 workflow unavailable 狀態。
- [x] T011 [US1] 在 `apps/api/src/boards/board-service.ts`、`apps/api/src/boards/board-view-service.ts`、`apps/api/src/boards/board-issue-service.ts` 移除 Convention 相容判斷並固定回傳三欄 Kanban 與固定狀態解析結果。
- [x] T012 [US1] 在 `apps/api/src/persistence/database.ts`、`packages/domain/src/board.ts` 升級 Board JSON schema/data format version，載入舊資料時保留 Board 名稱與 Repository refs、移除 Convention 欄位，並沿用 validation、lock、atomic write、flush。
- [x] T013 [P] [US1] 在 `apps/web/src/lib/api.ts`、`apps/web/src/features/boards/types.ts` 與 `apps/web/src/features/issues/types.ts` 更新固定 workflow definition、Issue、Repository、Board API 型別。
- [x] T014 [US1] 依 `specs/013-fixed-issue-workflow/research.md` 的設計系統重新設計 Kanban 與 Gantt：更新 `apps/web/src/features/boards/KanbanBoard.tsx`、`KanbanColumn.tsx`、`KanbanCard.tsx`、`GanttBoard.tsx`、`GanttIssueRow.tsx`；新增 `KanbanBoard.stories.tsx` 與 `GanttBoard.stories.tsx`，呈現固定三狀態及窄螢幕／鍵盤可操作版面。
- [x] T015 [P] [US1] 依 `specs/013-fixed-issue-workflow/research.md` 的設計系統重新設計 Issue 列表：更新 `apps/web/src/features/issues/IssueListPage.tsx`、`IssueRow.tsx`、`IssueFilters.tsx`，新增 `IssueListPage.stories.tsx`；顯示固定狀態、異常及完整 Labels，支援窄螢幕與鍵盤操作。
- [x] T016 [US1] 在 `apps/web/src/features/boards/BoardEditor.tsx`、`apps/web/src/features/boards/BoardListPage.tsx` 移除 Convention 選擇/相容欄位及提示，保留 Board 名稱與 Repository 設定。

**Checkpoint**: Issue、Repository workspace 與 Board 均使用同一固定狀態模型。

---

## Phase 4: User Story 2 - 以轉換原因執行狀態移動 (Priority: P1)

**Goal**: 使用者以已定義的原因進行狀態移動，Portal 保存最後原因並顯示其固定下一步動作。

**Independent Test**: 對每種來源狀態執行有效原因，重載 Issue 後確認狀態、最後原因、下一步及 Gitea Labels/Open/Closed 相符；故意觸發更新失敗時不得顯示成功。

### Implementation for User Story 2

- [x] T017 [US2] 在 `apps/api/src/boards/transition-service.ts` 新增共用 transition coordinator：讀取原 Issue snapshot、驗證 `expectedUpdatedAt`/來源/action、按規則寫入狀態與 action Labels 及 Open/Closed，失敗時補償並讀回實際資料。
- [x] T018 [US2] 在 `apps/api/src/issues/issue-routes.ts` 新增 `POST /api/issues/:owner/:repo/:number/transition`，驗證 action key、來源狀態、必要 Assignee 與目前使用者 Gitea 權限，回傳 contract 定義的 403/404/409/422/502/504。
- [x] T019 [US2] 在 `apps/api/src/gitea/client.ts` 以 T004 的 repository-scoped helper 確保所選 `workflow-action:<key>` Label 存在；只用目前使用者權限，缺少建立權限時回傳可辨識錯誤。
- [x] T020 [P] [US2] 在 `apps/web/src/features/issues/IssueDetailPage.tsx` 與新增的 `apps/web/src/features/issues/WorkflowTransitionDialog.tsx` 提供原因選擇、依目前狀態篩選有效原因、下一步預覽及 stale/conflict 錯誤處理。
- [x] T021 [US2] 在 `apps/web/src/features/boards/KanbanBoard.tsx` 將拖曳改為選擇有效轉換原因後呼叫 transition API，不直接寫入 target state。
- [x] T022 [US2] 在 `apps/web/src/features/issues/IssueDetailHeader.tsx` 顯示最後轉換原因與固定下一步動作；沒有最後原因的 Todo Issue 依 Assignee 是否存在顯示「指派負責人」或「開始處理」。

**Checkpoint**: 所有狀態移動都由原因驅動，Gitea 只保留最後 action Label。

---

## Phase 5: User Story 3 - 追蹤目前負責人及曾經手人員 (Priority: P1)

**Goal**: Open Issue 第一位 Assignee 顯示為目前負責人；完整名單保留所有曾經手人員，Done 不顯示現任負責人。

**Independent Test**: 以三位 Assignee 完成改派，確認 Gitea 清空後完整寫回使新負責人排第一並跨多次讀取順序穩定；Done 保留名單且不顯示 owner。

### Implementation for User Story 3

- [x] T023 [US3] 在 `apps/api/src/boards/transition-service.ts` 實作 Assignee policy：改派必選；無 Assignee 的開始處理必選；送交審查可選；等待外部回覆沿用目前負責人；其餘原因保留名單；改序時清空再依完整目標順序寫入並驗證，失敗時還原原清單。
- [x] T024 [US3] 在 `apps/api/src/repositories/repository-routes.ts` 與 `apps/api/src/gitea/client.ts` 提供可指派 Gitea 使用者的查詢/驗證，拒絕不可指派帳號，新增選取者排第一並保留其他 Assignees。
- [x] T025 [P] [US3] 在 `apps/web/src/features/issues/IssueDetailHeader.tsx` 與新增的 `apps/web/src/features/issues/IssueAssigneeRoster.tsx` 顯示 Open Issue 的目前負責人與完整經手名單；Done 只顯示經手名單。
- [x] T026 [US3] 在 `apps/web/src/features/issues/WorkflowTransitionDialog.tsx` 加入目前可指派 Gitea 使用者選項，依 action policy 強制/允許/隱藏新 Assignee 選擇。

**Checkpoint**: Issue 的負責人和經手人資訊完全由 Gitea Assignees 順序還原。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 移除舊 Convention 實作、正規化 dummy Gitea 資料並驗證整體行為。

- [x] T027 移除 Convention compatibility、舊 conventions API、單 Repository 舊 Board 提示與其專屬 UI。
- [x] T028 移除舊 Convention YAML、環境設定、Domain exports 與 API 用戶端依賴。
- [x] T029 將目前三個 dummy Gitea Repository `admin/portal-test-api`、`admin/portal-test-ops`、`admin/portal-test-web` 的 Issues 任意分配至 Todo/In Progress/Done 並同步 Open/Closed，保留一般 Labels、Assignees、Milestone、Comments；讀回驗證 19 筆後刪除 6 個舊 `workflow-a:*` Labels，未保存遷移記錄。
- [x] T030 執行 `pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd --filter @gitea-portal/web build-storybook`，讀回驗證 19 筆 dummy Issues 的新狀態、Labels 與保留欄位；`pnpm.cmd format:check` 已執行但 repo 現有 77 個未修改檔案未通過，本次修改檔案通過 targeted Prettier check。尚未透過登入後的 Portal UI 手動測完 24 個轉換和權限失敗情境。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001–T003 定義共享規則及資料型別；T001/T002 可平行，T003 依賴 T001。
- **Foundational (Phase 2)**: T004–T006 依賴固定 workflow model，完成前不得開始故事實作。
- **User Stories**: 依 T001–T006 後開始；此計畫按 P1 順序逐階段整合，避免 API、Board 與 UI 型別不同步。
- **Polish**: T027–T029 在所有故事完成後執行；T030 在程式與 dummy data 清理完成後執行。

### User Story Dependencies

- **US1 (P1)**: 依賴 Phase 1–2；完成固定狀態解析、API/Board/UI 欄位及 Board store 升級。
- **US2 (P1)**: 依賴 US1 的狀態解析及 API 型別；完成原因驅動轉換及 Kanban 拖曳流程。
- **US3 (P1)**: 使用 US2 transition coordinator；完成 Assignee 排序、改派與顯示。

### Parallel Opportunities

- Phase 1: T001 與 T002 可平行；T003 需在 T001 後。
- US1: T007/T008、T010、T013/T015 可在互不重疊檔案的前提下平行；其餘 API/Board 服務任務需依賴 Phase 1–2。
- US2: T019、T020 可在 T017/T018 契約穩定後分開實作；Board 拖曳 T021 與 Issue 詳情呈現 T022 可平行。
- US3: T025 可與後端 T023/T024 平行；T026 依賴 transition UI T020。

## Implementation Strategy

先完成共享 Domain/API 型別，再交付 US1 的固定狀態與三欄 Board；接著完成 US2 的原因轉換，最後完成 US3 的 Assignee roster/改派。每個階段以其 Independent Test 確認可用，再進行舊 Convention 移除與 dummy Gitea 清理。最後依 quickstart 驗收並執行既有檢查命令。

## Notes

- 每項 task 都列出其實際修改檔案；`[P]` 只標記無依賴且修改不同檔案的工作。
- 不新增自動化測試框架或 Issue 狀態 mirror。
- Gitea fixture 清理只針對上述三個 dummy Repository，並保留所有非 workflow 資料。
