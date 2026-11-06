# 現行需求契約

本目錄保存已驗收且目前仍有效的產品需求，是日常開發與需求判讀的權威來源。封存 feature 不作為現行需求來源。

| 契約 | 範圍 |
| --- | --- |
| [產品與工作流程](product-contract.md) | Source of Truth、權限、工作區、Issue workflow、排程、介面、安全與部署 |
| [工作檢視互動](work-views.md) | Issues、Kanban、Gantt、篩選、日期互動、狀態修復及響應式行為 |
| [Issue 管理與帳戶](issue-management.md) | Issue 編輯、類型、優先度、Assignee、Markdown、Session 與導覽 |
| [驗證契約](verification.md) | API、Web、E2E 測試分層及目前驗證入口 |
| [Feature 對照與核對](feature-reconciliation.md) | 46 份可讀歷史 feature spec 對應的現行需求與已取代內容 |
| [IIS 子應用程式部署手冊](deployment-runbook.md) | 仍有效的 IIS 子路徑部署與操作步驟 |

每份契約按產品領域整理，記錄完整行為與必要技術限制，不照搬歷史 feature 清單。需求變更須依使用者確認更新 feature，再同步本目錄。feature 未驗收前留在 `specs/` 根層；使用者明確驗收且有效需求已同步後，才移至 `specs/archive/`。

本 repo 首次整理既有 feature 時，依使用者指示將目前根層 feature 預設視為已驗收。已驗收 feature 的仍有效需求整理至上述契約；feature 文件與測試留在 `specs/archive/` 作歷史證據。此一次性整理完成後，新 feature 一律需要使用者明確驗收才能封存。
