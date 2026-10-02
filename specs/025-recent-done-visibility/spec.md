# Feature Specification: 最近完成項目篩選

**Feature Branch**: `025-recent-done-visibility`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: 為避免已完成的工作項目長期累積在 Issues List、Kanban 與 Gantt，預設只顯示最近一個月完成的項目，並可從左側控制面板取消勾選以查看全部完成項目。

## Clarifications

### Session 2026-10-02

- Q: 這個「最近 30 天完成」限制要套用在哪些檢視？ → A: Issues List、Kanban 與 Gantt 全部套用。
- Q: 取消勾選「只看最近完成」後，狀態要如何保存？ → A: 僅在目前頁面有效；重新載入或離開頁面後回到預設勾選狀態。
- Q: 「一個月內」要如何計算？ → A: 含使用者當地今天在內，往前涵蓋最近 30 個日曆日。
- Q: 勾選「只顯示最近完成」時，左上結果摘要要如何呈現這個日期條件？ → A: 左上摘要顯示日期條件，並隨結果更新筆數。
- Q: Issue List 是否應取消分頁並一次呈現目前篩選下的所有 Issue？ → A: 是；以單一連續清單呈現全部符合條件的 Issue，不使用分頁。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 管理完成項目的顯示範圍 (Priority: P1)

工程師在 Issues List、Kanban 或 Gantt 預設聚焦最近完成的 Done 項目；需要回顧歷史時，可取消勾選以顯示全部完成項目，再勾選即可回到近期範圍。

**Why this priority**: 長期累積的完成項目會降低工作檢視的可讀性；同一個直接可用的控制項能精簡預設結果，也保留完整歷史的入口。

**Independent Test**: 在每種檢視的 All repos 與單一 Repository 工作區各準備近期 Done、較早 Done、Todo 與 In Progress 項目，確認預設範圍、切換前後結果、摘要及頁面重設行為。

**Acceptance Scenarios**:

1. **Given** 工作檢視包含最近 30 個當地日曆日內完成、較早完成及未完成的項目，**When** 使用者進入 Issues List、Kanban 或 Gantt，**Then** 「只顯示最近完成的項目」預設勾選，只隱藏範圍外的 Done 項目。
2. **Given** 使用者位於 All repos 或單一 Repository 工作區，**When** 套用預設範圍，**Then** 三種檢視都依相同日期範圍呈現結果。
3. **Given** 使用者變更其他共用篩選條件，**When** 結果更新，**Then** 最近完成條件與其他篩選同時生效，且 Todo、In Progress 的可見性不受完成日期影響。
4. **Given** 最近完成控制項已勾選，**When** 使用者取消勾選或重新勾選，**Then** 所有或近期 Done 項目立即顯示，左上摘要同步更新結果筆數，並僅在勾選時列出「完成時間：最近 30 天」。
5. **Given** 使用者已取消勾選，**When** 重新載入或離開目前工作檢視頁面後再次進入，**Then** 控制項回到預設勾選狀態。

### User Story 2 - 完整瀏覽 Issue List (Priority: P1)

工程師在 Issues List 查看目前工作範圍與篩選條件下的完整 Issue 清單，不必透過分頁逐批載入結果。

**Why this priority**: 單一完整清單能呈現全量結果，也讓近期完成條件對所有符合項目一致生效。

**Independent Test**: 在 All repos 及單一 Repository 準備超過 50 筆符合條件的 Issues，確認清單單次呈現完整排序結果、結果數相符且沒有翻頁控制項。

**Acceptance Scenarios**:

1. **Given** Issue List 有超過原單頁筆數的符合條件項目，**When** 清單載入完成，**Then** 所有符合條件的項目都出現在同一連續清單中，不需要翻頁。
2. **Given** 使用者套用 Repository 或共用篩選條件，**When** Issue List 顯示結果，**Then** 清單包含所有符合目前條件的項目並保留既有排序。

### Edge Cases

- 完成時間恰好落在最近 30 個日曆日的起始日，仍視為範圍內。
- 若 Done 項目沒有可辨認的完成時間，勾選近期模式時不列入；取消勾選時仍可查看。
- 日期範圍依使用者當地日曆計算，跨日、跨月、跨年及閏日都遵循相同的 30 個日曆日規則。
- 零筆結果是有效的篩選結果，應與讀取錯誤清楚區分。
- 日期限制只作用於 Done；狀態為異常或其他狀態的項目不因缺少完成時間而被隱藏。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Issues List、Kanban 與 Gantt 的左側工作檢視控制面板 MUST 提供「只顯示最近完成的項目」核取控制項，並預設勾選。
- **FR-002**: 控制項勾選時 MUST 僅顯示完成日期落在使用者當地今天及之前 29 個日曆日內的 Done 項目；起始日當天 MUST 包含在範圍內。
- **FR-003**: 控制項未勾選時 MUST 顯示所有 Done 項目，不依完成日期排除項目。
- **FR-004**: 完成日期限制 MUST 僅影響 Done 項目，不得隱藏 Todo、In Progress 或異常狀態項目。
- **FR-005**: 完成日期限制 MUST 與優先級、類型、狀態、負責人、Repository、Label 及 Milestone 篩選條件共同生效；清除其他篩選不得變更此控制項。
- **FR-006**: 最近完成控制項 MUST 在 All repos 與單一 Repository 工作區的 Issues List、Kanban、Gantt 中一致運作。
- **FR-007**: 勾選狀態 MUST 僅作用於目前工作檢視頁面，不得寫入分享網址或跨頁持久保存；重新載入或離開該頁後再次進入 MUST 回到預設勾選狀態。
- **FR-008**: 缺少可辨認完成日期的 Done 項目，在近期模式下 MUST 視為不符合日期範圍；未勾選時仍 MUST 可見。
- **FR-009**: 控制項變更 MUST 立即更新可見項目及左上結果摘要，不需另按套用；摘要 MUST 更新結果筆數，並在勾選時明列「完成時間：最近 30 天」，取消勾選時移除此日期條件。
- **FR-010**: 此功能 MUST 只改變項目呈現範圍，不得建立 Issue 副本或修改 Gitea Issue 狀態及資料。
- **FR-011**: 控制項標籤、無障礙名稱及相關摘要文字 MUST 支援繁體中文、英文與日文，並可透過鍵盤操作。
- **FR-012**: Issues List MUST 取消分頁並在同一連續清單中呈現目前 Repository 範圍及其他篩選條件下的全部符合項目；清單可垂直捲動，且不得要求使用者切換頁碼以查看剩餘項目。

### Key Entities *(include if feature involves data)*

- **Done 項目**：狀態為 Done 的 Gitea Issue；其完成日期由 Gitea 提供的關閉時間代表。
- **近期完成範圍**：使用者當地今天及之前 29 個日曆日，合計 30 個日曆日。
- **最近完成控制項狀態**：目前工作檢視頁面上的勾選值；預設為勾選，且不跨頁或重新載入保存。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 在 Issues List、Kanban、Gantt 及 All repos、單一 Repository 兩種工作範圍共六種組合中，近期模式都只隱藏範圍外的 Done 項目。
- **SC-002**: 使用者取消勾選後，所有符合其他篩選條件的 Done 項目都能顯示；重新勾選後，範圍外 Done 項目再次隱藏。
- **SC-003**: 控制項變更後，可見結果與左上摘要中的結果筆數及日期條件在一次操作內更新，且零筆結果不會被呈現為錯誤。
- **SC-004**: 最近完成控制項不會改變任何 Gitea Issue 資料，重新載入後 100% 回到預設勾選狀態。
- **SC-005**: 對任一有效篩選條件，Issue List 顯示的項目總數與符合條件的完整結果數一致，且不存在需要翻頁才能查看的項目。

## Assumptions

- 「完成」依 Portal 固定狀態 Done 判定，對應 Gitea Closed；完成日期以 Gitea 關閉時間為準。
- 最近 30 個日曆日以使用者當地日期計算，包含今天與第 30 天的起始日。
- Issue List 依目前 Repository 與共用條件取得完整結果集，再於單一連續清單呈現；近期完成限制套用於完整結果而非原先的單頁子集。
- 控制項是暫時檢視狀態；既有共用篩選的網址行為不因此改變。
- 為使目前工作集合可辨認，勾選近期完成控制項時，左上結果摘要會顯示「完成時間：最近 30 天」；取消勾選時不顯示此日期條件。
- 此功能不封存、不刪除，也不改變 Done 項目的 Gitea 狀態。
