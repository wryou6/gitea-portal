# AGENTS.md

## 專案定位

這是供內網工程團隊使用的 Gitea 跨 Repository Issue Portal。Gitea 是 Issue、Comment、Label、Assignee、Milestone 與狀態的唯一 Source of Truth；不要建立獨立 Issue mirror 或把 Gitea 資料複製進 Portal persistence。

## 工作規則

- 文件與使用者可見文字使用繁體中文；程式識別字與 API 欄位可使用英文。
- 回覆要直接給實際修改、指令、錯誤原因或驗證結果，不只提供高階建議。
- 修改前先檢查 `git status --short --branch`、相關 `README.md`、本檔案與 feature spec。
- 保留與任務無關的既有變更；不要使用 `git reset --hard`、`git checkout --` 或 force push。
- 不得提交 `.env`、OAuth secret、access token、session secret、private key 或其他 credentials。
- 使用者指出 AI 判斷有誤（例如「不是 A，而是 B」）時，不可只替換答案或覆述 B。先確認 B 要達成的結果，並查明落差是規則／文件不明確、缺少前提，還是原解法本身不適合目標；用程式與文件證據區分事實和推測。若原解法無法可靠達標，提出並採用更合適的具體做法。確認是專案規則、契約或流程缺漏時，更新對應權威文件及受影響內容，讓後續 AI 能直接理解；不要把一次性或未確認的推測寫成永久規則。
- 測試未通過、工具／資源調用失敗或工作反覆返工時，把結果當成根因線索，檢查產品、預期、環境、權限、工具限制及專案指引；條件和假設未變時不要重跑相同操作。選擇最直接可靠的路徑以減少非正味作業；確認是持續性專案缺口時，修正對應文件、測試或自動化。外部阻塞無法排除時，清楚回報限制及已完成部分，不要宣稱成功。

## 技術邊界

- 維持目前的 pnpm workspace：`apps/api`、`apps/web`、`packages/domain`、`packages/gitea-contracts`。
- Gitea API 操作必須遵守目前使用者權限；Portal 不得用較高權限的後端身份替使用者繞過 Gitea authorization。
- 所有 Repository 共用固定的 Issue Status 定義；`Todo`、`In Progress` 以 Gitea Label 保存，`Done` 對應 Gitea Closed。
- Kanban 狀態必須保存於 Gitea 支援的 `status:` Label；不得把工作狀態只保存於 Portal。
- Issue list/detail 顯示完整 Labels；Kanban Card 可隱藏工作流程 Labels。

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
- 修改 Gitea Label 或 Issue Status 時，確認 atomic replacement 與 optimistic concurrency 行為未被破壞；不得改回 remove-then-add fallback。
- 修改 Kanban/Gantt view 時，確認沒有新的 Issue persistence mutation，且 repair annotation、error、anomaly column、drag transition 仍可辨識。
- 修改 UI 後至少執行 `pnpm.cmd typecheck` 與 `pnpm.cmd build`；若涉及 feature spec，更新對應 `specs/<feature>/` 文件與 tasks。
- `specs/current/` 是已驗收且仍有效需求的權威契約；`specs/` 根層只放進行中的 feature，`specs/archive/` 保存已驗收、已同步的交付紀錄。日常需求判讀不得讀取 archive，除非使用者要求追查歷史。
- `specs/current/` 必須是無歷史脈絡的產品終態說明：只描述現在應如何運作。每次需求變更都改寫同主題的現行條文，不新增差異、變更日誌、feature 來源／編號、舊行為、變更原因或驗收過程；需要保存的歷史放 feature/archive。提交 current 前依 `.specify/workflows/feature-lifecycle.md` 執行沿革詞與歷史連結檢查。
- 新 feature 完成實作或 converge 只代表可請使用者驗收，不代表已驗收。只有使用者明確接受，且需求已同步至 `specs/current/` 後，才封存 feature；未收到確認就留在根層。封存保留原編號與目錄名，新編號取根層及 archive 最大編號加一，永不重用。
- 需求建立、釐清、修訂或實作收斂時，依 `.specify/workflows/feature-lifecycle.md` 同步現行契約及處理驗收／封存。
- Playwright E2E 使用 `pnpm.cmd --filter @gitea-portal/web test:e2e`。此腳本先建立 production bundle，再由測試直接載入產出的 CSS，以 `page.setContent()` 驗證版面；不要為這類純前端佈局測試啟動 Vite preview 或 API，也不需要 loopback 權限。使用獨立 Playwright 瀏覽器，不使用 Codex CUA MCP 或既有瀏覽器工作階段。若測試需要驗證真實 HTTP/API 整合，才設定 webServer，並從一開始要求本機 loopback 權限。
- 使用 `apply_patch` 編輯檔案；不要用 shell redirect 或腳本覆寫檔案。

## Git

- Commit 使用 Conventional Commits，例如 `feat(work-views): hide status labels on kanban cards`。
- Commit 前確認 staged diff 只包含本次工作，執行 `git diff --cached --check`。
- 不要跳過 hooks，也不要修改 Git global config。
