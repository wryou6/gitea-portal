# Feature Specification: Portal 中英日語系

**Feature Branch**: `014-multilingual-interface`
**Created**: 2026-09-27
**Status**: Draft
**Input**: User description: 為 Gitea Portal 提供繁體中文、英文與日文介面，讓使用者能切換語系並保留未來擴充能力；統一目前混用或不一致的產品用語，且固定 Workflow 在 Gitea 保持英文識別、Portal 依語系顯示翻譯。

## Clarifications

### Session 2026-09-27

- Q: 繁體中文介面應把產品中的 “Issue” 統一譯為「工作項目」、「議題」，還是保留 “Issue”？ → A: 原先選擇保留 “Issue”，後修正為「問題」以配合 Gitea 中文用語；英文與日文介面沿用 Gitea 對應語系的用語。
- Q: 若 Gitea 對相同概念已有中文、英文或日文用語，Portal 應採用哪個詞彙來源？ → A: 對應語系沿用 Gitea 用語；Gitea 沒有對應概念時才由 Portal 詞彙表定義。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 選擇並保留介面語系 (Priority: P1)

工程師可以在 Portal 設定中選擇繁體中文、英文或日文，讓主要操作介面使用自己熟悉的語言。再次開啟 Portal 或同一瀏覽器切換帳號時，各帳號仍看到自己的選擇。

**Why this priority**: 語系選擇是使用者取得多語介面的入口，也必須能在日常使用中保持一致。

**Independent Test**: 以不同帳號選擇不同語系，重新載入及切換帳號，確認各自的語系選擇恢復正確。

**Acceptance Scenarios**:

1. **Given** 使用者已登入並開啟設定，**When** 使用者選擇繁體中文、英文或日文，**Then** Portal 立即以所選語系顯示。
2. **Given** 使用者已為帳號選擇語系，**When** 使用者重新載入 Portal 或再次登入，**Then** Portal 保留該帳號的語系選擇。
3. **Given** 不同 Portal 帳號使用同一瀏覽器，**When** 各帳號選擇不同語系並切換帳號，**Then** 每個帳號只套用自己的選擇。
4. **Given** 使用者尚未選擇語系，**When** 使用者首次開啟 Portal，**Then** Portal 依瀏覽器語言選擇支援的語系；不支援時使用繁體中文。

### User Story 2 - 以所選語系操作 Portal (Priority: P1)

工程師瀏覽 Issue、Repository 工作區、跨庫看板及設定時，Portal 自有的導覽、欄位、操作、說明與狀態文字會使用所選語系，並以一致的詞彙呈現。

**Why this priority**: 只有主要操作流程完整一致地切換，使用者才能在不同頁面理解相同功能與狀態。

**Independent Test**: 分別選擇三種語系，走訪 Issue 列表與詳細資料、建立與編輯、Kanban、Gantt、工作區選擇器和設定頁，確認 Portal 自有文字完整切換且詞彙一致。

**Acceptance Scenarios**:

1. **Given** 使用者已選擇一種語系，**When** 使用者瀏覽 Portal 各主要頁面，**Then** Portal 自有的可見文字、表單訊息、無障礙標籤及載入／空白提示均以該語系呈現。
2. **Given** Issue 顯示固定 Type、Priority、Open/Closed 或工作狀態，**When** 使用者切換語系，**Then** Portal 顯示對應翻譯，而底層狀態識別與 Gitea Label 保持原值。
3. **Given** 使用者檢視日期、時間及數量，**When** 使用者切換語系，**Then** Portal 依所選語系格式化，且排程日曆日期不因格式化改變日期。

### User Story 3 - 保留 Gitea 內容與來源錯誤細節 (Priority: P2)

工程師以不同語系瀏覽 Portal 時，仍能看到 Gitea 中使用者或管理者建立的原始內容，並在發生錯誤時分辨 Portal 的說明與 Gitea 提供的原始細節。

**Why this priority**: 翻譯不能修改 Gitea 作為唯一資料來源的內容，也不能隱藏診斷錯誤所需的來源資訊。

**Independent Test**: 在 Gitea 建立含非英文標題、留言、Label 和自訂名稱的資料，切換 Portal 語系並觸發可辨識錯誤，確認資料原文及錯誤來源細節仍可讀。

**Acceptance Scenarios**:

1. **Given** Gitea Issue 含標題、描述、留言、Label、使用者名稱或自訂名稱，**When** Portal 切換語系，**Then** 這些來源資料保持原文。
2. **Given** Portal 顯示錯誤，**When** 錯誤由 Portal 產生，**Then** 說明使用所選語系；若另有 Gitea 原始錯誤細節，**Then** 細節仍以原文呈現。

### Edge Cases

- 瀏覽器語言為不支援的語系且使用者沒有已保存選擇時，Portal 使用繁體中文。
- 使用者偏好資料不存在、無效或瀏覽器無法保存時，Portal 仍可使用並採用瀏覽器語系預設；當次無法保存選擇時仍立即套用。
- 使用者尚未登入或登入資訊暫時不可用時，Portal 依瀏覽器語言呈現，不套用其他帳號的偏好。
- 固定 Workflow 狀態翻譯依穩定狀態識別值對應；缺少對應翻譯時保留該狀態的來源顯示名稱。
- 文字較長的語系在窄螢幕、表單、導覽及鍵盤／輔助技術操作下仍可辨識及使用。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Portal MUST 提供繁體中文、英文與日文三種介面語系，並提供可從使用者設定到達的語系選擇。
- **FR-002**: 使用者變更語系後，Portal MUST 立即套用選擇，並在後續載入時依目前 Portal 帳號恢復該選擇。
- **FR-003**: 尚未保存語系偏好時，Portal MUST 依瀏覽器語言選擇支援的語系；繁體中文、英文與日文的區域變體分別對應至 `zh-TW`、`en` 與 `ja`，其他語言 MUST 回退至 `zh-TW`。
- **FR-004**: 所有 Portal 自有的使用者可見文字 MUST 隨所選語系呈現，包括導覽、頁面標題、欄位、按鈕、提示、驗證訊息、Portal 錯誤、載入／空白狀態、無障礙文字及設定。
- **FR-005**: 固定 Issue Type、Priority、Issue Open/Closed 顯示名稱、Todo／In Progress／Done 狀態、狀態轉換原因與下一步動作 MUST 依所選語系顯示翻譯；Portal MUST 保留其穩定識別值及 Gitea Label 原值。
- **FR-006**: 日期、時間、數量及有複數變化的文字 MUST 依所選語系格式化；日期呈現 MUST 保持原日曆日期。
- **FR-007**: Issue 標題、描述、Comment 內容、Label 名稱、Repository／Board／Milestone 名稱、Assignee 名稱，以及 Gitea 或管理者設定的自訂文字 MUST 保留來源原文。
- **FR-008**: Portal 自有錯誤說明 MUST 以所選語系呈現；可用的 Gitea 原始錯誤細節 MUST 保留原文供使用者辨識或診斷。
- **FR-009**: 三種語系 MUST 使用一致的產品詞彙；Portal 與 Gitea 有相同概念時，MUST 沿用 Gitea 在該語系使用的詞彙；Gitea 沒有對應概念時，Portal MUST 以詞彙表指定唯一譯名，且相同概念在各頁面不得任意混用。
- **FR-010**: 語系切換不得變更登入狀態、Gitea Issue／Comment／Label／Assignee／Milestone 資料或 Workflow 狀態。
- **FR-011**: 語系選擇與三語介面 MUST 在支援的螢幕尺寸及鍵盤／輔助技術操作下維持可辨識及可操作。

### Key Entities *(include if feature involves data)*

- **語系偏好**：目前 Portal 帳號所選的 `zh-TW`、`en` 或 `ja`；尚未選擇時由瀏覽器語言決定。
- **產品詞彙**：Portal 概念與三種語系之標準顯示名稱，供各功能一致使用。
- **固定 Workflow 狀態**：Todo、In Progress、Done 的穩定識別與 Gitea 英文 Label；Portal 顯示名稱依語系呈現，不改變 Gitea 資料。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可在兩次操作內到達語系設定並選擇語系；選擇後目前頁面立即切換，不需重新登入或手動重新載入。
- **SC-002**: 三種語系均可完成 Issue 檢視、建立、編輯、留言、工作區切換、Kanban／Gantt 檢視與設定操作，且這些流程的 Portal 自有文字沒有缺漏或混用其他語系文案。
- **SC-003**: 同一瀏覽器中 100% 的已保存帳號語系選擇在重新載入及帳號切換後恢復正確；無偏好或不支援瀏覽器語言時均呈現繁體中文。
- **SC-004**: 切換語系前後，Gitea Issue、Comment、Label、Assignee、Milestone 與 Workflow 狀態值均保持一致；日期格式化前後代表同一日曆日期。
- **SC-005**: Portal 自有錯誤說明依所選語系呈現，且存在的 Gitea 原始錯誤細節不被翻譯或丟棄。
- **SC-006**: 所有與 Gitea 共用的產品概念在繁體中文、英文與日文介面均使用 Gitea 對應語系的詞彙；Portal 專屬概念在各頁面使用詞彙表指定名稱。

## Assumptions

- 語系選擇屬於個人顯示偏好，依目前瀏覽器中的 Portal login 分別保存，不跨瀏覽器或裝置同步。
- 首次選擇依瀏覽器語言；使用者明確選擇後，以保存的選擇優先於瀏覽器設定。
- Portal 與 Gitea 共用的產品概念沿用 Gitea 各語系的既有用語；Issue 的繁中用語為「問題」。只有 Gitea 沒有對應詞的 Portal 專屬概念才由三語詞彙表定義。
- 最上層導覽區塊的英文產品詞固定為 `Global navigation`，其他語系依 Portal 詞彙表呈現。
- Portal 現有固定 Workflow 為 Todo、In Progress、Done；Gitea 端繼續使用固定英文識別，Portal 只依語系翻譯顯示名稱及轉換原因。
- Gitea 是 Issue、Comment、Label、Assignee、Milestone 與狀態的唯一資料來源；語系功能只改變呈現，不建立資料副本或伺服器端偏好資料。
- 初始產品以支援三種語系為目標，未保存選擇時的通用回退語系為繁體中文；未來增加語系時須明確登錄支援並提供相應詞彙。
