# Implementation Plan: Repository 與 All repos 工作區

**Branch**: `016-all-repos-workspaces` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: [Feature specification](spec.md)

## Summary

將 All repos 建為即時聚合的工作區，並保留每個可讀 Repository 的獨立工作區。根路徑預設顯示 All repos Gantt；`/issues`、`/kanban`、`/gantt` 分別代表 All repos 的 Issues、Kanban、Gantt。API 以目前 Gitea 使用者可讀 Repository 為範圍，全頁讀完再顯示，任何必要讀取失敗時回傳錯誤。移除 Board 設定、API、領域型別、舊路由及持久化，將共用 Kanban/Gantt 元件與固定 Workflow transition 移到中性工作檢視命名空間。UI 沿用 repo 現有 token、元件與 React/Vite/Storybook；按 `$ui-styling`、`$ui-ux-pro-max` 補齊來源辨識、可及性、響應式、主題及互動狀態。

## Technical Context

**Language/Version**: TypeScript 5.8、Node.js 22、React 19

**Primary Dependencies**: Fastify 5、React/Vite、Gitea delegated API、Storybook 8.6、Tailwind CSS 4 與現有 Portal UI primitives

**Storage**: 不新增 Portal persistence；移除 Board JSON store 和 `BOARD_STORE_PATH`。Issues、Labels、狀態及日期仍由 Gitea 保存。

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd --filter @gitea-portal/web build-storybook`；使用 `quickstart.md` 的登入手動情境確認各 Repository 聚合、權限和錯誤流程。Repo 尚無一般自動化測試 runner。

**Target Platform**: 內網瀏覽器 Web app；API 在 Node.js 22 執行

**Project Type**: pnpm monorepo（Fastify API、React Web、domain、Gitea contracts）

**Performance Goals**: 不新增 aggregate SLA；單次 Gitea 請求沿用 10 秒 timeout。全量讀取及合併完成前顯示 loading，不串流或顯示部分聚合內容。

**Constraints**: 所有資料請求使用 session 的 Gitea delegated credentials；repository 可讀清單來自 Gitea；Kanban 固定狀態與 atomic Label replacement、optimistic concurrency 不變；Issue list 維持完整 Labels；Board routes/store/API 全數退場；Storybook 是 UI review 面。

**Scale/Scope**: 使用者可讀的所有 Repository，以及各 Repository 的所有 Issue pages；全域 Issues 在跨 repo merge/filter/sort 後再分頁。至少驗證 0、1、多個 Repository、相同 Issue number、超過 100 Issues、必要讀取失敗與無寫入權限情境。

## Constitution Check

專案 constitution 檔目前仍只有模板佔位文字，沒有已 ratify 的可執行原則；本計畫依 repo `AGENTS.md` 約束檢查：

- **Pass**：pnpm workspace 不變，Gitea 仍是 Issues 唯一來源，不建立 mirror 或新增資料庫。
- **Pass**：所有 Repository scope 使用目前使用者的 delegated permission；All repos 讀取失敗採全頁失敗。
- **Pass**：固定 Workflow、Gitea Label 狀態、atomic replacement、optimistic concurrency 及完整 Issue labels 行為保留。
- **Pass**：Board 資料、服務、API、UI 與環境設定依核准範圍移除；不保留舊 URL 相容性。
- **Pass**：React UI 使用現有設計 token/component conventions，新增 Storybook 狀態；不引入無必要 UI framework。

## Phase 0: Research Decisions

研究結果記於 [research.md](research.md)：聚合 Issue 查詢必須逐一讀取每個可讀 Repository，而不能依賴 Gitea 全域搜尋單頁；Kanban 與 Gantt 共用全頁讀取、All repos 的 Issue 清單在全量 filter/sort 後分頁；路由未知路徑要呈現 404；transition 可搬出 Board namespace 而保留 Gitea 寫入語意。未訂新效能 SLA，沿用現有單次 API timeout。

## Phase 1: Design & Contracts

- [data-model.md](data-model.md) 定義 All repos、Repository workspace、Issue identity、三種 view 與錯誤行為。
- [contracts/repository-workspaces.md](contracts/repository-workspaces.md) 定義 Web routes、API shapes、全量讀取、篩選、排序、分頁、Issue create 與 404。
- [quickstart.md](quickstart.md) 定義 build、Storybook 與 Gitea 手動驗收流程。

## Project Structure

### Documentation

```text
specs/016-all-repos-workspaces/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/repository-workspaces.md
└── tasks.md
```

### Source Code

```text
apps/api/src/
├── issues/                 # All repos issue aggregation and workflow transition
├── repositories/           # Repository and All repos Kanban/Gantt query
├── work-views/             # Shared fixed-workflow view mapping (move from boards)
└── persistence/            # Delete Board-only JSON persistence
apps/web/src/
├── app/                    # All repos, Repository, Dashboard, and 404 routes
├── components/layout/      # Workspace selector and scoped global navigation
├── features/work-views/    # Shared Kanban/Gantt presentation and stories
├── features/issues/        # All repos/repository Issue list and explicit create target
└── i18n/resources/          # Neutral work-view translations, all supported locales
packages/domain/src/        # Neutral workflow-column types; delete Board domain type
packages/gitea-contracts/src/ # Board-free portal contracts
```

**Structure Decision**: Retain the existing pnpm monorepo and extract reusable services/components from `boards` into `work-views`; delete modules used only for Board configuration and CRUD. Keep the Repository screens as consumers of the same shared view implementation.

## Risks & Mitigations

- All repos fanout can issue many Gitea requests; parallelize per repository, keep per-request timeout and fail the whole view. Do not add a new cap that would silently omit work.
- The former local JSON configuration used the default `data/boards.json` path. Its runtime variable, store code, and local data are removed by this feature.
- Kanban drag interactions are write operations; preserve permission checks, atomic Label replacement, rollback/recovery and stale-update conflicts when moving the service.
- Storybook must show repository provenance and all main async states using fictional fixtures; never include real Issue data.

## Complexity Tracking

No constitution violations or new projects/dependencies.
