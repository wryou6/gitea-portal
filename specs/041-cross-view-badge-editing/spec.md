# Feature Specification: 三個工作檢視的 Badge 快速編輯

**Feature Branch**: `041-cross-view-badge-editing`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: 三個 view 中的狀態、優先級、類型 badge 可以點擊後更換，狀態的更換一樣要走正規流程。

## User Scenarios & Testing

### User Story 1 - 快速變更優先級與類型 (Priority: P1)

工程師在 Issue List、Kanban 或 Gantt 瀏覽 Issue 時，可以從優先級或類型 badge 開啟選單並選擇新值，快速修正工作排序與分類。

**Why this priority**: 三種工作檢視是日常查看和整理工作的主要入口，直接從 badge 編輯可減少離開檢視的操作。

**Independent Test**: 在三種檢視分別選擇不同優先級與類型，確認每次選取都保存成功，重新載入後值仍一致，其他 Issue 標籤不變。

**Acceptance Scenarios**:

1. **Given** 使用者在任一工作檢視看到有效優先級或類型 badge，**When** 點擊 badge 並選擇另一個有效值，**Then** Issue 更新為所選值並保留其他標籤。
2. **Given** Issue 的優先級或類型缺漏或衝突，**When** 使用者從異常 badge 選擇有效值，**Then** 該欄位修復為單一有效值，且其他標籤保留。
3. **Given** 儲存成功後 Issue 不再符合目前檢視篩選條件，**When** 檢視更新，**Then** Issue 依目前篩選結果顯示或消失。

---

### User Story 2 - 依既定流程變更狀態 (Priority: P1)

工程師在 Issue List 或 Gantt 點擊狀態 badge 後，可以選擇可用的狀態動作並完成既有原因與負責人確認流程。Kanban 維持拖曳卡片換欄的狀態操作方式。

**Why this priority**: 狀態會改變 Issue 開放／關閉情況，也可能要求轉交負責人；必須保留完整工作流程，避免只改標籤造成狀態與責任不一致。

**Independent Test**: 在 List 與 Gantt 以 badge 啟動有效狀態轉換，確認未完成既有流程前 Gitea 資料不變；確認後狀態及適用負責人符合該動作。另確認 Kanban 拖曳仍使用相同轉換流程。

**Acceptance Scenarios**:

1. **Given** Issue 狀態有效且存在可用動作，**When** 使用者在 List 或 Gantt 點擊狀態 badge 並確認動作，**Then** Issue 依既有原因、下一步及負責人規則轉換。
2. **Given** 使用者尚未確認狀態動作，**When** 使用者取消流程，**Then** Gitea 的狀態及負責人維持不變。
3. **Given** Issue 狀態異常或沒有適用動作，**When** 使用者查看或操作狀態 badge，**Then** Portal 清楚呈現不可轉換狀態，且不覆寫異常資料。
4. **Given** 使用者在 Kanban 拖曳 Issue 到另一狀態欄，**When** 完成既有轉換流程，**Then** 狀態結果與 List／Gantt badge 操作遵守相同規則。

### Edge Cases

- Issue 在選單開啟期間已於 Gitea 被更新時，Portal 不得覆蓋新資料，須回報衝突並重新載入實際資料。
- 使用者沒有修改 Issue 或標籤的 Gitea 權限，或 Gitea 寫入失敗時，Portal 必須回報失敗，不得顯示尚未保存的值為成功結果。
- 優先級／類型寫入失敗時，選單 MUST 保持開啟並顯示錯誤，讓使用者可重試或取消；badge MUST 維持 Gitea 實際保存值。
- 狀態轉換遇到權限不足、版本衝突或 Gitea 錯誤時，沿用既有錯誤回饋及恢復行為。
- 選單與 badge 必須可用鍵盤操作，且在窄螢幕、淺色及深色主題下仍可辨識。

## Requirements

### Functional Requirements

- **FR-001**: Issue List、Kanban 與 Gantt 的優先級及類型 badge MUST 可開啟候選值選單；選單 MUST 提供所有受支援的值，選定後立即提交變更。
- **FR-002**: 優先級 MUST 僅提供 Critical、High、Medium、Low；類型 MUST 僅提供 Bug、Feature、Task。有效值、缺漏值與衝突值都 MUST 能以選單選取有效值。
- **FR-003**: 成功變更優先級或類型 MUST 只替換對應欄位的標籤，保留其他 Gitea 標籤；Portal MUST 顯示 Gitea 已保存的結果。
- **FR-004**: Issue List 與 Gantt 的狀態 badge MUST 能啟動目前狀態可用的既有狀態動作流程；Kanban MUST 維持拖曳換欄的狀態操作，不新增卡片狀態 badge。
- **FR-005**: 狀態變更 MUST 經過既有原因、後續動作、負責人要求與確認規則；在確認前 MUST NOT 更新 Issue 狀態、標籤或負責人。
- **FR-006**: 狀態異常或沒有適用動作的 Issue MUST NOT 透過 badge 執行狀態變更，且異常 MUST 維持可辨識。
- **FR-007**: 所有變更 MUST 遵守目前使用者的 Gitea 權限、資料版本檢查與既有錯誤處理；衝突時 MUST NOT 覆蓋較新的 Gitea 資料。
- **FR-008**: 儲存成功後，各工作檢視 MUST 反映最新 Gitea 資料與目前篩選條件；失敗時 MUST 回報錯誤且不得呈現未保存結果為成功。
- **FR-009**: 新增的 badge 選單與狀態操作 MUST 可用鍵盤完成，且新增或修改的使用者可見文字 MUST 支援繁體中文、英文及日文。
- **FR-010**: Gitea MUST 持續是 Issue 狀態、優先級、類型與標籤的唯一資料來源；Portal MUST NOT 建立 Issue 資料副本或僅在 Portal 保存變更。

### Key Entities

- **Issue badge**：工作檢視中顯示 Issue 狀態、優先級或類型的互動入口；可編輯欄位依其既有固定值域管理。
- **狀態動作**：從目前狀態出發，包含原因、目標狀態、後續動作與可能的負責人變更之既有流程。
- **Gitea Issue**：狀態、優先級、類型與標籤的唯一持久資料來源。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 三種工作檢視中 100% 的優先級與類型 badge 均可開啟完整有效值選單，並可完成更新。
- **SC-002**: List 與 Gantt 的狀態 badge 及 Kanban 拖曳操作均遵守既有狀態轉換原因、負責人與確認規則；取消或確認前不會改變 Gitea Issue。
- **SC-003**: 儲存成功後重新載入，100% 顯示值與 Gitea 實際資料一致；發生權限或版本錯誤時，不會回報未保存變更成功。
- **SC-004**: 鍵盤使用者可完成 badge 選單操作；三種支援語系與窄螢幕下，選項、錯誤及目前值均可辨識。

## Assumptions

- 優先級值為 Critical、High、Medium、Low；類型值為 Bug、Feature、Task。
- 優先級及類型選取後立即保存，不另加確認步驟；狀態變更仍由既有流程確認。
- 優先級或類型保存失敗時，採用保留選單與重試入口的預設，並以 Gitea 讀回值呈現 badge。
- Kanban 的狀態由欄位表示，維持拖曳轉換，不在卡片新增狀態 badge。
- 本功能不改變既有 Gitea 權限、Status 定義、轉換理由、狀態資料格式或標籤保存方式。
