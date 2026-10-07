# Quickstart: 重新登入提示版面修正

## Prerequisites

- Node.js 22、pnpm 9，以及可執行的 Portal workspace。
- 需要檢視完整登入恢復流程時，需有可登入的 Gitea OAuth 帳號；版面與互動可透過 Storybook 獨立檢視。

## Validation

1. 執行 `pnpm.cmd typecheck` 與 `pnpm.cmd build`，確認型別及 production bundle 成功。
2. 執行 `pnpm.cmd --filter @gitea-portal/web storybook`，開啟 `Auth/Session expired notice` story。
3. 在一般桌面寬度及 320px、390px viewport 檢查 zh-TW、en、ja：通知位於右下方、文字換行、關閉控制完整可見，頁面沒有水平溢出。
4. 用滑鼠及鍵盤操作關閉控制；確認提示消失、焦點可見且 Storybook 畫面不發生內容區尺寸變化。
5. 開啟 authenticated app 並顯示通知，在 Issues、Kanban、Gantt、Dashboard、Settings、Repository 工作頁間切換；確認提示仍保持關閉或開啟的 UI 狀態，且不改變 View 可用寬高或捲動範圍。通知文字覆蓋可操作區域時，嘗試點擊底層工作操作，確認操作仍會觸發；點擊通知面板或關閉按鈕時則由通知接收事件。
6. 端對端驗證時，讓受保護請求回傳 `auth.required`，完成 Gitea OAuth 後確認回到原路徑、只顯示一則可關閉通知，且失敗前的 Issue 操作沒有自動重送。

## Expected Results

- 通知浮在視窗右下角，不參與工作頁版面配置，也不受工作區 overflow 裁切。
- 通知在繁中、英文、日文都可讀；使用者可透過鍵盤或滑鼠關閉。
- 關閉後 SPA 路由切換不會再次顯示；重新載入後只依現有登入恢復標記決定是否顯示。
- Issue 資料、OAuth/session contract 及 Gitea 狀態不變。

## Validation Record

- **Passed**: `pnpm.cmd --workspace-concurrency=1 typecheck` completed for all four workspace packages.
- **Passed**: `pnpm.cmd --workspace-concurrency=1 build` completed for all four workspace packages. Vite emitted the existing >500 kB chunk advisory.
- **Passed**: `pnpm.cmd --filter @gitea-portal/web build-storybook` compiled the new notice stories. Storybook emitted its upstream `eval` and >500 kB chunk advisories.
- **Not run**: Browser visual/interaction scenarios for viewport sizes, locale switching, bottom-layer click-through, keyboard dismissal, and route switching. CUA reported that no browser surface is available in this environment; Storybook was built but not opened.
