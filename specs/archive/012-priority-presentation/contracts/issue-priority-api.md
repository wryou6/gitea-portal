# Issue Priority API 契約

擴充既有 Issue endpoints，不新增 route。API 仍使用目前登入者的 Gitea delegated 權限。

## 建立 Issue

`POST /api/repositories/{owner}/{repo}/issues`

Request 新增必填 `priority`，允許值為 `critical`、`high`、`medium`、`low`：

```json
{
  "title": "改善報表匯出流程",
  "type": "feature",
  "priority": "high",
  "labels": ["area:reports"]
}
```

缺少或無效 Priority、或 `labels` 含 `priority:` 前綴時回傳 validation failure。API 以該 Repository 的 Priority Label ID 建立 Issue；若 Label 不存在，依目前使用者權限建立後使用。競態時重讀並重用同名 Label。

## 更新 Issue

`PATCH /api/issues/{owner}/{repo}/{number}`

Request 新增必填 `priority` 並沿用 `expectedUpdatedAt`：

```json
{
  "expectedUpdatedAt": "2026-09-27T00:00:00Z",
  "priority": "critical",
  "labels": ["area:reports"]
}
```

API 把所選 Priority Label、Type、一般 Labels 及排程 Labels 組成完整 Label replacement。Gitea 寫入前檢查 Issue revision 與現存 Labels，寫入後確認 Gitea 實際 Labels；並行變更或寫入失敗回傳錯誤，不回報成功。若 `labels` 未提供，保留既有非保留 Labels。

## Issue response

Issue list/detail、create/update 結果、Repository workspace 及 Board Issue view 所含 `IssueSummary` 新增：

```json
{
  "priority": "high",
  "labels": [
    { "name": "priority:high", "color": "d73a4a" },
    { "name": "area:reports", "color": "0052cc" }
  ]
}
```

只有恰有一個標準 Priority Label 時 `priority` 為其值；缺漏、衝突或未知標籤時 `priority` 為 `null`。API response 保留完整原始 Labels，前端由該集合推導並呈現具體錯誤狀態。
