# AGENTS.md

## 專案

內網 Gitea 跨 Repository Issue Portal，使用 pnpm workspace（`apps/*`、`packages/*`）；Gitea 是 Issue 資料的唯一來源，Portal 不建立 Issue mirror 或持久化 Issue snapshot。

## 所有工作適用

- 文件與使用者可見文字使用繁體中文；程式識別字與 API 欄位可使用英文。
- 回覆直接提供修改、指令、原因或驗證結果，不只給高階建議。
- 開始前檢查 `git status --short --branch`、`README.md`、`specs/current/README.md`、相關現行契約、相關 feature spec（若存在）及最近的 `AGENTS.md`。保留無關變更；不要使用 `git reset --hard`、`git checkout --` 或 force push。
- 不得提交 `.env`、OAuth secret、access token、session secret、private key 或其他 credentials。
- 使用者修正 AI 判斷，或測試／工具／資源調用失敗、工作反覆返工時，追查根因並檢驗原解法是否達成目標；條件未變時不要重複相同操作。確認是持續性的專案缺口後，更新權威文件或機制，減少非正味作業。完整規則見 [專案憲章](.specify/memory/constitution.md)。
- `specs/current/` 是現行產品契約；根層 `specs/` 放進行中或待驗收 feature。日常工作不讀 `specs/archive/`，除非使用者要求追查歷史。Feature 需求流程見 [feature lifecycle](.specify/workflows/feature-lifecycle.md)。
- 編輯檔案使用 `apply_patch`。

## Workspace 與常用命令

使用 pnpm 9；Windows PowerShell 執行 `pnpm.cmd`：

```powershell
pnpm.cmd install
pnpm.cmd dev
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd format:check
```

工作區指引按需載入：[API](apps/api/AGENTS.md)、[Web](apps/web/AGENTS.md)、[共用 packages](packages/AGENTS.md)。

## Git

- Commit 使用 Conventional Commits。
- Commit 前確認 staged diff 只包含本次審閱內容，並執行 `git diff --cached --check`。
- 不要跳過 hooks 或修改 Git global config。
