# Gitea 跨 Repository Issue Portal

供內網工程團隊使用的跨 Repository Issue 管理 Portal。Portal 統一呈現多個 Gitea Repository 的 Issues、搜尋篩選、Issue 編輯、留言與 Kanban Board；Gitea 仍是 Issue、Comment、Label、Assignee、Milestone 與狀態的唯一 Source of Truth。

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

## 環境變數

| 變數 | 必填 | 用途 |
| --- | --- | --- |
| `GITEA_BASE_URL` | 是 | 內網 Gitea URL，例如 `http://localhost:3000` |
| `GITEA_OAUTH_CLIENT_ID` | 是 | Gitea OAuth Application Client ID |
| `GITEA_OAUTH_CLIENT_SECRET` | 是 | Gitea OAuth Application Client Secret，只供 API 使用 |
| `GITEA_OAUTH_REDIRECT_URI` | 是 | Gitea OAuth callback，預設 `http://localhost:3001/auth/callback` |
| `GITEA_OAUTH_SCOPE` | 否 | OAuth scope；預設為 `read:user read:repository read:issue write:issue` |
| `GITEA_API_TIMEOUT_MS` | 否 | Gitea API timeout，預設 `10000` |
| `PORTAL_SESSION_SECRET` | 是 | Portal session signing secret；不要使用 `replace-me` |
| `BOARD_STORE_PATH` | 否 | Board JSON 路徑，預設 `data/boards.json` |
| `WORKFLOW_CONFIG_PATH` | 否 | Workflow Convention YAML 路徑，預設 `config/workflows/conventions.yaml` |
| `API_PORT` | 否 | API port，預設 `3001` |
| `WEB_ORIGIN` | 否 | Web origin，預設 `http://localhost:5173` |

不要將 `.env`、OAuth secret、access token 或 session secret commit 到 repository。

## Board 與 Workflow Convention

Workflow Convention 定義於 [`config/workflows/conventions.yaml`](config/workflows/conventions.yaml)。每個 state 以 `key`、`labelName`、`displayName` 與 `order` 定義；Repository 必須使用與 Board 完全相同的 Convention ID 與 version 才能加入 Board。

Board 設定預設保存於 `data/boards.json`。JSON store 具備：

- schema version 與啟動時 schema validation
- revision 欄位
- atomic temporary-file write 與 rename
- flush 後才視為寫入完成
- lock file 的並行寫入保護

Board JSON 只保存 Board、Repository references、immutable Workflow Convention version、timestamps 與 store revision，不保存 Issue、Comment、Label、Assignee 或 Milestone mirror。`data/boards.json` 與 lock/temp 檔案不應提交。

Kanban 的工作狀態使用 Gitea Workflow Labels 保存。狀態轉移必須透過可驗證的 atomic Label replacement；無法保證時，Portal 會在修改前拒絕操作，不使用 remove-then-add fallback。

## 專案結構

```text
apps/api/                 Fastify API、Gitea adapter、OAuth、Issue 與 Board service
apps/web/                 React/Vite Web UI
packages/domain/          Board、Issue、Workflow 等共用 domain types
packages/gitea-contracts/ API response 與 Gitea contract types
config/workflows/         Workflow Convention 設定
data/                     本機 Board JSON store（runtime data，不提交）
specs/                    Spec Kit feature specification、plan、tasks 與 checklist
```

## 驗證指令

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd format:check
```

`typecheck` 會檢查 API、Web 與 shared packages；`build` 會編譯 API、contracts、domain 並建立 Web production bundle。

## 安全與權限邊界

- Gitea OAuth delegated access token 只存在後端 session，不得進入 frontend bundle、JSON store 或 Git history。
- Portal 不得因自身設定取得超出使用者 Gitea 權限的 Repository、Issue 或 Label 存取能力。
- 所有 Issue、Comment、Label、Assignee、Milestone 與狀態操作最終都寫回 Gitea。
- Portal JSON store 不保存 Gitea Issue snapshot；Portal 停止後，Issue 仍可直接由 Gitea 管理。

## 範圍

目前範圍包含跨 Repository Issue 搜尋、篩選、建立、編輯、留言、Open/Close/Reopen、Assignee、Labels、Milestone 與跨 Repository Kanban。Epic、Parent/Child、dependency graph、Story Points、time tracking、Gantt、Roadmap、custom fields、Pull Request、CI/CD 與獨立 Issue database 不在第一階段範圍。
