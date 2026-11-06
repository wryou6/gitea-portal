# Quickstart: Issue list 欄位與預設排序調整

## Prerequisites

- 使用可讀取測試 Issues 的登入帳號，或開啟 Web Storybook。
- 清單案例至少包含過期、今日、未來及沒有 Due Date 的 Issues，並包含同 Due Date 的兩筆 Issue。
- 確認 Storybook 或帳號偏好為「無保存偏好」及「既有 Key ascending 偏好」兩種狀態。

## Validation scenarios

1. **無偏好預設**：清除測試帳號的 Issue view preference 後開啟 All repos 與 Repository Issue list；確認 Key 預設隱藏、Title 可見，且排序為 Due Date 升冪。
2. **日期次序**：確認較早 Due Date 在前、同日期以 Key 升冪排列、未設定 Due Date 位於最後。
3. **Key 可選性**：在 View Options 顯示 Key，再隱藏 Key；確認 Title 仍不可隱藏，表格欄位與空狀態欄數一致。
4. **舊個人偏好**：載入含 Key ascending 且有自訂欄位的既有偏好；確認 Key 可見性、欄序與排序均保留。
5. **URL 優先**：用 URL 指定其他有效欄位及方向；確認該排序覆寫個人預設，移除 URL sort 後回到個人預設。
6. **恢復預設**：從自訂欄位及排序狀態恢復預設；確認 Key 隱藏、Due Date ascending、生效 URL 與已保存預設一致。
7. **Repository 身分**：在 All repos 確認每筆 Title 下方顯示正確 `owner/repo`，包括相同 Issue number 的不同 Repository；進入 Repository 專屬清單後確認頁面標題仍識別來源且列內沒有重複標示。

## Project validation

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
```

Storybook review covers the default, legacy preference, Key visibility and reset states. URL override remains part of the runtime validation scenarios below. No authenticated Gitea write is part of this feature.

## 執行結果（2026-10-02）

- `pnpm.cmd typecheck`：通過（首次受限執行遇到環境 `spawn EPERM`，授權重試後通過）。
- `pnpm.cmd build`：通過。
- `pnpm.cmd --filter @gitea-portal/web build-storybook`：通過；Storybook runtime 有既有 `eval` 警告，bundle 有超過 500 KB 的提示。
- Storybook 瀏覽確認預設 Due Date 升冪、同日 Key 升冪、未設定日期在最後，以及既有 Key 升冪偏好仍可顯示 Key。
- View Options 確認預設 Key 未勾選且可切換、Title 固定顯示；切換後恢復預設會隱藏 Key 並保留 Due Date 升冪。
- All repos 確認 Title 下方顯示 `owner/repo`；深色主題及 375 px 寬度的 View Options 版面可讀且操作區完整。
- URL sort precedence 已檢視既有初始化與載入程式路徑，未在 Storybook 或已登入 Gitea session 執行互動驗證；本次未驗證登入後的 Repository API 行為。
