# Feature Specification: 跨檢視逾期日期提示

**Feature Branch**: `037-overdue-date-alerts`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: 不管是哪一個 view 的 issue due date 如果過了，但是還沒有 done 都應該出現火焰提示；逾期提示應在各 view 一致，並保留原有排序與篩選行為。

## User Scenarios & Testing

### User Story 1 - 跨檢視辨識逾期 Issue (Priority: P1)

工程師在 Issue List、Kanban、Gantt 或 Issue 詳情檢視工作時，可以快速看出尚未完成且已超過 due date 的 Issue，不必切換檢視確認期限狀態。

**Why this priority**: 逾期資訊若只出現在部分檢視，使用者可能漏掉需要處理的工作；一致提示能讓期限風險在現有工作流程中持續可見。

**Independent Test**: 準備一筆 due date 早於今天且仍開啟的 Issue，在四種檢視中確認均能辨識為逾期，再確認截止日為今天、未來日期及已完成 Issue 不會被標示。

**Acceptance Scenarios**:

1. **Given** 一筆 Issue 仍開啟、due date 是有效日期且早於使用者本地今天，**When** 使用者查看 Issue List、Kanban、Gantt 或 Issue 詳情，**Then** 各檢視都顯示明確可辨識的火焰圖示，以紅色圓形底框凸顯，不顯示文字。
2. **Given** Gantt 中有一筆逾期 Issue，**When** 使用者查看該列，**Then** 在 Issue 標題旁看見與其他檢視一致的緊湊火焰圖示，不會把整條排程列染成逾期色。
3. **Given** 一筆 Issue 的 due date 是今天或未來，**When** 使用者查看任一檢視，**Then** 不顯示逾期提示。
4. **Given** 一筆 Issue 已完成或已關閉，**When** 使用者查看任一檢視，**Then** 即使 due date 已過也不顯示逾期提示。
5. **Given** 使用者以螢幕閱讀器瀏覽逾期提示，**When** 提示被朗讀，**Then** 透過翻譯後的無障礙名稱辨識該 Issue 已逾期。

### User Story 2 - 區分逾期與日期異常 (Priority: P2)

工程師查看日期資料不完整或錯誤的 Issue 時，可以辨識排程異常，而不會收到根據無效日期推導出的逾期提示。

**Why this priority**: 錯誤日期不應被呈現成可信的期限風險，避免使用者根據錯誤提示採取行動。

**Independent Test**: 準備 due date 無效及 start date 晚於 due date 的 Issue，確認顯示排程異常而不顯示逾期；再準備 start date 異常但 due date 有效且已過期的 Issue，確認仍顯示逾期。

**Acceptance Scenarios**:

1. **Given** Issue 的 due date 無效，或日期區間起訖顛倒，**When** 使用者查看任一檢視，**Then** 顯示既有排程異常提示且不顯示逾期提示。
2. **Given** Issue 的 start date 有異常，但 due date 有效、已過期且 Issue 仍開啟，**When** 使用者查看任一檢視，**Then** 同時保留 start date 異常提示並標示逾期。

## Requirements

### Functional Requirements

- **FR-001**: Portal MUST 在 Issue List、Kanban、Gantt 與 Issue 詳情檢視中，對仍開啟且 due date 早於使用者本地今天的 Issue 顯示逾期提示。
- **FR-002**: 逾期提示 MUST 只以圖像呈現，不顯示文字；火焰輪廓 MUST 清楚可辨，並以底色和邊框凸顯。提示 MUST 保留支援語系的無障礙名稱，不得只靠顏色傳遞狀態。
- **FR-003**: due date 等於使用者本地今天或晚於今天時，Portal MUST NOT 顯示逾期提示。
- **FR-004**: 已完成或已關閉的 Issue MUST NOT 顯示逾期提示，不論 due date 是否已過。
- **FR-005**: due date 無效或日期區間起訖顛倒時，Portal MUST 保留日期異常提示，且 MUST NOT 由該日期顯示逾期提示。
- **FR-006**: start date 異常不得遮蔽由有效且已過期 due date 得出的逾期提示；日期異常與逾期狀態 MUST 可同時辨識。
- **FR-007**: Gantt MUST 在 Issue 標題附近以緊湊火焰圖示呈現逾期狀態，且 MUST NOT 以整列染色取代提示。
- **FR-008**: 逾期提示 MUST NOT 改變 Issue 的狀態、Gitea 資料、既有排序或篩選結果。
- **FR-009**: Portal MUST 在檢視重新載入或重新呈現時，依使用者本地日曆日重新判定逾期狀態。

### Key Entities

- **Issue**: 由 Gitea 管理的工作項目；其開啟/關閉狀態與 due date 是判斷逾期的依據。
- **逾期提示**: 根據 Issue 狀態、有效 due date 與使用者本地日期即時計算的檢視狀態，不是獨立保存的資料。
- **排程異常**: Issue 的日期資料無效或起訖顛倒時使用的既有提示；逾期提示須與其正確共存或避免誤判。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 對有效日期且已過期的開啟 Issue，四種檢視皆能顯示逾期提示；驗收案例覆蓋率為 100%。
- **SC-002**: 截止日為今天或未來、Issue 已關閉、due date 無效或日期區間顛倒的案例，錯誤顯示逾期提示的比例為 0%。
- **SC-003**: 所有支援語系的螢幕閱讀器均能辨識逾期無障礙名稱；純視覺提示以清楚火焰造型及紅色底框呈現。
- **SC-004**: 開啟或關閉逾期提示不會改變檢視排序、篩選結果或 Gitea Issue 資料。

## Assumptions

- 「未完成」以 Gitea Issue 仍為 Open 判定；Done 對應 Gitea Closed。
- due date 是無時區的日曆日期；到期日當天不算逾期，使用者本地日期進入下一天後才算逾期。
- 逾期狀態在頁面載入或重新呈現時重新計算；不新增背景計時器，也不新增逾期排序或篩選。
- 所有 Issue 狀態、due date 與排程資料仍以 Gitea 為唯一來源；此功能不新增 Portal persistence 或 Gitea 寫入。
