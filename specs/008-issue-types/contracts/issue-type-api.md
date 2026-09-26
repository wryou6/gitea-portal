# Issue Type API 契約

擴充既有 endpoint，不新增 route。

## 建立 Issue

`POST /api/repositories/{owner}/{repo}/issues`

Request body 新增必填 `type`：

```json
{
  "title": "改善報表匯出流程",
  "type": "feature",
  "labels": ["area:reports"]
}
```

`type` 必須是 `bug`、`feature` 或 `task`。缺少或無效 Type 時回傳 validation failure。API 確認該 Repository 有 `type:feature` Label；沒有時依目前登入者權限建立，再以該 Label 與指定的一般 Labels 建立 Issue。

## 更新 Issue

`PATCH /api/issues/{owner}/{repo}/{number}`

Request body 新增必填 `type`，並保留既有 `expectedUpdatedAt` 要求：

```json
{
  "expectedUpdatedAt": "2026-09-27T00:00:00Z",
  "title": "改善報表匯出流程",
  "type": "task",
  "labels": ["area:reports"]
}
```

API 將選定 Type Label、一般 Labels 與既有或更新後的排程 Labels 合併成一次完整 Label 替換。Issue/Label 並行變更時回傳 conflict；Gitea Label 建立或替換失敗時不回報成功。

## Issue response

Issue 清單、詳情、建立/更新結果、Repository workspace 與 Board Issue view 都包含：

```json
{
  "type": "feature",
  "labels": [
    { "name": "type:feature", "color": "a2eeef" },
    { "name": "area:reports", "color": "0052cc" }
  ]
}
```

無法推導出唯一有效 Type 時，`type` 為 `null`。API 一律回傳完整 `labels`，讓前端顯示並修正缺少或衝突的狀態。
