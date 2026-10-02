# Feature Specification: 日期格式統一

**Feature Branch**: `026-date-format-standardization`
**Created**: 2026-10-02
**Status**: Draft
**Input**: User description: "所有的日期顯示方式都想要統一 YYYY/MM/DD HH:MM or YYYY/MM/DD 然後要用 24 小時制；不想要看到年月日這些字。"

## Clarifications

### Session 2026-10-02

- Q: 日期格式的窄螢幕驗收要涵蓋哪些寬度？ → A: 本次不進行窄螢幕驗收；使用者將窄螢幕檢查排除於本 feature 範圍。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 快速辨識日期與時間 (Priority: P1)

Portal 使用者在 Issue 清單、Issue 詳情、留言及工作檢視中查看日期時，希望日期一律以數字呈現，能快速比較日期，也不受目前選用的介面語系影響。

**Why this priority**: 日期遍及日常 Issue 工作流程；一致的數字格式可減少辨識年月日順序和 12／24 小時制的負擔。

**Independent Test**: 在三種支援語系中查看 Issue 建立／更新時間、留言時間與排程日期，確認相同日期值使用相同格式，且資料代表的日期與時間不變。

**Acceptance Scenarios**:

1. **Given** 使用者檢視一筆有排程日期的 Issue，**When** Portal 顯示開始日或截止日，**Then** 日期顯示為 `YYYY/MM/DD`，只包含數字與斜線。
2. **Given** 使用者檢視 Issue 建立、更新或留言時間，**When** Portal 顯示 timestamp，**Then** 顯示為 `YYYY/MM/DD HH:MM`，只包含數字、斜線與冒號，使用 24 小時制及瀏覽器本地時區。
3. **Given** 使用者切換 zh-TW、en 或 ja，**When** 檢視上述日期或時間，**Then** 日期格式不隨介面語系改變，其他介面文案仍依選用語系顯示。
4. **Given** 使用者檢視甘特圖或日期欄位，**When** Portal 顯示明確日期值，**Then** 該值採用統一格式；甘特圖精簡月份／日刻度及原生日期輸入框維持既有呈現。

---

### Edge Cases

- 日期-only 值在不同瀏覽器時區檢視時，仍須顯示相同日曆日期。
- timestamp 跨越午夜或夏令時間切換時，日期時間依瀏覽器本地時區顯示，並維持 24 小時制。
- 缺少或無效的日期值沿用所在欄位既有的未設定、無效日期或錯誤呈現，不得顯示成看似有效的日期。
- 甘特圖精簡刻度是明確的例外；其日期工具提示與無障礙日期名稱若呈現完整日期，仍使用統一數字格式。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Portal MUST 將自行呈現的日期-only 值格式化為 `YYYY/MM/DD`，且不得在日期字串中顯示「年」、「月」、「日」等文字。
- **FR-002**: Portal MUST 將自行呈現的日期時間格式化為 `YYYY/MM/DD HH:MM`，且不得在日期時間字串中顯示年月日文字或 12 小時制標記。
- **FR-003**: 日期時間 MUST 以瀏覽器本地時區呈現；日期-only 值 MUST 保留其原日曆日期，不因時區轉換而跨日。
- **FR-004**: 日期字串 MUST 不依 zh-TW、en、ja 語系改變；其他使用者可見文案仍依目前選用語系顯示。
- **FR-005**: 格式規則 MUST 套用於 Portal 自行顯示的 Issue、Comment、排程及其他明確日期值，包括完整日期的工具提示與無障礙名稱。
- **FR-006**: 甘特圖精簡月份／日刻度與原生日期輸入框 MUST 保留既有呈現方式。
- **FR-007**: 日期格式化 MUST 僅影響顯示，不得變更 Gitea 日期資料、Issue 行為或 Portal 持久資料。
- **FR-008**: 缺失或無效日期 MUST 保留所在欄位既有的未設定、無效或錯誤處理，不得格式化為有效日期。

### Key Entities *(include if data is involved)*

- **日期-only 值**：代表不含時間的日曆日期，例如排程開始日與截止日。
- **日期時間值**：代表含時區語意的時間點，例如 Issue 與 Comment 的建立時間。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 所有範圍內的日期-only 顯示值均符合 `YYYY/MM/DD`，且不含年月日文字。
- **SC-002**: 所有範圍內的日期時間顯示值均符合 `YYYY/MM/DD HH:MM`，採 24 小時制且不含 AM／PM。
- **SC-003**: 在 zh-TW、en、ja 三種語系下，相同日期資料的日期字串完全一致；介面其他文案仍可依語系切換。
- **SC-004**: 日期-only 值在 UTC 以西與以東的瀏覽器時區均顯示相同日曆日期。

## Assumptions

- 「Portal 日期顯示」包含 Portal 自行渲染的明確日期值，不包含甘特圖為了可讀性保留的精簡刻度，也不包含瀏覽器原生日期輸入框。
- 日期時間沿用目前瀏覽器本地時區行為；本功能不改變時間點或資料來源。
- zh-TW、en、ja 的非日期介面文案仍維持各自翻譯。
- 本 feature 不驗收窄螢幕可讀性；固定日期字串在窄螢幕的裁切或換行風險未驗證，若日後重新納入該驗收，須補做窄螢幕檢查。
