# Quickstart: 固定 Issue 工作流驗收

## Prerequisites

- Gitea 測試環境含至少兩個可存取 Repository。
- 其中一個 Repository 有可指派的 `admin`、`admin2`、`admin3` 測試使用者。
- Portal local configuration is present in `.env`; do not print or commit credentials.
- Dependencies are installed with `pnpm.cmd install`.

## Run

```powershell
pnpm.cmd dev
```

開啟 Portal，使用目前 Gitea 使用者登入並進入兩個 Repository 工作區及一個跨庫看板。

開啟 Storybook，檢視 Issue 列表、Kanban、Gantt 三個畫面 story。

## Acceptance scenarios

1. **固定狀態**: 確認 Repository 與 Board 都只有「待辦」、「處理中」、「已完成」三欄；不存在 Convention 選擇或設定提示。
2. **新建 Issue**: 從 Portal 建立 Issue，重新讀取 Gitea，確認狀態為 Open、Labels 含 `workflow:todo`，Portal 顯示「待辦」。
3. **Gitea state/Labels**: 對 Todo→In Progress、In Progress→Done、Done→Todo 操作；重新讀取 Gitea，確認 Open/Closed 與 `workflow:todo`／`workflow:in-progress` 一致。
4. **Last reason**: 連續選取不同原因；確認 Gitea 最多只有最新一個 `workflow-action:*`，Portal 的下一步文字由該原因固定推出。
5. **Assignee ordering**: Issue 有 `[admin, admin2, admin3]` 時將 `admin3` 改派到第一位；讀取 Gitea Issue 多次確認順序是 `[admin3, admin, admin2]`。在 write failure 時確認 Portal 不顯示成功，並嘗試還原原 roster。
6. **外部等待**: 選「等待外部回覆」，確認第一位 Assignee 不變並顯示為內部跟進負責人。
7. **Reviewer optional**: 送交審查可不選審查者；選擇時被選者排到第一位。其他原因保留第一位。
8. **Done roster**: Done Issue 保留 Assignees 經手名單，但 Portal 不標示目前負責人。
9. **Permission/conflict**: 以只讀 Gitea 權限執行 transition，確認 403；用舊 `expectedUpdatedAt` 執行 transition，確認 409 並要求 reload。
10. **Data cleanup**: 確認三個舊 workflow namespaced Labels/config 已刪，非 workflow Labels、Milestone、Comments、Assignees 保留；dummy Issues 分布到新三態，Close/Open 與新狀態一致。任一 Issue 更新/驗證失敗時，舊 Labels 必須保留。

## Repository validation

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd format:check
pnpm.cmd --filter @gitea-portal/web build-storybook
```

預期四個命令成功；API/UI 操作以 acceptance scenarios 驗收，不新增自動化測試框架。
