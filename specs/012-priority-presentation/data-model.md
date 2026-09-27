# 資料模型：Priority

## IssuePriority

共用 Priority 字串值及呈現名稱：

| 值 | Gitea Label | 顯示名稱 | 順序 |
| --- | --- | --- | ---: |
| `critical` | `priority:critical` | 緊急 | 1 |
| `high` | `priority:high` | 高 | 2 |
| `medium` | `priority:medium` | 中 | 3 |
| `low` | `priority:low` | 低 | 4 |

## Issue Priority 狀態

- 恰有一個標準 `priority:*` Label：Priority 有效，值為對應的 `IssuePriority`。
- 沒有 `priority:` Label：Priority 為 `null`，狀態為 `missing`。
- 有多個 `priority:` Labels，或有任一未知 `priority:` 名稱：Priority 為 `null`，狀態為 `conflict`；UI 將其呈現為衝突／無效並列出原值供修復。

API response 新增 `priority: IssuePriority | null` 並繼續回傳完整 Labels。前端以完整 Labels 推導 `missing` 或 `conflict` 狀態，不另增持久欄位。

## Repository-scoped Priority Label

- Label 名稱是跨 Repository 共用契約，Label ID 由各 Repository 的 Gitea 定義。
- 新建或更新前須確保目標 Repository 有所選 Label，使用該 Repository 的 Label ID 寫入。
- Priority 是 reserved Label namespace；Issue mutation 的一般 Labels 不可包含 `priority:` 前綴。
- 成功寫入必須恰有一個標準 Priority Label。其他 Type、Workflow、排程和一般 Labels 依現有完整 replacement 行為保留或依使用者編輯更新。
