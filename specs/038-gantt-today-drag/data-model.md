# Data Model: Gantt 今天高亮與拖曳排程

本功能不增加 Issue 或 Portal 持久資料。日期保存仍由 Gitea 管理。

## Issue Schedule

| Field | Type | Rules |
|---|---|---|
| Start date | nullable calendar date `YYYY-MM-DD` | Gitea `start-date:YYYY-MM-DD` Label；使用目前使用者權限更新。 |
| Due date | nullable calendar date `YYYY-MM-DD` | Gitea 原生 Due date。 |
| `updatedAt` | timestamp | 排程修改使用現有 optimistic concurrency check。 |
| Schedule status | `scheduled \| unscheduled \| invalid` | 由目前 Issue 日期解析；invalid 只呈現異常，不可由 Gantt drag 寫入。 |

## Drag Preview

Drag Preview 是元件生命週期中的暫態狀態，不寫入 Gitea，也不保存於 URL/cookie。

| Field | Type | Rules |
|---|---|---|
| Issue identity | owner/repository/number | 指向目前 Gantt row 的 Gitea Issue。 |
| Operation | `resize-start \| resize-due \| move-range \| create-range` | 依目前日期資料與被拖曳區域決定。 |
| Candidate Start | nullable calendar date | `move-range` 保留既有日期偏移；`create-range` 使用較早的選取日。 |
| Candidate Due | nullable calendar date | `move-range` 保留既有日期長度；`create-range` 使用較晚的選取日。 |
| Active | boolean | 拖曳或鍵盤預覽期間為 true；取消、提交或 unmount 後清除。 |

Start 必須早於或等於 Due。pointer 操作完成才送出修改；成功後由 Gantt loader 重新載入，失敗或版本衝突亦重新載入實際 Gitea 值。若跨日期欄位更新發生部分遠端成功，不推測或回滾，而依重新讀取結果呈現。

## Today Overlay

| Field | Type | Rules |
|---|---|---|
| Today | local calendar date | 以瀏覽器本地日期計算，沒有持久化。 |
| Position | timeline coordinate | 將 `[today, following calendar day)` 映射到目前 scale cell，寬度只涵蓋一天。 |
