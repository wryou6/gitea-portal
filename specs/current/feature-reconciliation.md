# 歷史 Feature 與現行契約對照

本表核對既有 feature 規格是否仍代表現行需求。封存 spec 保存原始需求、澄清及交付脈絡；本表與 `specs/current/` 才是日常使用的現況契約。相同需求以現行契約合併，已由後續決策取代的歷史實作方式不回填。

| Feature | 原規格主題 | 現行契約位置／核對結果 |
| --- | --- | --- |
| 001 | 跨 Repository Issue Portal | `product-contract.md`、`issue-management.md`、`work-views.md`：保留 Gitea SoT、delegated 權限、工作區與 Issue 操作；早期 Board/Convention 設定方案已由固定 status 契約取代。 |
| 002 | Workflow 預設狀態修復 | `product-contract.md`、`work-views.md`：保留缺漏／衝突狀態辨識、修復註記與安全失敗；不可推定狀態。 |
| 003 | Board 隱藏流程 Labels | `product-contract.md`、`work-views.md`：卡片可隱藏流程 Labels，Issue list/detail 保留完整 Labels。 |
| 004 | 前端 UI 技術棧遷移 | `work-views.md`、`issue-management.md`：只保留交付後仍有效的互動、鍵盤與響應式要求；技術棧遷移步驟屬歷史。 |
| 005 | Issue 排程與 Gantt | `product-contract.md`、`work-views.md`：保留 Gitea start-date Label、due date、未排程建立、日期操作及異常狀態。 |
| 006 | 可收合側欄 | `work-views.md`：保留可收合導覽、窄視窗與鍵盤可操作性。 |
| 007 | Repository 工作區與跨庫 Board | `product-contract.md`、`work-views.md`：保留可讀 Repository 範圍及跨庫身份標示；早期可配置 Board 模型不再作現況。 |
| 008 | Issue Type 規範 | `product-contract.md`、`issue-management.md`：保留 canonical Type、缺漏／衝突辨識及保存時保留未知 Labels。 |
| 009 | Issue Type 呈現 | `product-contract.md`、`issue-management.md`：跨頁一致呈現 Type，缺漏或衝突明確可見。 |
| 010 | 使用者設定與外觀 | `issue-management.md`：保留外觀及本機偏好、無效偏好回退。 |
| 011 | 排程日期呈現 | `work-views.md`：以人類可讀日期呈現，不暴露 Label 儲存格式。 |
| 012 | Priority 統一 | `product-contract.md`、`issue-management.md`：保留固定 Priority 值、缺漏／衝突提示與 Gitea 寫入權限。 |
| 013 | 固定 Issue 工作流 | `product-contract.md`：保留 Todo/In Progress/Done、原因與下一步、Assignee 交接語意。歷史 `workflow:`／`workflow-action:` 名稱不沿用，現況依 `status:` 契約。 |
| 014 | 中英日介面 | `issue-management.md`：保留 zh-TW/en/ja、偏好保存、Gitea 來源文字與錯誤細節。 |
| 015 | Dashboard 與共用介面 | `product-contract.md`、`work-views.md`：現行首頁為 All repos Gantt，保留工作區空狀態與共用導覽；舊 Dashboard 分頁設計不作契約。 |
| 016 | All repos 與 Repository 工作區 | `product-contract.md`、`work-views.md`：保留資料範圍、空狀態、Repository 選取及跨庫身份。 |
| 017 | 登入與 Session | `issue-management.md`：保留 OAuth、登出、session 過期與暫時故障區分、合法回跳。 |
| 018 | Issues 表格與 Status | `work-views.md`：保留表格掃描、排序、欄位偏好、逾期及統一狀態；表格欄位細節以現行 UI 為準。 |
| 019 | Gantt 表格與時間軸 | `work-views.md`：保留欄位偏好、日期範圍、時間刻度及時間軸操作。 |
| 020 | Kanban 卡片版面 | `work-views.md`：保留卡片掃描、欄寬、狀態轉換和錯誤回復。 |
| 021 | 側欄建立 Issue | `issue-management.md`：保留從導覽建立入口及 Gitea Repository 建立權限。 |
| 022 | 共用工作檢視篩選 | `work-views.md`：保留跨檢視篩選、Repository 範圍、URL 還原及搜尋；Gantt 專屬日期／scale 保持專屬。 |
| 023 | 狀態色彩與配色 | `issue-management.md`：保留六款配色及狀態文字語意；顏色不得成為唯一狀態識別。 |
| 024 | Assignee 快速篩選 | `work-views.md`：保留 self、特定負責人及全部範圍語意，零結果是正常結果。 |
| 025 | 最近 Done 顯示 | `work-views.md`：保留完成項目可見範圍及清單完整瀏覽能力。 |
| 026 | 日期格式統一 | `work-views.md`、`issue-management.md`：保留依語系顯示日期及避免內部格式外露。 |
| 027 | 使用者姓名與頭像 | `product-contract.md`、`issue-management.md`：保留姓名優先、帳號與預設頭像回退、資料重新載入更新。 |
| 028 | 多位經手人頭像 | `product-contract.md`、`issue-management.md`：Assignee 順序語意與多位經手者可辨識，窄版不犧牲可讀性。 |
| 029 | Issue list 掃描性 | `work-views.md`：保留標題、近期到期優先及使用者排序偏好。 |
| 030 | 工作檢視 URL 清理 | `work-views.md`：保留檢視專屬 URL 參數、切頁清理及返回還原。 |
| 031 | 工作檢視多選 | `work-views.md`：保留狀態、Priority、Type 多選與跨檢視 URL 還原。 |
| 032 | 設定重設計／退役遷移 | `issue-management.md`、`product-contract.md`：保留設定與配色；已退役標籤遷移不可重新出現，舊 Labels 不得因此被修改或刪除。 |
| 033 | SPA 導覽 | `issue-management.md`：保留站內切換、直接載入、重新整理、返回與工作脈絡。 |
| 034 | Hover 側欄及排序 | `work-views.md`：保留工作檢視排序、窄側欄、觸控與輔助科技操作。 |
| 035 | 篩選列版面 | `work-views.md`：保留篩選列位置、控制項辨識及窄版可讀性。 |
| 036 | Kanban 欄位獨立捲動 | `work-views.md`：保留獨立欄捲動；E2E 見 `apps/web/e2e/repository-kanban-scroll.spec.ts`。 |
| 037 | 跨檢視逾期提示 | `work-views.md`：保留跨檢視一致提示，區分逾期、日期異常及無日期。 |
| 038 | Gantt 今天與拖曳排程 | `work-views.md`：保留今天指示與日期拖曳；寫入依 Gitea 權限及衝突行為。 |
| 039 | Session 提示版面 | `issue-management.md`：保留 session 重新登入提示、關閉後單次瀏覽不重現。 |
| 040 | Issue 詳情對話框 | `issue-management.md`、`work-views.md`：保留快速檢視、完整頁面導覽、Esc/遮罩關閉及焦點回復。 |
| 041 | 跨檢視 Badge 編輯 | `issue-management.md`、`work-views.md`：保留 Type/Priority/Status 快速編輯及寫入失敗不得顯示假成功。 |
| 042 | Gantt 時間軸平移 | `work-views.md`：保留單一時間軸平移及未排程項目建立日期操作。 |
| 043 | Issue Markdown | `issue-management.md`：保留 Issue 描述／留言 Markdown 安全呈現。 |
| 044 | IIS 子路徑部署 | `issue-management.md`、`product-contract.md`：保留 base path、OAuth callback、API/auth proxy 及 SPA fallback；部署細節文件留在封存交付記錄。 |
| 046 | Repository 標題顯示編號 | `work-views.md`、`issue-management.md`：保留清單/卡片/Gantt 標題顯示 `#<number>`，detail 原標題與 Gitea 資料不變。 |
| 047 | 分層自動化測試 | `verification.md`：保留 API、Web、E2E、typecheck、build 入口及已確認測試覆蓋。 |

## 未能由現存規格還原的項目

- `048-test-coverage-next` 是空目錄，沒有 `spec.md`、tasks 或交付資料。它不是可核對的既有規格，故不從名稱推測需求；目前測試覆蓋只依實際 package scripts 與 test files 記錄於 `verification.md`。

## 程式與測試抽查錨點

- Status 使用 `packages/domain/src/status.ts`、`packages/domain/src/issue-status-resolver.ts`；Label replacement/並行控制見 `apps/api/test/issues/label-replacement.test.ts` 及 `apps/api/test/domain/issue-status-resolver.test.ts`。
- URL 篩選與多語工作列見 `apps/web/test/work-view-url-state.test.ts`、`apps/web/test/WorkViewFilterBar.test.tsx`。
- Kanban 轉換與捲動見 `apps/web/e2e/kanban-status-transition.spec.ts`、`apps/web/e2e/repository-kanban-scroll.spec.ts`。
- 其他 46 份 feature 的契約已按領域合併於本目錄；並非每條需求都有獨立自動化測試。程式中未由上述錨點驗證的細節，不宣稱已通過執行期測試。
