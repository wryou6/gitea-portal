# Tasks: Issue Type 規範

**輸入**：設計文件位於 `specs/008-issue-types/`

**前置文件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/issue-type-api.md`

**測試**：專案沒有測試執行器，需求也未要求新增自動化測試。驗證使用既有 typecheck/build 命令，並確認 `quickstart.md` 涵蓋手動驗收情境。

## Phase 1：環境準備

**目的**：專案初始化與基本結構。

pnpm workspace 與目標模組已存在；不需要新增 package、dependency、route 或 persistence 設定。

## Phase 2：共用基礎

**目的**：建立兩個使用情境共用的 Type model 與 API 驗證。

- [X] T001 在 `packages/domain/src/issue-type.ts` 定義 `IssueType` (`bug | feature | task`)、標準 `type:*` Label 對應與正規化/狀態 helper，並從 `packages/domain/src/index.ts` 匯出。
- [X] T002 在 `packages/domain/src/issue.ts` 為 `IssueSummary` 新增 nullable `type: IssueType | null`，並在 `apps/api/src/issues/issue-service.ts` 由即時 Gitea Labels 推導；缺少、多個或無效 `type:` Labels 時回傳 null。
- [X] T003 在 `apps/api/src/issues/issue-validation.ts` 要求建立/更新 payload 帶有效 Type，並拒絕一般 `labels` 中的 `type:` 名稱；只有 `bug`、`feature`、`task` 是 Type，裸 `bug`、`feature` 維持一般 Labels。
- [X] T004 在 `apps/web/src/lib/api.ts` 的前端 Issue response contract 加入 `type: IssueType | null`，並使用共用 domain type。

**檢查點**：API response 提供正規化 Type，且建立與一般編輯入口都拒絕缺少或無效的 Type。

## Phase 3：使用情境 1 - 建立符合規範的 Issue（Priority: P1）- MVP

**目標**：建立表單要求選擇 Bug、Feature 或 Task，並只將對應的標準 Label 寫入 Gitea。

**獨立驗收條件**：不選 Type 送出時 Portal 拒絕建立；每種 Type 各建立一張 Issue 後，確認各自恰有一個對應的 `type:*` Label，並保留指定的一般 Labels。

### 實作工作

- [X] T005 [US1] 在 `apps/api/src/issues/issue-schedule-service.ts` 與 `apps/api/src/issues/issue-command-service.ts` 確保選定的 Repository Type Label 存在；遇到並行建立時重讀並重用，並把 Label ID 加入建立內容。
- [X] T006 [P] [US1] 在 `apps/web/src/features/issues/IssueCreatePage.tsx` 加入必填 Type 選單、Bug/Feature/Task 說明與 `type` request 欄位；裸 `bug`、`feature` 仍可作為一般 Labels。

**檢查點**：Portal 新建 Issue 恰有一個標準 Type Label；Gitea 權限不足時顯示建立失敗。

## Phase 4：使用情境 2 - 維持或變更既有 Issue 類型（Priority: P1）

**目標**：一般 Issue 編輯明確保留或變更 Type，並呈現缺少/衝突狀態供使用者修正。

**獨立驗收條件**：編輯標題或一般 Labels 後 Type 保留；變更 Type 後只留下所選 `type:*` Label；修復缺少、多個或無效 Type 的 Issue，並確認其他 Labels 不變。

### 實作工作

- [X] T007 [US2] 在 `apps/api/src/issues/issue-schedule-service.ts` 與 `apps/api/src/issues/issue-command-service.ts` 確保或建立/重用選定的 Repository Type Label，再與一般及排程 Labels 一起原子替換；保留其他 Labels 與 optimistic concurrency/readback checks。
- [X] T008 [US2] 在 `apps/web/src/features/issues/IssueEditForm.tsx` 加入必填 Type 選單，依 `issue.type` 初始化；未設定時顯示缺少/衝突狀態，每次儲存都送出 Type；一般 Labels 不含保留的 `type:` 前綴，但保留裸 `bug`、`feature`。
- [X] T009 [P] [US2] 在 `apps/web/src/features/issues/IssueRow.tsx` 與 `apps/web/src/features/issues/IssueDetailHeader.tsx` 顯示標準 Type 或缺少/衝突狀態並保留完整 Gitea Labels；更新 `apps/web/src/stories/fixtures.ts` 與 `apps/web/src/features/issues/IssueRow.stories.tsx` fixtures。

**檢查點**：有效 Type 經一般編輯後仍保留；缺少/衝突 Type 的 Issue 仍可讀取，並可從編輯表單修復。

## Phase 5：收尾與跨流程驗證

**目的**：檢查兩個使用情境的 API、UI、並行更新與權限行為。

- [X] T010 確認 `apps/api/src/boards/transition-service.ts` 與 `apps/api/src/boards/board-view-service.ts` 的 Workflow 更新與修復會保留既有 Type Labels。
- [X] T011 執行 `pnpm.cmd typecheck` 與 `pnpm.cmd build`，並檢查 `specs/008-issue-types/quickstart.md` 涵蓋所有驗收情境；修正受影響的 source files。

## 相依關係與執行順序

### 階段相依關係

- **環境準備（Phase 1）**：workspace 與模組已存在，無需程式修改。
- **共用基礎（Phase 2）**：先完成共用 model、response contract 與驗證，再開始任一使用情境。
- **使用情境（Phase 3 之後）**：US1 與 US2 都依賴 Phase 2；依列出順序先交付建立流程，兩個 UI 工作可在共用 contract 完成後分開進行。
- **收尾（Phase 5）**：依賴 US1 與 US2 完成。

### 使用情境相依關係

- **US1（P1）**：Phase 2 後可開始，建立流程可獨立交付。
- **US2（P1）**：Phase 2 後可開始，共用 Type model 與 validator；不依賴 US1 UI，但可重用後端 Label helper。

### 可平行工作

- T001 與 T003 涉及不同模組，可平行處理。
- 共用 contract 完成後，T006 可與 T005 平行處理。
- response contract 可用後，T009 可與 T007/T008 平行處理。

## 實作策略

1. 完成 Phase 2，讓 Type 值與無效 payload 有共用定義。
2. 先交付 US1 作為 MVP：新 Issue 必須選標準 Type 才能建立。
3. 交付 US2：既有 Issue 可保留、變更或修復 Type，清單與詳情會呈現異常。
4. 對兩個使用情境執行 typecheck、build，並核對 quickstart 驗收內容。
