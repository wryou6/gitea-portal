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

預期 typecheck/build 成功；Storybook 可檢視 Issues table 的欄位顯示、表頭重排、預設欄序/排序保存、恢復預設、逾期提示、缺漏/異常、空/載入/錯誤及窄視窗呈現。

## Implementation validation

- `pnpm.cmd typecheck`: passed (all workspace package typechecks).
- `pnpm.cmd build`: passed (domain, Gitea contracts, Web production bundle, API TypeScript build).
- `pnpm.cmd --filter @gitea-portal/web build-storybook`: passed; Storybook reports the upstream `eval` warning and large-chunk warning.
- Earlier Storybook review covered the initial menu-based View Options design. The current toolbar refinement and its browser evidence are recorded in the 2026-09-29 section below.
- Checked the updated View Options menu in zh-TW, en, and ja Storybook locales.
- Localized Issues table headings were checked against the local Gitea 1.27.3 UI: Traditional Chinese uses `負責人`, `建立於`, and `截止日期`; the Portal translations now use those labels, with the missing Type/Key/Status headings translated in Traditional Chinese and Japanese. Status-facing work-view copy no longer uses the old Workflow term.
- Live Status-label migration has not been run from this development session: it requires an authenticated Portal `admin` session against the rebuilt API. The settings entry point is implemented; leave compatibility enabled until it reports `verified: true`.
- The migration result includes an expandable per-Issue success list plus the existing per-Issue conflict and failure details.

## Issues table acceptance

1. 開啟 All repos 與單一 Repository Issues 頁面，確認首次預設欄序為 Type、Key、Title、Assignee、Status、Priority、Start Date、Due Date、Created at、Author。
2. 確認 Type、Status 與 Priority 的表頭及每列內容皆水平置中。
3. 初次載入確認 URL 與表格為 `sort=key&direction=asc&page=1`。
4. 逐欄啟動排序，確認相同欄位切換方向、新欄位從升冪開始、缺值保持置底、換頁後排序穩定。
5. 使用篩選後分享 URL、重新載入，確認搜尋、篩選、排序及頁碼還原；任一頁不超過 50 筆。
6. 確認 `owner/repo#number` 能辨認並開啟原 Issue，Author/Created at 來自 Gitea 原始建立者與建立時間。
7. 確認僅開啟 Issue 的逾期 Due Date 日期值出現火焰提示；今日到期、已關閉、空值與異常日期沒有此提示。
8. 開啟 View Options，確認其中只有欄位顯示設定，Key 與 Title 無法隱藏且切換欄位立即套用。
9. 從表頭空白處拖曳欄位，確認整個表頭區域可啟動重排；只有目前排序欄顯示方向箭頭。
10. 更改欄序與目前排序，確認工具列分別顯示「設為預設欄位順序」與「設為預設排序」小型醒目按鈕；同時出現時可並列或換行，均不遮擋 View Options。
11. 按下保存按鈕後確認個別按鈕隱藏；按「恢復預設」確認欄位全部顯示、欄序回復初始值、排序與 URL 回到 `key asc`，並確認 cookie 也還原初始偏好。
12. 確認 URL 明確指定有效排序欄位與方向時優先於 cookie；URL 沒有有效排序時使用登入帳號的預設排序，改排序後 URL 同步更新。
13. 切換兩個登入帳號確認偏好互相隔離；關閉並重開瀏覽器確認各自 cookie 設定仍存在。使用缺漏或無效 cookie 時確認回到完整預設設定。
14. 檢視 View Options、保存排序、恢復預設及欄位拖曳的繁體中文、英文、日文文字；與 Gitea 對應同義用字保持一致。
15. 用鍵盤操作 Dialog 與欄位勾選；聚焦表頭排序按鈕後以 Shift+Space 抓取、左右方向鍵移動、Space 放下、Esc 取消。確認即時欄序有位置播報、保存動作生效，Escape 關閉對話框後焦點回到 View Options 按鈕。

### 2026-09-29 toolbar refinement validation

- Workspace `pnpm.cmd typecheck` and `pnpm.cmd build`: passed.
- `pnpm.cmd --filter @gitea-portal/web build-storybook`: passed; build emitted the existing Storybook runtime `eval` notices and large DocsRenderer chunk warning.
- Storybook at 375px: the column-order, default-sort, and restore actions fit without overlap; View Options wraps below them. zh-TW, en, and ja toolbar labels rendered, with no page-width overflow.
- Browser interaction: dragging from header whitespace reordered columns; only the active sort column showed an arrow. Changing sort revealed its save action; saving hid that action. Restore defaults returned all 10 columns, Key ascending, and only View Options on the toolbar.
- View Options directly displayed visibility controls only. Browser console had 0 errors and 0 warnings after linking the existing `favicon.svg` in `.storybook/preview-head.html`.

## Status acceptance

以 Gitea `admin` 登入 Portal，前往「設定 → Issue Status 標籤遷移」，啟動或重試完整範圍遷移。入口會先列舉所有可見 Repository、讀取全部 Issues 並檢查每個 Repository 的 Issue/Label 寫入權；任一必要讀取或權限檢查失敗時不會開始部分遷移。每筆 Issue 使用目前登入者權限及原子 Label 全集替換；結果列出處理數量、衝突中刪除與保留的值，以及逐 Repository/Issue 失敗原因。完成後會重新列舉並重讀全範圍；只有報告 `verified: true` 才能移除舊 prefix 相容程式。若請求中斷，重新執行會依 Gitea 當前資料續跑。

只有 admin 能呼叫遷移 API；Portal 不儲存密碼或額外 Gitea token。遷移作用範圍為 admin 可列舉的全部 Repository，若實際權限或讀取範圍不完整，報告不會宣告完成。

## Contracts

- [Issues query and pagination](./contracts/issues-query.md)
- [Status definition](./contracts/status-definition.md)
- [Status label migration](./contracts/status-label-migration.md)
