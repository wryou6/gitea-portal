# Storybook fixtures

這裡只放虛構資料與呈現案例，不連線 Gitea、不放帳密、不放真實 Repository 或 Issue 內容。

Issues table stories 位於 Storybook 的 `Screens / Issue List`：`Default`、`SortedByPriorityDescending`、`OverdueDueDate`、`DueToday`、`ClosedIssueWithPastDueDate`、`Empty`、`Loading`、`ReadError` 及 `NarrowViewport`。點擊表頭會只排序故事資料，不會呼叫 API；縮窄 viewport 可檢視水平捲動與日期提示。
