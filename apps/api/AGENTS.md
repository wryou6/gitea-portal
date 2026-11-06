# API 指引

Fastify API 以目前登入者的 Gitea delegated access 執行讀寫。不得使用較高權限身份擴大 Repository、Issue 或 Label 權限；Issue、Comment、Label、Assignee、Milestone、狀態及排程仍以 Gitea 為資料來源。

## Issue 狀態與 Labels

- 所有 Repository 共用 `packages/domain` 定義的狀態。Todo、In Progress 寫入 Gitea `status:` Label；Done 對應 Closed。
- 更新狀態或 Labels 時使用可驗證的 atomic replacement 與 optimistic concurrency，保留未修改的 Labels；不得改回 remove-then-add fallback。
- 多 API 資源寫入失敗時，重新讀取並回報 Gitea 實際保存結果；不得把未保存的預覽當成成功。

## API contract 與驗證

- API contract 變更時，同步檢查 `packages/domain`、`packages/gitea-contracts`、API 與 Web 型別。
- API 測試以 mock Gitea；不得使用正式 credentials。
- 執行 API 工作區驗證：`pnpm.cmd --filter @gitea-portal/api typecheck`、`pnpm.cmd --filter @gitea-portal/api test`。完整 production build 使用根目錄 `pnpm.cmd build`。
