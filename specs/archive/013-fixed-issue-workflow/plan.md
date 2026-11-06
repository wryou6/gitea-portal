# Implementation Plan: 固定 Issue 工作流

**Branch**: `013-fixed-issue-workflow` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-fixed-issue-workflow/spec.md`

## Summary

以共用 domain 規則取代 Repository／Board 級 Workflow Convention。Todo、In Progress 由固定 Gitea Labels 表示，Done 由 Issue Closed 表示；Portal 新建 Issue 時設為 Open + `workflow:todo`；24 個轉換原因使用 `workflow-action:<key>` Labels 保存最後原因。API 從 Gitea 讀取狀態、Labels 與完整 Assignees；交接時以「清空後按目標順序完整寫回」維持 Assignees 次序，失敗時嘗試還原。等待外部回覆沿用目前負責人作內部跟進。Issue 列表、Kanban 與 Gantt 使用一致的響應式設計系統並由 Storybook 呈現。移除 Convention 設定與 Board 相容欄位，保留 Gitea 為唯一 Issue 資料來源。既有 Gitea Issues 是 dummy data，本次實作時直接隨機分配三態；全部更新並驗證後移除舊 workflow Labels，不提供面向使用者的遷移嚮導或遷移記錄。

## Technical Context

**Language/Version**: TypeScript 5.8.2、Node.js ESM；React 19 前端<br>
**Primary Dependencies**: Fastify 5.2、Vite 6、React 19、Tailwind CSS 4、pnpm workspace packages<br>
**Storage**: Gitea API 是 Issue、State、Label、Assignee 的唯一來源；Board 設定維持既有 `BOARD_STORE_PATH` JSON store，更新其 schema/data format version<br>
**Testing**: Repository 有 `typecheck`, `build`, `format:check` scripts；沒有既有自動化測試 runner。此 feature 的快速驗收以 Gitea fixtures 與 Portal 操作情境為主，不新增自動化測試套件。<br>
**Target Platform**: 內網瀏覽器及目前部署的 Gitea API
**Project Type**: TypeScript monorepo web application，包含 `apps/api`、`apps/web`、`packages/domain`、`packages/gitea-contracts`<br>
**Performance Goals**: 不增加跨 Repository 的額外同步讀取；Issue list/detail 沿用既有分頁。單次 workflow 轉換只讀取/寫入該 Issue 與其 Repository Labels；只有使用者選擇交接對象時才查詢該 Repository 可指派人員。
**Constraints**: 遵守使用者 Gitea 權限；不建立 Issue mirror；workflow Labels 必須在 Gitea；Label 集合使用既有 atomic replacement/optimistic concurrency；Assignee 重新排序必須清空再完整寫入並在失敗時補償；Board JSON store 保留 schema validation、版本、atomic write、flush、lock<br>
**Scale/Scope**: 所有登入使用者可存取的 Repository 使用同一份定義；不新增全域工作流設定或每 Repository Convention。

## Constitution Check

Constitution 檔目前仍是 Spec Kit 範本佔位內容，沒有已核准的 MUST 原則，沒有額外 Constitution gate。以下 repository 規則仍視為本計畫必須遵守的技術邊界：

- Gitea 是 Issue、Comment、Label、Assignee、Milestone 與 State 的唯一來源；不得建立 Issue mirror。
- 所有 Gitea 操作使用目前使用者權限；不得以後端較高權限繞過授權。
- Board JSON persistence 保留 schema/data format version、validation、atomic write、flush 與 lock-file 保護。
- Issue list/detail 顯示完整 Labels；工作流標籤可在 Board Card 專屬呈現中隱藏。
- Label 更新必須維持 atomic replacement 與 optimistic concurrency，不得退回 remove-then-add fallback。

**Gate (Phase 0)**: PASS — 技術堆疊與權限界線已由 repo 明確定義；Assignees 順序已用本機 Gitea API 驗證其清空／完整寫回行為。<br>
**Gate (Phase 1)**: PASS — 不引入新 persistence；Board JSON schema 以版本升級移除 Convention 欄位；API 合約延用目前使用者 token 與 Gitea source of truth。

## Project Structure

### Documentation (this feature)

```text
specs/013-fixed-issue-workflow/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── workflow-api.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/api/src/
├── issues/                 # Workflow transition route/service and issue mapping
├── gitea/                  # Gitea issue/label/assignee calls and replacement helpers
├── repositories/           # Repository views without Convention assignment
├── boards/                 # Fixed three-column Board and versioned Board JSON schema
└── http/                   # Fixed workflow definition endpoint

apps/web/src/
├── features/issues/        # Issue summary/detail, transition reasons, assignee handoff
├── features/boards/        # Fixed Kanban columns and workflow-label presentation
├── features/repositories/  # Repository workspace without Convention prompts
└── lib/api.ts              # Updated API contracts

packages/domain/src/        # Fixed state/action catalogue, resolver and Issue/Board entities
packages/gitea-contracts/src/ # Gitea Issue assignees[] and Portal workflow contracts
config/workflows/           # Remove obsolete conventions.yaml
```

**Structure Decision**: Extend the existing four workspace packages. Workflow definition and transition rules belong in `packages/domain`; Gitea request/compensation behavior belongs in `apps/api`; response types belong in `packages/gitea-contracts`; user action selection and displays belong in `apps/web`. No new service or persistence store.

## Phase 0: Research

Completed. See [research.md](./research.md) for API behavior evidence, Assignee order experiment, architecture decisions, and alternatives.

## Phase 1: Design & Contracts

Completed. See [data-model.md](./data-model.md), [contracts/workflow-api.md](./contracts/workflow-api.md), and [quickstart.md](./quickstart.md).

## Complexity Tracking

No Constitution violations or additional runtime projects. The plan changes multiple packages because state, labels, Assignees, API types, Board persistence, and UI share one cross-layer contract; this is required to keep Gitea as the only Issue source of truth.
