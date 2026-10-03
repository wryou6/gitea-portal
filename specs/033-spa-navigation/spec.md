# Feature Specification: 站內畫面切換不閃白

**Feature Branch**: `main`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: 修正 Portal 在畫面切換時短暫閃白的問題，讓站內切換期間介面連續顯示，並保留目前工作脈絡。

## Clarifications

### Session 2026-10-03

- Q: 深層網址驗收要涵蓋哪個環境？ → A: 限定目前 repo 可重現的本機 Vite 環境；正式 host fallback 列為部署需求，不納入本功能的主機設定變更。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 切換 Portal 畫面時不中斷操作 (Priority: P1)

已登入的工程師在 Issue List、Kanban、Gantt、Dashboard、設定、Issue 詳情與 Issue 建立頁面間切換時，畫面連續更新，不會先出現整頁空白或白色閃屏。

**Why this priority**: 站內切換是 Portal 的主要操作方式；短暫空白會讓切換感受不穩定，並讓使用者以為頁面正在重新啟動。

**Independent Test**: 從主要導覽及頁面內連結逐一切換 Portal 畫面，確認共用導覽仍可見且新頁面直接接續呈現。

**Acceptance Scenarios**:

1. **Given** 使用者正在任一 Portal 頁面，**When** 選擇另一個站內頁面，**Then** 新頁面接續顯示且不出現整頁空白或白色閃屏。
2. **Given** 使用者從 Issue List、Kanban 或 Gantt 開啟 Issue，**When** Issue 詳情頁顯示，**Then** Portal 共用導覽保持可用，且可返回來源工作檢視。
3. **Given** 使用者正在建立 Issue，**When** 提交成功並前往新 Issue，**Then** 導航連續完成且新 Issue 可正常開啟。

---

### User Story 2 - 保留切換前後的工作脈絡 (Priority: P1)

工程師切換工作區或工作檢視時，網址仍代表目前頁面與有效篩選；從 Issue 返回時，來源頁面狀態可還原。

**Why this priority**: URL 與返回路徑是跨檢視工作的依據；導航方式改變不得丟失目前已支援的狀態。

**Independent Test**: 設定多選篩選及 List 排序或 Gantt 日期／刻度，跨檢視、工作區與 Issue 詳情切換，再確認網址和返回結果符合既有規則。

**Acceptance Scenarios**:

1. **Given** 使用者在工作檢視套用篩選，**When** 切換至另一工作檢視或 Repository 工作區，**Then** 只保留適用於目的檢視的 URL 狀態。
2. **Given** 使用者從 Gantt 開啟 Issue，**When** 返回工作檢視，**Then** 原有 Gantt 日期、刻度及有效篩選均還原。
3. **Given** 使用者在 List 調整排序或任一工作檢視變更篩選，**When** 使用瀏覽器上一頁或下一頁，**Then** 對應的網址、篩選與結果狀態一併還原。

---

### User Story 3 - 直接開啟或重整 Portal 網址 (Priority: P2)

工程師可將 Portal 頁面網址加入書籤、直接開啟或重新整理，並抵達該網址所代表的頁面與工作狀態。

**Why this priority**: 站內導航改善不能犧牲深連結、重新整理或分享工作網址的能力。

**Independent Test**: 在現有本機 Portal 環境的新分頁直接開啟 Dashboard、工作檢視、Repository 工作區與 Issue 詳情網址，並逐一重新整理確認目的頁正常呈現。

**Acceptance Scenarios**:

1. **Given** 使用者取得一個有效的 Portal 深層網址，**When** 在新分頁開啟或重新整理，**Then** 顯示該網址對應的頁面與有效狀態。
2. **Given** 使用者開啟不存在或無效的 Portal 路徑，**When** 頁面完成載入，**Then** 顯示既有的 Not Found 體驗。

### Edge Cases

- 目的頁資料載入較慢時，Portal 共用導覽仍可見，目的頁呈現其既有載入狀態。
- 目的頁資料載入失敗時，顯示該頁既有錯誤與重試方式，不以整頁空白取代。
- 外部 Gitea、OAuth 登入及登出流程仍可完成其必要的完整頁面導向。
- URL 含不適用或無效的工作檢視參數時，套用既有的清理與回退規則。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 已登入使用者 MUST 能在所有 Portal 站內頁面間切換，而不因站內導航重新載入整份文件。
- **FR-002**: 站內導航 MUST 保持共用導覽可用，且不得在切換期間呈現整頁空白或白色閃屏。
- **FR-003**: 導航 MUST 更新瀏覽器網址，使網址持續代表目前的 Portal 頁面及其有效狀態。
- **FR-004**: 導航 MUST 保留 Feature 030 與 031 定義的工作檢視 query 參數範圍、篩選序列化、Issue 返回網址與瀏覽器歷史還原行為。
- **FR-005**: Portal MUST 在目前 repo 可重現的本機 Web 環境支援直接開啟及重新整理有效深層網址，並呈現網址所指定的頁面。
- **FR-006**: Portal MUST 對無效路徑顯示 Not Found 體驗；頁面資料載入或讀取失敗時 MUST 顯示對應的載入或錯誤狀態。
- **FR-007**: 外部 Gitea 與 OAuth 導航 MUST 維持其必要的站外導向及驗證行為。
- **FR-008**: 本功能 MUST NOT 改變 Issue、Comment、Label、Assignee、Milestone 或狀態的資料來源、權限檢查及持久化行為。

### Key Entities *(include if data involved)*

- **Portal 導航目的地**：目前頁面的路徑及其查詢狀態，用以還原工作區、檢視、Issue 與篩選脈絡。
- **瀏覽器歷史項目**：使用者在 Portal 內切換或更新狀態所形成的可返回目的地序列。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 覆蓋的 Portal 站內導航情境中，100% 不觸發整份文件重新載入。
- **SC-002**: 重複切換主要頁面時，0 次出現整頁空白或白色閃屏。
- **SC-003**: 100% 的既有工作檢視 URL 狀態情境，在切換、返回及瀏覽器上一頁／下一頁後維持正確。
- **SC-004**: 目前本機 Web 環境中，有效深層網址的直接開啟與重新整理情境 100% 呈現指定頁面；無效路徑呈現 Not Found 體驗。

## Assumptions

- 目標使用者為已登入 Portal 的工程師；登入、登出及 OAuth callback 不屬於一般站內頁面切換。
- Issue 及工作檢視資料仍使用既有 API 與頁面載入、錯誤及空狀態，不新增資料持久化或 Issue mirror。
- 工作檢視 URL 規則以 Feature 030 與 031 為準，不重新定義篩選或返回語意。
- 頁面切換不改變現有 API、Gitea 權限或資料持久化行為。
- 本功能的直接開啟與重新整理驗收限於目前 repo 可重現的本機 Web 環境；production host 的 SPA fallback 是部署需求，待該環境納入 repository 管理時另行驗證或設定。
