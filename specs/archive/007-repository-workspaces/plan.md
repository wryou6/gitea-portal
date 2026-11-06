# Implementation Plan: Repository 工作區與跨庫看板

**Branch**: `007-repository-workspaces` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-repository-workspaces/spec.md`

## Summary

在頂部加入工作區選擇器，切換單 Repository 工作區、涵蓋至少兩個 Repository 的跨庫看板，以及既有全部 Issues 入口。Repository 與 Board 各自提供 Issues、Kanban、甘特圖檢視；URL 保存工作區與檢視上下文。API 只從目前使用者可讀取的 Gitea 資料讀取 Issues。Repository Kanban/Gantt 與跨庫看板共用既有 workflow、排程、repair 與 atomic transition 行為；單 repo 舊 Board 設定保留於既有 JSON，但不再顯示成 Board。

## Technical Context

**Language/Version**: TypeScript 5.8、Node.js 22；pnpm 9 workspace。

**Primary Dependencies**: React 19、Vite 6、Tailwind CSS 4、Fastify 5、`@gitea-portal/domain`、`@gitea-portal/gitea-contracts`。沿用原生 anchor、select 與目前 UI 元件，不新增套件。

**Storage**: 不新增 workspace 或 Issue persistence。Gitea 仍是 Issue 唯一來源；Board 設定繼續使用 `BOARD_STORE_PATH` JSON store，維持 schemaVersion 1、驗證、atomic write、flush 與 lock。既有單 repo Board 設定留在 store 中但不列為可選 Board。

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd format:check`；依 `quickstart.md` 手動驗收 Gitea scope、legacy route、權限拒絕、超過 100 筆與鍵盤/窄視窗流程。專案未配置自動化測試 runner；本計畫不新增測試套件。

**Target Platform**: 內網 Gitea 的 responsive web portal；API 在 Node.js 22 執行。

**Project Type**: pnpm monorepo web application：`apps/api`、`apps/web`、`packages/domain`、`packages/gitea-contracts`。

**Performance Goals**: Repo/Board Issues、Kanban 與 Gantt 不得因 100 筆分頁界線靜默漏資料；Repository selector 不得只列第一頁 Gitea repositories。跨 repo 請求依 repo 平行讀取，repo 內依序分頁；沿用 Gitea 10 秒單次請求 timeout，沒有另訂整體 SLA。

**Constraints**: Gitea delegated permission 是唯一授權依據；Workflow Convention 必須 exact match ID/version；Kanban state 維持 Gitea Workflow Labels；Issue list/detail 顯示完整 Labels；禁止新增 Issue mirror 或繞過權限；Board transition 保持 atomic replacement 與 optimistic concurrency；既有 `/issues`、Issue detail 與多 repo Board URLs 維持可用。

**Scale/Scope**: 使用者可讀取的全部 Repositories、每個 Repository 的所有分頁 Issues，以及現有 Board 設定；驗收涵蓋超過 100 Issues、跨 repo 同號 Issue、單 repo legacy Board、未設定 Convention 與部分 repo 讀取失敗。

## Constitution Check

專案 Constitution 檔目前只有範本佔位文字，沒有已 ratify 的原則可設 gate。依 `AGENTS.md` 與 README 的專案規則，本設計通過：

- 不新增 persistence；Board JSON store schema 和 atomic/lock guarantees 不變。
- Gitea delegated access 維持 read/write permission boundaries；Board 的多 repo必要讀取採全有或全無回應。
- Repository 與 Board 使用 exact Workflow Convention ID/version；狀態持續由 Gitea Label 保存。
- Issue views 沿用完整 Gitea Labels；Board Card 才按 Convention 計算 `visibleLabels`。
- UI 變更完成後執行 typecheck/build；使用 `apply_patch` 編輯，不改動無關工作。

## Architecture Decisions

1. **工作區由 URL 和 Gitea/Board 設定推導**：新增 Repository 路徑 `/repositories/:owner/:repo/{issues|kanban|gantt}`；為多 repo Board 增加 `/boards/:id/issues`，保留既有 `/boards/:id/{kanban|gantt}`、`/issues` 及 Board 管理路徑。selector 只把至少兩 repo 的 Board 顯示為「跨庫看板」，並以目前 `/api/repositories` 可讀 Repo 集合過濾不可完整存取的 Board。
2. **舊單 repo Board 顯示重新分類說明**：保留 JSON 設定原值；selector/Board 管理清單不顯示單 repo 記錄。使用者直接開啟 legacy Board URL 時，先讀取 Board metadata；若僅涵蓋一個 Repository，顯示說明頁，要求使用者從工作區選擇器重新選 Repository，不自動導向、不呼叫會觸發 repair 的 Board view API。多 repo Board 舊 URL 維持原檢視。
3. **Repository workspace 不偽裝成 persisted Board**：新增明確 Repository Kanban/Gantt response type 與 repo-scoped API/transition routes。共用 Board view service 的 workflow columns、anomaly/repair 與 atomic label update 邏輯，但以 Repository identity 做 response metadata；不建立虛構 Board ID，也不寫入 Board JSON。
4. **所有 Board Kanban/Gantt 和 scoped Board Issues 讀完整分頁**：單 repo與跨 repo檢視都不採固定 100 件上限。Board Issues 聚合各 Repo 的 Gitea Issue pages、套用 filter、以 `updatedAt` 遞減排序（同時間以 `owner/name/number` 字典順序穩定排序），再對合併結果分頁。任何必要 repo/page 失敗都讓整個 Board request 失敗。
5. **Issue detail 保留返回上下文**：scoped Issue link 帶 app-local `returnTo` pathname/query；Issue detail 僅接受以單一 `/` 開頭且可解析成 Portal route 的相對路徑，無效/直接進入時退回 `/issues`。Issue create 也保留 repository workspace return target。
6. **Repo Convention 的唯一來源是目前 YAML 指派**：Repository workspace 由 Repository exact assignment 解析 ID/version；不以 legacy Board 的過時 convention 覆蓋目前 YAML。若保留的 legacy Board Convention 與目前 assignment 不同，Kanban/Gantt 顯示提示並仍按目前 YAML 提供檢視；無有效 assignment 或 exact match Convention 不存在時顯示設定錯誤。
7. **跨庫看板設定導覽依目前選擇顯示**：側邊的「跨庫看板設定」入口只在頂部工作區選擇器目前選中可完整存取的跨庫看板時顯示；Repository、全部 Issues、legacy 或無效上下文均隱藏。
8. **檢視切換由全域導覽承載**：Kanban 與甘特圖內容頁不再顯示彼此切換的頁內導覽；保留 AppShell 全域側邊導覽的檢視連結。

## Constitution Check After Design

PASS。設計沿用既有 workspace、Gitea source of truth、delegated permissions、Convention identity、Board JSON safety 與 atomic transition；無 constitution violation 或新增 persistence。

## Project Structure

### Documentation (this feature)

```text
specs/007-repository-workspaces/
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── repository-workspaces.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
apps/api/src/
├── boards/                 # shared Board listing, multi-repo Issue aggregation, view/transition routes
├── repositories/           # Repository workspace lookup and scoped Kanban/Gantt routes
├── issues/                 # existing delegated Issue read/create routes
└── gitea/client.ts         # complete repository and Issue pagination
apps/web/src/
├── app/                    # contextual route parsing and page selection
├── components/layout/      # topbar workspace selector and context-aware sidebar
├── features/issues/        # repository/Board issue views and return-context links
├── features/repositories/  # Repository workspace view and Convention notices
└── features/boards/        # Board/repository Kanban and Gantt contexts
packages/domain/src/        # Repository workspace response types
packages/gitea-contracts/src/ # API response contracts
```

**Structure Decision**: 在目前的 Fastify API、React/Vite Web 與共用 domain/contracts packages 內擴充；不新增 workspace package、資料庫或平行前端架構。

## Complexity Tracking

無 Constitution violation；不需例外或額外架構。
