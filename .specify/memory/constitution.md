# Gitea 跨 Repository Issue Portal Constitution

## Core Principles

### I. Gitea 是 Issue 資料的唯一來源

Issue、Comment、Label、Assignee、Milestone、狀態與排程資料 MUST 以 Gitea 為準。Portal
MAY 保存工作區等檢視設定，但 MUST NOT 建立 Issue 副本、獨立 Issue mirror，或將 Gitea
Issue snapshot 作為 Portal 的持久資料。

### II. 操作權限必須跟隨目前使用者

Portal 對 Repository、Issue 及其相關資料的讀取與寫入 MUST 受目前使用者的 Gitea 權限
限制。Portal MUST NOT 使用較高權限的後端身份擴大使用者可存取的資料範圍。

### III. Gitea 寫入必須保全資料並可驗證

修改 Gitea 狀態或 Labels 前，Portal MUST 驗證使用者權限及資料版本。寫入 MUST 保留未
涉及的資料，並使用可驗證的原子更新及樂觀並行控制。若無法安全完成，Portal MUST 在
寫入前拒絕操作，不得以可能留下部分更新的方式降級處理。

### IV. 跨來源彙整不得呈現部分結果為完整資料

聚合檢視 MUST 讀取其工作範圍內的所有必要 Repository 與 Issue 頁面。任何必要讀取失敗
時，Portal MUST 回報錯誤，不得將部分結果呈現為完整結果。載入、無資料與錯誤狀態
MUST 能清楚區分。

### V. 所有 Repository 共用固定 Workflow 語意

Kanban MUST 使用 Portal 統一的固定 Workflow，使不同 Repository 的狀態具有一致語意。
Workflow 狀態 MUST 保存在 Gitea 支援的資料欄位中。狀態缺漏或衝突 MUST 明確呈現，
不得默默推測或覆寫來源資料。

### VI. 工作範圍與資料來源必須清楚可辨

使用者 MUST 能辨認目前檢視涵蓋的工作範圍。跨 Repository 彙整中的每筆 Issue MUST 標示
所屬 Repository，避免相同 Issue 編號或相似標題造成誤認。

### VII. 使用者可見文字必須納入多語系

新增或修改使用者可見文字時，MUST 使用專案的 i18n 資源，不得新增硬編碼字串。所有
支援語系 MUST 更新對應翻譯，並確認翻譯 key 與插值參數一致。按鈕、表單、錯誤訊息、
提示、狀態文字及無障礙名稱均適用此原則；文字變更 MUST 檢查不同語系及窄螢幕下的
版面可讀性。

## Additional Constraints

- OAuth secrets、access tokens、session secrets、private keys 與其他 credentials MUST NOT
  提交至版本控制。
- Delegated credentials MUST NOT 進入前端 bundle、Portal 持久資料或日誌。
- 共用 API contract 變更 MUST 同步檢查 domain、Gitea contracts、API 與 Web 型別一致性。

## Development Workflow

- 改變使用者可見行為或資料契約的功能 MUST 維護對應的 Spec Kit 規格與任務文件。
- 功能實作前 MUST 完成 spec、plan、tasks 與跨文件分析；只有存在阻塞歧義時才進行
  clarify，分析確認沒有重大不一致後才能實作。
- UI 變更 MUST 執行 `pnpm.cmd typecheck` 與 `pnpm.cmd build`，並確認新增或修改的文字已
  完成所有支援語系的處理。
- 實作與規格不一致時，MUST 更新規格或修正實作，並在 review 中確認符合本憲章。

## Governance

本憲章是本專案功能規格、實作計畫及程式碼審查的治理依據。所有變更 MUST 在 review
時檢查是否符合本憲章；若有例外，變更說明 MUST 記錄理由、影響與後續處理方式。

修訂本憲章 MUST 更新版本與最後修訂日期，並記錄影響的原則及理由。版本依語意化版本
規則遞增：移除或重新定義既有原則為 MAJOR；新增原則或實質擴充規範為 MINOR；不改變
規範意義的澄清與修正文句為 PATCH。

**Version**: 1.0.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-09-28
