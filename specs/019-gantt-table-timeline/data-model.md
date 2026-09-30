# Data Model: Gantt 表格與日曆時間軸

本功能不更改 Gitea Issue/API model，新增的狀態僅供前端檢視。

## Gantt column preference

| Field | Type | Rules |
|---|---|---|
| account login | string | 取自現有 session bootstrap；沒有登入名時使用產品預設，不共用其他帳號偏好。 |
| visible fields | `IssueSortField[]` | 子集合限定為 `type`, `key`, `title`, `assignee`, `status`, `priority`, `createdAt`, `author`；`title`, `assignee`, `status` 必須存在。 |
| column order | `IssueSortField[]` | 恰為上述 8 個可選欄位各一次；可見欄依此順序顯示。 |
| version | literal `1` | Cookie 版本；缺值、不合法或未知版本回到預設。 |

預設可見欄位及順序皆為 `title, assignee, status`。完整順序預設為 `type, key, title, assignee, status, priority, createdAt, author`。偏好與 Issue/Gitea 資料無關，使用 Gantt 專用、每登入帳號一年期 cookie。恢復預設還原預設可見欄及完整預設欄序。

## Timeline view state

| Field | Type | Rules |
|---|---|---|
| initial date | calendar date `YYYY-MM-DD` | 預設為使用者本地 today 減 7 個 calendar days；只控制第一次定位。 |
| scale | `day \| week \| two-weeks \| month` | 預設 `day`；只改變刻度分格，不捨棄或改寫 Issue 日期。 |
| current viewport | scroll position | 由 initial date 定位；可向前、向後瀏覽完整排程日期範圍，不持久化於 cookie。 |

以上兩個選擇由 Gantt URL query 保存。缺省或無效日期/尺度值使用對應預設；日期採日曆值，不轉成可能跨日的本地 timestamp。

## Issue row projection

來源為既有 `Issue`：

- Title、Assignee、Status 欄使用現有 Issue 值與共用 Status presenter。
- Type、Key、Priority、Created at、Author 是可選欄；Start Date 和 Due Date 不屬於 Gantt 欄位集合，由軸線與 bar 呈現。
- All repos 即使 Key 隱藏仍在 Title 次要文字呈現 repository identity。
- `scheduled` 以有效開始/到期日建立日期區間；單一有效日期為單日 bar；`unscheduled` 無 bar；`invalid` 在 anomaly section 保留異常說明。
- Bar 日期與時間軸位置使用日曆日，繪製不修改來源 Issue。
