# Feature Specification: Hide Workflow Labels on Board Cards

**Feature Branch**: `003-board-card-label-display`

**Created**: 2026-09-21

**Status**: Draft

**Input**: User description: "Board 畫面中的 Card 不需要特別顯示 Workflow Label；狀態由所在欄位表示，保留一般 Labels。"

## Clarifications

### Session 2026-09-21

- Q: Board 載入時，`visibleLabels` 的計算與既有 Workflow 自動修復行為應如何區分？ → A: `visibleLabels` 計算本身絕不修改資料，但既有 Workflow 自動修復仍可依原規則寫回 Gitea。
- Q: 這個 feature 是否需要新增正式的 Board 載入效能目標？ → A: 不新增正式效能目標；沿用既有載入行為與無額外 Gitea round trip 的限制。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 以欄位辨識工作狀態 (Priority: P1)

工程師在跨 Repository Board 查看工作項目時，可以直接透過 Card 所在的欄位辨識 Workflow 狀態，不需要在 Card 內容中再次閱讀代表相同狀態的 Workflow Label。

**Why this priority**: Board 的主要用途是快速瀏覽與管理工作狀態；移除重複資訊可以降低 Card 視覺雜訊。

**Independent Test**: 準備包含不同 Workflow 狀態的 Board，開啟 Board 後確認每個 Card 的欄位仍正確代表狀態，且 Card 不顯示該 Board Convention 的 Workflow Labels。

**Acceptance Scenarios**:

1. **Given** Card 擁有該 Board Convention 的 Workflow Label，**When** 使用者開啟 Board，**Then** Card 顯示於對應狀態欄位，但 Card 的 Label 區域不顯示該 Workflow Label。
2. **Given** Board 有多個 Workflow 狀態欄位，**When** 使用者瀏覽空欄位或有 Card 的欄位，**Then** 欄位名稱仍清楚顯示狀態，不依賴 Card 上的 Workflow Label。

---

### User Story 2 - 保留一般工作分類資訊 (Priority: P1)

工程師在 Board Card 上仍可看到 Bug、Priority、Team 等非 Workflow Labels，以便在不開啟 Issue 詳情的情況下掌握工作分類。

**Why this priority**: 隱藏 Workflow Label 不應降低跨 Repository 工作管理所需的分類資訊。

**Independent Test**: 準備同時具有 Workflow Label 與多個一般 Label 的 Issue，開啟 Board 後確認一般 Labels 完整顯示，而 Workflow Label 不顯示。

**Acceptance Scenarios**:

1. **Given** Card 同時擁有 Workflow Label 與一般 Labels，**When** Card 出現在 Board，**Then** 所有非 Workflow Labels 顯示，Workflow Label 不顯示。
2. **Given** Card 沒有任何非 Workflow Label，**When** Card 出現在 Board，**Then** 不顯示空的 Label 區域。

---

### User Story 3 - 需要完整資料時回到 Issue 詳情 (Priority: P2)

工程師需要檢查 Issue 的完整 Labels 或底層 Gitea 資料時，可以開啟 Issue 詳情或前往原始 Gitea Issue，不會因 Board Card 的簡化呈現而失去資料。

**Why this priority**: Board 是工作管理的簡化入口，不取代 Issue 詳情或 Gitea 原始頁面。

**Independent Test**: 從 Board 開啟同一張 Card 的 Issue 詳情與原始 Gitea Issue，確認完整 Workflow Labels 與其他 Labels 仍可查看。

**Acceptance Scenarios**:

1. **Given** Board Card 隱藏了 Workflow Label，**When** 使用者開啟 Portal Issue detail，**Then** Issue detail 仍顯示完整 Labels。
2. **Given** 使用者前往原始 Gitea Issue，**When** 查看 Issue Labels，**Then** Gitea 中實際保存的 Workflow Labels 與一般 Labels 都不受影響。

### Edge Cases

- Card 沒有任何非 Workflow Labels 時，Label 區域不顯示空白容器或誤導性的「無 Label」資訊。
- Card 的 Workflow 自動修復失敗或仍處於狀態衝突時，Card 仍顯示異常欄位與可理解的修復錯誤；不因隱藏 Workflow Label 而隱藏錯誤狀態。
- Card 擁有其他非本 Board Convention 的 Labels 時，這些 Labels 不被當成本 Board 狀態重複資訊而任意刪除；它們是否屬於一般分類資訊，依其是否為本 Board Convention 的 Label 判斷。
- Board 所選 Workflow Convention 的狀態名稱或 Label 命名格式改變時，顯示行為仍依該 Convention 的定義判斷，不依賴固定文字前綴。
- 隱藏 Label 只影響 Board Card 呈現；`visibleLabels` 計算不得觸發 Label 新增、刪除、替換或其他 Issue mutation。既有 Workflow 自動修復若因缺失或衝突而執行，仍可依原規則更新 Gitea Workflow Labels。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Board Card MUST 不顯示屬於該 Board 所選 Workflow Convention 的 Workflow Labels。
- **FR-002**: Board Card MUST 顯示該 Issue 所有不屬於該 Board Workflow Convention 的 Labels。
- **FR-003**: Board MUST 以 Card 所在的 Workflow 欄位表達工作狀態；隱藏 Workflow Label 不得造成狀態資訊遺失。
- **FR-004**: Portal MUST 依 Board 所選 Workflow Convention 的 Label 定義辨識要隱藏的 Labels，不得依賴固定 prefix、Label 顯示文字或硬編碼狀態名稱猜測。
- **FR-005**: Card 沒有任何可顯示的一般 Label 時，Portal MUST 隱藏空的 Label 區域。
- **FR-006**: Workflow 自動修復成功、失敗或狀態衝突的 repair annotation 與錯誤資訊 MUST 仍可在 Board Card 上辨識。
- **FR-007**: Board Card 的 `visibleLabels` 計算與顯示 MUST 僅改變呈現，不得因本功能修改 Gitea Issue 的 Labels、狀態或其他資料；既有 Workflow 自動修復若因缺失或衝突而執行，仍可依既有規則更新 Gitea Workflow Labels。
- **FR-008**: Issue list 與 Issue detail MUST 維持完整 Labels 的顯示，不套用 Board Card 的 Workflow Label 隱藏規則。
- **FR-009**: Portal MUST 提供從 Board Card 前往 Portal Issue detail 或原始 Gitea Issue 的既有方式，以查看完整 Labels。
- **FR-010**: 不同 Workflow Convention 的 Labels 若存在於 Issue 中，Portal MUST 不因 Board Card 顯示規則刪除或修改這些 Labels；本需求只定義該 Board 所選 Convention 的顯示隱藏範圍。

### Key Entities

- **Board Card View**: Board 中代表實際 Gitea Issue 的呈現資料，包含欄位狀態、Repository、Issue number、Title、Assignee、可顯示 Labels 與修復結果資訊。
- **Workflow Convention**: 定義 Board 狀態欄位及其對應 Workflow Labels 的規則。
- **Gitea Issue Labels**: Issue 在 Gitea 中實際保存的完整 Labels；Board Card 的隱藏不會改變這組資料。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 在所有已載入的 Board Cards 中，屬於所選 Workflow Convention 的 Labels 皆不出現在 Card 的 Label 區域。
- **SC-002**: 在所有同時具有一般 Labels 的 Board Cards 中，100% 的非 Workflow Labels 都可被使用者辨識。
- **SC-003**: 在包含 Workflow Label 的 Board 載入案例中，使用者可僅依欄位名稱辨識 Card 的 Workflow 狀態，不需要查看 Card Label 區域。
- **SC-004**: 在 Workflow 狀態已有效、且只驗證 Board Card 呈現的案例中，`visibleLabels` 規則不造成任何 Gitea Label 新增、刪除或替換；缺失或衝突狀態的既有 Workflow 自動修復行為不受本功能改變。
- **SC-005**: Issue list、Issue detail 與原始 Gitea Issue 的完整 Labels 在功能調整前後保持可查看且內容一致。
- **SC-006**: 沒有可顯示一般 Labels 的 Card 不會出現空白 Label 容器，且不影響 Card 的 Repository、Issue number、Title、Assignee 或錯誤資訊辨識。
- **SC-007**: 自動修復失敗或狀態衝突的 Card 在隱藏 Workflow Labels 後，使用者仍能辨識異常狀態與修復原因。

## Assumptions

- Board 已選定一個有效的 Workflow Convention，且既有 Board load 已能判斷 Card 的 Workflow 狀態。
- Board Card 顯示規則只影響 Board 畫面；Portal Issue list/detail 與 Gitea 原始頁面維持完整資料呈現。
- 不新增獨立 Label metadata、Issue snapshot、Board 權限資料或其他持久化資料。
- Workflow Label 的實際 prefix 或 namespace 仍由 Workflow Convention 定義，不在本需求中固定命名格式。
- 使用者需要完整 Label 資訊時，透過既有 Issue detail 或原始 Gitea Issue 連結查看。
- 本 feature 不新增獨立效能目標；Board 載入行為維持既有水準，呈現規則不得增加額外 Gitea round trip。
