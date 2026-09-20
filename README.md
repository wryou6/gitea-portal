# Gitea 跨 Repository Issue Portal

供內網工程團隊使用的 Gitea 跨 Repository Issue 管理 Portal。Gitea 是 Issue、Comment、Label、Assignee、Milestone 與工作狀態的唯一 Source of Truth；Portal 只保存共享 Board 設定與版本化 Workflow Convention metadata。

## 開發環境

需求：Node.js 22、Corepack/pnpm 9、PostgreSQL，以及可連線的內網 Gitea。

```text
copy .env.example .env
pnpm install
pnpm dev
```

API 預設在 `http://localhost:3000`，Web 預設在 `http://localhost:5173`。Gitea delegated access token 只能由後端使用，不得寫入 frontend bundle、`.env` 以外的 repository 檔案或提交紀錄。

Workflow Convention 從 `config/workflows/conventions.yaml` 讀取。設定至少包含 Convention ID、版本、狀態 key/名稱、順序與 exact Gitea Label name；prefix/namespace 的實際命名語法可依團隊設定。Board 只能加入 exact matching Convention version 的 Repository。

Board 狀態轉移必須由 Gitea 支援可驗證的 atomic Label replacement；無法保證時 Portal 必須在修改前拒絕，不得使用 remove-then-add fallback。
# Gitea Cross-Repository Issue Portal

供內網使用的 Gitea Issue read-through Portal。Gitea 是 Issue、Comment、Label、Assignee、Milestone 與狀態的唯一 Source of Truth；Portal 只保存共享 Board 設定。

## Local setup

1. 複製 `.env.example`，填入 Gitea URL、OAuth client 與 session secret。
2. 確認 `config/workflows/conventions.yaml` 的 convention version 與 Repository assignment。
3. 執行 `pnpm install`、`pnpm build`，開發時執行 `pnpm dev`。
4. Gitea OAuth callback 必須指向 `GITEA_OAUTH_REDIRECT_URI`；access token 只存於 HttpOnly Portal session，不會進入 browser bundle、Git 或 frontend storage。

Board persistence 只包含 Board、Repository references 與 immutable Workflow Convention version，不保存 Issue mirror。刪除 Board 不會修改 Gitea Issue。

## Scope

Portal 提供跨 Repository Issue 搜尋、詳情、建立、編輯、留言、狀態管理與 Kanban。未提供的 Gitea 功能可由 Issue 的原始 Gitea link 開啟。Pull Request、CI/CD、Project custom fields 與獨立 Issue database 不在本階段範圍。
