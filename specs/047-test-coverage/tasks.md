# Tasks: 分層自動化測試

**Input**: Design documents from `/specs/047-test-coverage/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: 測試為此 feature 的主要交付物。

## Phase 1: Setup

- [x] T001 新增 root `test:api`、`test:web`、`test:e2e` 與 `test` 指令於 `package.json`
- [x] T002 [P] 設定 Web 純邏輯測試指令，透過 API workspace 既有 tsx 執行 `apps/web/test/*.test.ts`
- [x] T003 [P] 在 `apps/api/package.json` 設定 `node:test` / tsx 指令
- [x] T004 確認各測試層指令可在 Windows PowerShell 的 pnpm workspace 執行

## Phase 2: Foundational

- [x] T005 [P] 建立 `apps/api/test/helpers/mock-gitea.ts`，隔離 Gitea HTTP 並在測試結束復原 fetch
- [x] T006 [P] 使用單一測試內 fixtures，避免共用可變資料與真實 credentials
- [x] T007 更新 `README.md` 與 `specs/047-test-coverage/quickstart.md`，記錄各層命令與前置條件

## Phase 3: User Story 1 - 驗證 API 與共用規則 (Priority: P1)

**Independent Test**: `pnpm.cmd test:api` 通過，不連線 Gitea，涵蓋權限、錯誤、contract 與並行更新拒絕。

- [x] T008 [P] [US1] 測試 `resolveIssueStatus` 的有效、缺漏、未知、衝突與 closed 狀態，位於 `apps/api/test/domain/issue-status-resolver.test.ts`
- [x] T009 [P] [US1] 測試 Gitea status/body error mapping，位於 `apps/api/test/gitea/errors.test.ts`
- [x] T010 [P] [US1] 使用 Fastify `inject()` 驗證 session API 未登入錯誤與 health response contract，位於 `apps/api/test/routes/session-contract.test.ts`
- [x] T011 [US1] 驗證 repository read/write 權限及 lookup 失敗時 fail-closed，位於 `apps/api/test/auth/permissions.test.ts`
- [x] T012 [US1] 驗證 Label 原子替換遇到 stale version 時不寫入，成功時僅呼叫一次 replacement 並核對回讀結果，位於 `apps/api/test/issues/label-replacement.test.ts`
- [x] T013 [US1] 以 HTTP mock 驗證 Gitea adapter 使用 delegated token/request id 並保留 403，位於 `apps/api/test/gitea/client.test.ts`

## Phase 4: User Story 2 - 驗證 Web 邏輯與互動 (Priority: P1)

**Independent Test**: `pnpm.cmd test:web` 通過，不啟動服務或瀏覽器。

- [x] T014 [US2] 測試工作檢視 URL state 的跨檢視保留、無效/退役 query 清除與預設 assignee，位於 `apps/web/test/work-view-url-state.test.ts`

## Phase 5: User Story 3 - 驗證跨層使用流程 (Priority: P2)

**Independent Test**: Playwright 使用受控 API response 瀏覽 Kanban，驗證卡片載入與欄內捲動，無正式 Gitea。

- [x] T015 [US3] 保留並執行 Kanban route/browser flow，mock session/repository/Kanban response，位於 `apps/web/e2e/repository-kanban-scroll.spec.ts`
- [x] T016 [US3] 確認 Playwright 以本機 Web server 執行且測試 API request 均由 route mock 提供，設定於 `apps/web/playwright.config.ts` 與 E2E spec

## Phase 6: Polish & Cross-Cutting

- [x] T017 執行 API/Web 測試、Playwright E2E、typecheck、build 與 `git diff --check`；記錄全 repo format check 的既存基線失敗
- [x] T018 對照 `specs/047-test-coverage/spec.md` 更新實作狀態與 quickstart 結果

## Dependencies

- T001-T007 → US1/US2；US3 沿用既有 Playwright setup。
- 所有 story 完成後執行 T017-T018。

## Parallel Opportunities

- T008、T009、T011、T014 可在測試工具建立後分開實作。
- API/domain 與 Web 純邏輯測試可平行開發。

## Implementation Strategy

先交付 API/domain 與 Web 純邏輯測試，再確認既有 mocked Playwright 流程仍可執行；最後執行全套驗證。
