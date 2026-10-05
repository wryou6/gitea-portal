# Feature Specification: Kanban 欄位獨立捲動

**Feature Branch**: `[036-kanban-independent-scroll]`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: 「現在 kanban view 的三個 status 會隨著滑鼠滾動全部一起被滾動，但希望是三個 status 各別分開的捲動，然後改成這樣設計之後，就需要變成全頻不捲動」；確認範圍：頁面不垂直捲動、保留必要的水平欄位瀏覽，Anomaly 欄一併獨立捲動。

## Clarifications

### Session 2026-10-06

- Q: 窄螢幕下是否同意把四組篩選器收進預設收合的區域，讓 Kanban 欄位取得足夠高度？ → A: 窄螢幕預設收合篩選器，使用者可展開操作；桌面維持篩選器顯示。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 分別瀏覽各狀態欄 (Priority: P1)

工程師在 All repos 或單一 Repository 的 Kanban 中，可以捲動某一個狀態欄的卡片，而其他欄位的位置不變，方便並排比較不同狀態的工作。

**Why this priority**: 卡片數量超過視窗高度時，共用捲動會讓欄位失去並排比較的價值。

**Independent Test**: 開啟含有多張卡片的 Kanban，分別捲動 Todo、In Progress、Done 欄，確認只有受操作欄位的卡片清單移動。

**Acceptance Scenarios**:

1. **Given** 多個狀態欄各有超出可視高度的卡片，**When** 工程師捲動其中一欄，**Then** 只有該欄的卡片清單移動，其他欄位保持原位。
2. **Given** 狀態欄卡片清單已捲動，**When** 工程師檢視該欄，**Then** 欄位標題與卡片數仍可見。
3. **Given** Kanban 顯示 Anomaly 欄，**When** 工程師捲動其卡片，**Then** 該欄也只移動自己的卡片清單。

### User Story 2 - 在固定視窗內操作 Kanban (Priority: P1)

工程師可在目前視窗高度內操作 Kanban，不需垂直捲動整個頁面；視窗較窄而欄位無法並排時，仍可水平瀏覽欄位。

**Why this priority**: 頁面整體移動會抵銷欄位獨立捲動帶來的並排比較效益。

**Independent Test**: 在桌面與窄視窗開啟 Kanban，確認頁面本身沒有垂直捲動，欄位內容仍能操作，必要時可水平瀏覽欄位。

**Acceptance Scenarios**:

1. **Given** 桌面視窗顯示 Kanban，**When** 欄位卡片超出可視高度，**Then** 頁面維持固定於視窗高度，卡片清單在各欄內捲動。
2. **Given** 窄視窗以狀態選擇器顯示單一欄位，**When** 該欄卡片超出可視高度，**Then** 頁面不垂直捲動且所選欄位可獨立垂直捲動。
3. **Given** 可用寬度不足以同時顯示全部欄位，**When** 工程師瀏覽 Kanban，**Then** 可水平移動欄位檢視而不引起頁面垂直移動。
4. **Given** 窄螢幕顯示 Kanban，**When** 頁面載入，**Then** 篩選器預設收合以保留看板高度，工程師可展開篩選器並操作所有既有條件。

### Edge Cases

- 空欄仍顯示標題與空狀態，且不產生不必要的頁面捲動。
- 卡片少於欄位可視高度時，欄位不顯示多餘的內部垂直捲動需求。
- 卡片內容再長也不得被欄位邊界裁切；欄位標題與卡片數需持續可見。
- 窄螢幕篩選器預設收合時，使用者仍可透過明確的展開控制存取所有篩選條件；套用條件不因收合或展開而清除。
- 鍵盤使用者可聚焦卡片清單並捲動；焦點指示清楚可見。
- 欄位捲動不得改變現有狀態轉移、拖放目標或卡片資料。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Kanban MUST 讓每個狀態欄的卡片清單可獨立垂直捲動，不連動其他欄位。
- **FR-002**: Kanban MUST 在目前視窗高度內呈現，頁面本身不得因卡片數量而產生垂直捲動。
- **FR-003**: 欄位標題與卡片數 MUST 在捲動卡片清單時保持可見。
- **FR-004**: 若有 Anomaly 欄，其卡片清單 MUST 使用與狀態欄相同的獨立捲動行為。
- **FR-005**: 窄視窗沿用單一狀態欄選擇方式；所選欄位的卡片清單 MUST 可在頁面固定高度內獨立垂直捲動。
- **FR-006**: 欄位超出可用寬度時，使用者 MUST 能水平瀏覽欄位，且此操作不得使整頁垂直捲動。
- **FR-007**: 卡片清單 MUST 可用鍵盤聚焦與捲動，並提供能辨識所屬狀態欄的無障礙名稱及可見焦點。
- **FR-008**: 欄位捲動 MUST 不改變 Issue 狀態、資料來源、權限或既有拖放狀態轉移行為。
- **FR-009**: 窄螢幕 Kanban MUST 預設收合四組共用篩選器，並提供可辨識且可鍵盤操作的展開/收合控制；展開或收合 MUST 保留目前篩選條件。桌面版 MUST 維持篩選器顯示。

### Key Entities *(include if data involved)*

- **Kanban 欄位**：代表固定 Issue Status 或 Anomaly 分組，包含欄位名稱、卡片數與卡片清單。
- **Kanban 卡片**：代表 Gitea Issue；本功能只改變其瀏覽方式，不新增或改變 Issue 資料。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 對任一欄位進行垂直捲動時，其他欄位卡片位置不變。
- **SC-002**: 桌面與窄視窗下，Kanban 頁面因卡片數量增加皆不產生整頁垂直捲動。
- **SC-003**: 桌面與窄視窗下，所有狀態欄及可見的 Anomaly 欄都能瀏覽其完整卡片清單。
- **SC-004**: 鍵盤使用者能聚焦及捲動欄位卡片清單，並辨認目前欄位。
- **SC-005**: 使用者可在 All repos 與 Repository Kanban 完成既有拖放狀態轉移，且捲動本身不新增 Issue 資料寫入。
- **SC-006**: 窄螢幕初次開啟 Kanban 時篩選器為收合狀態，看板卡片區取得可供瀏覽的剩餘高度；展開篩選器後仍能操作並保留原條件。

## Assumptions

- 「全頻不捲動」指 Kanban 頁面固定於視窗高度且不垂直捲動；欄位內垂直捲動及必要的水平欄位瀏覽保留。
- Anomaly 欄如有呈現，與正式狀態欄採相同獨立捲動行為。
- 窄視窗維持現有單欄選擇器，不改成所有狀態欄縱向堆疊。
- 窄視窗的四組共用篩選器初始收合，透過有標籤的控制展開；桌面篩選器保持顯示。
- 功能只調整 Kanban 呈現，不改 List、Gantt、URL、API、Gitea 權限或 Issue 持久化行為。
