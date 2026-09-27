# Feature Specification: Issue Type 呈現統一

**Feature Branch**: `009-issue-type-presentation`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: 統一所有使用 Issue Type 概念的介面呈現，以 Bug、Feature、Task 等類型名稱直接呈現，不顯示 `type:`，並使用元件案例檢視不同呈現情境。

## Clarifications

### Session 2026-09-27

- Q: Issue 建立與編輯表單中的 Type 選擇器，是否也要納入這次的統一設計？ → A: 納入建立／編輯表單，統一 Type 名稱與視覺語意，但保留選擇器。

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 跨頁辨識 Issue Type (Priority: P1)

工程師在 Issue 清單、Issue 詳情、Kanban、甘特圖、建立／編輯表單或其他呈現 Issue Type 的頁面瀏覽或設定工作時，可以直接辨識 Bug、Feature 或 Task，並在切換頁面後仍能依一致的視覺線索辨認相同類型。

**Why this priority**: Type 是理解工作性質的主要資訊；一致呈現可降低跨頁瀏覽與比較時的認知成本。

**Independent Test**: 在所有含 Type 呈現的頁面與表單檢查三種有效 Type，確認同一類型的名稱與視覺語意一致、表單仍可選擇類型，且不出現 `type:` 前綴。

**Acceptance Scenarios**:

1. **Given** Issue 帶有一個有效 Type，**When** 使用者在 Issue 清單、Issue 詳情、Kanban 卡片、甘特圖列或其他呈現 Issue 的頁面檢視它，**Then** 直接顯示 Bug、Feature 或 Task，並使用該類型固定的標籤樣式。
2. **Given** 使用者在不同頁面檢視相同 Type，**When** 比較標籤，**Then** 顯示名稱與類型樣式保持一致，位置依各頁資訊層級清楚安排。
3. **Given** 一般 Labels 與 Type 同時存在，**When** 使用者查看完整 Labels，**Then** Type 可辨識且不會被 `type:*` 原始字串重複呈現，一般 Labels 仍完整顯示。
4. **Given** 使用者建立或編輯 Issue，**When** 選擇 Type，**Then** 欄位仍提供選擇器，且選項名稱與有效類型的視覺語意和瀏覽頁面一致。

---

### User Story 2 - 辨識未設定或衝突的 Type (Priority: P1)

工程師遇到缺少 Type 或 Type 衝突的 Issue 時，可以從標籤呈現辨認異常，而不會把它誤認為正常的 Bug、Feature 或 Task。

**Why this priority**: 清楚呈現異常可避免使用者依錯誤分類安排工作，也支援後續修正。

**Independent Test**: 在各種承載 Type 標籤的頁面檢視缺少、多個或無效 `type:` Labels 的 Issue，確認異常狀態可辨識且沒有被誤標為有效類型。

**Acceptance Scenarios**:

1. **Given** Issue 缺少 Type，**When** 使用者查看 Type 呈現，**Then** 顯示明確的未設定狀態。
2. **Given** Issue 有多個或無效的 `type:` Labels，**When** 使用者查看 Type 呈現，**Then** 顯示明確的衝突狀態，且不任意選取其中一個作為有效 Type。

### Edge Cases

- 長標題、窄視窗或多個一般 Labels 不得遮住 Type 標籤或使其文字難以辨讀。
- 色彩不能是辨識 Bug、Feature、Task 或異常狀態的唯一線索。
- 某個頁面沒有可顯示的 Type 時，仍須保留該頁既有內容與操作，不得因標籤缺少而無法載入。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Issue 清單、Issue 詳情、Kanban 卡片、甘特圖列及其他呈現 Issue 的使用者介面 MUST 顯示統一的類型名稱：Bug、Feature、Task；標籤及建立／編輯表單的選項不得顯示 `type:` 前綴。
- **FR-002**: 相同 Issue Type MUST 在所有呈現位置使用一致的固定視覺語意；三種有效 Type 彼此可區分，且不只依賴顏色傳達差異。表單 MUST 保留適合輸入的選擇器。
- **FR-003**: Issue 清單、詳情、Kanban 卡片與甘特圖列 MUST 將 Type 標籤放在標題區，並置於 Repository、Assignee、日期等次要資訊之前；建立／編輯表單 MUST 將 Type 選擇器放在標題欄位之後、內容欄位之前。兩者均不得遮蔽 Issue 標題、一般 Labels 或該頁主要資訊。
- **FR-004**: 缺少 Type 或存在多個、無效 Type Labels 的 Issue MUST 顯示可辨認的異常狀態，不得呈現成有效類型。
- **FR-005**: Issue 的完整 Labels MUST 保持可辨識；Type Label 可用標準類型名稱呈現，且不得與 Type 標籤重複顯示。
- **FR-006**: Type 標籤與表單選項 MUST 在不同螢幕寬度與淺色、深色主題下保持可讀，長文字不得造成內容不可辨識。
- **FR-007**: 本功能 MUST 僅調整 Type 的呈現方式，不得改變 Gitea 作為 Issue Type 與 Labels 唯一資料來源的規則，也不得改變 Type 驗證與寫入行為。

### Key Entities _(include if data involved)_

- **Issue Type**：由 Gitea Label 推導出的單一有效類型，限 Bug、Feature 或 Task；缺少、重複或無效類型屬於異常狀態。
- **Type 標籤呈現**：在使用者介面中代表 Issue Type 的文字、樣式與位置；不另行保存 Issue Type 資料。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% 使用 Type 標籤或提供 Type 選擇的介面直接顯示 Bug、Feature 或 Task，不顯示 `type:` 前綴。
- **SC-002**: 同一有效 Type 在 100% 呈現位置使用相同的顯示名稱與視覺語意。
- **SC-003**: 使用者在 100% 缺少、衝突或無效 Type 的情境中，可將異常與三種有效 Type 區分。
- **SC-004**: 所有 Type 呈現情境在窄螢幕及淺色、深色主題下均可辨讀，且一般 Labels 不會因呈現 Type 而遺失。

## Assumptions

- Bug、Feature、Task 是既有的標準類型與使用者可見名稱；本功能不新增類型。
- 依 Type 固定配色，並搭配文字或其他非色彩線索辨識；異常狀態使用清楚的警示語意。
- 建立與編輯表單納入 Type 呈現一致性範圍，但仍使用適合輸入的選擇器，不改成唯讀標籤。
- Issue 清單與詳情仍完整呈現 Labels；Type Label 可由標準類型標籤取代原始 `type:*` 顯示。
