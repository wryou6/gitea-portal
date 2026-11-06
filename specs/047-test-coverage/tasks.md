# Tasks: 分層自動化測試

**Input**: Design documents from `/specs/047-test-coverage/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: 測試為此 feature 的主要交付物。

## Previously Completed Work

- [x] T001 新增 root `test:api`、`test:web`、`test:e2e` 與 `test` 指令。
- [x] T002-T004 設定 API/Web runner 並確認 Windows workspace 命令。
- [x] T005-T007 建立 Gitea mock、隔離 fixtures 並更新 README/quickstart。
- [x] T008-T009 測試 Issue Status resolver 與 Gitea error mapping。
- [x] T010-T011 測試 session/health route contract 與 repository permissions。
- [x] T012-T013 測試 atomic label replacement 與 delegated Gitea client request。
- [x] T014-T016 測試工作檢視 URL state 與 mocked Kanban browser flow。
- [x] T017-T018 執行原始驗證並更新 spec/quickstart。

## Phase 1: Setup

- [ ] T019 [P] 確認 API write routes 與對應 Gitea requests，整理 create/update/comment/transition fixture matrix，對照 `apps/api/src/issues/issue-routes.ts`、`apps/api/src/http/routes.ts`
- [ ] T020 [P] 擴充可注入錯誤 body/timeout 的 Gitea test helper，位於 `apps/api/test/helpers/mock-gitea.ts`
- [x] T037 新增 Vitest、Testing Library、user-event、jsdom dev dependencies 並設定 `apps/web/vitest.config.ts`
- [x] T038 新增獨立 `test:component` script，並串接 root `test:web`，更新 `apps/web/package.json` 與根 `package.json`

## Phase 2: Foundational

- [ ] T021 建立 Fastify inject helper，提供測試簽章 session、CSRF 與可計數 Gitea requests，位於 `apps/api/test/helpers/`
- [ ] T022 [P] 在 Playwright fixtures 中統一 session、repository、issue、kanban 與 transition response mocks，位於 `apps/web/e2e/`

## Phase 3: User Story 1 - 認證後 API 寫入 (P1)

**Independent Test**: `pnpm.cmd test:api` 驗證 route 到 Gitea adapter，無正式 Gitea。

- [x] T023 [P] 測試缺 session、錯誤簽章、過期 session 與缺 CSRF 的 issue create/update/comment/transition 拒絕，並斷言零次 Gitea write，位於 `apps/api/test/routes/issue-write-auth.test.ts`
- [x] T024 [P] 測試無 push/comment 權限時各寫入 route 回 403 且零次 Gitea write，位於同測試檔
- [ ] T025 測試授權 status transition 經 route/permission/service/adapter 成功，保留一般 Labels 並只呼叫一次 atomic replacement，新增 `apps/api/test/routes/issue-transition.test.ts`
- [x] T026 測試 stale `expectedUpdatedAt` 回 409 且不觸發 Gitea writes，位於 `apps/api/test/routes/issue-transition.test.ts`

## Phase 4: User Story 1 - Gitea adapter failures (P1)

**Independent Test**: `pnpm.cmd test:api` 執行 adapter 測試且每案隔離 mock。

- [x] T027 [P] 覆蓋 401/403/404/429/500、空 body、非 JSON/截斷 JSON 與 timeout，驗證 Portal error status/message，位於 `apps/api/test/gitea/client-failures.test.ts`
- [x] T028 驗證 adapter 錯誤 log 不包含 delegated token；fetch stub 由 `withMockGitea` finally 還原

## Phase 5: User Story 2 - Web component interactions (P1)

**Independent Test**: 獨立執行 Vitest component suite；不啟動 API 或瀏覽器服務。

- [x] T029 [P] 測試 WorkViewFilterBar 多選、清除與序列化 URL 更新，位於 `apps/web/test/WorkViewFilterBar.test.tsx`
- [x] T030 測試鍵盤操作、disabled self-filter、長文字與 zh-TW/en/ja 渲染，沿用 component spec
- [x] T031 確認 component suite 獨立執行並更新 README 測試說明

## Phase 6: User Story 3 - Issue status transition E2E (P2)

**Independent Test**: Playwright status spec 驗證成功、403、409；既有 Kanban scroll spec 仍通過。

- [x] T032 測試從 Kanban Todo 卡片轉為 In Progress，確認 UI status 與 workflow Label 更新，位於 `apps/web/e2e/kanban-status-transition.spec.ts`
- [x] T033 測試 403 permission denied 與 409 concurrency conflict 可見，且卡片回復到伺服器確認狀態，沿用 transition spec

## Phase 7: Polish & Cross-Cutting

- [x] T034 更新 README 與 `specs/047-test-coverage/quickstart.md`，記錄 component suite 指令與 mock 前提
- [ ] T035 執行 `pnpm.cmd test:api`、`pnpm.cmd test:web`、`pnpm.cmd test:e2e`、`pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd format:check` 與 `git diff --check`
- [ ] T036 對照 spec 更新狀態及測試結果，並確認未連接正式 Gitea、未使用正式 credentials

## Dependencies

- T019-T022 → US1-US3；T037-T038 → US2。
- US1 API tests 與 US2 component runner setup 可在基礎 fixture 完成後平行；US2 與 US3 可共用前端 fixtures 後平行。
- T034-T036 在所有 stories 完成後執行。

## Parallel Opportunities

- T019、T020、T022 可平行。
- T023/T024/T027 可在 T021 完成後平行。
- T029/T030 依賴 T037/T038；T032 可在 T022 完成後平行。

## Implementation Strategy

先完成 API auth/write 與 adapter failure，確保權限和資料完整性；再補 WorkViewFilterBar interaction 與 Kanban transition E2E；最後完整執行 workspace 測試及 build gates。
