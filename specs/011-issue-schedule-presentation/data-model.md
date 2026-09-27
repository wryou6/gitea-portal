# Data Model: Issue 排程日期呈現改善

本功能不新增持久化資料或 API contract。以下是既有 Issue 排程資料的呈現投影。

## Issue Schedule Presentation

| Field | Source | Presentation |
|---|---|---|
| `startDate` | Existing `Issue.startDate`, nullable calendar date | 「開始」及 `YYYY/MM/DD`；缺值顯示「未設定」；無效/重複來源顯示日期異常 |
| `dueDate` | Existing `Issue.dueDate`, nullable calendar date | 「到期」及 `YYYY/MM/DD`；缺值顯示「未設定」；無效來源顯示日期異常 |
| `scheduleStatus` | Existing `Issue.scheduleStatus` | `scheduled`、`unscheduled` 或 `invalid` 決定 Gantt 區域與異常呈現 |
| `scheduleAnomaly` | Existing optional anomaly code | 轉成繁體中文欄位／區間異常提示，不輸出原始 label 字串 |

## Invariants

- Gitea remains the sole source of schedule dates; the presenter is read-only.
- An invalid or duplicate start-date source must not be resolved by arbitrarily selecting a date.
- A single valid date remains a single-day Gantt item while the absent field remains visible as「未設定」.
- Filtering internal labels affects display only; Type parsing and all Gitea Labels remain unchanged at the data layer.
