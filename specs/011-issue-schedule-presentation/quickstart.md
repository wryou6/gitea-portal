# Quickstart: 排程日期呈現驗收

## Prerequisites

- Node.js 22、pnpm 9，以及已安裝的 workspace dependencies。
- 在 repo root 執行命令；不需要登入 Gitea 來檢視 Storybook stories。

## Build and Type Check

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
```

預期三個命令皆成功完成。

## Storybook Review

1. 開啟 `Issues/ScheduleDates`，檢查雙日期、僅開始、僅到期、無日期與日期異常情境。
2. 開啟 `Issues/ScheduleDateFields`，確認建立與編輯模式使用「開始日期」「到期日期」，編輯模式的清除控制具可讀名稱。
3. 開啟 `Issues/IssueRow`、`Issues/IssueDetailHeader`、`Boards/KanbanCard` 與 `Boards/GanttIssueRow`，確認共用標籤與格式一致；一般 Labels 不顯示 `start-date:`。
4. 切換 Preview 的 light/dark theme，並以 375 px 和桌面寬度檢查日期換行、標題、異常提示及鍵盤閱讀順序。

## Portal Smoke Check

在登入後的 Portal 建立或編輯一筆可用測試 Issue，分別設定、清除開始日期與到期日期；檢查 Issue list/detail、Kanban 與 Gantt 的日期一致性，確認一般 Labels 不顯示原始開始日期 Label，且其他 Labels、Issue Type、Gantt 單日／未排程／異常區仍可辨識。
