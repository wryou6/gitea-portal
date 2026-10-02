# Feature Specification: Issue list 欄位與預設排序調整

**Feature Branch**: `029-issue-list-scanability`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: 調整 Issue list 的 Key 顯示方式，並將預設排序改為 Due Date。

## Clarifications

### Session 2026-10-02

- Q: Key 欄位應該預設隱藏、但仍可從欄位選項打開，還是從 Issue list 完全移除？ → A: 預設隱藏，但保留為可選欄位。
- Q: 發布新預設後，使用者已保存的 Key ascending 排序應如何處理？ → A: 保留所有已保存的排序偏好；新預設只套用到尚無個人設定的使用者及恢復預設的使用者。
- Q: 隱藏 Key 後，All repos 的每筆 Issue 應如何顯示所屬 Repository？ → A: 在 Title 下方以次要文字顯示 `owner/repo`；單一 Repository 清單使用工作區標題辨識來源。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 優先查看近期到期項目 (Priority: P1)

工程師開啟 All repos 或單一 Repository 的 Issue list 時，能先看到已逾期或即將到期的工作，不必每次手動排序。

**Why this priority**: Issue list 是日常工作入口，先呈現時間上較急迫的項目能降低漏看期限的機會。

**Independent Test**: 以含有過去、今日、未來及未設定 Due Date 的 Issue 清單開啟 Issue list，確認順序與空值位置。

**Acceptance Scenarios**:

1. **Given** 清單沒有有效的明確排序或個人排序偏好，**When** Issue list 載入，**Then** 有 Due Date 的 Issue 依日期由早到晚排列。
2. **Given** 多筆 Issue 的 Due Date 相同，**When** 清單排序，**Then** 這些 Issue 依 Key 升冪排列，結果穩定且可重現。
3. **Given** 部分 Issue 沒有 Due Date，**When** 清單排序，**Then** 未設定日期的 Issue 排在有日期的 Issue 之後。
4. **Given** 使用者從表頭或明確的清單連結指定其他排序，**When** 清單載入，**Then** 指定排序優先於產品預設。
5. **Given** 使用者已保存 Key ascending 個人排序，**When** Issue list 載入，**Then** 仍使用該排序，直到使用者自行更改或恢復預設。

### User Story 2 - 以標題掃描 Issue (Priority: P1)

工程師在 Issue list 掃描工作時，能以標題及其他有用欄位辨識項目，不必讓 Key 長期佔據可視欄位；All repos 在標題下方顯示來源 Repository，需要 Key 時仍可從欄位選項顯示。

**Why this priority**: 減少非主要識別資訊的視覺占用，讓有限表格寬度優先呈現工作內容。

**Independent Test**: 在首次載入及恢復預設後確認 Key 預設隱藏，並確認可從欄位選項顯示及使用。

**Acceptance Scenarios**:

1. **Given** 使用產品預設欄位，**When** 工程師開啟 All repos Issue list，**Then** Key 預設隱藏，且每筆 Title 下方顯示 `owner/repo`；在單一 Repository 清單中，工作區標題顯示該 Repository。
2. **Given** 工程師需要引用特定 Issue，**When** 從欄位選項顯示 Key，**Then** 能取得正確 Issue 的穩定識別資訊。
3. **Given** 使用者恢復產品預設，**When** 清單重設完成，**Then** 欄位與排序均回到本功能定義的預設值。

### Edge Cases

- 多筆 Issue 具有相同 Due Date 時，以 Key 升冪作為穩定次序。
- 未設定 Due Date 的 Issue 固定排在有日期者之後，不因排序方向改變。
- All repos 中不同 Repository 可能有相同 Issue number；即使 Key 隱藏，每筆 Title 下方仍顯示 `owner/repo` 以避免混淆。
- 使用者已有個人排序偏好時，保留該偏好；明確指定的清單排序仍優先。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Issue list 的 Key 欄位 MUST 預設隱藏，並 MUST 可由欄位選項重新顯示。
- **FR-002**: 首次載入及恢復產品預設時，Key 欄 MUST 預設隱藏；All repos MUST 在每筆 Title 下方顯示 `owner/repo`，單一 Repository 清單 MUST 由工作區標題辨識來源。
- **FR-003**: 沒有有效的清單排序或個人排序偏好時，Issue list MUST 依 Due Date 升冪排序，較早日期優先。
- **FR-004**: Due Date 相同的 Issue MUST 依 Key 升冪排列；未設定 Due Date 的 Issue MUST 排在所有有日期的 Issue 之後，且不受排序方向影響。
- **FR-005**: 使用者明確選擇的清單排序 MUST 優先於個人預設；已保存的個人排序偏好 MUST 保留，直到使用者自行更改或恢復預設。
- **FR-006**: 恢復產品預設 MUST 同時重設 Key 欄位可見性及 Issue list 預設排序。
- **FR-007**: Issue list MUST 在 All repos 及單一 Repository 工作區遵循一致的 Key 可見性與排序規則。

### Key Entities *(include if feature involves data)*

- **Issue list 欄位偏好**：使用者在 Issue list 顯示或隱藏欄位的選擇，包含 Key 欄位。
- **Issue list 排序偏好**：Issue list 使用的排序欄位與方向；本功能的產品預設為 Due Date 升冪。
- **Issue**：保留來源 Repository、Key、Title 及 Due Date，以供辨識與排序。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% 的預設載入及恢復預設驗收情境，均依 Due Date 升冪呈現有日期的 Issue。
- **SC-002**: 所有驗收情境中，未設定 Due Date 的 Issue 均位於有日期的 Issue 之後；同日期項目均以 Key 升冪穩定排列。
- **SC-003**: 使用者在 All repos 每筆 Issue 的 Title 下方均能辨識 `owner/repo`，在 Repository Issues list 能由工作區標題辨識 Repository；Key 預設隱藏但可由欄位選項顯示。
- **SC-004**: 明確的清單排序及已保存的個人排序偏好均依各自選擇套用；恢復預設後則回到 Due Date 升冪及 Key 隱藏。

## Assumptions

- 預設 Due Date 方向採升冪，讓逾期及最近到期的項目先出現。
- 未設定日期置後及同日期以 Key 升冪打破平手，沿用現有清單排序語意。
- Key 預設隱藏，但仍可透過欄位選項顯示；All repos 的 Title 下方顯示 `owner/repo`，Repository 工作區標題保留來源識別。
- 既有個人排序偏好保留；新預設只影響尚無個人設定的使用者及恢復預設的使用者。
- 本功能只調整 Issue list 的呈現與檢視偏好，不變更 Gitea Issue 資料或寫入行為。
