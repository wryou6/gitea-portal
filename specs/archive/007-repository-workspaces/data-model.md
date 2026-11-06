# Data Model: Repository 工作區與跨庫看板

本功能只新增 API/view model；不新增 persisted workspace/Issue entity。

## Repository Workspace

- **Identity**: Gitea `owner/name` pair。
- **Source**: 登入者 delegated token 可讀取的 `/user/repos` 結果及 `config/workflows/conventions.yaml` 的 Repository assignment。
- **Derived fields**: `owner`, `name`, `fullName`, `conventionId`, `conventionVersion`, and a UI-only mismatch notice derived by comparing the current assignment with retained single-repo Board records.
- **Persistence**: 無。URL 及 Gitea/config 是來源；selector selection 不寫入 JSON。
- **Validation**: Kanban/Gantt 僅在 Convention ID/version 與該 Repository assignment 精確相符時可用；Issues 不要求 Convention。

## Cross-repository Board

- **Identity**: 現有 Board `id`。
- **Fields**: 現有 `name`, unique nonempty `repositoryRefs[]`, `workflowConventionId`, `workflowConventionVersion`, `createdAt`, `updatedAt`。
- **Persistence**: 現有 `BOARD_STORE_PATH` JSON schemaVersion 1；維持既有 schema validation、revision、atomic write、flush、file lock。
- **Validation**: 新增及更新的顯示中跨庫 Board 至少有兩個不同 Repository；每個 Repository 都必須屬於同一 exact Convention ID/version。
- **Read scope**: 每筆 Issue 都必須來自 refs 中的 Repository；任一必要 Repo/page read 失敗時整份 Board view 失敗。

## Legacy Single-repository Board

- **Identity/fields**: 原 Board JSON record，不修改 `id`、name、Repository refs 或 Convention fields。
- **Lifecycle**: 不再作為 Board selector/管理項目；同一 Repository 的 Repository workspace 成為其使用者可見入口。原設定仍保留在 store。
- **Legacy route**: 舊 Board URL 顯示重新分類說明，要求使用者從工作區選擇器重新選 Repository；不自動轉址。
- **Convention**: Repository workspace 使用目前 YAML assignment；legacy Board record 不覆蓋已變更或不相符的 Repository assignment。若兩者不同，Kanban/Gantt 顯示提示但使用目前 YAML；若 YAML assignment 缺失或無法 exact match，顯示設定提示。

## Workspace Route Context

前端從目前 URL 推導的 ephemeral union：

```text
{ kind: "all-issues" }
{ kind: "repository", owner, name, view: "issues" | "kanban" | "gantt" }
{ kind: "board", boardId, view: "issues" | "kanban" | "gantt" }
{ kind: "legacy-board-notice", boardId }
```

它用於 topbar selection、sidebar links、Issue detail `returnTo` 與視圖 metadata，不保存到 Portal persistence。

## Issue Views

- **Identity**: `{owner, name, number}`；跨 repo 同號不碰撞。
- **Repository/Board Issue page**: `items`, `page`, `limit`, `hasNext`；filter 與 page 用 URL query state 表示。
- **Ordering for Board aggregation**: `updatedAt` descending；同時間按 `owner`, `name`, `number` 升冪，確保分頁 deterministic。
- **Kanban/Gantt**: 所有 repository pages；日期、state、labels 與 permission semantics 沿用既有 Issue/Board contracts。
- **Write boundary**: Issue dates/fields/states 仍寫入 Gitea delegated API；Board store 不保存 Issue snapshot。
