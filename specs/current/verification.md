# 驗證需求與現有證據

本契約描述專案持續提供的驗證能力。測試通過是工程證據，不替代使用者對功能的驗收。

| 層級 | 指令 | 覆蓋範圍 |
| --- | --- | --- |
| API/domain | `pnpm.cmd test:api` | session/route contract、權限、Issue 寫入與狀態轉移、Label 原子替換、Gitea client/error、status resolver |
| Web | `pnpm.cmd test:web` | React 元件與純邏輯；不啟動 API 或瀏覽器 |
| E2E | `pnpm.cmd test:e2e` | Playwright 使用者流程；佈局測試以 production CSS 和 `page.setContent()` 執行 |
| 型別 | `pnpm.cmd typecheck` | API、Web、domain 與 contracts 型別 |
| 建置 | `pnpm.cmd build` | API/packages 編譯及 Web production bundle |
| 全套 | `pnpm.cmd test` | 依序執行分層自動化測試 |

## 已核對的可執行測試證據

- `apps/api/test/domain/issue-status-resolver.test.ts`：目前狀態 Label 與 Gitea Open/Closed 狀態解析。
- `apps/api/test/issues/label-replacement.test.ts`：保留未涉及 Labels、版本變更時拒絕覆寫，及原子替換衝突處理。
- `apps/api/test/issues/issue-transition.test.ts`、`apps/api/test/routes/issue-transition.test.ts`：狀態轉換及 API 行為。
- `apps/api/test/auth/permissions.test.ts`、`apps/api/test/routes/issue-write-auth.test.ts`：授權邊界及寫入權限。
- `apps/web/test/work-view-url-state.test.ts`：無效 URL 篩選值處理、檢視狀態序列化及 assignee 預設值。
- `apps/web/test/WorkViewFilterBar.test.tsx`：篩選器鍵盤操作、自我篩選與 zh-TW/en/ja 呈現。
- `apps/web/e2e/kanban-status-transition.spec.ts`：Kanban 拖曳狀態更新、權限拒絕與衝突呈現。
- `apps/web/e2e/repository-kanban-scroll.spec.ts`：Repository Kanban 欄位獨立捲動及卡片版面。

這些測試是具體回歸證據，但不代表每一種工作檢視、部署方式、偏好與錯誤情境都有測試覆蓋；不能據此宣稱需求全數由自動化測試驗證。

已存在的 E2E 包含 Repository Kanban 捲動與 Kanban 狀態轉移。API 測試攔截 Gitea HTTP，不使用正式 credentials。純前端佈局測試不啟動 Vite preview/API；需要驗證真實 HTTP 整合時才設定 webServer 並使用具 loopback 能力的環境。

測試案例是行為回歸證據，不是完整需求清單。任何新變更仍須依 current 契約及當前 feature 規格驗收。
