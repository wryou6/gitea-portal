# Quickstart: 日期格式統一驗收

## Prerequisites

- Node.js 22、pnpm 9 及已安裝的 workspace dependencies。
- 可使用三種 Portal 語系及含 Issue／Comment／排程日期的測試資料。

## Build checks

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

Expected: workspace 型別檢查與 API／Web production builds 均成功。

## Date formatting scenarios

1. 在 zh-TW、en、ja 檢視同一筆 Issue 建立時間、更新時間及留言時間；日期皆使用 `YYYY/MM/DD HH:MM`，不含年月日文字或 AM／PM，且三種語系的日期字串一致。
2. 驗證 `00:05`、`09:07`、`12:00`、`23:59` 等時間，確認小時與分鐘均補零且使用 24 小時制。
3. 以不同本地時區檢視相同 timestamp，確認日期時間反映瀏覽器本地時區；涵蓋午夜與 DST 邊界。
4. 在 UTC 以西及以東的時區檢視相同 Issue 開始日與截止日；兩邊都顯示同一 `YYYY/MM/DD` 日曆日。
5. 檢視 Issue detail／list／Kanban／Gantt 中的完整排程日期值，以及甘特圖日期提示、title、range slider 值與無障礙名稱；確認完整日期只用數字與 `/`，日期時間只用數字、`/`、空格及 `:`。
6. 確認甘特圖月份列與緊湊日刻度、瀏覽器原生日期輸入框仍維持原有呈現；缺失與無效日期仍顯示原有 fallback 或 anomaly。

## Excluded validation

本次依使用者指示不驗收窄螢幕可讀性。固定日期字串在窄螢幕的裁切或換行風險未驗證；若日後重新納入窄螢幕驗收，須補做檢查。

## Acceptance

所有範圍內的完整日期與日期時間符合指定數字格式；日期-only 不跨日、timestamp 依本地時區呈現，其他 UI 文案保留語系翻譯，且 Gitea／Portal 資料未被格式化流程改寫。
