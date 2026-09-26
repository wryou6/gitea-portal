# Data Model: 可收合側邊導覽

本功能不新增業務資料。以下項目描述導覽期間的 UI 狀態，不屬於 Gitea Issue 或 Board JSON 資料。

## Sidebar Layout Preference

| Field | Type | Rule |
|---|---|---|
| `expanded` | boolean | `true` 表示顯示圖示與文字；`false` 表示只顯示圖示。新工作階段預設 `true`。 |
| lifetime | browser session | 同一工作階段內的頁面導覽與重新載入維持狀態；新工作階段重設為展開。 |

### Transitions

- 使用者啟動展開/收合控制時，`expanded` 在 `true` 與 `false` 間切換。
- 導覽至其他頁面或重新載入時，讀取同一工作階段保存的狀態。
- 新的瀏覽器工作階段從展開狀態開始。

## Board Navigation Context

| Field | Type | Rule |
|---|---|---|
| `activeBoardId` | existing Board ID or absent | 由目前 `/boards/<id>/...` 路徑取得；不新增全域或持久化選擇。 |
| `viewIntent` | `kanban` \| `gantt` or absent | 使用者沒有目前 Board 時，由 `/kanban` 或 `/gantt` route 暫時表達要開啟的檢視；舊 `/boards?view=...` 仍相容。 |

### Navigation Rules

- 有 `activeBoardId` 時，Kanban/Gantt 連結保留該 ID 並切換檢視。
- 沒有 `activeBoardId` 時，Kanban/Gantt 連結進入 `/kanban` 或 `/gantt` 的 Board 選擇頁並保留 `viewIntent`；使用者選定 Board 後開啟對應檢視。
- 沒有 `viewIntent` 時，Board 清單維持 Board Settings/管理用途。
- `viewIntent` 不改變 Board、Issue、Gitea Label 或排程資料。

## Persistence Boundary

- Sidebar layout preference 僅為瀏覽器工作階段 UI 狀態。
- `activeBoardId` 與 `viewIntent` 來自 URL，不寫入 Board JSON 或 Issue。
- 不新增 API、domain entity、database 欄位或 Gitea 資料。
