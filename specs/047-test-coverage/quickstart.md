# Quickstart: 分層自動化測試

## Prerequisites

- Node.js 22、Corepack/pnpm 9，已安裝 workspace dependencies。
- 不需要 Gitea instance、OAuth 設定或 credentials。

## Run

```powershell
pnpm.cmd test:api
pnpm.cmd test:web
pnpm.cmd --filter @gitea-portal/web test:component
pnpm.cmd --filter @gitea-portal/web test:e2e
pnpm.cmd test
```

## Expected results

- 各命令回報對應測試層的通過/失敗案例與非零失敗 exit code。
- `test:api` 和 `test:web` 不啟動 API server 或正式 Gitea；component suite 使用 jsdom。
- `test:component` 可獨立執行 WorkViewFilterBar 可見互動，不啟動 API 或 browser server。
- E2E 會執行既有 Kanban 捲動測試及少量高價值工作流程。
- `pnpm.cmd typecheck` 與 `pnpm.cmd build` 仍是額外的型別及建置驗證，不取代測試。

## Latest verification

2026-11-06：`pnpm.cmd test` 通過 API/domain 27、Web 6（3 純邏輯與 3 component）、E2E 4；`pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd format:check` 與 `git diff --check` 均通過。所有 Gitea requests 與 transition responses 使用測試替身，未連線正式 Gitea 或使用正式 credentials。
