# Feature Specification: Priority 統一與跨頁呈現

**Feature Branch**: `012-priority-presentation`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: 統一 Priority 的設計與各頁面的呈現，使用 Storybook 和 UI/UX 設計指引規劃。

## User Scenarios & Testing

### User Story 1 - 為 Issue 指定標準 Priority (Priority: P1)

工程師建立或編輯 Issue 時，可從同一組四級 Priority 中選擇一級，並在儲存後於 Gitea Issue 上保留該級別。

**Why this priority**: Priority 若沒有共同值域，各 Repository 的工作就無法用一致語意判斷；建立及編輯是維持規範的入口。

**Independent Test**: 建立和編輯 Issues，分別選擇四級 Priority，重新載入後確認每筆 Issue 恰有一級且其他 Labels 未變。

**Acceptance Scenarios**:

1. **Given** 使用者建立 Issue，**When** 選擇 Critical、High、Medium 或 Low 並儲存，**Then** Issue 具有對應 Priority，且該值在重新載入後仍一致。
2. **Given** 使用者編輯已有 Priority 的 Issue，**When** 改選另一級並儲存，**Then** 新級別取代舊級別，其他非 Priority Labels 保留。
3. **Given** 使用者嘗試以缺漏或不支援的 Priority 儲存，**When** Portal 驗證資料，**Then** 儲存被拒絕並指出如何修正。

### User Story 2 - 在工作頁面快速辨識 Priority (Priority: P1)

工程師瀏覽 Issue 清單、Issue 詳情、Kanban 卡片或 Gantt 列時，可以用一致的文字與視覺樣式辨識 Priority；Storybook 展示這些頁面密度下的共用設計。

**Why this priority**: Priority 只有在工作者能於常用工作頁面快速讀取時，才能協助跨 Repository 排序及協作。

**Independent Test**: 使用包含四級 Priority、缺漏值及衝突值的虛構資料，比對 Storybook 案例及所有列出的工作頁面，確認同一級別文字、層級與異常狀態一致。

**Acceptance Scenarios**:

1. **Given** Issue 有一個有效 Priority，**When** 使用者在 Issue 清單、詳情、Kanban 或 Gantt 檢視它，**Then** 各處呈現相同 Priority 名稱與層級。
2. **Given** Issue 沒有有效 Priority 或同時具有多個 Priority，**When** 使用者檢視它，**Then** Portal 明確標示未設定或衝突，不以任一級別冒充有效值。
3. **Given** 設計者開啟 Storybook，**When** 切換四級、缺漏、衝突、淺色及深色案例，**Then** 可檢視共用 Priority 呈現與各頁面尺寸下的狀態。

### Edge Cases

- Gitea 上的 Priority Label 被刪除或 Issue 被直接改成零個或多個 Priority Labels 時，Portal 顯示未設定或衝突並提供修正入口，不自行改寫 Issue。
- 使用者沒有權限新增或更新 Gitea Priority Label 時，變更失敗並顯示錯誤；Portal 不得顯示未寫入 Gitea 的成功狀態。
- 一般 Labels 中含有未支援的 `priority:` 值時，Portal 將 Priority 標示為無效；儲存有效值時保留所有非 Priority Labels。
- 窄版面、鍵盤操作或淺色／深色主題下，名稱、層級及狀態仍可辨識，且不只依賴顏色。

## Requirements

### Functional Requirements

- **FR-001**: Portal MUST 提供且只提供 Critical、High、Medium、Low 四個 Priority 級別，並以此順序由高至低排列。
- **FR-002**: 建立及編輯 Issue MUST 要求使用者指定恰好一個有效 Priority；缺漏或不支援的值 MUST 阻止儲存並提供可理解的錯誤。
- **FR-003**: 成功建立或更新後，Issue MUST 在 Gitea 中具有恰好一個與所選級別相符的 Priority Label；其他非 Priority Labels MUST 保留。
- **FR-004**: Issue 清單、詳情、Kanban 卡片及 Gantt 列 MUST 使用一致的 Priority 名稱、層級與異常狀態呈現。
- **FR-005**: 沒有有效 Priority Label 的 Issue MUST 顯示未設定；具有多個有效 Priority Labels 或未知 `priority:` 值的 Issue MUST 顯示衝突或無效狀態，不得任選一級呈現為有效值。
- **FR-006**: Priority MUST 可在 Storybook 中獨立檢視四級、未設定、衝突／無效、表單及各工作頁面呈現案例，並可檢視淺色與深色主題。
- **FR-007**: Priority MUST 以文字呈現級別；色彩、圖示或其他視覺提示可作輔助，但 MUST NOT 成為唯一辨識方式。
- **FR-008**: Priority 資料 MUST 隨 Gitea Issue Label 讀寫；Portal MUST NOT 將 Priority 另存為 Issue mirror 或 Portal 自有持久資料。
- **FR-009**: 使用者無權限或 Gitea 寫入失敗時，Portal MUST 清楚回報失敗，且不得呈現尚未保存的 Priority 為成功結果。

### Key Entities

- **Priority**: Issue 的單一工作排序級別，值域為 Critical、High、Medium、Low。
- **Priority Label**: Gitea 上代表 Priority 的 Label；每個 Repository 的 Label 身分由該 Repository 管理，名稱對應至共用 Priority 值域。
- **Priority 呈現狀態**: Issue 上 Priority 有效、未設定、衝突或無效時，在各工作頁面呈現的名稱與狀態。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 建立與編輯流程都只允許四個標準級別，且每次成功儲存後 Gitea Issue 恰有一個有效 Priority Label。
- **SC-002**: Issue 清單、詳情、Kanban 及 Gantt 中 100% 的 Priority 呈現使用相同級別名稱與排序。
- **SC-003**: 所有未設定、衝突及無效 Priority 案例均能在四個工作頁面上與有效級別明確區分。
- **SC-004**: Storybook 可展示四級 Priority、表單、四種工作頁面、缺漏／衝突／無效狀態及淺色／深色主題。
- **SC-005**: 成功更新 Priority 後，所有其他非 Priority Labels 均維持不變；寫入失敗時不會回報成功。

## Assumptions

- 四級的標準 Label 名稱分別為 `priority:critical`、`priority:high`、`priority:medium`、`priority:low`；介面顯示繁體中文「緊急」、「高」、「中」、「低」。
- 使用者從 Portal 編輯 Issue 時，必須修正缺漏或衝突 Priority 才能完成儲存；直接在 Gitea 的變更會在 Portal 下一次讀取時反映。
- 本功能不包含舊資料批次遷移、Priority 篩選／排序功能，或自訂級別與每 Repository 各自設定的 Priority 對照。
- Storybook 是本功能指定的視覺設計與審閱入口；Story 使用虛構資料，不連線 Gitea。
