# Feature Specification: Gantt 表格與日曆時間軸

**Feature Branch**: `019-gantt-table-timeline`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: 將 Gantt chart 每一列改為較精簡的表格呈現，左側預設依序顯示標題、負責人、狀態，右側提供可調整尺度的日曆時間軸，並可設定起始日期。

## Clarifications

### Session 2026-09-29

- Q: 起始日期預設與「today」重設要回到今天前幾天？ → A: 最新決定為 7 天前；先前規格記載的 14 天由此決定取代。
- Q: 在窄螢幕上，Gantt 應隱藏時間軸只顯示 Issue 表格，還是保留整張圖表並允許水平捲動？ → A: 保留完整時間軸並允許水平捲動。
- Q: 選定的起始日期要作為時間軸的硬性左界，還是只作為初次開啟時的顯示位置？ → A: 起始日期設定初次顯示位置；更早日期仍可往前捲動。
- Q: 重新載入或分享 Gantt 網址時，起始日期與 Scale 要如何保存？ → A: 保存於網址，分享和重新載入都還原。
- Q: 同一視窗尺寸下，預設 Gantt 至少多顯示 25% Issues 的成功門檻要保留嗎？ → A: 保留 25% 門檻，使用相同資料與視窗尺寸比較可見列數。
- Q: 25% 門檻要用哪組資料比較？ → A: 使用固定 Storybook fixture；採 8 筆排程 Issue 與 1440×900 視窗，保存改版前後首屏列數供比較。
- 決策：Gantt 欄位偏好與 Issues table 分開保存；依目前登入帳號隔離。
- 決策：標題、負責人、狀態固定顯示但可調整欄序；Issues table 的其他欄位可加入 Gantt，預設隱藏。
- 決策：開始日期與到期日期不列為可選表格欄位；排程日期由右側時間軸呈現。
- 決策：週末只指週六與週日；不標示國定假日。
- 決策：時間軸涵蓋所有有效排程日期，必要時可水平捲動。
- 決策：Title 欄只顯示 Issue 標題；All repos 將 Repository 欄放在 Title 左側識別來源，不將 owner/repo 或 Issue Key 放進標題內容。
- 決策：Assignee、Status 與 All repos 的 Repository 欄寬依目前顯示內容中的最大寬度計算，並讓表頭與每列使用相同欄寬。
- 決策：只有存在未排程 Issue 時才顯示未排程區段；沒有項目時不顯示區段標題或空狀態。
- 決策：Scale 使用 Day、Week、2 weeks、Month；每格分別代表一天、週一開始的一週、從選定起始日開始的兩週、日曆月。
- 決策：時間軸起始日、前後區段、回到預設起始日、Scale 與欄位設定放在獨立的時間軸工具列，不與 Issue 篩選混排；時間軸前後按鈕依目前 Scale 移動一天、七天、十四天或一個日曆月，並保留 URL state。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 精簡瀏覽 Gantt Issue (Priority: P1)

工程師在 All repos 或 Repository Gantt 中以較矮的表格列瀏覽工作，並在同一列查看右側排程時間軸。

**Why this priority**: 現有多行 Issue 卡片佔用過多垂直空間，限制一頁可同時比較的工作數量。

**Independent Test**: 在 All repos 與單一 Repository 載入同一組排程 Issue，確認標題、負責人與狀態以表格欄位呈現、時間軸日期正確對齊，並在相同視窗尺寸下比較改版前後可見列數。

**Acceptance Scenarios**:

1. **Given** Gantt 載入多筆 Issue，**When** 使用者檢視工作列，**Then** 左側預設欄位依序為標題、負責人、狀態，右側為對應時間軸。
2. **Given** 使用者檢視 All repos，**When** Issue 列呈現，**Then** Title 欄只顯示 Issue 標題，且左側緊鄰的獨立欄位顯示 Repository 身分。
3. **Given** Issue 有有效開始日與到期日，**When** 顯示時間軸，**Then** 日期區間落在正確日期位置；單一日期顯示單日項目。
4. **Given** Issue 未排程或日期異常，**When** 顯示 Gantt，**Then** Issue 仍出現在對應區域且狀態清楚可辨。
5. **Given** 改版前後使用相同排程資料及相同視窗尺寸，**When** 比較預設 Gantt 可見的 scheduled Issue 列數，**Then** 改版後至少增加 25%。
6. **Given** 多筆 Issue 顯示於 Gantt，**When** 使用者瀏覽列，**Then** 各區域固定依開始日期升冪排列，同日依 Repository 與 Issue 編號穩定排序，標題欄只包含 Issue 標題。
7. **Given** Gantt 顯示的 Issue 超過可視高度，**When** 使用者瀏覽圖表，**Then** 頁面本身不垂直捲動，圖表區可垂直及水平捲動，水平捲軸位於圖表底部且保持可見。
8. **Given** Issue 的 Assignee、Status 或 Repository 內容長度不同，**When** 使用者檢視表格，**Then** 這些欄位各自依目前最大內容寬度呈現，表頭和列對齊且內容不溢入相鄰欄位。
9. **Given** 沒有未排程 Issue，**When** 使用者瀏覽 Gantt，**Then** 不顯示未排程區段或空狀態，釋出的高度可用來顯示更多排程列。

### User Story 2 - 自訂 Gantt 表格欄位 (Priority: P1)

工程師可依工作需求顯示其他 Issue 欄位、調整欄序並保存預設；設定與 Issues table 分開且依登入帳號保存。

**Why this priority**: 使用者需要保留精簡預設，同時能在需要時比較其他 Issue 資訊。

**Independent Test**: 顯示額外欄位、調整欄序、保存預設、恢復預設，再切換到 Issues table 及另一 Gantt 工作區確認偏好範圍正確。

**Acceptance Scenarios**:

1. **Given** 使用者首次開啟 Gantt，**When** 欄位載入，**Then** 標題、負責人與狀態顯示，其他可選 Issues table 欄位預設隱藏，且開始日期與到期日期不提供為欄位。
2. **Given** 使用者開啟 View Options，**When** 調整欄位顯示，**Then** 可顯示或隱藏非固定欄位，但標題、負責人與狀態維持顯示。
3. **Given** 使用者透過滑鼠或鍵盤調整欄序，**When** 新順序不同於已保存預設，**Then** 顯示保存預設欄序操作；保存後重新載入仍套用該順序。
4. **Given** 使用者選擇恢復預設，**When** 操作完成，**Then** 只顯示預設三欄並還原預設欄序。
5. **Given** 使用者修改 Gantt 欄位偏好，**When** 切換 Issues table 或登入帳號，**Then** Issues 偏好不受影響，其他帳號的 Gantt 偏好亦不受影響。

### User Story 3 - 調整與定位時間軸 (Priority: P1)

工程師可選擇時間軸起始日期和 Scale，快速回到預設起始日，並辨識今天及週末。

**Why this priority**: 可讀的日曆刻度和可控的時間範圍有助於判斷排程落點及近期工作。

**Independent Test**: 檢查預設起始日、today 重設、今天醒目標示、週末底色、四種 Scale、跨月表頭及水平捲動後的列與表頭對齊。

**Acceptance Scenarios**:

1. **Given** 使用者首次開啟 Gantt，**When** 時間軸載入，**Then** 起始日期預設為使用者當地今天往前 7 天，Scale 預設為 Day。
2. **Given** 使用者變更起始日期，**When** 日期套用，**Then** 時間軸依選定日期定位；按下「today」後回到今天往前 7 天。
3. **Given** 使用者檢視任一 Scale，**When** 今天位於時間軸範圍內，**Then** 今天以醒目且不只依賴顏色的方式標示。
4. **Given** 時間軸涵蓋週六或週日，**When** 使用者檢視日期標頭與排程區，**Then** 週末使用不同底色標示。
5. **Given** 使用者切換 Scale，**When** 選擇 Day、Week、2 weeks 或 Month，**Then** 刻度分別依日、週一開始的一週、從選定起始日開始的兩週區間或日曆月排列，Issue 日期仍按真實日期定位。
6. **Given** 時間軸跨越月份或超出可視寬度，**When** 使用者瀏覽圖表，**Then** 兩層表頭清楚呈現月份及日期區間，且水平捲動時表頭與 Issue 列維持對齊。
7. **Given** 使用者已設定起始日期與 Scale，**When** 重新載入或分享 Gantt 網址，**Then** 相同起始日期與 Scale 會還原。
8. **Given** 使用者選擇任一 Scale，**When** 按下時間軸前進或後退，**Then** 起始日期依該 Scale 移動，時間軸重新定位，左側 Issue 欄位寬度維持不變。

### Edge Cases

- 日期軸跨年、跨月、閏年或夏令時間地區時，日期仍依使用者當地日曆正確排列。
- 起始日期不在目前任一 Issue 的排程範圍內時，仍提供該日期作為初次顯示位置，且更早的有效排程可往前捲動查看。
- 月刻度移動到較短月份時，保留相同日數；若該月份沒有該日，使用該月最後一天。
- 沒有有效排程日期時，保留未排程與異常區域，並呈現可理解的時間軸空狀態。
- 使用者無法取得登入帳號時，不得將偏好套用到另一帳號；使用產品預設值。
- 窄螢幕、鍵盤操作及淺色／深色主題下，欄位、時間軸控制與排程狀態仍須可辨識；窄螢幕保留完整時間軸並允許水平捲動。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All repos 與每個 Repository 的 Gantt MUST 以精簡表格列呈現 Issue，左側表格與右側時間軸逐列對齊。
- **FR-002**: 初始核心欄位順序 MUST 為標題、負責人、狀態；三欄 MUST 持續顯示，但使用者可調整順序。All repos 的固定 Repository 欄 MUST 位於 Title 左側，不參與可自訂欄位順序。
- **FR-003**: Gantt MUST 提供 Issues table 中除標題、負責人、狀態、開始日期、到期日期以外的欄位作為可選欄位，並於初始狀態隱藏；開始日期與到期日期 MUST 只由時間軸呈現。
- **FR-004**: 欄位顯示與欄序 MUST 可透過 View Options、表頭拖曳及鍵盤操作調整；欄序異動時 MUST 提供保存預設欄序操作，且 MUST 提供恢復預設操作。
- **FR-005**: Gantt 欄位偏好 MUST 依登入帳號保存，並與 Issues table 偏好分離；All repos 與各 Repository Gantt MUST 套用同一帳號的 Gantt 偏好。
- **FR-006**: 起始日期 MUST 預設為使用者當地今天往前 7 天；使用者 MUST 能選擇其他起始日期，並能以「today」操作回復預設日期。選定日期 MUST 設定時間軸初次顯示位置；使用者 MUST 能向前捲動查看更早日期。
- **FR-007**: 時間軸 MUST 提供 Day、Week、2 weeks、Month 四種 Scale，預設為 Day；每種 Scale MUST 依其日、週、雙週或日曆月單位顯示刻度，且不改變 Issue 的實際排程日期。
- **FR-008**: 時間軸 MUST 以兩層標頭呈現時間資訊，清楚標示月份及日期區間；日期軸與各 Issue 排程列 MUST 在水平捲動時維持對齊。
- **FR-009**: 時間軸 MUST 醒目標示今天，並以不同底色標示週六與週日；不得只用顏色傳達今天或週末狀態。
- **FR-010**: 時間軸 MUST 涵蓋所有有效排程日期；使用者 MUST 能水平瀏覽超出目前可視寬度的日期。
- **FR-011**: Gantt MUST 保留 scheduled、unscheduled、date anomaly 的區分、既有篩選及 Issue 詳情連結；日期呈現不得改變 Gitea 排程資料或寫入行為。
- **FR-012**: 使用者可見文字 MUST 維持繁體中文及專案支援的其他語系；欄位、日期與狀態 MUST 在鍵盤操作、輔助科技、窄螢幕與淺色／深色主題下可理解。窄螢幕 MUST 保留完整時間軸並提供水平捲動。
- **FR-013**: 使用者選擇的起始日期與 Scale MUST 保存於 Gantt 網址，並在重新載入或分享該網址時還原。
- **FR-014**: Gantt Issue 列 MUST 固定依開始日期升冪排序；缺少開始日期的單日排程以到期日排序，同日依 Repository 與 Issue 編號穩定排序。Title 欄 MUST 只顯示 Issue 標題；All repos MUST 在 Title 左側以獨立 Repository 欄顯示來源，不得將 owner/repo 或 Issue Key 放入標題內容。
- **FR-015**: Gantt 工作區 MUST 限制於視窗可用高度；超出高度的列 MUST 在圖表內垂直捲動，並在圖表底部提供常駐、可鍵盤操作的水平捲動控制，不得要求整頁垂直捲動。
- **FR-016**: Assignee 與 Status 欄，以及 All repos 的 Repository 欄 MUST 依目前可見 Issue 值的最大內容寬度計算；表頭與所有 Issue 列 MUST 共用量測後的欄寬，且語系或資料改變後 MUST 重新量測。
- **FR-017**: 未排程區段 MUST 僅在至少有一筆未排程 Issue 時顯示；未排程數量為零時 MUST 隱藏整個區段及其空狀態內容。

### Key Entities *(include if feature involves data)*

- **Gantt 欄位偏好**：登入帳號的可見欄位與欄位順序；與 Issues table 偏好分開。
- **時間軸檢視狀態**：起始日期與 Scale，用以決定日期刻度及初始定位，不改變 Issue 排程資料。
- **Issue 排程**：由 Gitea 提供的開始日期、到期日期與異常狀態；維持既有語意及唯一來源。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用相同排程資料與視窗尺寸比較，預設 Gantt 首屏可見的 scheduled Issue 列數較現行畫面至少增加 25%。
- **SC-002**: 使用者能在 5 秒內辨認任一 Issue 的標題、負責人、狀態及其開始／到期日期位置。
- **SC-003**: 使用者能在 3 次操作內選擇任一 Scale、指定起始日期或回到預設日期。
- **SC-004**: 所有 Scale 下，時間軸表頭、今天、週末與 Issue 日期區間均正確對齊，並能涵蓋圖表中的有效排程日期。
- **SC-005**: 欄位偏好在同一登入帳號的 All repos 與 Repository Gantt 間一致，且不改變 Issues table 或其他登入帳號的偏好。
- **SC-006**: 長列表 Gantt 下頁面無垂直捲軸，圖表內可垂直瀏覽所有列，且可直接操作圖表底部水平捲軸。

## Assumptions

- Gantt 可選欄位沿用 Issues table 欄位，但不含已由時間軸呈現的開始日期與到期日期；標題、負責人、狀態固定可見。
- Gantt 欄位偏好使用與 Issues table 相同的帳號隔離及持久化體驗，但欄位設定各自獨立。
- 起始日期與 Scale 由 Gantt 網址保存，以便重新載入及分享後還原相同檢視。
- 時間軸標示的週末依一般日曆週六、週日計算，不依地區國定假日資料。
- Gitea 仍是 Issue 與排程資料唯一來源；本功能只改變呈現與檢視偏好。
