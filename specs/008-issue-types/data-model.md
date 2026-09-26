# 資料模型：Issue Type 規範

## IssueType

共用 domain 的 TypeScript 字串聯集：

| 值        | Gitea Label    | 意義                               |
| --------- | -------------- | ---------------------------------- |
| `bug`     | `type:bug`     | 修正既有行為故障或與預期不符的情況 |
| `feature` | `type:feature` | 新增或調整產品能力                 |
| `task`    | `type:task`    | 文件、測試、維護、部署等支援性工作 |

## Gitea Issue Labels

Gitea 繼續保存完整 Label 集合；Type 從 Labels 推導，不另外持久化。

- 恰有一個標準 `type:*` Label，且沒有其他 `type:` Label：回傳該 `IssueType`。
- 沒有 `type:` Label：回傳 `type: null`，狀態為 `missing`。
- 有多個或非標準 `type:` Label：回傳 `type: null`，狀態為 `conflict`。
- API response 保留所有原始 Labels，包含異常 Type、Workflow Labels、排程 Labels 與一般 Labels。

Portal 從 response 的 `type` 與 Labels 推導顯示狀態，不快取結果。

## Issue API view

`IssueSummary` 新增 `type: IssueType | null`；既有 `labels: IssueLabel[]` 維持完整。Issue 詳情仍在 summary 上加入 body。

## 寫入內容

建立與更新都要求 `type: IssueType`。一般 `labels` 維持 Label 名稱清單，但不得包含保留的 `type:` 前綴。裸名稱 `bug`、`feature` 仍是一般 Labels，不符合 Type 驗證。API 在伺服器端把所選 Type Label 與一般及排程 Labels 合併。

## 識別與範圍

Type Label 定義依 Gitea Repository 區分。同一個 Type 在不同 Repository 可有不同 Label ID，但 API 值與 Label 名稱一致。Gitea 是唯一資料來源；Portal 不保存 Issue Type 狀態。
