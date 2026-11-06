# Web 指引

## UI 與多語系

- 使用者可見文字、提示、表單標籤及無障礙名稱都使用 i18n 資源，並同步維護繁體中文、英文、日文。Gitea 共用詞彙依 [terminology guide](src/i18n/terminology.md) 核對。
- Issue list/detail 顯示完整 Labels；Kanban Card 可隱藏流程 Labels。
- Kanban/Gantt 必須保留 repair annotation、error、anomaly column 與 drag transition 的可辨識性；狀態操作仍走 Gitea API，不新增 Portal Issue persistence。
- UI 變更執行根目錄 `pnpm.cmd typecheck` 與 `pnpm.cmd build`；視覺變更使用 Storybook 檢視實際呈現。

## Playwright

- E2E 指令：`pnpm.cmd --filter @gitea-portal/web test:e2e`。
- 純前端版面檢查以 production CSS 搭配 `page.setContent()`；不要啟動 Vite preview 或 API。使用獨立 Playwright 瀏覽器，不使用 Codex CUA MCP 或既有瀏覽器工作階段。
- 真正的 HTTP/API 整合測試才設定 `webServer`；需要本機 loopback 權限時，從一開始就要求可連線的執行環境。
