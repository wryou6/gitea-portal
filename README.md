# Gitea 跨 Repository Issue Portal

供內網工程團隊使用的 Gitea 跨 Repository Issue 管理 Portal。Gitea 是 Issue、Comment、Label、Assignee、Milestone 與工作狀態的唯一 Source of Truth；Portal 只保存共享 Board 設定與版本化 Workflow Convention metadata。

## 開發環境

需求：Node.js 22、Corepack/pnpm 9，以及可連線的內網 Gitea；不需要資料庫服務。

```text
copy .env.example .env
pnpm install
pnpm dev
```

API 預設在 `http://localhost:3001`，Web 預設在 `http://localhost:5173`。Board 設定預設寫入 `data/boards.json`，可由 `BOARD_STORE_PATH` 指定其他路徑。JSON store 具備 schema version、啟動驗證、atomic temp-file rename、flush 與 lock-file 並行寫入保護。

Gitea delegated access token 只能由後端使用，不得寫入 frontend bundle、repository 檔案或提交紀錄。Workflow Convention 從 `config/workflows/conventions.yaml` 讀取，Board 只能加入 exact matching Convention version 的 Repository。

Board 狀態轉移必須由 Gitea 支援可驗證的 atomic Label replacement；無法保證時 Portal 必須在修改前拒絕，不得使用 remove-then-add fallback。

Board persistence 只包含 Board、Repository references、immutable Workflow Convention version、timestamps 與 store revision，不保存 Issue、Comment、Label、Assignee 或 Milestone mirror。刪除 Board 不會修改 Gitea Issue。

## Scope

Portal 提供跨 Repository Issue 搜尋、詳情、建立、編輯、留言、狀態管理與 Kanban。未提供的 Gitea 功能可由 Issue 的原始 Gitea link 開啟。Pull Request、CI/CD、Project custom fields 與獨立 Issue database 不在本階段範圍。
