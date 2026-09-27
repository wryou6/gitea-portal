# Data Model: Dashboard 工作區目錄

本功能不新增持久化資料。Dashboard 項目僅為目前登入使用者現有 API 回應的前端呈現模型。

## Workspace Directory Item

代表 Dashboard 可開啟的一個工作區。

| Field | Type | Source / rule |
|---|---|---|
| `kind` | `repository` \| `board` | 由來源項目種類決定 |
| `id` | string | Repository 使用 owner/repository name；Board 使用既有 Board ID |
| `name` | string | Repository 使用 `owner/name`；Board 使用 Board 名稱 |
| `href` | same-origin route | Repository 開啟 `/repositories/{owner}/{repo}/issues`；Board 開啟 `/boards/{id}/issues` |
| `repositoryRefs` | Repository reference[] | Repository 項目含自身參照；Board 使用既有 Repository refs |

## Relationships and Visibility

- Repository 項目來源為 `GET /api/repositories`，其結果依目前 Gitea delegated user token 的可讀 Repository 權限決定。
- Board 項目來源為 `GET /api/boards`；只顯示至少含兩個 Repository，且其每個 Repository 都包含於可讀 Repository 集合的 Board。
- Directory 是 Repository 與符合可讀條件 Board 的聯集。兩個來源都成功後才顯示完整清單；零個項目代表有效空狀態，讀取錯誤不代表空清單。
- 項目 ID 在 Dashboard 清單內以 `kind` 區分種類；Board ID 不轉成或複製 Issue identity。

## State Model

Dashboard 顯示狀態為 `loading`、`ready`、`empty` 或 `error`。`ready` 至少含一個項目；`empty` 表示兩個來源成功且聯集為空；`error` 表示必要來源中至少一個失敗，不把部分結果呈現為完整清單。重新載入或重試回到 `loading`。
