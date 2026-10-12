# Feature Specification: 三個工作檢視的 Issue 浮窗

**Feature Branch**: `040-issue-detail-dialog`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: 在三個 view 點擊 issue 時，預設開啟漂浮視窗，右上角有可以實際切換過去的設計。

## Clarifications

### Session 2026-10-12

- Q: 浮窗右上角要提供哪種切換？ → A: 提供開啟同一 Issue 完整頁面的控制，並實際切換到完整頁面。
- Q: 浮窗要呈現哪些 Issue 功能？ → A: 顯示完整詳情，包含描述、Labels、Comments、編輯及狀態操作。
- Q: 開啟浮窗時網址及瀏覽器返回如何處理？ → A: 網址切換為 Issue URL，保留來源 view 作為返回目的地；瀏覽器返回關閉浮窗並還原原工作狀態，直接開啟 Issue URL 則顯示完整頁面。
- Q: 浮窗採用哪種版型？ → A: 使用置中大型對話框；桌面可捲動，手機接近全螢幕。
- Q: 在三個 view 中，點擊 Issue 的哪些區域應開啟浮窗？ → A: 只有目前的 Issue key／標題連結開啟浮窗。

## User Scenarios & Testing

### User Story 1 - 從工作檢視快速查看 Issue (Priority: P1)

工程師在 Issue List、Kanban 或 Gantt 瀏覽工作時，點擊 Issue 後可在不失去原工作脈絡的情況下查看完整內容，並可返回原檢視繼續工作。

**Why this priority**: 三種檢視都是日常定位 Issue 的入口；保留檢視脈絡可減少來回瀏覽與重新設定篩選的成本。

**Independent Test**: 分別從三種檢視開啟 Issue，確認置中浮窗、完整詳情、Issue URL 及返回後的工作狀態。

**Acceptance Scenarios**:

1. **Given** 使用者在 Issue List、Kanban 或 Gantt 檢視，**When** 點擊 Issue 的連結，**Then** Portal 以置中大型對話框顯示該 Issue 的完整詳情，且網址代表該 Issue。
2. **Given** Issue 浮窗已開啟，**When** 使用者關閉浮窗或使用瀏覽器返回，**Then** Portal 回到來源檢視，並還原其篩選、排序及適用的 Gantt 時間範圍。
3. **Given** Issue 浮窗已開啟，**When** 使用者檢視浮窗，**Then** 可使用既有描述、Labels、Comments、編輯及狀態操作。
4. **Given** Issue 浮窗已開啟，**When** 使用者啟動右上角的完整頁面控制，**Then** 同一 Issue 顯示為完整頁面，且仍可返回原工作檢視。

### User Story 2 - 直接進入 Issue 完整頁面 (Priority: P2)

工程師透過書籤、分享網址或重新整理 Issue URL 時，可直接查看完整 Issue 頁面，不依賴先前開啟的工作檢視。

**Why this priority**: 浮窗導覽必須與可分享、可重新載入的 Issue 網址相容。

**Independent Test**: 在新分頁直接開啟 Issue URL 並重新整理，確認完整頁面正常顯示。

**Acceptance Scenarios**:

1. **Given** 使用者直接開啟或重新整理 Issue URL，**When** 頁面載入，**Then** Portal 顯示完整 Issue 頁面，而非浮窗。

### Edge Cases

- Issue 詳情載入期間，浮窗仍提供清楚的載入狀態；載入失敗時顯示既有錯誤與重試方式。
- 在 Issue 浮窗中編輯、留言或執行狀態操作時，沿用既有權限、錯誤回饋及保存結果；浮窗不得宣稱尚未成功保存的變更已完成。
- 使用者透過鍵盤開啟浮窗時，焦點進入對話框；關閉後焦點回到原 Issue 入口。Esc、關閉控制及點擊遮罩均可關閉浮窗。
- 手機窄螢幕中，浮窗內容可垂直捲動，關閉與展開控制保持可見且可操作。
- 使用者直接開啟 Issue URL 時沒有來源檢視，完整頁面沿用既有返回目的地規則。

## Requirements

### Functional Requirements

- **FR-001**: Issue List、Kanban 與 Gantt 中目前的 Issue key／標題連結 MUST 預設以浮窗呈現完整詳情；不得攔截 Kanban 拖曳或 Gantt 排程操作區域。
- **FR-002**: 浮窗 MUST 使用置中大型對話框，並在桌面與窄螢幕中保持內容可讀、可捲動及操作控制可見。
- **FR-003**: 浮窗 MUST 提供既有完整 Issue 詳情與操作，包含描述、完整 Labels、Comments、編輯及狀態操作；其讀寫 MUST 沿用目前使用者權限及既有保存行為。
- **FR-004**: 開啟浮窗 MUST 使網址代表目前 Issue，並保留來源工作檢視及其有效狀態供返回使用。
- **FR-005**: 關閉浮窗或使用瀏覽器返回 MUST 回到來源工作檢視並還原有效狀態；浮窗右上角 MUST 提供切換至同一 Issue 完整頁面的控制。
- **FR-006**: 直接開啟或重新整理 Issue URL MUST 顯示完整頁面，不要求使用者先開啟來源工作檢視。
- **FR-007**: Issue 詳情的載入、錯誤、保存成功與保存失敗 MUST 清楚呈現，並沿用既有 Issue 詳情的回饋及重試行為。
- **FR-008**: 浮窗 MUST 支援鍵盤操作、明確的無障礙名稱及焦點進出管理；所有新增使用者可見文字 MUST 支援繁體中文、英文及日文。
- **FR-009**: 本功能 MUST NOT 新增 Issue 資料副本、改變 Gitea 作為唯一資料來源，或改變既有 API 權限及持久化行為。

### Key Entities

- **來源工作檢視**：使用者開啟 Issue 前所在的 Issue List、Kanban 或 Gantt 頁面及其有效 URL 狀態。
- **Issue 浮窗**：在來源工作檢視上呈現的 Issue 詳情介面；其顯示狀態隨目前導航而存在，不保存 Issue 副本。
- **Issue 完整頁面**：可由直接 Issue URL 開啟，亦可由浮窗切換前往的既有詳情頁。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 三種工作檢視的 Issue 開啟入口中，100% 預設顯示所選 Issue 的完整詳情浮窗。
- **SC-002**: 從任一工作檢視開啟及關閉浮窗後，100% 還原來源 URL 的有效篩選、排序及適用的 Gantt 時間狀態。
- **SC-003**: 使用者可從浮窗切換至同一 Issue 的完整頁面，且瀏覽器返回可回到來源工作檢視。
- **SC-004**: Issue URL 在直接開啟及重新整理時均顯示完整頁面，並呈現既有載入、錯誤及操作回饋。
- **SC-005**: 浮窗的主要控制可用鍵盤操作；在繁體中文、英文及日文及窄螢幕中，詳情內容與必要控制均可辨識及操作。

## Assumptions

- Issue List、Kanban 與 Gantt 是此處所稱的三個 view；只有目前可點擊的 Issue key／標題連結開啟浮窗，不擴大 row/card 或時間軸排程區的點擊範圍。
- 浮窗使用模態對話框行為；開啟時背景不可操作，Esc、遮罩及關閉控制皆可關閉。
- 既有完整 Issue 詳情、權限、載入、錯誤、編輯、留言及狀態操作是本功能的行為基準。
- 本功能只改變 Issue 詳情的呈現與導航方式，不改變 Gitea 資料或 Issue 操作語意。
