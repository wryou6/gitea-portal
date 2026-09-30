# Feature Specification: 工作檢視共用篩選

**Feature Branch**: `022-shared-work-view-filters`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: 重新設計 Issues List、Kanban、Gantt 主要內容上方區域，提供共用篩選；全域搜尋留在頂部導覽，左側檢視導覽及建立 Issue 入口維持原位。

## Clarifications

### Session 2026-09-30

- Q: Gantt 加入共用的 Todo／In Progress／Done 篩選後，原本的 Open／Closed 篩選應如何處理？ → A: 移除 Gantt 的 Open／Closed 篩選，由共用 Status 篩選取代；Todo／In Progress 對應 Open，Done 對應 Closed。
- Q: 在共用篩選區變更優先級、類型、狀態或負責人時，要立即套用篩選，還是等使用者按下「套用」？ → A: 條件變更時立即套用，並立即更新網址。
- Q: 頂部全域搜尋應搜尋目前工作區，還是始終搜尋所有可讀 Repository？ → A: 始終搜尋所有可讀 Repository，與目前工作區選擇無關。
- Q: 使用者從頂部搜尋送出關鍵字後，應在哪裡查看結果？ → A: 在頂部搜尋框下方顯示搜尋結果選單；選取結果後開啟該 Issue 詳情。

## User Scenarios & Testing

### User Story 1 - 在各工作檢視使用相同篩選 (Priority: P1)

工程師可在 List、Kanban 與 Gantt 的主要內容上方，使用一致的優先級、類型、狀態與負責人篩選，並在切換檢視時繼續查看符合相同條件的工作。

**Why this priority**: 三種檢視呈現相同工作範圍；共用條件可減少重複操作，並避免切換檢視後結果範圍突然改變。

**Independent Test**: 在任一工作區設定兩種以上共用篩選，依序切換 List、Kanban、Gantt，確認每個檢視都只呈現符合條件的 Issues，且篩選值保持一致。

**Acceptance Scenarios**:

1. **Given** 使用者位於任一工作檢視，**When** 查看主要內容上方，**Then** 可找到優先級、類型、狀態與負責人篩選。
2. **Given** 使用者設定共用篩選，**When** 切換 List、Kanban 或 Gantt，**Then** 條件保持不變，且顯示結果符合條件。
3. **Given** 使用者移除一個已套用條件，**When** 檢視結果，**Then** 只取消該條件，其餘條件仍生效。
4. **Given** 使用者變更任一篩選條件，**When** 選擇新值，**Then** 結果立即更新且網址同步反映新條件。

---

### User Story 2 - 展開進階篩選 (Priority: P2)

工程師可將低頻條件收合，以保留主要內容空間；需要時展開進階篩選，設定 Repository、Label 與 Milestone。

**Why this priority**: 常用篩選應容易取得，同時避免低頻欄位長期占據工作檢視的首屏高度。

**Independent Test**: 檢查進階條件預設為收合；展開後設定條件、切換檢視並收合，再確認條件仍生效且可移除。

**Acceptance Scenarios**:

1. **Given** 使用者開啟工作檢視，**When** 篩選區初次顯示，**Then** 進階條件為收合狀態，並顯示已套用的進階條件數量。
2. **Given** 使用者位於 All repos 工作區並展開進階篩選，**When** 編輯條件，**Then** 可設定 Repository、Label 與 Milestone。
3. **Given** 使用者位於單一 Repository 工作區並展開進階篩選，**When** 查看範圍條件，**Then** Repository 由目前工作區決定，不提供重複選擇。
4. **Given** 使用者設定進階條件後收合篩選區，**When** 查看結果或切換檢視，**Then** 條件持續生效並能辨認目前啟用的篩選。

---

### User Story 3 - 還原或分享篩選結果 (Priority: P2)

工程師可透過目前頁面網址保存並分享篩選狀態；重新載入或使用返回操作時，能還原相同工作範圍與條件。

**Why this priority**: 可還原的篩選讓使用者能直接回到指定工作集合，也讓團隊能分享一致的檢視結果。

**Independent Test**: 設定共用與進階篩選後複製網址，在新分頁開啟並使用返回/前進操作，確認工作區、檢視及有效篩選一致。

**Acceptance Scenarios**:

1. **Given** 使用者已設定篩選，**When** 複製並開啟目前網址，**Then** 相同工作區、檢視與篩選條件可還原。
2. **Given** 使用者已設定篩選，**When** 重新載入頁面或使用瀏覽器返回及前進，**Then** 顯示與網址狀態相符的篩選結果。
3. **Given** 網址包含無效或不支援的篩選值，**When** 頁面載入，**Then** 無效值不會造成頁面失效，且有效條件仍可使用。

---

### User Story 4 - 從頂部導覽搜尋所有 Issues (Priority: P1)

工程師可從 Portal 頂部導覽搜尋所有可讀 Repository 的 Issues，不受目前選取工作區或所在檢視限制，並從搜尋結果選單開啟 Issue 詳情。

**Why this priority**: 搜尋是跨頁面的入口，應在 List、Kanban、Gantt 及其他登入後頁面一致可用，並能找到目前 Repository 以外的工作。

**Independent Test**: 在單一 Repository 工作區的登入後頁面，從頂部搜尋另一個可讀 Repository 的 Issue，確認結果選單可找到該 Issue、辨認其 Repository，並開啟正確詳情。

**Acceptance Scenarios**:

1. **Given** 使用者位於任一登入後頁面，**When** 查看頂部導覽，**Then** 可使用全域 Issue 搜尋。
2. **Given** 使用者在頂部輸入關鍵字，**When** 搜尋有符合項目，**Then** 頂部搜尋框下方顯示符合的 Issue 結果選單。
3. **Given** 使用者目前選取單一 Repository，**When** 搜尋另一個可讀 Repository 的 Issue，**Then** 全域搜尋仍可找到該 Issue，並在結果中標明 Repository。
4. **Given** 使用者在結果選單選取一筆 Issue，**When** Portal 開啟詳情，**Then** 顯示所選 Issue，且返回可回到發起搜尋的頁面。
5. **Given** 搜尋沒有符合項目或讀取失敗，**When** 結果選單顯示，**Then** 空結果與搜尋錯誤有不同且可理解的提示。

### Edge Cases

- All repos 沒有符合條件的 Issue 時，檢視顯示明確的篩選後空狀態，並提供清除條件的操作。
- 篩選條件互相排除或結果為零時，不得呈現為載入失敗。
- 必要 Repository 或 Issue 讀取失敗時，沿用工作檢視的整體錯誤與重試行為，不得把部分結果當成完整篩選結果。
- 窄視窗下篩選控制與已套用條件可換行或收納，不得遮蔽主要內容或造成頁面水平溢出。
- 全域搜尋僅存在於頂部導覽列，不在工作檢視篩選區重複呈現。
- 左側 List、Kanban、Gantt 導覽與建立 Issue 入口維持現有位置及行為；頂部列不被側欄遮蓋。

## Requirements

### Functional Requirements

- **FR-001**: List、Kanban 與 Gantt MUST 在主要內容上方提供一致的共用篩選區。
- **FR-002**: 共用篩選區 MUST 預設提供優先級、類型、Portal Issue Status 與負責人條件。
- **FR-003**: 全域 Issue 搜尋 MUST 出現在頂部導覽列、與工作區選擇器同層，並在登入後所有頁面可用；輸入關鍵字時 MUST 顯示跨所有可讀 Repository 的搜尋結果選單，不受目前工作區選擇限制。
- **FR-017**: 每筆全域搜尋結果 MUST 顯示足以辨認 Issue 與 Repository 的資訊；選取結果 MUST 開啟該 Issue 詳情，且詳情返回 MUST 回到發起搜尋的頁面。
- **FR-018**: 全域搜尋 MUST 清楚區分無符合結果與讀取失敗，並提供相應狀態提示。
- **FR-019**: Issues List、Kanban 與 Gantt 的主要內容頁首 MUST 僅顯示單一主標題；All repos 工作區的標題須與目前檢視及左側導覽名稱一致，Repository 工作區可顯示 Repository 名稱。頁首不得顯示 eyebrow 小標或描述副標，主標題字級 MUST 採精簡層級，不得占用過多首屏高度。
- **FR-004**: Repository、Label 與 Milestone MUST 位於預設收合的進階篩選區；All repos 可選 Repository，單一 Repository 工作區以目前 Repository 為準。
- **FR-005**: 使用者 MUST 能辨認及個別移除已套用的篩選條件，並能清除所有條件。
- **FR-006**: 使用者 MUST 能辨認已收合進階篩選內仍生效的條件數量；收合或展開不得清除條件。
- **FR-007**: 共用條件 MUST 套用於目前工作區的 List、Kanban 與 Gantt，且切換檢視時保持一致。
- **FR-008**: 每次篩選條件變更 MUST 立即更新可分享網址；重新載入、返回、前進及直接開啟網址 MUST 還原有效的工作區、檢視與篩選條件。
- **FR-009**: 無效或不支援的網址篩選值 MUST 不得使工作檢視失效；Portal MUST 忽略無效值並保留其他有效條件。
- **FR-010**: 篩選結果 MUST 使用 Gitea 提供的 Issue 資料；篩選不得建立 Issue 副本、修改 Gitea 資料或繞過使用者權限。
- **FR-011**: Gantt MUST 移除原有 Open／Closed 篩選，改用共用 Status 篩選；Todo／In Progress 對應 Open，Done 對應 Closed。日期範圍與時間尺度控制 MUST 留在 Gantt 工具列。
- **FR-012**: 左側 List、Kanban、Gantt 導覽與左側建立 Issue 入口 MUST 維持現有位置與功能；頂部全域搜尋 MUST 與工作區選擇器同列，且頂部導覽列 MUST 位於左側導覽上方、不被遮蓋。
- **FR-013**: 篩選區 MUST 支援鍵盤操作、可見焦點及適當的輔助科技名稱；窄視窗下主要內容 MUST 不產生水平溢出。
- **FR-014**: 新增或修改的篩選標籤、狀態、提示、空狀態及無障礙名稱 MUST 支援繁體中文、英文與日文。
- **FR-015**: Storybook MUST 能展示三種檢視的共用篩選區，以及收合/展開、已套用條件、All repos/單一 Repository、窄視窗與明暗主題狀態。
- **FR-016**: 篩選條件 MUST 在使用者變更時立即生效；系統 MUST NOT 要求使用者另按「套用」才更新結果。

### Key Entities

- **共用篩選狀態**：目前工作區套用於 List、Kanban 與 Gantt 的優先級、類型、Portal Status、負責人及進階條件。
- **進階篩選條件**：Repository、Label、Milestone；Repository 選項只適用於 All repos 工作區。
- **工作檢視網址狀態**：可還原工作區、List/Kanban/Gantt 檢視及有效篩選條件的分享狀態。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 使用者能在 List、Kanban 與 Gantt 以相同四項常用條件篩選，且切換檢視後條件及符合條件的工作集合一致。
- **SC-002**: 桌面寬度至少 1024px 時，未展開進階篩選的常用條件能在一列內操作；窄螢幕可換行，且 375px 視窗無頁面水平溢出。
- **SC-003**: 使用者可透過網址重新開啟或分享篩選結果，還原工作區、檢視與所有有效條件。
- **SC-004**: 啟用篩選後，使用者能分辨有效條件、移除單一條件或一次清除全部條件；零筆結果與讀取錯誤可明確區分。
- **SC-005**: 支援語系中的篩選控制、條件摘要與空狀態均可辨認且可操作；Storybook 可檢視規定的主要狀態、窄螢幕與明暗主題。
- **SC-006**: 使用者可從任一登入後頁面搜尋其他可讀 Repository 的 Issue，辨認結果所屬 Repository，並開啟正確 Issue 詳情。

## Assumptions

- 「共用」指同一工作區內切換 List、Kanban、Gantt 時沿用篩選；切換工作區時由網址中的工作區範圍決定 Repository 條件。
- 全域搜尋是獨立的頂部導覽功能，不納入本功能的篩選狀態或篩選 chips。
- 頂部全域搜尋取代 List 篩選表單中的關鍵字輸入，始終跨所有可讀 Repository 搜尋；搜尋結果以頂部下拉選單呈現。
- Portal Status 以固定 Todo、In Progress、Done 取代原生 Open／Closed 語意；Todo／In Progress 對應 Gitea Open，Done 對應 Gitea Closed，Gitea 仍是資料來源。Gantt 日期範圍與 Scale 仍是專屬控制。
- 本功能改變工作資料的呈現範圍，不改變 Gitea Issue、Label、Assignee、Milestone 或 Status 資料。
