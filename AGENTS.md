# AGENTS.md

## 專案定位

這是供內網工程團隊使用的 Gitea 跨 Repository Issue Portal。Gitea 是 Issue、Comment、Label、Assignee、Milestone 與狀態的唯一 Source of Truth；不要建立獨立 Issue mirror 或把 Gitea 資料複製進 Portal persistence。

## 工作規則

- 文件與使用者可見文字使用繁體中文；程式識別字與 API 欄位可使用英文。
- 回覆要直接給實際修改、指令、錯誤原因或驗證結果，不只提供高階建議。
- 修改前先檢查 `git status --short --branch`、相關 `README.md`、本檔案與 feature spec。
- 保留與任務無關的既有變更；不要使用 `git reset --hard`、`git checkout --` 或 force push。
- 不得提交 `.env`、OAuth secret、access token、session secret、private key 或其他 credentials。

## 技術邊界

- 維持目前的 pnpm workspace：`apps/api`、`apps/web`、`packages/domain`、`packages/gitea-contracts`。
- 不要為 Board persistence 引入 PostgreSQL 或其他資料庫；Board 設定使用 `BOARD_STORE_PATH` 指向的 JSON store。
- Board JSON store 必須維持 schema validation、schema/data format version、atomic write、flush 與 lock-file 並行寫入保護。
- Gitea API 操作必須遵守目前使用者權限；Portal 不得用較高權限的後端身份替使用者繞過 Gitea authorization。
- Workflow Convention 由 `config/workflows/conventions.yaml` 定義。Board 與 Repository 必須 exact match Convention ID/version。
- Kanban 狀態要保存為 Gitea 支援的 Workflow Label；不得把工作狀態只保存於 Portal。
- Issue list/detail 顯示完整 Labels；只有 Board Card 可依該 Board Convention 提供 `visibleLabels`。

## 常用指令

Windows PowerShell 若 `pnpm.ps1` 被 Execution Policy 阻擋，使用 `pnpm.cmd`：

```powershell
pnpm.cmd install
pnpm.cmd dev
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd format:check
```

API 預設使用 `http://localhost:3001`，Web 預設使用 `http://localhost:5173`。本機設定從根目錄 `.env` 讀取，範例見 `.env.example`。

## 修改與驗證

- 新增或修改 API contract 時，同步檢查 `packages/domain`、`packages/gitea-contracts`、`apps/api` 與 `apps/web` 的型別。
- 修改 Gitea Label 或 Workflow state 時，確認 atomic replacement 與 optimistic concurrency 行為未被破壞；不得改回 remove-then-add fallback。
- 修改 Board view 時，確認不存在新的 Issue/Board persistence mutation，且 repair annotation、error、anomaly column、drag transition 仍可辨識。
- 修改 UI 後至少執行 `pnpm.cmd typecheck` 與 `pnpm.cmd build`；若涉及 feature spec，更新對應 `specs/<feature>/` 文件與 tasks。
- 使用 `apply_patch` 編輯檔案；不要用 shell redirect 或腳本覆寫檔案。

## Git

- Commit 使用 Conventional Commits，例如 `feat(board): hide workflow labels on kanban cards`。
- Commit 前確認 staged diff 只包含本次工作，執行 `git diff --cached --check`。
- 不要跳過 hooks，也不要修改 Git global config。
