# Research: 負責人快速篩選

## Decision 1: 使用登入 session login 解析特殊 me 篩選

- **Decision**: 由既有 App login prop 提供目前使用者身分給所有工作檢視；共用 matcher 將 `me` 解析為該 login。缺少 assignee 仍代表 all。
- **Rationale**: `apps/web/src/main.tsx` 在 bootstrap 時呼叫 `/api/session`，authenticated state 具備 login。`apps/web/src/app/App.tsx` 已將 login 傳給 Issues List。All repos 的 `WorkspaceViewPage` 與 Repository 工作區頁面需沿相同 component props 傳遞 login 給 Kanban/Gantt 和 List。
- **Alternatives considered**: 讓每個 FilterBar 自行呼叫 session API；不採用，因為會重複請求且使初始篩選依賴非同步元件狀態。

## Decision 2: 以 me、實際 login 與無參數表達負責人範圍

- **Decision**: `assignee=me` 由目前使用者解析；缺少 assignee 代表 all 且不輸出 `assignee=all`；直接從下拉選取的 login 與 `unassigned` 沿用明確 URL 值。Portal 從非工作檢視頁面產生預設工作檢視連結時加上 `assignee=me`，檢視間導覽保留目前條件。
- **Rationale**: 特殊 `me` 讓分享連結由收件者身分解析；缺少 query 保持簡潔並明確代表無負責人限制。分開 Portal 預設導覽連結與直接網址的語意後，兩者均可穩定重開。
- **Alternatives considered**: 用 `assignee=all` 保留明確 all；不採用，因使用者指定缺少 assignee 即為 all。

## Decision 3: 共用 FilterBar、範圍快捷鍵與互斥按鈕組

- **Decision**: 在 `WorkViewFilterBar` 以 segmented buttons 提供負責人「自己」與「所有負責人」，其下方使用原生 `<select>` 直接挑選 login；優先級、類型、狀態以含全部選項的互斥按鈕組呈現。各組只覆寫自己的篩選值。`me` 與 `all` 不視為可清除的篩選條件；Clear 將負責人重設為 `me`。
- **Rationale**: 原生 select 在已有選擇時仍可直接展開候選項，避免 datalist 要先清空才看見其他人；優先級、類型、狀態選項數量少，直接按鈕可以減少操作步驟。共用按鈕樣式保留 44px 觸控高度、可見焦點及窄版換行。List、Kanban、Gantt 都共用同一元件，確保交互一致。
- **Alternatives considered**: 保留 datalist；不採用，因已選值會阻礙使用者直接查看候選項。

## Decision 4: 只改變顯示範圍，不變更資料來源

- **Decision**: 保持現有 Issue query/client-side matcher、Gitea 權限與唯讀流程；不新增持久化及 Gitea mutation。
- **Rationale**: 功能只改篩選條件，符合 constitution 關於 Gitea 是 Issue 唯一來源及 delegated permission 的要求。
