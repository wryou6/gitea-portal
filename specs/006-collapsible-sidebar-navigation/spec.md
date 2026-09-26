# Feature Specification: 可收合側邊導覽

**Feature Branch**: `006-collapsible-sidebar-navigation`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: 頂部的導覽留著，拿掉 issues 和 boards；新增左側導覽，放 issues、kanban、gantt chart、board settings，並且可以開闔，合起來會只剩 icon，打開時會有 icon + text。

## Clarifications

### Session 2026-09-26

- Q: 使用者收合側欄後，應保留這個選擇多久？ → A: 只保留目前瀏覽器工作階段；新工作階段預設展開。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 從側欄前往工作頁面 (Priority: P1)

工程師可以從全站左側導覽前往 Issues、Kanban、Gantt Chart 與 Board Settings。Board 檢視維持目前 Board 的脈絡；還沒有選定 Board 時，使用者可以先從 Board 清單選擇。

**Why this priority**: 導覽是各工作頁面的共同入口；使用者需要能從目前頁面直接切換到日常工作區，而不必依賴頂部的 Issues 與 Boards 連結。

**Independent Test**: 由 Issue 清單、Issue 新增/詳情、Board Kanban 與 Gantt 頁面逐一操作側欄，確認四個入口都能到達預期頁面，Board 檢視切換時仍是同一個 Board。

**Acceptance Scenarios**:

1. **Given** 使用者位於任一主要頁面，**When** Portal 顯示頁面，**Then** 頂部導覽列與品牌入口仍在，頂部不再顯示 Issues 或 Boards 項目，左側顯示四個指定入口。
2. **Given** 使用者位於任一 Issue 頁面，**When** 使用者選擇 Issues，**Then** Portal 開啟 Issue 清單並標示 Issues 為目前頁面。
3. **Given** 使用者正在檢視某個 Board 的 Kanban，**When** 使用者選擇 Gantt Chart，**Then** Portal 顯示同一個 Board 的甘特圖；從甘特圖選擇 Kanban 時亦同。
4. **Given** 使用者尚未進入任何 Board，**When** 使用者選擇 Kanban 或 Gantt Chart，**Then** Portal 提供 Board 清單供使用者選擇，並開啟所選 Board 的對應檢視。
5. **Given** 尚未建立任何 Board，**When** 使用者選擇 Kanban 或 Gantt Chart，**Then** Portal 顯示空狀態並提供前往 Board Settings 建立 Board 的入口。
6. **Given** 使用者所選 Board 不存在或無法載入，**When** 使用者開啟或切換其檢視，**Then** Portal 顯示可理解的錯誤及返回 Board 清單的入口，且側欄仍可操作。
7. **Given** 使用者選擇 Board Settings，**When** Board 管理頁面開啟，**Then** 使用者仍可查看 Board 清單並使用既有建立與編輯功能。
8. **Given** 使用者只操作導覽或側欄收合控制，**When** Portal 切換頁面或側欄狀態，**Then** Gitea Issue 資料及 Board 設定均不會因此改變。
9. **Given** 使用者透過主要導覽開啟 Issue 或 Board 工作區，**When** 頁面切換，**Then** Issue 清單、新增、詳情、Kanban、Gantt Chart 與 Board Settings 使用一致且可辨識的 canonical URL；既有網址仍能開啟相同頁面。

---

### User Story 2 - 收合或展開側欄 (Priority: P1)

工程師可以收合左側導覽以增加工作內容可用空間，也可以重新展開以閱讀每個入口的文字標籤。

**Why this priority**: 使用者可以依工作內容和視窗空間調整導覽密度，同時保留快速辨識及切換入口的能力。

**Independent Test**: 展開與收合側欄，確認展開時四個項目皆有圖示和文字、收合時僅有圖示，且所有項目仍可操作。

**Acceptance Scenarios**:

1. **Given** 側欄為展開狀態，**When** 使用者啟動收合控制，**Then** 側欄只顯示各導覽項目的圖示。
2. **Given** 側欄為收合狀態，**When** 使用者啟動展開控制，**Then** 側欄顯示各導覽項目的圖示和文字。
3. **Given** 使用者切換側欄狀態或頁面，**When** 使用者繼續操作導覽，**Then** 目前頁面的標示正確，且側欄狀態不會令任何項目無法使用。
4. **Given** 使用者在目前瀏覽器工作階段中收合側欄，**When** 使用者導覽至其他頁面或重新載入頁面，**Then** 側欄仍維持收合；新的瀏覽器工作階段開始時，側欄預設展開。

---

### User Story 3 - 在窄視窗與鍵盤操作導覽 (Priority: P2)

工程師可以在較窄的視窗或不使用滑鼠時辨識和操作側欄，不會因圖示模式或側欄寬度而失去目前頁面資訊或主要內容。

**Why this priority**: 導覽會出現在不同尺寸的工作視窗；收合介面仍須可理解、可操作，且不遮擋頁面內容。

**Independent Test**: 在窄視窗以滑鼠及鍵盤操作展開、收合和四個導覽項目，確認焦點、名稱、目前頁面與主要內容都可辨識。

**Acceptance Scenarios**:

1. **Given** 側欄處於僅圖示狀態，**When** 使用者以鍵盤移至導覽項目，**Then** 使用者能辨識該項目的名稱並啟動它。
2. **Given** 視窗寬度縮小，**When** 使用者展開或收合側欄，**Then** 主要頁面內容仍可閱讀和操作，不會被側欄遮住或截斷。

### Edge Cases

- 尚未建立任何 Board 時，Kanban 或 Gantt Chart 入口應提供前往 Board Settings 建立 Board 的方式，而不是開啟空白或失效頁面。
- Board 清單載入失敗或所選 Board 已不存在時，Portal 應顯示可理解的錯誤及返回入口；導覽本身仍可使用。
- Issue 新增頁與 Issue 詳情頁都應將 Issues 標示為目前導覽區域，不得因路徑不同而沒有目前項目。
- 收合狀態中的圖示必須有可取得的項目名稱；僅以滑鼠懸停才可得知名稱不足以支援鍵盤或輔助科技操作。
- 窄視窗、鍵盤焦點或錯誤提示出現時，展開/收合控制與導覽項目不得互相遮擋或失去焦點順序。
- Board Settings 開啟或編輯 Board 時不得改變 Issue、Label、Assignee、狀態或排程資料。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Portal MUST 保留頂部導覽列及品牌入口，並從頂部導覽列移除 Issues 與 Boards 導覽項目。
- **FR-002**: Portal MUST 在 Issue 清單、新增與詳情頁，以及 Board 清單、Kanban 與甘特圖頁面提供一致的左側導覽。
- **FR-003**: 左側導覽 MUST 提供 Issues、Kanban、Gantt Chart 與 Board Settings 四個入口；展開時每個入口都 MUST 顯示圖示與文字。
- **FR-004**: Issues 入口 MUST 開啟 Issue 清單；Issue 清單、新增與詳情頁 MUST 將 Issues 標示為目前頁面。
- **FR-005**: Kanban 與 Gantt Chart MUST 開啟同一 Board 的對應檢視；從一個 Board 檢視切換至另一個檢視 MUST 保留該 Board。
- **FR-006**: 使用者沒有目前 Board 脈絡而選擇 Kanban 或 Gantt Chart 時，Portal MUST 提供 Board 選擇入口；尚無 Board 時 MUST 提供前往 Board Settings 建立 Board 的入口。
- **FR-007**: Board Settings MUST 開啟 Board 管理入口，並保留檢視 Board 清單、建立 Board 與編輯 Board 的既有能力。
- **FR-008**: Portal MUST 提供明確的展開/收合控制。展開時 MUST 顯示圖示與文字；收合時 MUST 僅顯示圖示。
- **FR-009**: 收合狀態 MUST 保留每個項目的可存取名稱，且展開/收合控制及導覽項目 MUST 可由鍵盤操作並呈現可見焦點。
- **FR-010**: Portal MUST 清楚標示目前導覽項目；收合或展開不得改變導覽目標或目前 Board。
- **FR-011**: 側欄在窄視窗 MUST 不得遮擋主要頁面內容或讓必要導覽操作無法完成。
- **FR-012**: 導覽切換與側欄收合/展開 MUST NOT 改變 Gitea Issue 資料或新增 Issue/Board 資料副本；Board 設定的保存方式及 Gitea 權限行為維持既有規則。
- **FR-013**: Board 不存在、尚未建立或無法載入時，Portal MUST 提供可理解的空狀態或錯誤，以及可繼續使用的導覽入口。
- **FR-014**: 側欄收合/展開狀態 MUST 在目前瀏覽器工作階段的頁面導覽與重新載入後維持；新的瀏覽器工作階段 MUST 預設展開。
- **FR-015**: Portal MUST 使用 `/issues`、`/issues/new`、`/issues/{owner}/{repo}/{number}`、`/kanban`、`/gantt`、`/boards` 與 `/boards/{boardId}/{kanban|gantt}` 作為 canonical UI routes；根路徑、既有單數 `/issue/...` 與 `/boards?view=...` 網址 MUST 保持可用並開啟對應頁面。

### Key Entities *(include if data involved)*

- **導覽項目**：使用者可開啟的 Issues、Kanban、Gantt Chart 或 Board Settings 頁面入口，包含可辨識名稱、圖示和目前頁面狀態。
- **Board 脈絡**：Kanban、甘特圖與 Board Settings 所屬的 Board；切換檢視時須保持一致，尚未選定時由使用者從 Board 清單選擇。
- **側欄顯示狀態**：側欄展開或僅顯示圖示的呈現狀態，不包含 Issue 或 Board 業務資料。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 所有主要 Issue 與 Board 頁面均可由同一左側導覽到達四個指定入口；每個入口在展開狀態都有圖示及文字。
- **SC-002**: 使用者每次切換收合狀態時，側欄都正確呈現指定模式：展開為圖示加文字、收合為僅圖示；四個入口在兩種模式下均可操作，且收合選擇在目前工作階段的導覽與重新載入後維持、新工作階段則預設展開。
- **SC-003**: 100% 的 Board 檢視切換保留使用者當前選定的 Board；沒有 Board 脈絡時，使用者能從導覽抵達 Board 選擇或建立入口。
- **SC-004**: 所有 Issue 清單、新增與詳情頁均將 Issues 標示為目前導覽項目；所有 Board 管理與檢視頁均標示對應 Board 導覽項目。
- **SC-005**: 在窄視窗與鍵盤操作情境中，四個導覽入口及其名稱均可取得，且主要頁面內容沒有被側欄遮擋。
- **SC-006**: 透過導覽或收合/展開控制完成的操作不會修改 Gitea Issue 資料或繞過使用者既有 Gitea 權限。
- **SC-007**: 所有主要導覽與頁面內連結都使用 canonical UI routes；既有根路徑、單數 Issue 路徑及 Board view query 路徑仍可載入原本對應頁面。

## Assumptions

- 頂部保留品牌與其他既有非 Issues/Boards 內容；本次只將 Issues 與 Boards 這兩個主要入口移至側欄或以側欄入口取代。
- Board Settings 指現有的 Board 管理頁面，涵蓋 Board 清單、建立及編輯；它也是沒有目前 Board 時選擇 Board 的入口。
- Kanban 與 Gantt Chart 是目前 Board 的檢視入口。使用者未選定 Board 時，先由 Board 管理/選擇頁面挑選，再進入對應檢視。
- 側欄預設展開；使用者在目前瀏覽器工作階段中的頁面導覽與重新載入期間維持其選擇，新的瀏覽器工作階段預設展開。
- `/boards` 是 Board 管理入口；沒有 Board 脈絡時，`/kanban` 與 `/gantt` 顯示 Board 選擇頁，選取後進入該 Board 的對應檢視。
- 舊網址作為相容入口保留；新的導覽與頁面內連結使用 canonical routes。
- 收合時的圖示會提供可存取名稱；具體圖示樣式由介面設計決定。
- 本功能只改變全站導覽與版面入口，不改變 Issue、Board、Workflow、排程功能及其資料語意。
