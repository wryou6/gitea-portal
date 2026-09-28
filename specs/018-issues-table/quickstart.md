# Quickstart: Issues 表格與 Status 統一

## Prerequisites

- Node.js 與 pnpm workspace dependencies 已安裝。
- Web 與 API 使用既有 `.env` Gitea OAuth 設定。
- Storybook 可離線載入 fixture；真實 Issue 驗收需使用有對應 Gitea 權限的登入者。

## Local validation

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web storybook
```

預期 typecheck/build 成功；Storybook 可在 Issues Table story 看到預設 Key 升冪、其他欄位排序、逾期日期提示、缺漏/異常欄位、空結果、載入中及錯誤狀態，且可在窄視窗水平捲動。

## Implementation validation

- `pnpm.cmd typecheck`: passed (workspace package typechecks).
- `pnpm.cmd build`: passed (domain, Gitea contracts, Web production bundle, API TypeScript build).
- `pnpm.cmd --filter @gitea-portal/web build-storybook`: passed. Storybook reports the upstream `eval` warning and bundle-size warning.
- Visual review through the built Storybook static preview: default table/Key ascending, overdue date-only fire/color, narrow horizontal scrolling, empty, loading, and read-error states rendered as expected. The Playwright CLI was unavailable from the offline npm cache; local headless Chrome was used for screenshots.
- Localized Issues table headings were checked against the local Gitea 1.27.3 UI: Traditional Chinese uses `負責人`, `建立於`, and `截止日期`; the Portal translations now use those labels, with the missing Type/Key/Status headings translated in Traditional Chinese and Japanese. Status-facing work-view copy no longer uses the old Workflow term.
- Live Status-label migration has not been run from this development session: it requires an authenticated Portal `admin` session against the rebuilt API. The settings entry point is implemented; leave compatibility enabled until it reports `verified: true`.
- The migration result includes an expandable per-Issue success list plus the existing per-Issue conflict and failure details.

## Issues table acceptance

1. 開啟 All repos 與單一 Repository Issues 頁面，確認 10 欄依規格順序顯示。
2. 初次載入確認 URL 與表格為 `sort=key&direction=asc&page=1`。
3. 逐欄啟動排序，確認相同欄位切換方向、新欄位從升冪開始、缺值保持置底、換頁後排序穩定。
4. 使用篩選後分享 URL、重新載入，確認搜尋、篩選、排序及頁碼還原；任一頁不超過 50 筆。
5. 確認 `owner/repo#number` 能辨認並開啟原 Issue，Author/Created at 來自 Gitea 原始建立者與建立時間。
6. 確認僅開啟 Issue 的逾期 Due Date 日期值出現火焰提示；今日到期、已關閉、空值與異常日期沒有此提示。

## Status acceptance

以 Gitea `admin` 登入 Portal，前往「設定 → Issue Status 標籤遷移」，啟動或重試完整範圍遷移。入口會先列舉所有可見 Repository、讀取全部 Issues 並檢查每個 Repository 的 Issue/Label 寫入權；任一必要讀取或權限檢查失敗時不會開始部分遷移。每筆 Issue 使用目前登入者權限及原子 Label 全集替換；結果列出處理數量、衝突中刪除與保留的值，以及逐 Repository/Issue 失敗原因。完成後會重新列舉並重讀全範圍；只有報告 `verified: true` 才能移除舊 prefix 相容程式。若請求中斷，重新執行會依 Gitea 當前資料續跑。

只有 admin 能呼叫遷移 API；Portal 不儲存密碼或額外 Gitea token。遷移作用範圍為 admin 可列舉的全部 Repository，若實際權限或讀取範圍不完整，報告不會宣告完成。

## Contracts

- [Issues query and pagination](./contracts/issues-query.md)
- [Status definition](./contracts/status-definition.md)
- [Status label migration](./contracts/status-label-migration.md)
