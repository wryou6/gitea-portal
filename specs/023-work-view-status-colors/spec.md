# Feature Specification: 工作檢視色彩與可切換配色

**Feature Branch**: `023-work-view-status-colors`
**Created**: 2026-10-01
**Status**: In Progress
**Input**: User description: Alternate Issue List row backgrounds; establish fixed Status colors across Status badges and Gantt rows while considering the visual relationship with other badge families; implement three selectable light/dark product palettes.

## User Scenarios & Testing

### User Story 1 - 快速追蹤 Issue List 的列 (Priority: P1)

工程師在 Issues List 連續比較多筆資料時，可透過交替的列底色持續追蹤目前正在閱讀的 Issue。

**Why this priority**: 列背景能減少寬表格中視線跨欄移動時看錯列的情況。

**Independent Test**: 在 Issues List 顯示多筆 Issue，確認資料列深淺交替、滑鼠 hover 清楚可辨，並在窄螢幕、淺色及深色主題中保持文字可讀。

**Acceptance Scenarios**:

1. **Given** Issues List 顯示至少兩筆 Issue，**When** 使用者由上而下掃描資料列，**Then** 相鄰資料列使用可辨認但低對比的交替底色。
2. **Given** 使用者將指標移至任一資料列，**When** hover 樣式出現，**Then** hover 狀態比交替底色更醒目且不遮蔽文字。
3. **Given** Issues List 顯示空狀態或載入狀態，**When** 沒有 Issue 資料列，**Then** 不套用交替列底色。

### User Story 2 - 跨檢視辨認固定 Status 色彩 (Priority: P1)

工程師在 Issue List、detail 與 Gantt 以一致的 badge 色彩辨識 Status，同時保留 Type、Priority、Label badge 各自清楚且一致的視覺層級；在 Gantt 中可由整列淡色背景快速掃描同一狀態的工作。

**Why this priority**: Gantt 的表格與時間軸橫跨較大面積，穩定的 Status 色彩可讓使用者快速追蹤每列工作狀態。

**Independent Test**: 以單一 Storybook palette 比較 Status、Type、Priority、一般 Label 及缺漏／衝突 badge，確認共用的形狀、間距與一致的語意色彩；再於 Gantt 確認 Status badge、列底色及排程 bar 使用相同色彩，文字與其他列資訊仍可讀。

**Acceptance Scenarios**:

1. **Given** 使用者比較 Status、Type、Priority 與 Label badges，**When** 在 List、detail、Kanban 或 Gantt 查看，**Then** badge 外形與尺寸一致，各語意色彩按同一組配色角色穩定對應。
2. **Given** Gantt 顯示任何 Status 的 Issue，**When** 使用者掃描工作列，**Then** 表格欄與時間軸所在列以該 Status 的淡色背景對應，排程 bar 亦使用相同 Status 色彩。
3. **Given** Gantt 顯示缺少或衝突 Status 的異常 Issue，**When** 使用者檢視該列，**Then** 異常提示維持明確且不會被正常 Status 顏色誤認。
4. **Given** Gantt 切換到窄螢幕或深色主題，**When** 使用者檢視任一 Status，**Then** 狀態文字、列背景與排程 bar 保持可辨，不依賴顏色作為唯一資訊。

### User Story 3 - 在設定切換產品配色 (Priority: P1)

工程師可在設定中選擇霧藍、鼠尾草或鳶尾配色。所選配色會套用到全站背景、導覽側欄、控制面板、表格、badge、看板及 Gantt，並同時支援淺色、深色與系統外觀模式；偏好依登入帳號保存。

**Why this priority**: 工程師需要在不影響其他帳號或工作資料的前提下，選用符合個人閱讀偏好的完整色彩方案。

**Independent Test**: 在設定切換三套配色，檢查主要工作檢視與所有 badge；重新載入及切換明暗主題後確認偏好維持，其他帳號仍採各自偏好或預設值。

### Edge Cases

- Issues List 最後一列、空狀態及載入狀態不得出現多餘的交替色條。
- Gantt 的 unscheduled 與 date-anomaly 列即使沒有排程 bar，仍依 Status 顯示對應列底色；date anomaly 的既有異常提示優先保留。
- 深淺底色與 hover 狀態在窄版、寬版及淺色／深色主題均不可降低文字辨識度。

## Requirements

### Functional Requirements

- **FR-001**: Issues List 的資料列 MUST 以低對比交替底色區分相鄰列；表頭、空狀態、載入狀態不得套用交替資料列樣式。
- **FR-002**: Issues List 的 hover 樣式 MUST 在交替底色之上維持清楚辨識，且不改變列內容或互動行為。
- **FR-003**: Todo、In Progress、Done MUST 各自使用固定且跨 Issues List、Issue detail 與工作檢視一致的 Status 語意色彩；異常 Status MUST 維持獨立且可辨識的提示色。Status badge MUST 使用與 Type、Priority、一般 Label 一致的外形與視覺密度。
- **FR-004**: Gantt 每筆 Issue 列及其排程 bar MUST 使用該 Issue Status 對應的色彩；列背景保持淡色，並涵蓋 scheduled、unscheduled 與 date-anomaly 列。
- **FR-005**: Status 色彩 MUST 同時適用淺色與深色主題、窄螢幕與桌面版；Status 仍須以既有文字顯示，不得只靠色彩辨識。
- **FR-006**: 本功能 MUST 僅改變呈現，不得改變 Gitea Issue Status、Label、排程資料、篩選、排序或 Issue 操作；唯一新增的持久化 MUST 僅為 FR-010 定義的帳號配色偏好。
- **FR-007**: 新增或修改的使用者可見文字（如有）MUST 更新繁體中文、英文及日文資源；若沒有新增文字則不得為純裝飾變更新增翻譯鍵。
- **FR-008**: Status、Type、Priority、資料異常與一般 Label MUST 由共用 badge 色彩系統呈現：danger、warning、caution、info、success 使用共用淺色／深色前景、背景與邊框 token；一般 Label 使用共用 neutral theme token。各類別仍以既有文字辨認，顏色不得是唯一訊號。
- **FR-009**: Settings MUST 提供霧藍、鼠尾草及鳶尾三套完整產品配色，選擇後立即套用至背景、側欄、Badge、Issue List、Kanban 與 Gantt，且每套均須支援 light、dark 及 system 外觀模式。
- **FR-010**: 配色偏好 MUST 依登入帳號儲存在瀏覽器本機，重新載入後還原；不得與外觀模式或 Issue/Gitea 資料耦合。舊帳號尚無配色偏好時 MUST 預設為霧藍。

### Key Entities

- **Issue List 資料列**：現有 Issues List 中呈現一筆 Issue 的表格列；交替底色僅作用於資料列。
- **共用 Badge 語意色**：Danger、warning、caution、info、success 五組淺色／深色前景、背景與邊框 token；Status、Type、Priority、異常及一般 Label 使用一致的角色映射。
- **Issue Status 語意色**：Todo、In Progress、Done 與異常 Status 映射至共用 badge 語意色；只影響視覺，不改變 Status 資料。
- **Gantt Issue 列**：呈現 Issue 欄位與日期時間軸的一列，背景與排程 bar 依同一 Status 語意色呈現。

## Success Criteria

### Measurable Outcomes

- **SC-001**: Issues List 中每一對相鄰資料列均可辨認為不同底色，且空狀態不顯示斑馬紋。
- **SC-002**: Todo、In Progress、Done 在 Issues List、Issue detail、Kanban 與 Gantt 使用一致的 Status badge 色彩；Gantt 列底色與排程 bar 均符合該映射。
- **SC-003**: Storybook 的共用 Badge Palette 同時呈現 Status、Type、Priority、異常與一般 Label；zh-TW、en、ja 及淺色／深色主題下文字仍清楚可讀。
- **SC-004**: Status、Label、排程資料及使用者操作結果與改版前完全一致。
- **SC-005**: Settings 可切換三套配色；每套配色在 light/dark 下均一致套用至全站 surfaces、badge、Issue List、Kanban 及 Gantt，重載後保留且不覆蓋其他帳號偏好。

## Assumptions

- 共用 badge 語意色沿用現有跨類別配色：danger 紅、warning 琥珀、caution 橘、info 藍、success 綠，並提供對應深色主題色值。
- Status 映射為 Todo/info 藍、In Progress/warning 琥珀、Done/success 綠、anomaly/danger 紅；Priority、Type 與缺漏／衝突 badge 維持各自既有語意層級，透過共用 palette token 使用相同角色色。
- Gitea Label badge 繼續使用中性色，不與表達工作狀態或優先級的語意色競爭。
- 三套配色共用一致的語意角色（danger、warning、caution、info、success），但可採各自的品牌色相與中性色；使用者可獨立選擇配色與 light/dark/system 外觀。
- 配色選擇儲存在現有 per-account localStorage 偏好慣例中；不登入時使用霧藍預設值。
- Issues List 交替色使用現有 surface 與 muted theme token 混色，避免加入只適用單一主題的硬編碼色碼。
- Status 文字與既有 anomaly annotation 是狀態辨認的必要資訊，色彩只作輔助。
