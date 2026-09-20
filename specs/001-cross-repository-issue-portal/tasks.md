---

description: "跨 Repository Gitea Issue 管理 Portal implementation tasks"
---

# Tasks: 跨 Repository Gitea Issue 管理 Portal

**Input**: Design documents from `specs/001-cross-repository-issue-portal/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

**Tests**: Feature specification defines acceptance scenarios but does not request TDD or a specific automated test implementation. Tasks below therefore focus on implementation and quickstart validation; implementation may add automated tests in the files identified by the plan when the later engineering plan selects them.

## Phase 1: Setup

**Purpose**: 建立 pnpm workspace、前後端目錄與共用契約邊界。

- [X] T001 建立根目錄 `package.json`、`pnpm-workspace.yaml` 與 workspace scripts，對應 `apps/web`、`apps/api`、`packages/domain`、`packages/gitea-contracts`
- [X] T002 [P] 建立 `apps/web/package.json`、Vite/React 入口與 `apps/web/src/main.tsx`
- [X] T003 [P] 建立 `apps/api/package.json`、Fastify 入口與 `apps/api/src/server.ts`
- [X] T004 [P] 建立 `packages/domain/package.json` 與 `packages/domain/src/index.ts`，作為前後端共用領域型別入口
- [X] T005 [P] 建立 `packages/gitea-contracts/package.json` 與 `packages/gitea-contracts/src/index.ts`，承載 Gitea/Portal boundary 型別
- [X] T006 建立 `.env.example` 與 `apps/api/src/config/env.ts`，列出 Gitea base URL、OAuth client、session、JSON Board store path 與 workflow config 設定
- [X] T007 [P] 建立 `apps/web/src/styles/`、`apps/web/src/components/`、`apps/api/src/http/` 與 `apps/api/src/gitea/` 的初始目錄結構

---

## Phase 2: Foundational

**Purpose**: 所有 User Story 的必要基礎；本階段完成前不得開始 story implementation。

- [X] T008 建立 `packages/domain/src/repository.ts`、`packages/domain/src/issue.ts`、`packages/domain/src/workflow.ts` 與 `packages/domain/src/board.ts`，定義 Repository+Issue Number composite identity、`unconfigured`、`conflict` 與 exact Convention version 型別
- [X] T009 建立 `packages/gitea-contracts/src/gitea.ts`，定義 Gitea Issue、Comment、Label、Milestone、Repository、User 與 API error mapping 型別
- [X] T010 建立 `packages/gitea-contracts/src/portal.ts`，依 `contracts/openapi.yaml` 定義 Session、Issue、IssuePage、Board、BoardView、WorkflowConvention 與 mutation payload
- [X] T011 建立 `apps/api/src/persistence/database.ts` 的 versioned JSON Board store schema，包含 `schemaVersion`、`revision`、Board configuration 與禁止 Issue mirror 的 validation
- [X] T012 建立 `apps/api/src/persistence/database.ts` 與 `apps/api/src/persistence/board-repository.ts`，實作 JSON shared Board CRUD、atomic write、schema validation、schema version 與 lock-file 並行寫入保護
- [X] T013 建立 `config/workflows/conventions.yaml` 的 versioned read-only schema 範例，明確包含 convention id/version、ordered states、exact label names 與 repository assignments
- [X] T014 建立 `apps/api/src/workflows/convention-loader.ts` 與 `packages/domain/src/workflow-state-resolver.ts`，載入並驗證 unique state key、unique Label name、deterministic order、每 Repository 僅一個 exact Convention version，並實作 no workflow label → `unconfigured`、exactly one matching label → ordered state、multiple same-Convention labels → `conflict`；非 Workflow Labels 不參與判定
- [X] T015 建立 `apps/api/src/auth/oauth.ts` 與 `apps/api/src/auth/session.ts`，實作 Gitea OAuth2 delegated session；Gitea access token 僅存在後端 session，不得進入 browser bundle
- [X] T016 建立 `apps/api/src/auth/permissions.ts`，以目前使用者 delegated Gitea API 結果判定 Repository/Issue read、create、update、comment 與 Label mutation 權限，不建立 Portal role/member bypass
- [X] T017 建立 `apps/api/src/gitea/client.ts`、`apps/api/src/gitea/errors.ts` 與 `apps/api/src/gitea/request.ts`，集中 Gitea REST API 呼叫、timeout、401/403/404/409 mapping 與 request correlation logging
- [X] T018 建立 `apps/api/src/http/error-handler.ts`、`apps/api/src/http/auth-middleware.ts` 與 `apps/api/src/http/routes.ts`，統一 session cookie、未授權、不可見資源與外部 Gitea failure response
- [X] T019 建立 `apps/api/src/app.ts`，註冊 `/api` routes、session middleware、error handler 與 health/config checks，且不讓前端直接呼叫 Gitea
- [X] T020 建立 `apps/web/src/lib/api.ts`，依 Portal API contract 呼叫後端並處理 session、permission 與 error 狀態
- [X] T021 建立 `apps/web/src/app/App.tsx`、`apps/web/src/app/routes.tsx` 與 `apps/web/src/components/AppShell.tsx`，提供 Issue、Board、workflow convention 的共用導航與登入狀態

**Checkpoint**: 基礎 auth、Gitea adapter、persistence boundary、workflow config loader 與 Portal API/client skeleton 可供所有 story 使用。

---

## Phase 3: User Story 1 - 統一瀏覽與篩選 Issues (Priority: P1)

**Goal**: 從單一入口讀取所有納入範圍且目前使用者可見的跨 Repository Issues，並組合條件搜尋。

**Independent Test**: 使用可查看兩個 Repository 的帳號開啟清單，確認每列含 Repository/Issue Number 等欄位；同時套用 Repository、State、Assignee、Label、Milestone、keyword，結果只含符合全部條件且使用者可見的 Issues。

- [X] T022 [P] [US1] 建立 `apps/api/src/repositories/repository-service.ts`，從 Gitea 取得目前使用者可見 Repository，保留原始 `owner/name/fullName/htmlUrl` 與 workflow assignment metadata
- [X] T023 [US1] 建立 `apps/api/src/issues/issue-search-service.ts`，以 Gitea cross-Repository issue search/read-through 組合 keyword、Repository、State、Assignee、Label、Milestone、page 與 limit 條件，所有 filter groups 以 AND 語意處理
- [X] T024 [US1] 建立 `apps/api/src/issues/issue-routes.ts` 的 `GET /api/issues` 與 `GET /api/repositories`，把 Gitea 權限拒絕映射為不可見結果或明確錯誤，不回傳無權 Repository 存在資訊
- [X] T025 [P] [US1] 建立 `apps/web/src/features/issues/issue-list-state.ts`，管理 query、filter、pagination、loading、empty、permission 與 Gitea unavailable state
- [X] T026 [US1] 建立 `apps/web/src/features/issues/IssueListPage.tsx`，顯示 Repository、Issue Number、Title、State、Assignee、Labels、Milestone、Updated Time 與原始 Issue link
- [X] T027 [US1] 建立 `apps/web/src/features/issues/IssueFilters.tsx`，提供 Repository、Open/Closed、Assignee、Label、Milestone 與 keyword 組合篩選，送出後保留可分享的 query state
- [X] T028 [P] [US1] 建立 `apps/web/src/features/issues/IssueRow.tsx`、`apps/web/src/features/issues/LabelList.tsx` 與 `apps/web/src/features/issues/IssueListPage.css`，確保不同 Repository 的相同 Issue Number 不會混淆

---

## Phase 4: User Story 2 - 查看 Issue 詳情與回到 Gitea (Priority: P1)

**Goal**: 從跨 Repository 清單查看單一 Gitea Issue 的完整 read-through 詳情與 Comments，並能開啟原始頁面。

**Independent Test**: 從清單開啟 Issue detail，確認 Repository、Number、Title、Description、State、Assignee、Labels、Milestone、Updated Time、Comments 與 Gitea URL 均正確。

- [X] T029 [US2] 擴充 `apps/api/src/issues/issue-service.ts`，以 `(repositoryOwner, repositoryName, number)` 讀取 Issue detail 與 Gitea HTML URL，不以 Issue Number 單獨識別
- [X] T030 [US2] 建立 `apps/api/src/issues/comment-query-service.ts`，從 Gitea read-through 取得指定 Issue Comments，保留 author、body、createdAt、updatedAt 與時間順序
- [X] T031 [US2] 擴充 `apps/api/src/issues/issue-routes.ts` 的 `GET /api/issues/{owner}/{repo}/{number}` 與 comments GET route，處理不存在、失去權限與 Gitea 最新資料
- [X] T032 [P] [US2] 建立 `apps/web/src/features/issues/IssueDetailPage.tsx` 與 `apps/web/src/features/issues/IssueDetailHeader.tsx`，顯示所有原生 Issue 欄位、Repository identity 與 state
- [X] T033 [P] [US2] 建立 `apps/web/src/features/issues/IssueComments.tsx`，依 Gitea comment 時間順序顯示作者與內容，並隔離不同 Repository/Issue context
- [X] T034 [US2] 建立 `apps/web/src/features/issues/IssueDetailRoute.tsx`，由清單使用 owner/repo/number composite route 開啟 detail，並提供明確的原始 Gitea Issue link
- [X] T035 [US2] 在 `apps/web/src/features/issues/IssueDetailPage.tsx` 與 `apps/api/src/issues/issue-service.ts` 加入 stale/deleted/permission-revoked refresh handling，不把過期資料標示為最新成功狀態

---

## Phase 5: User Story 3 - 從 Portal 建立與編輯 Gitea Issue (Priority: P1)

**Goal**: 直接建立正式 Gitea Issue，並修改 Title、Description、State、Assignee、Labels、Milestone、Close/Reopen。

**Independent Test**: 在可修改 Repository 建立 Issue，修改欄位、Close、Reopen，重新從 Portal 與 Gitea 查看並確認同一 Issue 一致；只讀帳號操作不得產生變更。

- [X] T036 [US3] 建立 `apps/api/src/issues/issue-command-service.ts`，實作 create payload `title` required，以及 body、assignee、labels、milestone 的 Gitea delegated mutation
- [X] T037 [US3] 擴充 `apps/api/src/issues/issue-command-service.ts`，實作 Issue patch 的 title、body、state(open/closed)、assignee、labels、milestone，並使用 Gitea 最新資料避免靜默覆蓋
- [X] T038 [US3] 擴充 `apps/api/src/issues/issue-routes.ts` 的 Repository issue POST 與 Issue PATCH route，依 `contracts/openapi.yaml` 回傳 201/200、403、404、409
- [X] T039 [US3] 建立 `apps/api/src/issues/issue-validation.ts`，拒絕空 Title、非法 state、無效 assignee/label/milestone 與缺少 Repository context 的 payload，且 validation failure 不呼叫 Gitea mutation
- [X] T040 [P] [US3] 建立 `apps/web/src/features/issues/IssueCreatePage.tsx` 與 `apps/web/src/features/issues/IssueForm.tsx`，提供 Repository 選擇與 Title、Description、Assignee、Labels、Milestone 欄位
- [X] T041 [P] [US3] 建立 `apps/web/src/features/issues/IssueEditForm.tsx`，提供 Title、Description、State、Assignee、Labels、Milestone、Close 與 Reopen 操作
- [X] T042 [US3] 在 `apps/web/src/features/issues/IssueForm.tsx` 與 `apps/web/src/features/issues/IssueEditForm.tsx` 實作欄位驗證、Gitea permission denied、conflict、unavailable 與成功後重新讀取 Issue
- [X] T043 [US3] 在 `apps/api/src/issues/issue-command-service.ts` 與 `apps/web/src/features/issues/IssueDetailPage.tsx` 確保只讀使用者的 create/update/close/reopen 被 Gitea 拒絕時不顯示成功，且不提交第二次或部分本地變更

---

## Phase 6: User Story 4 - 管理 Comments (Priority: P1)

**Goal**: 從 Portal 讀取與新增 Gitea Comment，維持原生 Issue 討論來源。

**Independent Test**: 在可新增 Comment 的 Issue 提交非空內容，從 Portal 與 Gitea 確認作者、內容與所屬 Issue 一致；無權限操作不產生 Comment。

- [X] T044 [US4] 擴充 `apps/api/src/issues/comment-command-service.ts`，以 delegated Gitea identity 新增 Comment，要求 `body` 長度至少 1，成功後回傳 Gitea Comment
- [X] T045 [US4] 擴充 `apps/api/src/issues/issue-routes.ts` 的 comments POST route，處理 201、401、403、404、Gitea timeout 與 duplicate-submit protection
- [X] T046 [P] [US4] 建立 `apps/web/src/features/issues/CommentComposer.tsx`，提供非空驗證、submit pending、permission denied 與 unavailable feedback
- [X] T047 [US4] 整合 `apps/web/src/features/issues/CommentComposer.tsx` 與 `IssueComments.tsx`，成功後只以 Gitea response/re-read 更新畫面，失敗時不插入假 Comment

---

## Phase 7: User Story 5 - 跨 Repository Kanban 管理 (Priority: P1)

**Goal**: 建立共享 Board，顯示多個 Repository 的 read-through Issue Cards，並以 Gitea 可保存的 Workflow Labels 原子切換狀態。

**Independent Test**: 建立包含兩個相同 Convention version Repository 的共享 Board，查看 Cards；有權限使用者移動 Card 後確認 Gitea Labels 與 Board 一致；不相容 Repository、無權限 Issue 或無 atomic capability 時操作被拒絕且原狀保留。

- [X] T048 [US5] 建立 `apps/api/src/boards/board-service.ts`，實作 shared Board create/list/get/update/delete；不建立 owner/member 欄位，所有 Portal 使用者可管理 Board config，刪除只刪 Portal config
- [X] T049 [US5] 建立 `apps/api/src/boards/board-compatibility.ts`，要求 Board 與每個 Repository 使用相同 exact Convention id/version，拒絕 unknown/unassigned/mismatched Repository
- [X] T050 [US5] 建立 `apps/api/src/boards/board-view-service.ts`，依 Board repositoryRefs 從 Gitea read-through 取得目前使用者可見 Issues，計算欄位、unconfigured 與 conflict presentation，不保存 Issue snapshot
- [X] T051 [US5] 建立 `apps/api/src/boards/board-routes.ts` 的 Board GET/POST/PATCH/DELETE 與 BoardView route，依 `contracts/openapi.yaml` 回傳 compatibility、permission、not found 與 validation errors
- [X] T052 [P] [US5] 建立 `apps/web/src/features/boards/BoardListPage.tsx`、`BoardEditor.tsx` 與 `BoardRepositoryPicker.tsx`，支援共享 Board 建立、編輯、刪除與相同 Convention Repository 選擇
- [X] T053 [US5] 建立 `apps/web/src/features/boards/KanbanBoard.tsx`、`KanbanColumn.tsx` 與 `KanbanCard.tsx`，顯示 Repository、Issue Number、Title、Assignee、Labels、unconfigured 與 conflict
- [X] T054 [US5] 建立 `apps/api/src/boards/transition-service.ts`，在 mutation 前驗證 current Issue、user permission、Board/repository exact Convention、target state、target Label 存在與 atomic replacement capability
- [X] T055 [US5] 在 `apps/api/src/gitea/label-replacement.ts` 實作單一 atomic Gitea Label replacement 或 target instance 支援的等效 atomic operation；禁止 remove-then-add fallback，無法保證 atomic 時回傳 unsupported 且不得修改 Gitea
- [X] T056 [US5] 建立 `apps/api/src/http/board-transition-route.ts` 的 transition endpoint；成功回傳 re-read Issue，preflight/unsupported 回傳 422，state conflict 或 Gitea concurrent change 回傳 409，並保證原始 Labels 不變
- [X] T057 [US5] 建立 `apps/web/src/features/boards/card-transition.ts` 與 `apps/web/src/features/boards/KanbanBoard.tsx` 的 drag/drop transition，只有成功 response 才移動 Card；拒絕或失敗時 refresh 並顯示原因
- [X] T058 [US5] 在 `apps/api/src/boards/board-view-service.ts` 與 `apps/web/src/features/boards/KanbanBoard.tsx` 加入重新整理與外部 Gitea 變更處理，確保直接在 Gitea 修改後 Board 不以 Portal 狀態覆蓋

---

## Phase 8: User Story 6 - 以 Labels 表達工作管理分類 (Priority: P2)

**Goal**: 以集中、版本化 Workflow Convention 解讀不同團隊的 workflow Labels，並保留非 Workflow Labels 的一般分類用途。

**Independent Test**: 準備兩套 Convention 與不同 Repository assignment，確認 Board 僅接受 exact matching version；Issue 無 workflow label 顯示「未設定狀態」，同 Convention 多個 workflow labels 顯示「狀態衝突」，非 Workflow Labels 不影響判定。

- [X] T059 [US6] 建立 `apps/api/src/http/workflow-convention-routes.ts` 的 read-only `GET /api/workflow-conventions`，只回傳已發布 Convention/version/states，不提供建立或修改 endpoint
- [X] T060 [US6] 擴充 `apps/api/src/workflows/convention-loader.ts`，依集中設定的 prefix/namespace 解析 Convention、state name、state order 與 exact Label name，不以 Issue Labels 自動推測 Repository Convention
- [X] T061 [US6] 在 `apps/api/src/boards/board-compatibility.ts` 與 `apps/api/src/boards/board-view-service.ts` 整合 immutable Convention version，確保既有 Board 不因新版 Convention 改變欄位語意
- [X] T062 [P] [US6] 建立 `apps/web/src/features/workflows/WorkflowStateBadge.tsx`、`apps/web/src/features/workflows/WorkflowLegend.tsx` 與 `apps/web/src/features/workflows/workflow-display.ts`，以 Board Convention 狀態順序呈現正常、未設定與衝突狀態
- [X] T063 [US6] 在 `apps/web/src/features/issues/IssueFilters.tsx` 與 `apps/web/src/features/boards/BoardEditor.tsx` 顯示 workflow/non-workflow label metadata，避免將 `priority:*`、`team:frontend`、`bug` 等一般 Labels 誤判為 Workflow state

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 完成跨故事的可靠性、可操作性、效能與需求驗證。

- [X] T064 [P] 在 `apps/api/src/http/error-handler.ts` 與 `apps/web/src/components/ErrorNotice.tsx` 統一 Gitea unavailable、permission denied、not found、conflict、unsupported atomic transition 與 validation message，禁止未成功 mutation 顯示為成功
- [X] T065 [P] 在 `apps/api/src/auth/session.ts`、`apps/api/src/http/auth-middleware.ts` 與 `apps/web/src/lib/api.ts` 完成 cookie/session hardening、CSRF 防護、token redaction 與禁止 browser 直接保存 Gitea token
- [X] T066 [P] 在 `apps/api/src/telemetry/request-metrics.ts` 與 `apps/web/src/lib/performance.ts` 加入跨 Repository list/detail/Board response timing，量測工程 response-time 目標；SC-002、SC-003、SC-005、SC-008 的使用者成效量測留給後續產品驗收
- [X] T067 [P] 在 `apps/web/src/styles/accessibility.css`、`apps/web/src/components/LoadingState.tsx` 與 `apps/web/src/components/EmptyState.tsx` 完成鍵盤操作、focus state、loading、empty、error 與 responsive layout 的共用 UI 行為
- [X] T068 在 `README.md` 補充本 feature 的 local setup、Gitea OAuth 設定、workflow convention config、Board persistence boundary 與禁止把 access token 寫入 repository/frontend 的說明
- [ ] T069 在 `specs/001-cross-repository-issue-portal/quickstart.md` 執行並記錄六個 validation scenarios，包含 atomic transition 成功與 unsupported/preflight rejection；evidence 不得保存 token、密碼或未授權 Issue 內容
- [X] T070 在 `specs/001-cross-repository-issue-portal/checklists/portal-quality.md` 逐項進行 reviewer review，將未完成項目記錄於 implementation review notes，不直接勾選 reviewer-owned checklist marker
- [X] T071 檢查 `spec.md`、`plan.md`、`data-model.md`、`contracts/openapi.yaml`、`quickstart.md` 與 `tasks.md` 的 Source of Truth、Gitea permission、Board shared model、exact Convention version、no Issue mirror 與 atomic transition wording 一致

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies; T002–T007 can proceed in parallel after T001 establishes workspace metadata.
- **Phase 2 Foundational**: Depends on T001–T007; blocks every user story.
- **Phase 3 US1**: Depends on T008–T021; delivers the MVP read/search entry point.
- **Phase 4 US2**: Depends on US1 list routing and shared Gitea read-through foundation; can begin after Phase 2, but integrates naturally after US1.
- **Phase 5 US3**: Depends on Phase 2; uses US2 Issue detail/forms but its API mutation service is independently implementable.
- **Phase 6 US4**: Depends on Phase 2 and Issue detail context from US2.
- **Phase 7 US5**: Depends on T013–T014, T016–T017 and persistence foundation; uses Issue read-through from US1/US2. Workflow state resolution is provided by Foundational T014.
- **Phase 8 US6**: Depends on T013–T014; completes the read-only Convention API, immutable version integration and workflow metadata presentation after US5 can already resolve Board states.
- **Phase 9 Polish**: Depends on all desired stories; T069 can only run after the corresponding stories are implemented.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational; MVP and prerequisite for the most natural US2/US5 navigation.
- **US2 (P1)**: Can start after Foundational; consumes US1 route links but remains independently testable via a direct composite Issue URL.
- **US3 (P1)**: Can start after Foundational; depends on shared Issue domain and permission services, not on Portal-owned Issue persistence.
- **US4 (P1)**: Can start after Foundational; requires Issue detail context but has its own comment command/read paths.
- **US5 (P1)**: Depends on Board persistence, Workflow Convention loading and the Foundational workflow-state resolver; integrates with US1 read-through and US3 mutation behavior.
- **US6 (P2)**: Can start after Foundational; it exposes and presents Convention metadata but does not block US5 state resolution.

### Parallel Opportunities

- After T001: T002–T007 can run in parallel where files do not overlap.
- After Phase 2: US1 API/UI tasks, US2 detail UI, US3 form UI, US4 comment UI, and US6 Convention API/UI can be split among contributors, subject to shared package contracts.
- Within US1: T022 and T025/T028 are parallel; T023/T024 depend on the Gitea client and domain types.
- Within US3: T040 and T041 can run in parallel after payload types exist; command service and UI can proceed on separate files.
- Within US5: T052, T053 and T055 can proceed in parallel after Board/domain contracts; T056 depends on T054/T055.
- Within Polish: T064–T067 can run in parallel; T069 and T071 are final validation tasks.

## Parallel Example: MVP (US1)

```text
Task: T022 repository-service.ts
Task: T025 issue-list-state.ts
Task: T028 IssueRow.tsx, LabelList.tsx and IssueListPage.css
```

After T022 and the foundational Gitea adapter are available:

```text
Task: T023 issue-search-service.ts
Task: T027 IssueFilters.tsx
```

Then integrate T024, T026 and validate the US1 independent test before starting the remaining stories.

## Implementation Strategy

### MVP First

1. Complete Phase 1 Setup and Phase 2 Foundational.
2. Complete Phase 3 US1: cross-Repository browse/search/filter.
3. Add Phase 4 US2 for detail/comments read-through and Gitea link.
4. Validate US1 and US2 independently before enabling mutation stories.

### Incremental Delivery

1. Add US3 Issue create/edit/close/reopen.
2. Add US4 Comment creation.
3. Add US5 shared Kanban and atomic Label transitions.
4. Add US6 read-only Convention metadata API and presentation refinements.
5. Complete Polish, quickstart evidence and cross-artifact consistency review.

## Notes

- Every task uses the required `- [ ] Txxx` checklist form; `[P]` is only used where file ownership and dependencies permit parallel work.
- User Story tasks include exactly one `[USn]` label and an implementation path.
- Board transition implementation must not fall back to remove-then-add Label updates. If target Gitea cannot guarantee atomic replacement, the Portal rejects the operation before mutation.
- No task introduces a Portal Issue database, Board owner/member records, elevated shared Gitea credential, or Portal-owned workflow state.
