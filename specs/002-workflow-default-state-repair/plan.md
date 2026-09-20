# Implementation Plan: Workflow Default State Repair

**Branch**: `002-workflow-default-state-repair` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-workflow-default-state-repair/spec.md`

## Summary

當使用者載入 Board 時，Portal 會以該 Board 選定的 Workflow Convention 判斷 Gitea Issue 的 Workflow Label。沒有 Label 或同一 Convention 有多個 Label 的 Issue，會在 Board 呈現前嘗試透過既有的 atomic label replacement 寫回 Gitea 的預設狀態；成功後重新讀取 Issue，修復寫入或驗證失敗則保留異常狀態並回傳個別錯誤。若 Board 所需的 Issue 或 Repository 資料本身無法從 Gitea 讀取，則回傳整體外部服務錯誤，不呈現不完整 Board。修復結果只存在於本次 Board response，不建立 Portal Issue snapshot 或其他狀態副本。

實作沿用現有 monorepo、Gitea client、JSON Board store 與 transition flow。正常 Workflow 欄位即使為空仍保留；未設定與衝突欄位只有在仍有 Card 時顯示。自動修復失敗的 Card 仍可手動拖曳到有效 Workflow 欄位，操作失敗時維持原異常狀態。

## Technical Context

**Language/Version**: TypeScript 5.8.2，Node.js runtime；前端 React 19、Vite 6

**Primary Dependencies**: Fastify 5、React 19、React DOM 19、Vite 6、`@gitea-portal/domain`、`@gitea-portal/gitea-contracts`、既有 Gitea REST client、pnpm 9.15.0

**Storage**: Board 設定沿用既有 JSON store，包含 schema validation、atomic write 與 file lock；本 feature 不新增資料庫、不保存 Issue snapshot、不保存修復結果

**Testing**: 沿用 repository 現有 `pnpm.cmd typecheck` 與 `pnpm.cmd build` 驗證；功能驗收依 [quickstart.md](./quickstart.md) 的 Gitea dummy data 情境執行，不在本 feature 決定新的測試框架

**Target Platform**: 內網瀏覽器與既有 Node.js API service；Gitea 為外部唯一 Issue Source of Truth

**Project Type**: Web application monorepo（`apps/api`、`apps/web`、shared domain/contracts packages）

**Performance Goals**: Board 必須在所有該次修復嘗試完成後才呈現；以 quickstart 驗證從 Board load 開始到修復結果可辨識是否在 3 秒內，不新增超出既有範圍的吞吐承諾

**Constraints**: 僅 Board load 觸發自動修復；Board 所需資料讀取失敗回報整體外部服務錯誤，已讀取 Issue 的單 Card 修復失敗則保留 Card anomaly 並繼續其他 Card；不得使用高於目前使用者 Gitea 權限的身份；Workflow Label 必須已存在；保留非 Workflow Labels；每次 label replacement 必須先執行 version/label preflight，再做一次 atomic replacement，最後 post-write verification；Gitea 失敗時不得偽造成功；不引入資料庫、同步快取或 Portal 狀態副本

**Scale/Scope**: 沿用現有 Board repository issue 查詢與分頁行為；本 feature 只處理納入 Board 的 Repository Issues，不改變 Issue list/detail 的 read-through 行為，也不擴大到 PR、Code Review 或 Project Management 功能

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Result: PASS / no active gates.** `.specify/memory/constitution.md` 目前仍是 Spec Kit 的未填寫模板，只有 placeholder principles 與 governance，沒有可執行的專案原則或禁止事項。因此沒有可判定的 gate violation；本 plan 仍遵守 feature spec 的 Source of Truth、權限與不引入資料庫限制。

## Project Structure

### Documentation (this feature)

```text
specs/002-workflow-default-state-repair/
├── plan.md              # 本文件
├── research.md          # Phase 0 decision log
├── data-model.md        # Phase 1 read-time domain/view model
├── quickstart.md        # Phase 1 runnable/manual validation guide
├── contracts/
│   └── board-workflow-repair.md
└── tasks.md             # Phase 2，由 $speckit-tasks 產生
```

### Source Code (repository root)

```text
packages/domain/src/
├── workflow.ts
├── workflow-state-resolver.ts
├── board.ts
└── issue.ts

packages/gitea-contracts/src/
└── portal.ts

apps/api/src/
├── boards/
│   ├── board-routes.ts
│   ├── board-view-service.ts
│   └── transition-service.ts
├── gitea/
│   └── label-replacement.ts
└── persistence/
    ├── board-repository.ts
    └── database.ts

apps/web/src/features/boards/
├── KanbanBoard.tsx
├── KanbanColumn.tsx
├── KanbanCard.tsx
├── card-transition.ts
└── types.ts
```

**Structure Decision**: 沿用現有 web application monorepo。Domain package 定義 Workflow repair 的 read-time 型別與解析規則；API package 負責以目前使用者 Gitea 權限執行 Board load repair、重讀與錯誤映射；contracts package 同步 API view shape；web package 顯示修復結果、異常原因與 conditional anomaly columns。Board JSON persistence 不因本 feature 增加欄位。

## Phase 0: Research Decisions

研究結果已整理於 [research.md](./research.md)。本 feature 沒有需要選擇的新技術；所有技術上下文取自現有 repository，產品決策則取自 spec 與本次 clarification。所有 Technical Context 的 unknown 均已由現有 codebase 或既定需求解決。

## Phase 1: Design Summary

- [data-model.md](./data-model.md) 定義 Workflow Convention、Board Card、read-time Repair Result，以及成功/失敗與手動拖曳的狀態轉換。
- [contracts/board-workflow-repair.md](./contracts/board-workflow-repair.md) 定義 Board view 與 Card transition 的 response/error contract；修復 annotation 不持久化。
- [quickstart.md](./quickstart.md) 定義使用 dummy Gitea Repository/Issue 驗證自動修復、保留 labels、失敗呈現、手動拖曳與不影響 list/detail 的流程。

### Expected Implementation Surfaces

1. `packages/domain/src/workflow-state-resolver.ts` 與 `apps/api/src/workflows/convention-loader.ts`：集中計算 Convention default state、異常分類與修復 annotation 所需的穩定型別，並在設定載入邊界拒絕沒有 state 或重複 `order` 的 Convention。
2. `apps/api/src/boards/board-view-service.ts`：先完成 Board 所需 Issue/Repository read；讀取失敗回傳整體外部服務錯誤，已讀取 Issue 則逐 Card repair、成功後重讀、失敗保留 anomaly、最後組 columns；以逐項結果保持單 Card 失敗不阻斷其他 Card。
3. `apps/api/src/boards/transition-service.ts` 與既有 `label-replacement.ts`：允許修復失敗的 anomaly Card 手動指定有效 state，所有自動/手動 replacement 都執行 permission check、concurrency preflight、一次 atomic replacement 與 post-write verification；不得在 conflict 上靜默猜測。
4. `packages/domain/src/issue.ts`、`packages/gitea-contracts/src/portal.ts` 與 web board types：增加非持久化 `workflowRepair` annotation，使 UI 能顯示修復成功或失敗原因。
5. `apps/web/src/features/boards/`：僅在 anomaly columns 有 Card 時渲染；保留一般空欄位；呈現修復錯誤與可拖曳行為，並保留現有 transition 失敗後 reload 的真實資料流程。

## Constitution Check (Post-Design)

**Result: PASS / no active gates.** 設計沒有新增資料庫、Portal Issue snapshot、權限代理、同步機制或獨立 Workflow engine；修復只對真實 Gitea Issue 執行，且失敗時不改寫畫面為成功。未發現需要 Complexity Tracking 的 constitution violation。

## Complexity Tracking

無。constitution 目前沒有有效 gate，且設計沿用現有 domain/API/UI 分層與 label replacement，不增加獨立服務或資料儲存層。
