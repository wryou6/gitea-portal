# Feature Specification: 工作檢視共用篩選

**Feature Branch**: `022-shared-work-view-filters`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: 重新設計 Issues List、Kanban、Gantt 的桌機版面，將共用篩選及檢視設定移到圖表左側的可收合控制面板；內容上方只保留純文字的筆數及已套用條件摘要。全域搜尋留在頂部導覽，左側檢視導覽及建立 Issue 入口維持原位。

## Clarifications

### Session 2026-09-30

- Q: Gantt 加入共用的 Todo／In Progress／Done 篩選後，原本的 Open／Closed 篩選應如何處理？ → A: 移除 Gantt 的 Open／Closed 篩選，由共用 Status 篩選取代；Todo／In Progress 對應 Open，Done 對應 Closed。
- Q: 在共用篩選區變更優先級、類型、狀態或負責人時，要立即套用篩選，還是等使用者按下「套用」？ → A: 條件變更時立即套用，並立即更新網址。
- Q: 頂部全域搜尋應搜尋目前工作區，還是始終搜尋所有可讀 Repository？ → A: 始終搜尋所有可讀 Repository，與目前工作區選擇無關。
- Q: 使用者從頂部搜尋送出關鍵字後，應在哪裡查看結果？ → A: 在頂部搜尋框下方顯示搜尋結果選單；選取結果後開啟該 Issue 詳情。

### Session 2026-10-02

- 決策：暫時移除 Repository、Label、Milestone 三個進階篩選。Repository 範圍統一由頂部工作區選擇器決定；切換工作區時不沿用舊的 repository、label、milestone 查詢條件。舊網址中的這三個條件不再套用，更新篩選時會清除。

## User Scenarios & Testing

### User Story 1 - 在各工作檢視使用相同篩選 (Priority: P1)

工程師可在 List、Kanban 與 Gantt 的主要內容左側，使用一致的優先級、類型、狀態與負責人篩選，並在切換檢視時繼續查看符合相同條件的工作。

**Why this priority**: 三種檢視呈現相同工作範圍；共用條件可減少重複操作，並避免切換檢視後結果範圍突然改變。

**Independent Test**: 在任一工作區設定兩種以上共用篩選，依序切換 List、Kanban、Gantt，確認每個檢視都只呈現符合條件的 Issues，且篩選值保持一致。

**Acceptance Scenarios**:

1. **Given** 使用者位於任一工作檢視，**When** 查看主要內容左側，**Then** 可找到優先級、類型、狀態與負責人篩選，內容上方顯示目前筆數與條件摘要。
2. **Given** 使用者設定共用篩選，**When** 切換 List、Kanban 或 Gantt，**Then** 條件保持不變，且顯示結果符合條件。
3. **Given** 使用者移除一個已套用條件，**When** 檢視結果，**Then** 只取消該條件，其餘條件仍生效。
4. **Given** 使用者變更任一篩選條件，**When** 選擇新值，**Then** 結果立即更新且網址同步反映新條件。

---

### User Story 2 - 透過工作區選擇 Repository 範圍 (Priority: P2)

工程師使用頂部工作區選擇器決定目前檢視的 Repository 範圍。工作檢視暫不提供 Repository、Label、Milestone 進階篩選。

**Why this priority**: All repos 與單一 Repository 的範圍都由同一個工作區控制，避免重複條件互相衝突。

**Independent Test**: 從 All repos 切換至 Repository 工作區及切回，確認結果範圍隨工作區變更，且舊網址條件不會限制新工作區。

**Acceptance Scenarios**:

1. **Given** 使用者位於 All repos 工作區，**When** 從頂部選擇一個 Repository，**Then** 進入該 Repository 的目前檢視並只載入該 Repository 的結果。
2. **Given** 使用者切換工作區，**When** 來源網址含舊的 repository、label 或 milestone 條件，**Then** 目標工作區不受這些條件限制。
3. **Given** 使用者位於 Repository 工作區，**When** Issue List 發出讀取請求，**Then** Repository 範圍仍由目前路由提供給 API。
4. **Given** 使用者切換至 All repos，**When** 檢視結果，**Then** 顯示所有可讀 Repository 中符合其他共用條件的結果。

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

- **FR-001**: List、Kanban 與 Gantt MUST 在桌機主要內容左側提供一致的共用控制面板，寬度約 240px，可收合並獨立捲動；主內容上方 MUST 只保留純文字的篩選結果摘要。面板收合狀態在同一瀏覽器分頁切換檢視後保持一致。
- **FR-002**: 共用篩選區 MUST 預設提供優先級、類型、Portal Issue Status 與負責人條件。
- **FR-003**: 全域 Issue 搜尋 MUST 出現在頂部導覽列、與工作區選擇器同層，並在登入後所有頁面可用；輸入關鍵字時 MUST 顯示跨所有可讀 Repository 的搜尋結果選單，不受目前工作區選擇限制。
- **FR-017**: 每筆全域搜尋結果 MUST 顯示足以辨認 Issue 與 Repository 的資訊；選取結果 MUST 開啟該 Issue 詳情，且詳情返回 MUST 回到發起搜尋的頁面。
- **FR-018**: 全域搜尋 MUST 清楚區分無符合結果與讀取失敗，並提供相應狀態提示。
- **FR-019**: Issues List、Kanban 與 Gantt MUST 優先提供桌機表格與圖表的可用高度，不顯示獨立的頁面主標題列、eyebrow 小標或描述副標；compact 頁首的下方 margin MUST 為 0。檢視與 Repository 身分由側邊導覽及工作區選擇器識別；供輔助工具讀取的頁面標題 MUST 保留，All repos 的標題與目前檢視及左側導覽名稱一致，Repository 工作區使用 Repository 名稱。
- **FR-004**: 工作檢視 MUST NOT 顯示 Repository、Label、Milestone 進階篩選；Repository 結果範圍 MUST 由頂部工作區選擇器決定。切換工作區不得沿用舊的 repository、label、milestone 查詢條件。
- **FR-005**: 使用者 MUST 能辨認及個別移除已套用的篩選條件，並能清除所有條件。
- **FR-006**: 舊網址中的 repository、label、milestone 查詢條件 MUST 不得套用至工作檢視，並 MUST 在下一次篩選或工作區導覽時清除。
- **FR-007**: 共用條件 MUST 套用於目前工作區的 List、Kanban 與 Gantt，且切換檢視時保持一致。
- **FR-008**: 每次篩選條件變更 MUST 立即更新可分享網址；重新載入、返回、前進及直接開啟網址 MUST 還原有效的工作區、檢視與篩選條件。
- **FR-009**: 無效或不支援的網址篩選值 MUST 不得使工作檢視失效；Portal MUST 忽略無效值並保留其他有效條件。
- **FR-010**: 篩選結果 MUST 使用 Gitea 提供的 Issue 資料；篩選不得建立 Issue 副本、修改 Gitea 資料或繞過使用者權限。
- **FR-011**: Gantt MUST 移除原有 Open／Closed 篩選，改用共用 Status 篩選；Todo／In Progress 對應 Open，Done 對應 Closed。日期起點、前後區段、今天、時間刻度及欄位設定 MUST 位於左側控制面板，保持既有 URL 與欄位偏好行為。List 的欄位設定、儲存及還原操作亦 MUST 位於左側面板。
- **FR-020**: 結果摘要 MUST 呈現實際顯示的筆數與所有有效條件，沒有篩選時顯示未設定篩選；分頁清單 MUST 區分當頁筆數與完整結果筆數。摘要 MUST 使用一般文字，不提供可點擊的 chip、外框、按鈕底色或 hover 樣式；loading/error MUST 不顯示誤導性的成功筆數。
- **FR-012**: 左側 List、Kanban、Gantt 導覽與左側建立 Issue 入口 MUST 維持現有位置與功能；頂部全域搜尋 MUST 與工作區選擇器同列，且頂部導覽列 MUST 位於左側導覽上方、不被遮蓋。
- **FR-013**: 篩選區 MUST 支援鍵盤操作、可見焦點及適當的輔助科技名稱；窄視窗下主要內容 MUST 不產生水平溢出。
- **FR-014**: 新增或修改的篩選標籤、狀態、提示、空狀態及無障礙名稱 MUST 支援繁體中文、英文與日文。
- **FR-015**: Storybook MUST 能展示三種檢視的共用篩選區，以及收合/展開、已套用條件、All repos/單一 Repository、窄視窗與明暗主題狀態。
- **FR-016**: 篩選條件 MUST 在使用者變更時立即生效；系統 MUST NOT 要求使用者另按「套用」才更新結果。

### Key Entities

- **共用篩選狀態**：目前工作區套用於 List、Kanban 與 Gantt 的優先級、類型、Portal Status 及負責人。
- **工作區 Repository 範圍**：由頂部工作區選擇器和目前路由決定；不作為共用篩選條件。
- **工作檢視網址狀態**：可還原工作區、List/Kanban/Gantt 檢視及有效篩選條件的分享狀態。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 使用者能在 List、Kanban 與 Gantt 以相同四項常用條件篩選，且切換檢視後條件及符合條件的工作集合一致。
- **SC-002**: 1440×900 桌機版面中，共用篩選及專屬控制位於左側面板，主內容僅有約 28px 的單行摘要占用上方高度；多條件摘要可自然換行。收合面板後主內容寬度增加；主要內容及控制面板各自捲動，375px 視窗無頁面水平溢出。
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
