# Feature Specification: Issue 排程日期呈現改善

**Feature Branch**: `011-issue-schedule-presentation`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: 使用 Storybook 與 UI/UX 設計指引，改善畫面中的 Start date 與 Due date 呈現；不要向使用者暴露 start date 以 Gitea Label 保存的內部實作。

## Clarifications

### Session 2026-09-27

- Q: 哪些畫面要納入日期呈現調整？ → A: Issue 清單、詳情、Kanban、Gantt，以及建立與編輯表單等所有日期欄位。
- Q: 日期未設定時要如何呈現？ → A: 個別顯示「未設定」，讓缺少哪個日期清楚可見。
- Q: 日期標籤與格式要採用什麼？ → A: 使用「開始」與「到期」短標籤，日期格式統一為 `YYYY/MM/DD`。

## User Scenarios & Testing

### User Story 1 - 跨畫面辨識 Issue 排程日期 (Priority: P1)

工程師瀏覽 Issue 清單、Issue 詳情、Kanban 卡片或 Gantt 列時，可以快速找到開始日期與到期日期，並以一致的短標籤和日期格式理解排程。

**Why this priority**: 日期是安排及追蹤工作的核心資訊；跨畫面一致呈現可避免誤讀或漏看排程。

**Independent Test**: 使用包含兩個日期、單一日期及無日期的 Issues，逐一檢視清單、詳情、Kanban 與 Gantt，確認日期欄位、格式及缺值狀態一致。

**Acceptance Scenarios**:

1. **Given** Issue 設有開始日期及到期日期，**When** 使用者在任一 Issue 或 Board 畫面檢視該 Issue，**Then** 兩個日期都以「開始」或「到期」標籤及 `YYYY/MM/DD` 格式呈現。
2. **Given** Issue 只設定其中一個日期，**When** 使用者查看 Issue 或 Gantt，**Then** 已設定日期清楚可見，另一日期標示「未設定」；Gantt 依現有規則呈現單日項目。
3. **Given** Issue 未設定任一日期，**When** 使用者查看 Issue 或 Board，**Then** 兩個欄位均標示「未設定」，Gantt 將 Issue 放在未排程區。
4. **Given** Issue 的排程日期無效或互相矛盾，**When** 使用者查看 Issue 或 Gantt，**Then** 日期異常仍有清楚提示，不會被呈現為有效日期區間。

### User Story 2 - 設定日期而不暴露內部資料格式 (Priority: P1)

工程師建立或編輯 Issue 時，可以從清楚命名的日期欄位設定或清除開始日期及到期日期；在一般 Labels 呈現中不會看到用來保存開始日期的內部 Label 字串。

**Why this priority**: 使用者需要以日期概念管理排程，不應被 Gitea 的內部保存格式干擾或誤當成一般 Label。

**Independent Test**: 建立或編輯日期後檢視 Issue 清單、詳情及 Board，確認日期以排程欄位呈現、內部 Label 字串不出現在一般 Label 區，其他 Labels 仍可辨識。

**Acceptance Scenarios**:

1. **Given** 使用者建立或編輯 Issue，**When** 查看日期欄位，**Then** 欄位使用「開始日期」與「到期日期」名稱，且允許分別設定或清除日期。
2. **Given** Issue 帶有開始日期，**When** 使用者查看一般 Labels，**Then** 不會看見代表開始日期的原始 Gitea Label 字串，而日期仍透過開始日期欄位呈現。
3. **Given** Issue 同時有一般 Labels 與排程日期，**When** 使用者查看 Issue 或 Board，**Then** 一般 Labels 保持可辨識，排程日期不會以原始 Label 格式重複顯示。

### Edge Cases

- 只設定開始日期或只設定到期日期時，保留已設定日期並明確呈現另一欄未設定。
- 兩個日期皆未設定時，仍顯示兩個未設定狀態；Gantt 維持未排程呈現。
- 日期無效、重複或先後順序矛盾時，維持可辨識的異常狀態，不把原始內部 Label 格式當作日期文字展示。
- 長 Issue 標題、窄視窗、鍵盤操作或淺色／深色主題下，日期與異常資訊仍須可讀取。
- 一般 Label 名稱不得因隱藏內部排程 Label 而被一併隱藏。

## Requirements

### Functional Requirements

- **FR-001**: Issue 清單、Issue 詳情、Kanban 卡片及 Gantt 列 MUST 以一致方式呈現開始日期與到期日期。
- **FR-002**: 日期呈現 MUST 使用「開始」與「到期」標籤，以及 `YYYY/MM/DD` 日期格式；建立與編輯表單的欄位 MUST 使用「開始日期」與「到期日期」標籤。
- **FR-003**: 任一日期未設定時，該日期欄位 MUST 顯示「未設定」；一個日期已設定時，不得隱去另一個未設定狀態。
- **FR-004**: 一般 Labels 呈現 MUST 隱藏用來表示開始日期的內部 Label 原始字串；對應日期 MUST 由排程日期欄位呈現，其他一般 Labels MUST 保持可見。
- **FR-005**: Gantt MUST 延續既有規則：兩個有效日期顯示日期區間，單一有效日期顯示單日項目，無日期列於未排程區，無效或矛盾日期標示異常。
- **FR-006**: 日期呈現 MUST 保留現有 Gitea 日期讀取與寫入行為；本功能 MUST NOT 改變日期來源、保存方式或 Issue 排程資料。
- **FR-007**: 日期、缺值與異常狀態 MUST 在窄視窗、鍵盤瀏覽及淺色與深色主題下保持可辨識，且不得只依賴顏色傳達狀態。
### Key Entities

- **Issue 排程日期**：Issue 的可選開始日期與可選到期日期；日期值沿用既有 Gitea 資料，不由本呈現功能另行保存。
- **排程日期呈現狀態**：雙日期、單日期、無日期或日期異常在各 Issue 與 Board 畫面中的文字及視覺呈現。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% 的 Issue 清單、詳情、Kanban 與 Gantt 日期呈現位置使用相同的「開始」／「到期」語意與 `YYYY/MM/DD` 格式。
- **SC-002**: 100% 未設定日期的情境在對應欄位明確顯示「未設定」，且不會被誤認為已設定日期。
- **SC-003**: 所有一般 Label 呈現位置均不顯示開始日期的原始內部 Label 字串；其他一般 Labels 維持可見。
- **SC-004**: 雙日期、單日期、無日期及日期異常四類排程狀態均能在 Issue 與 Board 畫面中辨識，並在窄視窗、鍵盤操作及淺色／深色主題下保持可讀。
- **SC-005**: 日期呈現調整前後，重新載入顯示的日期與 Gitea 實際保存值一致，且呈現操作不新增或修改排程資料。

## Assumptions

- 開始日期與到期日期是日曆日期，不帶時間；顯示格式採 `YYYY/MM/DD`。
- 未設定的開始日期與到期日期各自顯示「未設定」，不合併成單一摘要。
- Gitea 仍是 Issue 排程日期的唯一來源；一般 Label 區只呈現一般用途 Labels，不展示開始日期的內部 Label 格式。
- 本功能只調整日期欄位及其可見呈現，不改變日期驗證、Gantt 篩選、Issue 權限或 Gitea 寫入規則。
- Gantt 日期區間、單日項目、未排程及異常的資料行為沿用既有 Issue 排程功能。
