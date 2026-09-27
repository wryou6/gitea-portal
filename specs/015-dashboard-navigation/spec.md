# Feature Specification: Dashboard 與共通工作介面

**Feature Branch**: `015-dashboard-navigation`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: 新增 dashboard，預設顯示所有工作區，移除左上角 Gitea Issue Portal 的超連結，修改名稱為 Gitea Portal，並放上 gitea 的 icon，右邊放 Dashboard 和其超連結，拿掉 kanban, gantt chart 的 back to repository issues 功能，統一設計三個頁面的共通介面

## Clarifications

### Session 2026-09-28

- Q: Dashboard 預設要呈現什麼？「列出工作區」讓使用者選擇，或「彙總所有工作區的 Issues」直接顯示跨工作區內容？ → A: 列出所有工作區供選擇；進入後再看該工作區的 Issues、Kanban 或 Gantt Chart。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 從 Dashboard 瀏覽所有工作區 (Priority: P1)

工程師開啟 Dashboard 後，預設可以瀏覽自己目前可用的所有工作區，並從 Dashboard 前往所選工作區。Dashboard 也能作為 Kanban 與 Gantt Chart 的共通導覽起點。

**Why this priority**: Dashboard 是跨工作區的預設入口，讓使用者一進入 Portal 就能找到可用的工作脈絡。

**Independent Test**: 使用具備多個 Repository 工作區與跨庫看板的帳號開啟 Dashboard，確認預設範圍包含所有可用工作區，並可開啟其中一個工作區。

**Acceptance Scenarios**:

1. **Given** 使用者已登入且有一個或多個可用工作區，**When** 使用者開啟 Dashboard，**Then** 預設顯示所有可用工作區，且不預先套用單一工作區篩選。
2. **Given** Dashboard 顯示多個工作區，**When** 使用者選擇其中一個工作區，**Then** Portal 開啟該工作區且保留原有 Repository 或跨庫看板脈絡。
3. **Given** 使用者沒有任何可用工作區，**When** 使用者開啟 Dashboard，**Then** Portal 顯示可理解的空狀態及可繼續使用的導覽入口。
4. **Given** 工作區清單載入失敗，**When** 使用者開啟 Dashboard，**Then** Portal 顯示錯誤狀態及重試或返回入口，不將不完整結果呈現為完整清單。

### User Story 2 - 使用品牌與 Dashboard 導覽 (Priority: P1)

工程師可從頁面左上方辨識產品為 Gitea Portal，並從品牌右側的 Dashboard 連結返回 Dashboard。品牌本身僅作識別，不會導向其他頁面。

**Why this priority**: 清楚的品牌識別和穩定的 Dashboard 入口可讓使用者從任何主要頁面回到跨工作區入口。

**Independent Test**: 在 Dashboard、Kanban 與 Gantt Chart 檢查頁首，確認品牌顯示 Gitea 圖示與「Gitea Portal」、品牌沒有超連結，且 Dashboard 文字可導向 Dashboard。

**Acceptance Scenarios**:

1. **Given** 使用者位於主要頁面，**When** 頁首載入，**Then** 左上方顯示 Gitea 圖示及「Gitea Portal」，且品牌不是超連結。
2. **Given** 使用者位於任一主要頁面，**When** 使用者啟動品牌右側的 Dashboard 連結，**Then** Portal 開啟 Dashboard。
3. **Given** 使用者以鍵盤瀏覽頁首，**When** 焦點移至 Dashboard，**Then** 可辨識連結名稱與目前頁面狀態，並可用鍵盤啟動。

### User Story 3 - 在 Dashboard、Kanban 與 Gantt Chart 使用一致介面 (Priority: P1)

工程師在 Dashboard、Kanban 與 Gantt Chart 之間切換時，能使用一致的頁首、工作區脈絡、導覽層級與主要內容版面；Kanban 和 Gantt Chart 不再提供「回到 Repository Issues」操作。

**Why this priority**: 統一三個主要工作頁面的共通介面，降低切換工作視圖時的認知落差，並使使用者透過全站導覽管理頁面移動。

**Independent Test**: 依序開啟 Dashboard、Repository 或跨庫看板的 Kanban 與 Gantt Chart，確認共通介面元素一致，並確認 Kanban/Gantt 不顯示回到 Repository Issues 的連結或按鈕。

**Acceptance Scenarios**:

1. **Given** 使用者瀏覽 Dashboard、Kanban 或 Gantt Chart，**When** 各頁面完成載入，**Then** 三頁使用相同的品牌頁首、Dashboard 入口、工作區脈絡呈現與主要頁面框架。
2. **Given** 使用者正在 Repository 工作區的 Kanban 或 Gantt Chart，**When** 使用者檢視頁面操作，**Then** Portal 不提供「回到 Repository Issues」功能。
3. **Given** 使用者正在跨庫看板的 Kanban 或 Gantt Chart，**When** 使用者檢視頁面操作，**Then** Portal 保留其工作區脈絡與既有全站導覽能力。
4. **Given** 使用者切換 Dashboard、Kanban 與 Gantt Chart，**When** 頁面更新，**Then** 不會因共通介面變更而建立 Issue/Board 資料副本或修改 Gitea 資料。

### Edge Cases

- 使用者可用工作區為空時，Dashboard 仍提供清楚的空狀態，不顯示錯誤的單一預設工作區。
- 工作區載入失敗時，不得把部分載入的結果當成完整的「所有工作區」清單。
- 窄視窗或較長的工作區名稱不得遮住品牌或 Dashboard 連結；頁首主要入口仍可操作。
- 使用者從 Issue 詳情或建立頁面回到 Dashboard 時，Dashboard 仍以所有可用工作區作為預設範圍。
- Repository 工作區與跨庫看板必須能從共通介面辨識其目前脈絡，避免切換頁面後誤以為資料範圍已改變。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Portal MUST 提供 Dashboard 作為可由主要頁面進入的工作區總覽頁面。
- **FR-002**: Dashboard MUST 預設呈現使用者目前可存取的所有工作區，並明確呈現目前採用的工作區範圍。
- **FR-003**: Dashboard MUST 讓使用者從工作區項目進入對應的 Repository 工作區或跨庫看板，並保留其工作區識別與既有導覽語意。
- **FR-004**: Dashboard MUST 在沒有可用工作區、清單載入失敗及清單載入中的情況提供相應的可辨識介面狀態。
- **FR-005**: 主要頁面左上方 MUST 顯示 Gitea 圖示及產品名稱「Gitea Portal」；品牌區 MUST 不可點擊且不得作為超連結。
- **FR-006**: 品牌右側 MUST 顯示可操作的 Dashboard 連結，並在 Dashboard 頁面標示目前所在頁面。
- **FR-007**: Dashboard、Kanban 與 Gantt Chart MUST 使用一致的共通介面，包括品牌頁首、Dashboard 入口、目前工作區脈絡與主要內容框架。
- **FR-008**: Repository 或跨庫看板的 Kanban 與 Gantt Chart MUST NOT 顯示返回 Repository Issues 的專用連結或按鈕。
- **FR-009**: 共通介面 MUST 保留現有 Repository 工作區、跨庫看板、Kanban 與 Gantt Chart 的導覽與資料範圍語意。
- **FR-010**: 新增 Dashboard 與共通介面 MUST NOT 改變 Gitea Issues、Labels、狀態、排程或 Board 設定，也 MUST NOT 建立 Issue 資料副本。
- **FR-011**: 品牌、Dashboard 連結、工作區入口與共通導覽 MUST 能以鍵盤操作及輔助科技辨識，並在窄視窗保持可用。

### Key Entities *(include if feature involves data)*

- **Dashboard**：顯示目前使用者可存取之工作區的主要入口；預設範圍包含所有可用工作區。
- **工作區項目**：Dashboard 中可供進入的 Repository 工作區或跨庫看板，保留其既有識別、名稱與資料範圍。
- **共通頁面框架**：Dashboard、Kanban 與 Gantt Chart 共用的品牌、導覽、工作區脈絡和主要內容呈現區域。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可從 Dashboard 看見 100% 目前可存取的工作區；預設進入時不會排除任何一個可用工作區。
- **SC-002**: 使用者可從 Dashboard 一次操作進入任一顯示的工作區，且進入後的工作區種類與資料範圍正確。
- **SC-003**: Dashboard、Kanban 與 Gantt Chart 的品牌、Dashboard 入口與共通頁面框架在三頁一致；所有 Kanban/Gantt 頁面均沒有返回 Repository Issues 的專用操作。
- **SC-004**: 在空清單、載入中、載入失敗與窄視窗情境中，使用者都能辨識 Dashboard 狀態並繼續使用可用的主要導覽。
- **SC-005**: 導覽 Dashboard 或切換三個主要頁面不會造成任何 Gitea Issue 或 Board 設定資料變更。

## Assumptions

- 「所有工作區」是指目前登入使用者可存取的 Repository 工作區及跨庫看板；工作區可見性與權限仍依既有 Portal/Gitea 規則。
- Dashboard 預設列出所有可用工作區供使用者選擇；各工作區中的 Issues、Kanban 或 Gantt 資料仍由使用者進入該工作區後查看，不在 Dashboard 彙總顯示。
- 三個頁面指 Dashboard、Kanban 與 Gantt Chart；現有 Issues 和設定頁面不要求重新設計其完整頁面內容，但可共享品牌頁首與全站導覽。
- Gitea 圖示使用代表 Gitea 的產品標誌，品牌文字顯示固定名稱「Gitea Portal」；圖示的尺寸與呈現樣式由介面設計決定。
- 「移除 Back to Repository Issues」僅移除 Kanban/Gantt 的專用返回操作；既有 Dashboard 與全站導覽仍可用來離開目前頁面。
- 本功能不改變工作區定義、Gitea 權限、Board JSON 設定保存方式或 Issue 資料來源。
