# Feature Specification: 工作檢視網址參數範圍

**Feature Branch**: `030-work-view-url-cleanup`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "現在點到 gantt 後再切到其他 view，網址好像回殘留一些不必要的參數，查看相關路由是不是也有相似的問題，一起解決"

## Clarifications

### Session 2026-10-02

- Q: 離開 Gantt 切到 List/Kanban 或切換 Repository 時，`gantt_start`、`gantt_scale` 應怎麼處理？ → A: 只保留在 Gantt URL；離開 Gantt 後從一般導覽返回時使用預設值，從 Gantt 開啟 Issue 的返回路徑仍保留 Gantt 設定。

### Session 2026-10-03

- Q: 從 List 切到另一個 List（例如切換 Repository 或再次點側欄 List）時，要保留網址中的 `sort` 和 `direction` 嗎？ → A: 來源與目標都是 List 時保留；切到 Kanban/Gantt 時清除。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 切換檢視時網址只保留適用狀態 (Priority: P1)

工程師在 Gantt 調整日期或刻度後切到 List 或 Kanban，網址應只保留適用於目標檢視的狀態，不再顯示 Gantt 專屬參數。跨檢視共用的有效篩選仍維持一致。

**Why this priority**: 檢視切換後的網址應能正確描述目前頁面，避免無關狀態造成混淆或影響後續操作。

**Independent Test**: 在 Gantt 設定日期、刻度及至少一項共用篩選，再切換 List、Kanban，確認 Gantt 參數消失而共用篩選仍存在；反向切換至 Gantt 時確認日期與刻度使用預設值。

**Acceptance Scenarios**:

1. **Given** 使用者在 Gantt 並設定日期、刻度及共用篩選，**When** 切換至 List 或 Kanban，**Then** 目標網址不含 Gantt 日期與刻度，且保留有效共用篩選。
2. **Given** 使用者在 Gantt，**When** 切換至另一個 Repository 的 List 或 Kanban，**Then** 新工作區網址不含 Gantt 專屬參數，且保留適用的共用篩選。
3. **Given** 使用者從非 Gantt 檢視切換至 Gantt，**When** 目標網址沒有 Gantt 日期與刻度，**Then** Gantt 使用各自的預設日期與刻度。
4. **Given** 使用者在 List 設定排序，**When** 導覽至另一個 List 工作區或再次選擇 List，**Then** 保留 `sort` 和 `direction`；切換至 Kanban/Gantt 時兩者不出現在目標網址。

---

### User Story 2 - 從 Issue 返回時還原原本 Gantt (Priority: P2)

工程師從 Gantt 開啟 Issue 詳情或建立 Issue 後返回，仍能回到離開前的 Gantt 日期、刻度及共用篩選。

**Why this priority**: Gantt 狀態離開一般檢視導覽時應清除，但使用者暫時離開 Gantt 處理 Issue 時仍需恢復原工作位置。

**Independent Test**: 從已調整日期、刻度且套用篩選的 Gantt 開啟 Issue 詳情及建立頁，分別返回並確認原 Gantt 狀態還原。

**Acceptance Scenarios**:

1. **Given** 使用者從 Gantt 開啟 Issue 詳情，**When** 使用詳情頁返回，**Then** 回到原 Gantt URL 狀態。
2. **Given** 使用者從 Gantt 開啟建立 Issue 頁，**When** 返回原工作檢視，**Then** 回到原 Gantt URL 狀態。
3. **Given** 使用者從 List 或 Kanban 開啟 Issue，**When** 使用詳情頁返回，**Then** 返回網址不包含 Gantt 專屬狀態。

### Edge Cases

- 從舊網址進入 List 或 Kanban，而網址帶有 Gantt 日期或刻度時，切換檢視、工作區或更新篩選後，這些參數不得繼續污染非 Gantt URL。
- Gantt 日期或刻度缺漏、格式無效或值不支援時，Gantt 分別使用既有預設值；導覽至非 Gantt 時不保留這些參數。
- 已淘汰的 Gantt 篩選參數不得在檢視或工作區切換後繼續出現在目標網址。
- 任何檢視切換都必須保留有效的共用篩選，且不可把前一個 Repository 的資料範圍帶入另一個工作區。
- List 排序參數只有在導覽來源及目標都是 List 時保留；離開 List 檢視時清除。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: List、Kanban 與 Gantt 間切換時，Portal MUST 在目標網址保留有效的共用篩選條件。
- **FR-002**: `gantt_start` 與 `gantt_scale` MUST 僅存在於 Gantt 檢視網址；切換至 List、Kanban 或非 Gantt 工作區時 MUST 移除。
- **FR-003**: 從 Gantt 開啟 Issue 詳情或建立頁時，返回目標 MUST 保留原 Gantt 日期、刻度及共用篩選；從非 Gantt 檢視開啟時 MUST NOT 加入 Gantt 專屬參數。
- **FR-004**: 使用者進入沒有 Gantt 日期或刻度的 Gantt 網址時，Portal MUST 各自套用既有預設值，不得因先前離開 Gantt 而隱式還原其他日期或刻度。
- **FR-005**: 側欄檢視導覽、工作區選擇器及篩選更新 MUST 遵守相同的參數範圍；舊網址中的不適用 Gantt 專屬或已淘汰參數 MUST 在下一次相關導覽或篩選更新時清除。
- **FR-006**: 檢視或工作區切換 MUST NOT 改變 Gitea Issue 資料、工作區範圍規則或共用篩選的既有語意。
- **FR-007**: `sort` 與 `direction` MUST 僅在來源與目標皆為 List 時沿用；導覽至 Kanban 或 Gantt 時 MUST 移除。

### Key Entities

- **工作檢視網址狀態**：目前工作區、檢視、有效共用篩選，以及僅供 Gantt 使用的日期與刻度。
- **返回目標**：使用者暫時離開工作檢視處理 Issue 後，能返回原始工作區、檢視與適用狀態的網址。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 所有 List/Kanban/Gantt 側欄切換與工作區切換情境中，非 Gantt 目標網址均不含 `gantt_start` 或 `gantt_scale`。
- **SC-002**: 所有三種檢視間的切換情境中，有效共用篩選均完整保留，且目標工作區符合目前 Repository 範圍。
- **SC-003**: 從 Gantt 開啟 Issue 詳情或建立頁後返回，日期、刻度及共用篩選三項狀態均與離開前一致。
- **SC-004**: 從非 Gantt 檢視開啟 Issue 詳情後返回，網址不含 Gantt 專屬參數；切換回 Gantt 時日期與刻度採用預設值。
- **SC-005**: List 至 List 導覽保留排序欄位與方向；所有導向 Kanban/Gantt 的 URL 均不含 List 排序參數。

## Assumptions

- Priority、Issue Type、Portal Status 與 Assignee 是 List、Kanban、Gantt 共用篩選，仍依既有行為跨檢視保留。
- Gantt 日期與刻度不在一般檢視或工作區間持續記憶；僅透過 Gantt 發起的 Issue 返回目標暫存並還原。
- 修正涵蓋所有工作檢視導覽入口與篩選 URL 更新，不變更 API、Gitea 資料或 Gantt 日期/刻度的預設規則。
