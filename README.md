# Gitea 跨 Repository Issue Portal

供內網工程團隊使用的 Gitea Issue 管理 Portal。工作區提供 All repos 與各個可讀 Repository；每個工作區可切換 Issues、Kanban 與 Gantt。Gitea 是 Issue、Comment、Label、Assignee、Milestone、排程日期與狀態的唯一資料來源。

Portal 不建立 Issue mirror，也不取代 Gitea 的 Git Hosting、Pull Request、Code Review 或 CI/CD 功能。未提供的 Gitea 功能可從 Issue detail 的原始 Gitea URL 開啟。

## 需求

- Node.js 22
- Corepack 與 pnpm 9
- 可由開發機連線的內網 Gitea
- Gitea OAuth Application（Client ID、Client Secret 與 callback URL）
- 不需要 PostgreSQL 或其他資料庫服務

## 本機啟動

Windows PowerShell 若 `pnpm` 被 Execution Policy 阻擋，使用 `pnpm.cmd`。

```powershell
Copy-Item .env.example .env
# 編輯 .env，填入 Gitea OAuth 設定與 session secret
pnpm.cmd install
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd dev
```

啟動後：

- Web：<http://localhost:5173>
- API：<http://localhost:3001>

API 會讀取專案根目錄的 `.env`。API 與 Web 分開啟動時，Web Vite dev server 會將 `/api` proxy 到 `http://localhost:3001`。

## IIS 子應用程式部署

若 Portal 部署於 IIS 預設網站的 `/issue` 子應用程式，使用下列命令建立對應前端 bundle：

```powershell
$env:VITE_BASE_PATH = "/issue/"
pnpm.cmd build
Remove-Item Env:VITE_BASE_PATH
```

將 `apps/web/dist` 內的內容複製到 IIS 子應用程式實體目錄。產物包含 `web.config`，為不存在的前端路徑回退至 `index.html`；IIS 需啟用 URL Rewrite。API 仍須由獨立 Node.js 程序執行。設定 `WEB_ORIGIN` 為完整 Portal 公開網址（例如 `http://portal-host/issue/`），並將 Gitea OAuth callback 設為同一主機的 `/issue/auth/callback`。IIS 需把 `/issue/api/*` 和 `/issue/auth/*` 轉送至 API，移除 `/issue` 前綴；這些反向代理規則由部署環境配置，未包含在靜態 bundle 中。

實際 API 環境變數、ARR 反向代理、Gitea OAuth 與 Windows 工作排程設定，請參考 [IIS 子應用程式部署與操作手冊](specs/044-iis-subpath-deployment/deployment-runbook.md)。

## 環境變數

| 變數                        | 必填 | 用途                                                                                  |
| --------------------------- | ---- | ------------------------------------------------------------------------------------- |
| `GITEA_BASE_URL`            | 是   | 內網 Gitea URL，例如 `http://localhost:3000`                                          |
| `GITEA_OAUTH_CLIENT_ID`     | 是   | Gitea OAuth Application Client ID                                                     |
| `GITEA_OAUTH_CLIENT_SECRET` | 是   | Gitea OAuth Application Client Secret，只供 API 使用                                  |
| `GITEA_OAUTH_REDIRECT_URI`  | 是   | Gitea OAuth callback，預設 `http://localhost:3001/auth/callback`                      |
| `GITEA_OAUTH_SCOPE`         | 否   | OAuth scope；預設為 `read:user read:repository read:issue write:issue`                |
| `GITEA_API_TIMEOUT_MS`      | 否   | Gitea API timeout，預設 `10000`                                                       |
| `PORTAL_SESSION_SECRET`     | 是   | Portal session signing secret；不要使用 `replace-me`                                  |
| `API_PORT`                  | 否   | API port，預設 `3001`                                                                 |
| `WEB_ORIGIN`                | 否   | Portal 公開網址，預設 `http://localhost:5173`；子路徑部署時需包含路徑，例如 `/issue/` |

不要將 `.env`、OAuth secret、access token 或 session secret commit 到 repository。

## 工作區與 Issue Status

所有 Repository 共用固定三種 Issue Status：Todo、In Progress、Done。Todo 與 In Progress 由 Gitea `status:<key>` Labels 表示；Done 使用 Gitea Closed 狀態。轉換原因以 `status-action:<key>` Label 記錄，Portal 依固定定義顯示繁體中文原因與下一步動作。

All repos 只彙整目前登入者有讀取權限的 Repository；任何必要 Repository 或 Issue 頁面讀取失敗時，整個彙整請求失敗，不顯示部分結果。Repository 工作區只顯示該 Repository 的資料。Portal 不保存工作區或 Issue 的副本。

Kanban 的 Issue Status 使用 Gitea Status Labels 保存。狀態轉移必須透過可驗證的 atomic Label replacement；無法保證時，Portal 會在修改前拒絕操作，不使用 remove-then-add fallback。

Portal 直接使用 Gitea 使用者姓名與大頭貼呈現登入帳戶及 Issue 人員。姓名優先顯示，帳號保留在提示與人員選項中；缺少姓名或頭貼時分別回退到帳號與預設人像。重新載入會更新登入者外觀，Issue 與留言資料重新取得時會更新相關人員外觀。

## 專案結構

```text
apps/api/                 Fastify API、Gitea adapter、OAuth、Issue 與工作檢視服務
apps/web/                 React/Vite Web UI
packages/domain/          Issue、Status 等共用 domain types
packages/gitea-contracts/ API response 與 Gitea contract types
specs/                    Spec Kit feature specification、plan、tasks 與 checklist
```

## 驗證指令

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd format:check
```

`typecheck` 會檢查 API、Web 與 shared packages；`build` 會編譯 API、contracts、domain 並建立 Web production bundle。

Playwright E2E 指令：`pnpm.cmd --filter @gitea-portal/web test:e2e`。腳本會先建立 production bundle，測試直接載入 bundle CSS 並用 `page.setContent()` 檢查 DOM 版面，不啟動 Vite preview 或 API，也不需要 loopback 權限。使用獨立 Playwright 瀏覽器，不依賴 Codex CUA MCP 或既有瀏覽器工作階段。若新增需要驗證 HTTP/API 整合的測試，再為該測試設定 webServer 並從一開始要求本機 loopback 權限。

分層自動化測試指令：

```powershell
pnpm.cmd test:api
pnpm.cmd test:web
pnpm.cmd test:e2e
pnpm.cmd test
```

`test:api` 使用 Node.js test runner 測試 API、domain、Gitea HTTP adapter 與 route contract；Gitea 呼叫由測試替身攔截。`test:web` 測試 Web 純邏輯，不啟動服務或瀏覽器。`test:e2e` 執行 Playwright 瀏覽器流程；`test` 依序執行三層測試。這些測試不使用正式 Gitea credentials。

## 安全與權限邊界

- Gitea OAuth delegated access token 只存在後端 session，不得進入 frontend bundle、JSON store 或 Git history。
- Portal 不得因自身設定取得超出使用者 Gitea 權限的 Repository、Issue 或 Label 存取能力。
- 所有 Issue、Comment、Label、Assignee、Milestone 與狀態操作最終都寫回 Gitea。
- Portal 不保存 Gitea Issue snapshot；Portal 停止後，Issue 仍可直接由 Gitea 管理。

## 範圍

目前範圍包含 All repos 與 Repository 工作區中的 Issue 搜尋、篩選、建立、編輯、留言、Open/Close/Reopen、Assignee、Labels、Milestone，以及使用 Gitea start-date Label 與原生 due date 的 Kanban/Gantt。首頁 `/` 開啟 All repos Gantt；`/issues`、`/kanban`、`/gantt` 是 All repos 檢視。Epic、Parent/Child、dependency graph、Story Points、time tracking、Roadmap、custom fields、Pull Request、CI/CD 與獨立 Issue database 不在第一階段範圍。
