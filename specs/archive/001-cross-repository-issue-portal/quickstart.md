# Quickstart Validation: 跨 Repository Gitea Issue 管理 Portal

本文件是 Phase 1 的端到端驗證指南。它不定義實作程式碼；實作完成後，依此準備內網 Gitea 測試資料並驗證需求。

## Prerequisites

1. 可使用的 Gitea instance，版本與 API capabilities 已確認支援本計畫使用的 v1 API。
2. 至少兩個測試 Repository，使用者對兩者具有不同 Issue 查看/修改權限案例。
3. 測試帳號至少包含：可建立/修改 Issue 的使用者、只能查看的使用者、無其中一個 Repository 權限的使用者。
4. 至少兩套已發布且有版本的 Workflow Convention；每個測試 Repository 在集中設定中只指定一套 Convention。
5. 一個 Board config 可選擇兩個相同 Convention version 的 Repository；另一個 Repository 使用不同 Convention version。

## Start

```text
pnpm install
pnpm dev
```

設定 Gitea OAuth2 client 與 Portal session secrets，然後從瀏覽器開啟本地 development URL。具體環境變數名稱由實作任務定義，不能把 access token 寫入 frontend bundle 或 repository。

## Validation scenarios

### 1. Cross-Repository search

- 以可查看兩個 Repository 的帳號登入。
- 開啟 Issue list，確認每筆結果包含 Repository 與 Issue Number。
- 組合 Repository、State、Assignee、Label、Milestone 與 keyword 條件。
- 期望：結果符合所有指定條件，且不包含無權限 Repository。

### 2. Issue mutation and comments

- 建立一筆 Issue，修改 Title、Description、Assignee、Labels、Milestone。
- Close、Reopen，再新增 Comment。
- 直接在 Gitea 查看同一 Issue。
- 期望：Portal 與 Gitea 的資料一致；只讀帳號的相同操作被拒絕且沒有部分變更。

### 3. Board convention compatibility

- 建立共享 Board，選擇 Convention version A。
- 加入兩個指定為 version A 的 Repository。
- 嘗試加入 version B Repository。
- 期望：version A Repository 可加入；version B 被拒絕並顯示不相容原因。

### 4. Board states and conflicts

- 對一筆 Issue 不設定 Workflow Label；對另一筆套用一個狀態；對第三筆套用同 Convention 的兩個狀態。
- 期望：三者分別顯示「未設定狀態」、正確欄位與「狀態衝突」。Portal 不自動猜測。
- 將單一狀態 Card 移到另一欄。
- 期望：Portal 先確認能以單一原子操作替換同 Convention 的狀態 Labels，再由 Gitea 一次完成替換；重新整理後 Board 仍反映 Gitea。
- 若原子替換能力不存在、target Label 不存在、權限不足或目前資料已變更，期望：操作在修改前被拒絕，原始 Labels 不變，Portal 顯示可理解的拒絕原因。

### 5. External Gitea changes

- 在另一個 Gitea session 修改 Issue、Label 或權限。
- 回到 Portal 重新整理 Issue list/detail/Board。
- 期望：Portal 顯示 Gitea 最新資料；失去權限的內容不再可見或可操作。

### 6. Board configuration persistence

- 使用者建立、修改、刪除共享 Board 設定。
- 以另一個 Portal 使用者重新登入。
- 期望：Board 設定可被看見與修改；不存在 owner/member 管理資料；刪除 Board 不影響任何 Gitea Issue。

## Acceptance evidence

記錄每個情境的帳號、Repository、Issue Number、Convention version、操作時間與 Gitea 對照結果。至少保留一個成功與一個權限拒絕案例；不得在 evidence 中保存 access token、密碼或未授權 Issue 內容。SC-002、SC-003、SC-005 與 SC-008 的代表性使用者成效量測，於後續產品驗收規劃執行，不要求此 quickstart 建立完整使用者研究或統計系統。

## 本次實作驗證紀錄

驗證日期：2026-09-20；帳號：`admin`；測試 Repository：`admin/portal-test-api`、`admin/portal-test-ops`、`admin/portal-test-web`。

1. Cross-Repository search：通過。Issue list 同時顯示三個 Repository；`bug` Label 篩選結果跨 Repo 正確收斂，URL 保留 `state`、`label`、`page`。
2. Issue mutation and comments：通過。Portal 建立 `admin/portal-test-api#5`，修改 Title/Labels、Close、Reopen 並新增 Comment；Portal detail 與 Gitea Issue 頁面一致。
3. Board convention compatibility：通過。Workflow A Board 可選擇 `portal-test-ops`/`portal-test-web`；Workflow B 僅顯示 `portal-test-api`，不同 Convention 不會進入同一 Board。
4. Board states and conflicts：通過。無 workflow Label 顯示「未設定狀態」；單一 `workflow-a:wip` 顯示在 WIP；同時存在 `workflow-a:todo` 與 `workflow-a:wip` 顯示「狀態衝突」。單一狀態 Card 拖曳成功更新 Gitea Labels；衝突 Card 被 409 拒絕且原欄位保留。
5. External Gitea changes：通過。透過 Gitea MCP 新增 Workflow Labels、替 Issue 套用/製造衝突後重新整理 Portal，Board 反映最新 Gitea 資料。
6. Board configuration persistence：通過。Board 建立、重新載入、改名後仍存在於 JSON store；短暫測試 Board 可刪除，且未改動 Gitea Issue。Board JSON 使用 schema version/revision。

權限拒絕：未登入直接呼叫 Issue API 回 `401 Authentication required`；Portal session mutation 缺少 CSRF header 的請求回 `403`。本 dummy fixture 未建立第二個只讀 Gitea 帳號，因此尚未做第二個使用者的 Repository-level 403 對照。
