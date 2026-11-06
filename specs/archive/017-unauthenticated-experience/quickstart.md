# Quickstart: 未登入與 Session 過期處理

## Prerequisites

- Node.js 22、pnpm 9，並依根目錄 README 設定可用的 Gitea OAuth application、callback URI、Portal session secret 及 `WEB_ORIGIN`。
- Web `http://localhost:5173` 與 API `http://localhost:3001` 可由瀏覽器存取；Gitea application callback 指向目前 API `/auth/callback`。
- 一個可完成 OAuth 登入的 Gitea 帳號。OAuth 成功流程需要有效的 Gitea client credentials。

## Validation scenarios

1. **匿名深連結**：清除 Portal cookies 後，分別開啟首頁、`/settings`、Issue 清單、Issue 建立、Issue 詳情、Dashboard 與 Repository view。每個頁面均顯示獨立登入頁，且不顯示 AppShell 或 Issue/workspace 資料。
2. **成功登入及回跳**：從帶 query 的 Repository Kanban 或 Issue 詳情深連結啟動登入並完成 OAuth；確認瀏覽器返回相同 Web origin、相同路徑與原 query，頁面資料重新載入。
3. **無效回跳目標**：對登入入口傳入外部 URL、protocol-relative URL、反斜線、未知 Portal path、過期或缺失 state；確認 callback 不建立 session、不導向外站，合法但缺失的目標使用 Portal 首頁。
4. **服務暫時錯誤**：讓 session lookup 無法連線或回傳 5xx；確認登入頁不會出現，錯誤頁提供重試。恢復服務後選擇重試，確認登入或匿名介面正確載入。
5. **Session 過期**：在 Issues、Issue 建立／編輯及工作檢視中讓受保護 API 回 `auth.required`；確認只觸發登入轉場、不重送原操作。完成登入後回到原 URL；表單顯示重新輸入提示，原欄位沒有還原。
6. **OAuth 失敗**：在 Gitea 拒絕授權，或讓 token exchange 失敗；確認回到 Portal 登入畫面並顯示本地化、可重試訊息，不顯示 provider body、token 或 stack detail。
7. **介面與語系**：Storybook 檢視 login、service unavailable、OAuth failed 和 session expired notice；以 zh-TW/en/ja、鍵盤、淺色／深色主題及 320–390px 寬度確認內容可讀、焦點可見且 CTA 可操作。
8. **Portal 登出**：登入後從帳戶選單登出；確認 `POST /auth/logout` 回覆成功、Portal session 與 CSRF cookies 被清除，並顯示獨立登入頁。重新開啟先前受保護 URL 應要求登入；再次啟動 Gitea 登入時確認仍可使用 Gitea SSO。另以失敗回應確認仍留在登入後介面、錯誤可理解且能重試。

## Validation record (2026-09-28)

- **Passed**: `/auth` Vite proxy starts OAuth and sets the short-lived state cookie; a valid denial callback returns to the original safe deep link with a fixed failure code; an external return target falls back to Portal home; an invalid state is rejected; anonymous `/api/session` returns 401.
- **Passed**: Interactive OAuth login and token exchange completed for the local `admin`, `admin2`, and `admin3` accounts. Each Portal session showed the matching login; the `admin2` and `admin3` accounts required the normal first-use Gitea OAuth consent. From the authorized `admin3` session, `/repositories/admin/portal-test-api/kanban?status=open&assignee=admin2` survived the login callback with its path and query unchanged, and repository issues loaded.
- **Passed**: Workspace `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook` complete successfully. A fresh Storybook dev server indexed and rendered the login, expired-session, and unavailable-session stories with no component console errors. At 320px, the login story had no horizontal overflow; keyboard Tab reached the sign-in link.
- **Passed**: Storybook account-menu interaction with Playwright showed the localized sign-out action. With the browser offline, the authenticated shell remained visible and a localized `role="alert"` error offered retry. With a mocked `204`, the action navigated away and the authenticated shell disappeared.
- **Passed**: The running local API returned `204 No Content` from `POST /auth/logout` with separate expiry headers for `portal_session` and `portal_csrf`. The real Web app opened at `/issues?state=open` with an anonymous API session and rendered the standalone login page without the app shell.
- **Not verified end-to-end**: Completing a fresh Gitea OAuth round trip immediately after logout to confirm the browser reuses an existing Gitea IdP login. The Portal logout implementation does not call a Gitea logout endpoint or clear Gitea cookies.
- **Not verified end-to-end**: A live transient 5xx and retry, a real expired-token protected mutation, Gitea-side authorization denial in the browser, and English/Japanese plus dark-theme visual review were not simulated. Route-level denial and invalid-state handling were exercised; the session-expired and unavailable views were inspected in Storybook. An already-running Storybook on port 6006 returned a story-index error; the clean server on port 6008 indexed these same stories successfully.

## Expected results

- 無 session 與服務故障不會混淆；匿名時不載入受保護頁面。
- 合法 OAuth 往返保留 Portal 導覽位置且拒絕外部跳轉。
- Session 失效後不自動重送 mutation，也不保留未送出的 Issue 欄位。
- 登入、故障及過期提示均使用三種支援語系；Web/API typecheck 與 workspace build 通過。
