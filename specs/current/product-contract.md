# 產品現行需求契約

本文件描述 Portal 目前提供的產品能力及持續適用的產品規則。

## Source of Truth 與權限

- Gitea 是 Issue、Comment、Label、Assignee、Milestone、排程與狀態的唯一資料來源。Portal 不建立 Issue mirror 或持久化 Issue snapshot。
- Repository、Issue 及相關資料操作必須遵守目前使用者的 Gitea 權限；Portal 不得以較高權限後端身份擴權。
- 跨 Repository 彙整只呈現完整必要資料；必要 Repository 或 Issue 讀取失敗時回報錯誤，不將部分結果當作完整結果。
- Issue、Comment、Label、Assignee、Milestone、Open/Close 等寫入回 Gitea。狀態與 Label 更新須遵守原子替換、版本檢查及衝突回報，不採 remove-then-add 降級流程。

## 工作區與狀態

- 提供 All repos 與使用者可讀 Repository 工作區；Issue、Kanban、Gantt 檢視在工作區中切換。聚合結果的每筆 Issue 清楚標示所屬 Repository。
- 所有 Repository 共用 Todo、In Progress、Done 狀態。Todo 與 In Progress 使用 Gitea `status:` Label；Done 對應 Gitea Closed。缺漏或衝突狀態須明確呈現，不可靜默推定或覆寫。
- 狀態轉換使用固定原因及下一步動作；舊格式 workflow labels 不作相容推斷，也不因 Portal 顯示而改寫 Gitea 原資料。
- Kanban 可隱藏工作流程 Labels；Issue list/detail 顯示完整 Labels。工作狀態變更寫回 Gitea 支援的欄位。
- Open Issue 的第一位 Gitea Assignee 是目前負責人，其餘為經手人；Closed/Done 的 Assignees 僅表示經手人。交接不得遺失其他經手人。
- Issue Type 與 Priority 使用跨 Repository 共用定義；未知或衝突值須可辨識，保存時不得靜默丟棄未知 Labels。
- 排程資料以 Gitea 支援的 start-date Label 與原生 due date 保存，供 Kanban/Gantt 呈現及操作。

## 介面與導覽

- 提供 Issues、Kanban、Gantt 工作檢視及 Repository 工作區；All repos 首頁為 Gantt。
- 支援 Issue 搜尋、篩選、建立、編輯、留言、狀態操作、Assignee、Labels 與 Milestone 管理。
- 使用 Gitea 使用者姓名及頭像呈現帳戶和 Issue 人員；姓名缺漏時回退帳號，頭像缺漏時使用預設圖像。
- 使用者可見文字採專案 i18n，更新所有支援語系；不得硬編碼介面字串。
- 未提供的 Gitea 能力可由 Issue detail 原始 Gitea URL 開啟；Portal 不取代 Git Hosting、Pull Request、Code Review 或 CI/CD。

## 安全與部署

- OAuth token 僅存在後端 session；secret、token、session secret 與 private key 不得進入前端 bundle、持久資料或版本控制。
- 支援根路徑及文件記載的 IIS 子應用程式部署方式；OAuth callback、反向代理與公開 URL 須與部署路徑一致。

## 排除範圍

Epic、Parent/Child、dependency graph、Story Points、time tracking、Roadmap、custom fields、Pull Request、CI/CD 與獨立 Issue database 不屬於目前產品範圍。

## 需求來源

Gitea 是 Issue 資料的權威來源；本目錄是 Portal 產品需求的權威來源。
