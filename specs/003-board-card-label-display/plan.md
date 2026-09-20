# Implementation Plan: Hide Workflow Labels on Board Cards

**Branch**: `003-board-card-label-display` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-board-card-label-display/spec.md`

## Summary

Board Card 需要隱藏 Board 所選 Workflow Convention 的 Workflow Labels，讓 Card 以欄位表達工作狀態，同時保留一般 Labels 供工程師快速辨識分類。設計在 Board view 組合階段產生 read-time `visibleLabels` 子集；Kanban 只呈現該子集，Issue list/detail 與 Gitea 原始資料維持完整 Labels。這是呈現層調整，不建立新資料、不修改 Gitea Issue。

## Technical Context

**Language/Version**: TypeScript 5.8.2，Node.js runtime；前端 React 19、Vite 6

**Primary Dependencies**: 既有 `@gitea-portal/domain`、`@gitea-portal/gitea-contracts`、Fastify API、React Web 與既有 Gitea client

**Storage**: 無變更；Board JSON 設定與 Gitea Issue Labels 維持既有保存方式，不保存 `visibleLabels`

**Testing**: 既有 `pnpm.cmd typecheck`、`pnpm.cmd build` 與 quickstart dummy Gitea 驗證；不新增測試框架

**Target Platform**: 內網瀏覽器與既有 Node.js API service

**Project Type**: Web application monorepo（`apps/api`、`apps/web`、shared packages）

**Performance Goals**: 不增加額外 Gitea round trip；Board 顯示結果沿用既有 Board load 行為，不新增獨立效能驗收目標

**Constraints**: 只隱藏所選 Convention 的 Workflow Labels；保留一般 Labels；不得依固定 prefix 猜測；不得修改 Gitea Labels、Issue 狀態或 Board JSON；修復 annotation/error 與欄位狀態仍須可辨識

**Scale/Scope**: 只影響跨 Repository Board Card 的呈現；Issue list、Issue detail、Gitea 原始頁面與 Board transition 行為不變

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Result: PASS / no active gates.** `.specify/memory/constitution.md` 仍是未填寫的 Spec Kit 模板，沒有可執行的專案原則或禁止事項。設計遵守 feature spec 的 Gitea Source of Truth、不新增持久化資料與不修改 Issue 的限制。

## Project Structure

### Documentation (this feature)

```text
specs/003-board-card-label-display/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── board-card-label-display.md
└── tasks.md             # Phase 2，由 $speckit-tasks 產生
```

### Source Code (repository root)

```text
packages/domain/src/board.ts
packages/gitea-contracts/src/portal.ts
apps/api/src/boards/board-view-service.ts
apps/web/src/features/boards/types.ts
apps/web/src/features/boards/KanbanCard.tsx
apps/web/src/features/boards/KanbanBoard.tsx
apps/web/src/features/issues/IssueListPage.tsx
apps/web/src/features/issues/IssueRow.tsx
apps/web/src/features/issues/IssueDetailPage.tsx
```

**Structure Decision**: 沿用既有 monorepo 分層。Domain/contracts 定義 Board Card 的 read-time visible label view shape；API 依 exact Workflow Convention 產生可顯示 Label 子集；Web Kanban 只使用該子集；Issue list/detail 不共用此隱藏規則。

## Phase 0: Research Decisions

### Decision 1: 使用 read-time `visibleLabels`，不新增呈現層 mutation

**Decision**: Board view 產生 `visibleLabels`，它是目前 Gitea Issue Labels 移除所選 Convention Workflow Labels 後的呈現子集；`visibleLabels` 的計算不將結果寫入 Gitea 或任何 Portal storage。既有 Workflow auto-repair 若因缺失或衝突而執行，仍依既有規則更新 Gitea Workflow Labels。

**Rationale**: 本 feature 是視覺簡化，Gitea 仍是唯一 Source of Truth；同一 Issue 在 Issue detail、Gitea 或其他 Board Convention 中仍可依需要查看完整資料，同時不破壞既有 Workflow repair 行為。

**Alternatives considered**: 直接刪除或替換 Gitea Labels；拒絕，會破壞 Issue workflow metadata。

### Decision 2: 依 exact Workflow Convention Label 定義判斷

**Decision**: API 使用 Board 所選 Convention 的 state `labelName` 集合過濾 `visibleLabels`，不解析 prefix、顯示文字或固定狀態名稱。

**Rationale**: Workflow Convention 可以由團隊自行定義 namespace；顯示規則必須與 Board 的相容 Convention 一致。

**Alternatives considered**: 以 `workflow-` 等固定 prefix 過濾；拒絕，會與既有可配置 Convention 衝突。

### Decision 3: 完整 Labels 與 Board 顯示 Labels 分離

**Decision**: Board Card view 保留完整 `labels` 作為當次 read-through 資料，另提供 `visibleLabels` 給 Board UI；Kanban 只呈現 `visibleLabels`。`visibleLabels` 不持久化。

**Rationale**: 明確區分 Gitea 原始資料與 Board presentation subset，避免 UI 或後續功能把隱藏誤認成資料不存在。

**Alternatives considered**: 直接覆寫 response 的 `labels`；拒絕，會讓 Board response 的資料語意不清楚，且降低後續完整資料導向的彈性。

### Decision 4: 修復 annotation、錯誤與狀態欄位不隱藏

**Decision**: `workflowRepair`、異常欄位與 manual retry affordance 維持現有 Board 行為；只移除 Workflow Labels 的視覺重複。

**Rationale**: Workflow Label 隱藏不能讓使用者失去修復失敗或狀態衝突的辨識能力。

**Alternatives considered**: 對異常 Card 顯示完整 Workflow Labels 取代錯誤提示；拒絕，會重新引入重複且不一致的底層資訊呈現。

### Decision 5: Issue list/detail 不套用 Board filter

**Decision**: Issue list、Issue detail 與原始 Gitea Issue 維持完整 Labels；只有 Board Card 使用 `visibleLabels`。

**Rationale**: Board 是管理視圖，不取代 Issue 詳情或 Gitea 原始頁面。

**Alternatives considered**: 全 Portal 統一隱藏 Workflow Labels；拒絕，會妨礙需要完整 metadata 的 Issue 操作與診斷。

## Phase 1: Design Summary

- `packages/domain/src/board.ts` 增加 Board Card 的 `visibleLabels` view 欄位，保留完整 `labels` 與既有 workflow repair annotation。
- `packages/gitea-contracts/src/portal.ts` 同步 Board Card response contract。
- `apps/api/src/boards/board-view-service.ts` 依 exact Convention state labels 建立 `visibleLabels`；不新增由呈現規則觸發的 Gitea write 或 storage write，既有 Workflow repair write 維持不變。
- `apps/web/src/features/boards/KanbanCard.tsx` 使用 `visibleLabels` 顯示一般 Labels；若為空則省略 Label 區域。
- `apps/web/src/features/boards/types.ts` 同步 Board Card view type；Issue list/detail types 與 render path 保持完整 `labels`。
- `workflowRepair`、anomaly columns、drag transition 與原始 Issue link 保持現有行為。

### Expected Implementation Surfaces

1. `packages/domain/src/board.ts`：定義 Board Card 的 read-time visible label shape。
2. `packages/gitea-contracts/src/portal.ts`：同步 Board view contract，不修改 Issue persistence contract。
3. `apps/api/src/boards/board-view-service.ts`：從 Board Convention 推導隱藏 Label 集合並建立 `visibleLabels`。
4. `apps/web/src/features/boards/KanbanCard.tsx`、`KanbanBoard.tsx` 與 board types：只呈現一般 Labels、保留 repair/error/status 行為。
5. `apps/api/src/issues/issue-search-service.ts`、`issue-service.ts`、`apps/web/src/features/issues/IssueListPage.tsx`、`IssueRow.tsx`、`IssueDetailPage.tsx`：驗證 list/detail 不受 Board presentation filter 影響。

### Constitution Check (Post-Design)

**Result: PASS / no active gates.** 設計沒有新增資料庫、Issue snapshot、同步狀態、權限代理或由本 feature 新增的 Gitea mutation；`visibleLabels` 只存在於 Board response 的 read-time view，既有 Workflow repair side effect 維持不變，完整 Labels 仍由 Gitea 提供。

## Complexity Tracking

無。此 feature 只增加 Board view 的衍生欄位與顯示過濾，不增加服務、資料儲存或外部整合。
