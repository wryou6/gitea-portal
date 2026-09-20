---

description: "Implementation tasks for hiding Workflow Labels on Board Cards"
---

# Tasks: Hide Workflow Labels on Board Cards

**Input**: Design documents from `specs/003-board-card-label-display/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: 本 feature specification 未要求 TDD 或新增自動化測試任務；保留 quickstart、typecheck 與 build 驗證任務。

**Organization**: Tasks are grouped by user story. User Story 1 and User Story 2 are both P1; User Story 3 is P2.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 確認沿用既有 monorepo 與 read-through 邊界，不引入本 feature 不需要的依賴或持久化。

- [X] T001 [P] 確認 `package.json`、`pnpm-workspace.yaml` 與 `specs/003-board-card-label-display/plan.md` 維持既有 TypeScript/React 工作區、無新增套件、無資料庫或 Board JSON schema 變更。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 建立 Board Card view 的共享型別與 response contract，供後續 API 與 Web Story 使用。

**⚠️ CRITICAL**: 本階段完成前不可開始 User Story 實作。

- [X] T002 定義 `BoardCard` read-time view type 於 `packages/domain/src/board.ts`，令 Board columns 使用 `BoardCard[]`，並新增必要的 `visibleLabels: IssueLabel[]`；保留完整 `labels`，且遵守 `visibleLabels` 是目前 Issue `labels` 子集的 invariant。
- [X] T003 同步 `BoardCard` 與 `GET /api/boards/:id` 的 `visibleLabels` response contract 於 `packages/gitea-contracts/src/portal.ts` 與 `apps/web/src/features/boards/types.ts`；`apps/web/src/lib/api.ts` 的一般 `Issue.labels` 必須繼續代表完整 Labels，不套用 Board Card 過濾。

**Checkpoint**: Shared Board Card view contract ready - API 與 Web 可開始分別實作。

---

## Phase 3: User Story 1 - 以欄位辨識工作狀態 (Priority: P1) 🎯 MVP

**Goal**: Board Card 的 Workflow 狀態由所在欄位表達，Card 不再重複顯示該 Board Convention 的 Workflow Labels。

**Independent Test**: 使用包含多個 Workflow 狀態的 Board，確認每張 Card 仍位於正確欄位，且所選 Convention 的 Workflow Labels 不出現在 Card Label 區域。

### Implementation for User Story 1

- [X] T004 [US1] 在 `apps/api/src/boards/board-view-service.ts` 的 Board view 組合階段，依 exact `convention.states[].labelName` 建立 Workflow Label name set，為每張 repaired card 產生 `visibleLabels`；不得依固定 prefix、display name 或硬編碼狀態猜測，`visibleLabels` 衍生不得新增 Gitea 或 Portal write，既有 Workflow auto-repair write 維持不變。
- [X] T005 [US1] 更新 `apps/web/src/features/boards/KanbanBoard.tsx`、`apps/web/src/features/boards/KanbanColumn.tsx` 與 `apps/web/src/features/boards/KanbanCard.tsx` 使用 `BoardCard` view data；Card 狀態仍由欄位 `stateKey`/`displayName` 表達，Label render 改用 `visibleLabels`，並保留 Repository、Issue number、Title、Assignee、原有 drag transition 與 repair/error 顯示。

**Checkpoint**: User Story 1 可獨立展示欄位狀態，且不顯示所選 Convention 的 Workflow Labels。

---

## Phase 4: User Story 2 - 保留一般工作分類資訊 (Priority: P1)

**Goal**: Board Card 保留所有非本 Board Convention 的 Labels；沒有可顯示 Label 時，不留下空的 Label 容器。

**Independent Test**: 使用同時有 Workflow Label、`bug`、Priority 或 Team Label 的 Issue，確認一般 Labels 全部可見；再使用只有 Workflow Label 的 Issue，確認 Label 區域省略。

### Implementation for User Story 2

- [X] T006 [US2] 在 `apps/web/src/features/boards/KanbanCard.tsx` 以 `visibleLabels.length > 0` 條件渲染 Label container，顯示 `visibleLabels` 中每一個非 Workflow Label；空陣列時省略 container，但不得影響 `apps/web/src/features/boards/KanbanColumn.tsx` 的欄位、Card identity、Assignee、repair annotation 或 error message。

**Checkpoint**: User Stories 1 and 2 可同時驗證；Board Card 只隱藏所選 Convention Workflow Labels，普通分類 Labels 與核心 Card 資訊仍完整。

---

## Phase 5: User Story 3 - 需要完整資料時回到 Issue 詳情 (Priority: P2)

**Goal**: Board Card 的簡化只影響 Board 呈現；Issue list、Issue detail 與 Gitea 原始 Issue 仍可查看完整 Labels。

**Independent Test**: 從 Board Card 開啟 Portal Issue detail，再前往 Gitea 原始 Issue，確認兩處都能看到完整 Workflow Labels 與一般 Labels。

### Implementation for User Story 3

- [X] T007 [P] [US3] 保持 `apps/api/src/issues/issue-search-service.ts`、`apps/api/src/issues/issue-service.ts`、`apps/web/src/features/issues/IssueListPage.tsx`、`apps/web/src/features/issues/IssueRow.tsx`、`apps/web/src/features/issues/IssueDetailHeader.tsx` 與 `apps/web/src/features/issues/IssueDetailPage.tsx` 使用完整 `Issue.labels`；保留 Board Card 前往 Portal detail 及 detail page 前往原始 Gitea URL 的既有路徑，不將 `visibleLabels` 過濾規則洩漏到 Issue list/detail。

**Checkpoint**: User Stories 1–3 均可獨立驗證，且 Board 簡化不會造成完整 Issue metadata 遺失。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 驗證 presentation-only 邊界、既有 Board 行為與交付文件。

- [X] T008 [P] 檢查 `apps/api/src/boards/board-view-service.ts`、`apps/web/src/features/boards/card-transition.ts` 與 `packages/domain/src/board.ts`，確認 `visibleLabels` 不會修改 Gitea Labels、Issue state、Board JSON 設定或新增 Workflow repair 行為；既有 Workflow auto-repair side effect 維持不變，並修正任何因型別調整造成的相容性問題。
- [X] T009 執行 `specs/003-board-card-label-display/quickstart.md` 的六個情境，並從 repository root 執行 `pnpm.cmd typecheck` 與 `pnpm.cmd build`；Scenario 5 使用有效 Workflow state 驗證呈現不 mutation，Scenario 3 分開驗證既有 repair/anomaly 行為，以及 Board Card、Issue list/detail、Gitea URL 與空 Label container。
- [X] T010 [P] 更新 `specs/003-board-card-label-display/quickstart.md` 與 `specs/003-board-card-label-display/contracts/board-card-label-display.md`，使文件中的 response shape、顯示規則與實際 `visibleLabels` 實作一致。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 - Setup**: 無前置依賴；確認既有工作區與範圍。
- **Phase 2 - Foundational**: 依賴 Phase 1，建立 shared Board Card view contract；阻擋所有 User Story。
- **Phase 3 - US1**: 依賴 Phase 2；建立 API `visibleLabels` 並接到 Board Card。
- **Phase 4 - US2**: 依賴 Phase 3 的 Board Card `visibleLabels` wiring，再處理一般 Labels 與空容器。
- **Phase 5 - US3**: 依賴 Phase 2；可與 US1/US2 平行檢查 Issue list/detail 邊界，但整合驗證需在 Board view contract 穩定後完成。
- **Phase 6 - Polish**: 依賴所有要交付的 User Stories。

### User Story Dependencies

- **US1 (P1)**: Phase 2 完成後可開始；無其他 User Story 依賴。
- **US2 (P1)**: 依賴 US1 提供的 `visibleLabels` response 與 Web wiring；不新增其他資料來源。
- **US3 (P2)**: Phase 2 完成後即可平行進行；必須確認不改變 US1/US2 以外的 Issue read paths。

### Within Each User Story

- Shared types/contract before API response derivation.
- API response derivation before Board Card rendering.
- Board Card rendering before empty-container refinement.
- Core implementation before quickstart validation.

## Parallel Opportunities

- **Phase 1**: T001 可獨立執行。
- **Phase 2**: T002 必須先於 T003；兩者不可同時修改同一型別定義。
- **After Phase 2**: T007 [US3] 可與 T004/T005 平行，因為它只保護 Issue list/detail read paths。
- **Phase 6**: T008 與 T010 可平行處理不同檔案；T009 需等實作與文件穩定後執行。

### Parallel Example: User Story 1 + User Story 3

```text
Developer A: T004 -> T005 (API visibleLabels and Board rendering)
Developer B: T007 (preserve complete Issue labels and navigation paths)
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 T001。
2. 完成 T002–T003 建立 Board Card view contract。
3. 完成 T004–T005，讓 Board 欄位表達狀態且 Card 隱藏所選 Workflow Labels。
4. 依 US1 independent test 驗證後再擴充 US2。

### Incremental Delivery

1. Phase 1–2：完成 shared view contract。
2. US1：完成欄位狀態與 Workflow Label 隱藏，形成最小可用版本。
3. US2：補上一般 Labels 顯示與空 Label container 隱藏。
4. US3：確認完整 Labels 與 Gitea 導航保持可用。
5. Polish：執行 quickstart、typecheck、build 並同步文件。

## Notes

- 所有 task 都使用 `- [ ] [TaskID] [P?] [Story?]` checklist 格式。
- `[P]` 僅用於可在不同檔案、無未完成依賴下平行執行的任務。
- `visibleLabels` 是 read-time view data，不保存、不同步、不建立 Portal snapshot。
- 不新增資料庫、Workflow Engine、Label convention parser 或額外 Gitea API round trip。
