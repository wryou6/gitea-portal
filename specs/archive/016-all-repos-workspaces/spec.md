# Feature Specification: Repository 與 All repos 工作區

**Feature Branch**: `016-all-repos-workspaces`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: 移除 cross-repo boards 的設計。工作區改為各 Repository 和一個 All repos 版面；暫時不再使用 Board 這個產品用字。All repos 和單一 Repository 都提供 Issues、Kanban、Gantt。移除 Board 功能、設定及舊 Board URL 相容；清除既有 Board 設定資料。

## Clarifications

### Session 2026-09-28

- Q: 登入後應預設開啟 All repos，還是先顯示工作區目錄讓使用者選擇？ → A: 登入後直接開啟 All repos 的 Gantt。
- Q: 從 All repos 建立 Issue 時，是否應要求使用者明確選定目標 Repository 才能送出？ → A: Repository 初始不選，使用者選定後才能送出。
- Q: 如果有一個可讀 Repository 暫時讀取失敗，All repos 應如何呈現其他 Repository 的資料？ → A: 整個檢視顯示錯誤與重試入口，不呈現部分聚合資料。
- Q: 舊 Board URL 如何處理？ → A: 不保留 URL 相容性，未註冊的舊路徑顯示一般未找到頁面。

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 在 All repos 檢視工作 (Priority: P1)

工程師可在 All repos 工作區查看所有可讀 Repository 的 Issues、Kanban 與 Gantt，並能分辨每筆 Issue 所屬 Repository。

**Why this priority**: 這是取代跨庫 Board 的共同工作視角，讓工程師不需先建立或選擇集合設定即可查看跨 Repository 工作。

**Independent Test**: 選擇 All repos，逐一查看 Issues、Kanban 與 Gantt，確認資料涵蓋全部可讀 Repository，且每筆 Issue 都能辨識所屬 Repository。

**Acceptance Scenarios**:

1. **Given** 使用者可讀取多個 Repository，**When** 使用者選擇 All repos，**Then** Issues、Kanban 與 Gantt 都呈現這些 Repository 的工作。
2. **Given** 不同 Repository 有相同 Issue number，**When** 使用者檢視 All repos 的結果，**Then** 每筆 Issue 都能由 Repository 與 Issue number 區分。
3. **Given** 使用者在 All repos 的 Kanban 或 Gantt 開啟 Issue 詳情，**When** 使用者返回，**Then** Portal 返回原工作區、檢視與篩選位置。
4. **Given** 使用者登入，**When** Portal 開啟工作介面，**Then** 預設顯示 All repos 的 Gantt。
5. **Given** 使用者由 All repos 建立 Issue，**When** 建立表單開啟，**Then** Repository 尚未選定，且使用者選擇目標 Repository 後才能送出。
6. **Given** 任一必要 Repository 或 Issue 頁面讀取失敗，**When** 使用者查看 All repos 的檢視，**Then** Portal 不呈現部分聚合資料，並顯示錯誤與重試入口。
7. **Given** 使用者造訪舊 Board URL，**When** Portal 處理該路徑，**Then** 顯示一般未找到頁面，不載入 Board 資料或提供相容導向。
8. **Given** Portal 升級時存在舊 Board 設定，**When** 新版本啟動，**Then** Board 設定及其 lock/temp 檔案已移除，且 Portal 不再提供 Board API 或設定。

---

### User Story 2 - 在 Repository 工作區處理工作 (Priority: P1)

工程師可選擇一個可讀 Repository，並在其 Issues、Kanban 與 Gantt 檢視中處理該 Repository 的工作。

**Why this priority**: 工程師需能直接處理單一 Repository，而不被 All repos 聚合內容干擾。

**Independent Test**: 選擇一個 Repository，開啟三種檢視，確認每種檢視都只包含該 Repository 的 Issues，且切換及返回時保留 Repository 脈絡。

**Acceptance Scenarios**:

1. **Given** 使用者可讀取多個 Repository，**When** 使用者選擇其中一個 Repository，**Then** 工作區清楚顯示其名稱及 Issues、Kanban、Gantt 入口。
2. **Given** 使用者位於 Repository 工作區，**When** 使用者切換檢視或重新載入分享網址，**Then** 顯示同一 Repository 與指定檢視。
3. **Given** Repository 尚無可顯示的 Issues，**When** 使用者開啟任一檢視，**Then** Portal 顯示該檢視的空狀態及可用操作。

---

### User Story 3 - 使用精簡且一致的工作區介面 (Priority: P1)

工程師能在頁首工作區選擇器切換 All repos 與 Repository，並在各檢視中辨識目前工作區及目前檢視。介面在桌面、窄螢幕、鍵盤操作及淺色／深色主題下均可使用。

**Why this priority**: 移除跨庫 Board 後，工作區本身必須成為唯一範圍選擇方式，且使用者需持續知道目前查看的 Repository 範圍。

**Independent Test**: 以滑鼠及鍵盤切換 All repos 與 Repository，檢查 Issues、Kanban、Gantt、載入／空／錯誤狀態及窄螢幕版面；在 Storybook 檢視代表性的工作區選擇器與聚合檢視狀態。

**Acceptance Scenarios**:

1. **Given** 使用者位於任一工作檢視，**When** 使用者開啟工作區選擇器，**Then** 可選 All repos 或一個可讀 Repository，並能辨認目前選取範圍。
2. **Given** 使用者只使用鍵盤或窄螢幕，**When** 使用者切換工作區與檢視，**Then** 控制項具可見焦點、可存取名稱且主要內容不被遮蔽。
3. **Given** 使用者檢視任一工作區，**When** 使用者瀏覽頁面文字與導覽，**Then** 不會出現 Board 產品名稱、Board 管理入口或 Board 專屬頁面。

### Edge Cases

- 使用者無可讀 Repository 時，All repos 顯示可理解的空狀態；Repository 選擇器不列出無權限的 Repository。
- All repos 的任一必要 Repository 或其 Issue 頁面讀取失敗時，Portal 顯示錯誤與重試入口，不呈現部分聚合結果。
- 已儲存的 Board URL 不提供相容導向；造訪時顯示一般未找到頁面。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Portal MUST 提供 All repos 與每個使用者可讀 Repository 作為唯一工作區範圍。
- **FR-002**: All repos 與每個 Repository MUST 提供 Issues、Kanban 與 Gantt 檢視；聚合結果 MUST 標示每筆 Issue 所屬 Repository。
- **FR-003**: 工作區選擇與檢視導覽 MUST 保留目前範圍；Issue 詳情返回 MUST 還原來源檢視及其篩選位置。
- **FR-004**: Kanban MUST 使用 Portal 目前統一的固定 Workflow，並遵守 Gitea Issue 權限及狀態更新規則。
- **FR-005**: All repos 的結果 MUST 只包含目前使用者可讀取 Repository 的 Gitea 資料，不得建立 Issue mirror 或以 Portal 身份擴大權限。
- **FR-006**: Portal MUST 移除 Board 建立、編輯、清單、設定、API、持久化及使用者可見 Board 用字；既有 Board URL 不提供相容性。
- **FR-007**: Portal MUST 移除既有 Board 設定資料及其 runtime lock/temp 檔案，並停止要求或讀取 Board store 設定。
- **FR-008**: 工作區、Issues、Kanban、Gantt 及其載入、空、錯誤與互動狀態 MUST 依 `$ui-styling`、`$ui-ux-pro-max` 設計；代表性元件及頁面狀態 MUST 可在 Storybook 檢視。
- **FR-009**: All repos 與 Repository 檢視 MUST 在窄螢幕、鍵盤操作、輔助科技及淺色／深色主題下維持可理解及可操作。
- **FR-010**: 系統 MUST 提供清楚的載入、空狀態與錯誤呈現；使用者不得把不完整資料誤認為完整結果。
- **FR-011**: 使用者登入後 MUST 預設進入 All repos 的 Gantt 檢視。
- **FR-012**: 從 All repos 建立 Issue 時，Repository MUST 初始不選；使用者明確選定可寫入的目標 Repository 後才能送出。
- **FR-013**: All repos 的任一必要 Repository 或 Issue 頁面讀取失敗時，系統 MUST 拒絕呈現部分結果，並提供錯誤訊息及重試入口。

### Key Entities

- **工作區**：All repos 聚合範圍或單一 Repository 範圍；包含目前選取的檢視。
- **Repository**：Gitea Repository；工作區清單只包含目前使用者可讀取的 Repository。
- **Issue**：Gitea 管理的工作項目；跨庫結果以所屬 Repository 與 Issue number 識別。
- **檢視**：Issues、Kanban 或 Gantt；呈現目前選定工作區範圍內的 Gitea Issue 資料。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 使用者可從工作區選擇器在 All repos 與任一可讀 Repository 間切換，並在三種檢視中確認目前範圍。
- **SC-002**: All repos 的 Issues、Kanban、Gantt 涵蓋所有可讀 Repository，且 100% 的跨庫 Issue 顯示可辨識的 Repository 身分。
- **SC-003**: 使用者可從任一檢視開啟 Issue 詳情並返回原工作區及檢視，不遺失來源篩選位置。
- **SC-004**: 產品介面與可到達導覽中 Board 名稱及管理入口為零；舊 Board URL 不會載入 Board 頁面或資料。
- **SC-005**: Storybook 能呈現工作區選擇器與主要檢視的載入、空、錯誤及代表性內容狀態，並可檢查窄螢幕和主題差異。

## Assumptions

- 所有 Repository 共用目前固定的 Workflow，因此 All repos Kanban 可使用同一組狀態語意。
- All repos 是即時聚合目前使用者可讀取的 Repository，不保存自己的 Repository 清單或 Issue 副本。
- 從 All repos 建立 Issue 時，使用者須明確選擇目標 Repository。
- Gitea 仍是 Issue、Label、Assignee、Milestone、排程日期與狀態的唯一來源。
- 依使用者明確指示，既有 Board 設定資料會清除，且不支援舊 Board URL。
- UI 以繁體中文為主要文件與介面語言，並維持既有多語支援。
