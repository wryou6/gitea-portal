# Feature Specification: Issue Type 規範

**Feature Branch**: `008-issue-types`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: 統一 Portal 管理的 Issue Type，讓透過 Portal 建立或編輯的 Issues 持續符合規範。

## Clarifications

### Session 2026-09-27

- Q: 不帶 `type:` 的 `bug`、`feature` 是否算標準 Type？ → A: 否；它們可繼續作為一般 Labels，只有 `type:bug`、`type:feature`、`type:task` 是標準 Type。

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 建立符合規範的 Issue (Priority: P1)

工程師透過 Portal 建立 Issue 時，選擇 Bug、Feature 或 Task 其中一種，讓新 Issue 從建立起就可依統一類型辨識。

**Why this priority**: 若新 Issue 仍可不帶類型建立，資料一致性會持續退化。

**Independent Test**: 嘗試不選 Type 建立 Issue，確認 Portal 阻止提交；選擇任一 Type 後建立，確認 Gitea Issue 帶有且只有該 Type。

**Acceptance Scenarios**:

1. **Given** 使用者建立 Issue，**When** 尚未選擇 Type，**Then** Portal 說明必須選擇一種 Type 並阻止提交。
2. **Given** 使用者選擇一種標準 Type，**When** 建立 Issue 成功，**Then** Gitea Issue 帶有對應 Type 且不帶其他 Type。

---

### User Story 2 - 維持或變更既有 Issue 類型 (Priority: P1)

工程師透過 Portal 編輯 Issue 時，可保留目前 Type 或明確改選另一種類型；其他 Labels 的編輯不會意外移除 Type。

**Why this priority**: Issue 的工作性質可能改變，但一般 Label 編輯不應讓 Issue 失去類型或同時取得互斥類型。

**Independent Test**: 編輯 Issue 的標題或一般 Labels 後確認 Type 保留，再切換 Type 並確認只留下新選類型；直接送出缺少或無效 Type 的更新時確認被拒絕。

**Acceptance Scenarios**:

1. **Given** Issue 已有一種標準 Type，**When** 使用者只修改其他欄位或一般 Labels，**Then** 原 Type 保留。
2. **Given** 使用者將 Type 改為另一種標準類型，**When** 儲存成功，**Then** Issue 只保留新選的 Type。
3. **Given** Issue 缺少或有多個 Type，**When** 使用者開啟編輯並選擇一種 Type，**Then** 儲存後 Issue 回到恰有一種標準 Type 的狀態。

### Edge Cases

- Gitea Issue 缺少 Type、帶多個 Type 或含無效 `type:` Label 時，清單與詳情仍可載入；Portal 編輯時要求使用者選定一種標準 Type 後才能儲存。
- Repository 尚未定義標準 Type Label，或目前使用者無權建立/套用 Label 時，Portal 不得回報 Issue 寫入成功。
- 儲存時 Issue 已被其他使用者更新，Portal 不得覆蓋其最新 Labels 或 Type，並要求使用者重新載入。
- 直接在 Gitea 建立或編輯 Issue 不經過 Portal 驗證，不屬於本功能的持續檢查範圍。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Issue Type MUST 限定為三種互斥類型：`type:bug`、`type:feature`、`type:task`；每一張符合規範的 Issue MUST 恰有其中一種。
- **FR-002**: `type:bug` MUST 用於描述既有行為錯誤、故障或與預期不符的工作；`type:feature` MUST 用於新增或改變產品能力；`type:task` MUST 用於文件、測試、維護、部署等以支援性工作交付為主的項目。
- **FR-003**: Portal 建立 Issue MUST 要求選擇一種標準 Type；缺少或無效 Type 時 MUST 拒絕建立並說明原因。
- **FR-004**: Portal 編輯 Issue MUST 保留目前唯一有效的 Type，並允許使用者改選另一種；Issue 缺少、重複或含無效 Type 時，使用者必須先選擇一種標準 Type 才能儲存。
- **FR-005**: Portal 的一般 Labels 編輯 MUST 不得移除 Type 或讓 Issue 帶有多個 Type；`type:` 前綴 MUST 由專用 Type 欄位管理，不得從一般 Labels 欄位新增或移除。不帶 `type:` 的 `bug`、`feature` MUST 視為一般 Labels，且 MUST NOT 被當成 Type。
- **FR-006**: Repository 缺少標準 Type Label 時，Portal MUST 在目前使用者有 Gitea Label 寫入權限的前提下建立或重用對應定義；權限不足或 Gitea 操作失敗時 MUST 回報失敗且不得宣稱 Issue 已更新。
- **FR-007**: Portal MUST 在 Issue API response 提供由 Labels 推導的 Type；恰有一個標準 Type 且沒有其他 `type:` Label 時回傳該類型，缺少、重複或含非標準 `type:` Label 時回傳未設定值並保留原始 Labels。
- **FR-008**: Portal 的 Issue 建立與一般編輯入口 MUST 套用 Type 驗證；留言、Board 狀態轉移等專用操作 MUST 保留現有 Type Labels，但不負責修復缺少或衝突的 Type。直接透過 Gitea UI 或其他 Gitea client 的操作不受此驗證約束。
- **FR-009**: Gitea MUST 持續作為 Issue Type 與 Labels 的唯一資料來源；Portal MUST NOT 建立 Issue Type 的獨立副本。
- **FR-010**: Issue 清單與詳情 MUST 顯示有效 Type；缺少或衝突 Type 時 MUST 顯示可辨識的異常狀態，並保留完整 Labels 供使用者判斷及修正。

### Key Entities _(include if feature involves data)_

- **Issue Type**：Issue 的單一主要工作類型，只能是 Bug、Feature 或 Task。
- **Issue**：由 Gitea 管理的工作項目，包含標題、內容、狀態與 Labels；Type 以標準 Type Label 表達。
- **標準 Type Label**：`type:bug`、`type:feature` 或 `type:task`，以 Gitea Repository Label 表達 Issue 的唯一主要類型。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 透過 Portal 建立表單或一般編輯表單成功新增／更新的 Issue 100% 恰有一種標準 Type。
- **SC-002**: 缺少、無效或多個 Type 的 Portal Issue 寫入 100% 被阻止，並提供可理解的原因。
- **SC-003**: 使用者只變更 Type 時，該 Issue 所有非 Type Labels 100% 保持不變。
- **SC-004**: Issue 清單、詳情與編輯流程對缺少或衝突 Type 的既有資料均提供可辨識且可修正的狀態。

## Assumptions

- `type:bug`、`type:feature`、`type:task` 是唯一有效的標準 Type Labels；不帶前綴的 `bug`、`feature` 可作一般 Labels。
- Type Label 定義為 Repository-scoped；Portal 可在使用者有權限時建立或重用，不將 Labels 複製到 Portal persistence。
- Issue Type 在 Portal 以 Gitea Labels 表達；直接操作 Gitea 的使用者不受 Portal 持續檢查約束。
