# Quickstart: 負責人快速篩選

## Prerequisites

- 安裝 workspace dependencies，並以可讀取多個 Repository 的帳號登入 Portal。
- 使用至少包含目前使用者、其他負責人及未指派 Issue 的資料。

## Manual Scenarios

1. **Portal 預設連結**：從 Portal 導覽進入 All repos 與 Repository workspace 的 Issues List、Kanban、Gantt，確認連結含 `assignee=me` 且結果只顯示收件者目前登入者的 Issue。
2. **無參數網址**：直接開啟缺少 assignee 的檢視網址，確認結果涵蓋所有負責人。
3. **切換到所有負責人**：逐頁點選「所有負責人」，確認未指派和其他負責人的 Issue 可顯示；網址移除 assignee 參數，重新整理仍顯示 all。
4. **切回自己**：點選「自己」，確認網址為 `assignee=me`，由另一位登入者開啟時會篩選該收件者本人。
5. **直接選擇負責人**：選中 A 後直接展開 select 改選 B，不清空目前值；確認 URL 使用 B 的實際 login。
6. **保留其他篩選**：先設定 Priority、Type、Status、Repository、Label 或 Milestone，再切換負責人；確認其他條件及 Gantt 日期/刻度 query 保留。
7. **清除全部**：設定多項篩選後清除，確認負責人回到 `me`、其他篩選回到預設，固定 Repository workspace 仍鎖定目前 Repository；單獨 `me` 或 all 不啟用清除按鈕。
8. **鍵盤與多語系**：以 Tab/Enter/Space 操作按鈕和 select，確認選取狀態和焦點清楚；在 zh-TW、en、ja 與窄視窗檢查文案及版面。
9. **唯讀邊界**：切換篩選不應送出 Issue 指派更新，也不應變更 Gitea Issue。
10. **快速選項**：直接點選優先級、類型及狀態按鈕（含全部），確認各組單選狀態即時更新，且不需要展開下拉選單。

## Storybook and Workspace Checks

- `pnpm.cmd --filter @gitea-portal/web storybook`
- `pnpm.cmd --filter @gitea-portal/web build-storybook`
- `pnpm.cmd typecheck`
- `pnpm.cmd build`

Storybook 以 fixtures 展示 Portal 預設 `me`、無參數 all、指定 login、切換 select、清除行為及 All repos/Repository workspace；Storybook 不依賴 live API。
