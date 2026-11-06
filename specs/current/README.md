# 現行需求契約

本目錄只描述目前有效的產品需求，是日常需求判讀的權威來源。把它當成產品的最終現況說明：讀者不需知道歷史，只需知道系統現在應如何運作。

不得在此記錄每次改動、需求來源、feature 編號、舊版行為、變更原因、討論或驗收過程。需求改變時，直接改寫該主題的現行條文，不新增差異段落、變更日誌或時間脈絡；需保留的歷史資料放在 feature 交付文件或 archive。允許描述產品目前不支援的能力，但不得以「以前支援、現在移除」等歷史比較方式表達。

| 契約 | 範圍 |
| --- | --- |
| [產品與工作流程](product-contract.md) | Source of Truth、權限、工作區、Issue workflow、排程、介面、安全與部署 |
| [工作檢視互動](work-views.md) | Issues、Kanban、Gantt、篩選、日期互動、狀態修復及響應式行為 |
| [Issue 管理與帳戶](issue-management.md) | Issue 編輯、類型、優先度、Assignee、Markdown、Session 與導覽 |
| [驗證契約](verification.md) | API、Web、E2E 測試分層及目前驗證入口 |
| [IIS 子應用程式部署手冊](deployment-runbook.md) | 仍有效的 IIS 子路徑部署與操作步驟 |

每份契約按產品領域整理，包含完整有效行為與必要技術限制。需求驗收、同步及封存依 `.specify/workflows/feature-lifecycle.md`；流程紀錄不寫入本目錄。
