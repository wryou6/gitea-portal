# Quickstart: 驗證工作檢視共用篩選與全域搜尋

## Prerequisites

- Install workspace dependencies and configure a reachable Gitea OAuth application using `.env.example`.
- Sign in with an account that can read at least two repositories containing Issues with varied Status, Type, Priority, and assignees.
- Start the app with `pnpm.cmd dev`.

## Manual scenarios

1. **Shared filters**: In All repos List, select a priority, Type, Status, and assignee. Confirm each change immediately updates results and query parameters. Remove one chip and clear all; verify only selected conditions change.
2. **Cross-view state**: With shared filters active, navigate List → Kanban → Gantt → List. Confirm the same filter query remains and each view contains only matching Issues. Verify default filter values are omitted and invalid URL values do not break the page.
3. **Repository workspace scope**: From All repos, select a Repository in the top workspace selector, then return to All repos. Confirm each workspace shows its own complete scope. Open a legacy URL containing `repository`, `label`, or `milestone`; confirm those conditions are ignored and removed after filter update or workspace navigation.
4. **Gantt Status**: Confirm the Gantt Open/Closed controls are gone; Todo/In Progress/Done use the common Status filter. Confirm date range, Scale, and Gantt view options still work and remain in the URL.
5. **Global search**: From a Repository view, search for an Issue in a different readable Repository. Confirm results appear in the top-bar dropdown, show Repository identity, and selecting a result opens that Issue. Return from detail and confirm the original view is restored. Verify no-results, loading, read-error, keyboard navigation, and Escape dismissal.
6. **Responsive/theme/i18n**: Review 375px, tablet, and desktop widths in light and dark themes for zh-TW, en, and ja. Confirm no horizontal page overflow, visible focus, and readable dropdown/active chips.
7. **Read failures**: Simulate required aggregate read failure and confirm existing error/retry presentation remains whole-view; zero filtered results remain an empty result, not an error.

## Storybook

Run `pnpm.cmd --filter @gitea-portal/web build-storybook`. Inspect shared filter bar and top search stories using fixture data only; stories must not call live APIs or mutate the Storybook URL.

## Static checks

Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root.

## 桌機左側控制面板（2026-10-02）

- 在三個檢視的 `DesktopWorkspace`／`DesktopWorkspaceDark` stories，以 1440×900、zh-TW/en/ja 檢查控制面板、純文字摘要、內容獨立捲動與明暗主題。
- 選擇狀態及負責人，確認摘要、筆數與結果同步。移除單一條件與清除全部操作留在控制面板。
- 收合面板後確認摘要仍顯示條件、主內容寬度增加；展開後原值保留。
- 在 List 開啟檢視設定、調整欄位與排序；在 Gantt 調整起始日、前後區段、今天、刻度及欄位設定，確認圖表上方不再有操作工具列。
- 確認 List 當頁筆數沒有被宣稱為跨分頁總筆數；loading/error 與空結果呈現不同訊息。

### 本次驗證結果

- 1440×900、三檢視 × zh-TW/en/ja × 明暗主題，共 18 個 Storybook 組合均沒有頁面水平或垂直溢出；摘要高度 27.83px、面板寬度 240px，摘要包含的按鈕及連結數為 0。
- 在 Storybook 操作狀態及負責人，摘要與結果同步；面板收合後內容增加 196px 寬度，篩選仍保留。List 與 Gantt 檢視設定 dialog 可開啟及以 Escape 關閉；Gantt 刻度可調整。
- 使用已提供的帳號在 localhost:5173 實際登入，三檢視的繁體中文明暗頁面皆顯示 19 筆問題，選擇處理中皆為 6 筆；篩選更新網址，重新整理後面板收合與狀態條件保留。
- 實際 Kanban → Gantt → List 導覽保留 state 及 assignee；本次導覽沒有 API 寫入或瀏覽器執行錯誤，完成後已登出 Portal。其他語系的實際 Gitea session 操作、跨 Repository 全域搜尋及 Issue 狀態寫入不屬於本次驗證結果。
- workspace typecheck、production build 與 Storybook build 通過；新增共用元件符合 Prettier 格式。截圖及一次性瀏覽器檢查腳本位於 `output/playwright/work-view-controls/`，不納入提交。
