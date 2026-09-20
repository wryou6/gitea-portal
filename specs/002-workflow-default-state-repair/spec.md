# Feature Specification: Workflow Default State Repair

**Feature Branch**: `002-workflow-default-state-repair`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Board 載入時自動修復未設定與衝突 Workflow 狀態；預設狀態取 Convention 的最小 order；修復失敗保留異常並提示；空的未設定狀態與狀態衝突欄位不顯示。"

## Clarifications

### Session 2026-09-20

- Q: Board 載入時，Portal 是否要等所有異常 Issue 的自動修復嘗試完成後，再一次顯示 Board？ → A: 等待所有修復嘗試完成後再呈現 Board；成功卡片進入預設欄位，失敗卡片保留異常並顯示錯誤。
- Q: 自動修復失敗後，異常 Card 是否仍應允許使用者手動拖曳到有效的 Workflow 欄位？ → A: 允許手動拖曳；若 Gitea 仍拒絕，保留原異常狀態並顯示錯誤。
- Q: 當 Board 載入時 Gitea 發生錯誤，Portal 是否應區分「無法讀取 Issue」與「已讀取 Issue 但修復失敗」兩種情況？ → A: 無法讀取 Issue 時回傳整體外部服務錯誤；已讀取 Issue 但單一修復失敗時，保留該 Card 的異常狀態與錯誤，其他 Card 繼續呈現。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 自動補上預設 Workflow 狀態 (Priority: P1)

團隊成員開啟共享 Board 時，沒有 Workflow Label 的 Issue 應自動被設定為該 Workflow Convention 的預設狀態，使 Board 不再留下未設定工作項目。

**Why this priority**: 未設定狀態會阻斷 Kanban 工作管理；自動補上預設狀態是本功能的核心價值。

**Independent Test**: 準備一筆沒有該 Convention Workflow Label 的 Gitea Issue，載入 Board 後重新查看該 Issue，確認 Gitea 已保存預設 Workflow Label，且 Card 顯示在預設欄位。

**Acceptance Scenarios**:

1. **Given** Issue 沒有任何 Board Convention Workflow Label，**When** 使用者載入包含該 Repository 的 Board，**Then** Portal 將 Issue 的工作狀態設定為 Convention 中 `order` 最小的狀態，並在預設欄位顯示 Card。
2. **Given** Issue 同時具有一般 Labels 與沒有 Workflow Label，**When** Board 載入觸發修復，**Then** 一般 Labels 保留，且只新增預設 Workflow Label。
3. **Given** 使用者只查看 Issue list 或 Issue detail，**When** Portal 讀取 Issue，**Then** Portal 不因該讀取流程自動修改 Workflow Labels。
4. **Given** Board 包含需要修復的 Issue，**When** 使用者載入 Board，**Then** Portal 等待所有修復嘗試完成後再呈現 Board；成功修復的 Card 直接顯示於預設欄位，修復失敗的 Card 保留於異常欄位並顯示錯誤原因。

---

### User Story 2 - 修復 Workflow 狀態衝突 (Priority: P1)

團隊成員開啟 Board 時，若 Issue 被直接從 Gitea 套用多個同一 Convention 的 Workflow Labels，Portal 應將其收斂為預設狀態，避免 Board 長期存在衝突 Card。

**Why this priority**: 直接操作 Gitea 是允許的正常使用方式；Portal 必須能從外部異動恢復一致的工作狀態。

**Independent Test**: 準備一筆同時具有兩個同 Convention Workflow Labels 的 Gitea Issue，載入 Board 後確認原 Workflow Labels 被替換為單一預設 Label，且一般 Labels 不受影響。

**Acceptance Scenarios**:

1. **Given** Issue 具有兩個以上同一 Convention 的 Workflow Labels，**When** 使用者載入 Board，**Then** Portal 移除這些 Workflow Labels，保留一般 Labels，並設定預設 Workflow Label。
2. **Given** Issue 具有其他非該 Board Convention 的 Labels，**When** Portal 判定並修復狀態，**Then** 這些 Labels 不被視為衝突，也不被移除。
3. **Given** 外部使用者從 Gitea 造成狀態未設定或衝突，**When** 使用者下一次載入 Board，**Then** Portal 重新依目前 Gitea 資料執行修復，不依賴 Portal 內部 Issue snapshot。

---

### User Story 3 - 修復失敗時保留真實狀態 (Priority: P1)

當 Portal 沒有足夠的 Gitea 權限、預設 Label 不存在，或 Issue 在修復期間被其他人修改時，使用者應看到明確的修復失敗原因，而不是看到 Portal 假裝已套用預設狀態。

**Why this priority**: Gitea 是唯一 Source of Truth；修復失敗時若只改變畫面，會讓使用者誤以為工作狀態已寫入 Gitea。

**Independent Test**: 以無 Label 寫入權限的帳號、缺少預設 Label 的 Repository，或並行修改案例載入 Board，確認原始 Labels 不被靜默覆蓋，Card 保留異常狀態並顯示原因。

**Acceptance Scenarios**:

1. **Given** 使用者無法修改 Repository Labels，**When** Board 嘗試修復異常 Issue，**Then** Gitea Labels 不變，Card 保留在未設定或衝突欄位，並顯示權限拒絕原因。
2. **Given** Convention 的預設 Label 尚未存在於 Repository，**When** Board 嘗試修復，**Then** Portal 不自動建立 Label，Card 保留異常狀態並顯示缺少 Label 的原因。
3. **Given** Issue 在 Portal 讀取後、修復前被其他使用者修改，**When** Portal 執行修復，**Then** Portal 拒絕覆蓋較新的 Gitea 資料，Card 顯示並行修改原因。
4. **Given** Board 中只有部分 Issue 修復失敗，**When** Board 載入完成，**Then** 已成功修復的 Issue 正常顯示，失敗的 Issue 個別保留異常並顯示錯誤，不影響其他 Card。
5. **Given** Card 的自動修復失敗，**When** 使用者將 Card 手動拖曳到有效的 Workflow 欄位，**Then** Portal 嘗試將對應 Workflow Label 寫入 Gitea；成功時 Card 移至目標欄位，失敗時保留原異常狀態並顯示錯誤。
6. **Given** Issue 已成功從 Gitea 讀取，但該 Issue 的 Workflow Label 修復寫入或驗證失敗，**When** Board 載入完成，**Then** 該 Card 保留異常狀態並顯示個別錯誤，其他已成功讀取的 Card 繼續呈現。
7. **Given** Board 所需的 Issue 或 Repository 資料無法從 Gitea 讀取，**When** 使用者載入 Board，**Then** Portal 回報整體外部服務錯誤，不呈現該次不完整的修復結果，也不將任何 Issue 偽標記為已修復。

---

### Edge Cases

- Convention 沒有任何狀態或狀態 `order` 無法唯一決定最小值時，該 Convention 設定無效，Board 不執行自動修復。
- 預設 Label 不存在時，Portal 不自動建立 Repository Label，也不移除原有 Labels。
- Issue 同時有一般 Label 與多個 Workflow Labels 時，只替換該 Convention 的 Workflow Labels。
- Board 的「未設定狀態」與「狀態衝突」沒有 Card 時不顯示；一般 Workflow 欄位即使沒有 Card 仍保留，以便拖曳操作。
- Board 載入期間若 Board 所需的 Issue 或 Repository 資料無法從 Gitea 讀取，Portal 顯示整體外部服務錯誤，不呈現該次不完整結果，也不將 Issue 誤標記為已修復。
- Board 載入期間若 Issue 已成功讀取但該 Card 的 Label 修復寫入或驗證失敗，Portal 將錯誤附在該 Card，並繼續呈現其他已成功讀取的 Card。
- Board 載入期間，Portal 應在呈現 Board 前完成所有修復嘗試；單一 Card 的修復失敗不得阻止其他 Card 完成修復並一併呈現。
- 自動修復失敗的 Card 仍可接受使用者明確的手動拖曳修復；手動操作失敗時不得偽造成功狀態或遺失原異常資訊。
- 同一 Issue 被多個 Board 載入時，各 Board 依其 exact Workflow Convention 判定；不建立 Portal 狀態副本。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Portal MUST 僅在載入共享 Board 時，檢查並修復該 Board 所選 exact Workflow Convention 的未設定或衝突狀態。
- **FR-002**: Portal MUST 將 Convention 中 `order` 最小的狀態視為唯一預設狀態；Convention MUST 具有至少一個狀態且不得有重複 `order`。
- **FR-003**: Issue 沒有該 Convention Workflow Label 時，Portal MUST 保留所有非 Workflow Labels，並將預設 Workflow Label 寫入對應的 Gitea Issue。
- **FR-004**: Issue 具有多個該 Convention Workflow Labels 時，Portal MUST 只移除該 Convention 的 Workflow Labels，保留所有其他 Labels，並寫入單一預設 Workflow Label。
- **FR-005**: Portal MUST 透過一次可驗證的 Label replacement 完成狀態修復，不得使用可能留下部分結果的 remove-then-add 流程。
- **FR-006**: Portal MUST 在修復前確認使用者具有對應 Repository 的 Label 修改權限；Portal MUST NOT 使用高於目前使用者 Gitea 權限的身份修復。
- **FR-007**: Portal MUST 在修復前確認 Issue 仍符合讀取時的版本與 Label 條件；若資料已被修改，Portal MUST 拒絕覆蓋並保留 Gitea 最新資料。
- **FR-008**: 修復成功後，Portal MUST 重新讀取 Gitea Issue，並依最新資料呈現預設 Workflow 狀態。
- **FR-009**: 修復失敗時，Portal MUST NOT 偽造預設狀態或靜默修改畫面狀態；Card MUST 保留未設定或狀態衝突呈現，並提供個別可理解的失敗原因。
- **FR-010**: Board MUST 能在已成功讀取的 Issue 中，部分 Card 修復失敗時繼續呈現其他成功修復或原本正常的 Card；若 Board 所需的 Issue 或 Repository 資料無法讀取，Portal MUST 回報整體外部服務錯誤。
- **FR-011**: Issue list 與 Issue detail 的一般讀取 MUST NOT 觸發本功能的自動 Workflow Label 修復。
- **FR-012**: 空的「未設定狀態」與「狀態衝突」欄位 MUST 不顯示；一般 Workflow 狀態欄位即使為空 MUST 保留為可放置 Card 的欄位。
- **FR-013**: Portal MUST 不因本功能建立獨立 Issue、Issue snapshot、Board owner/member 或其他取代 Gitea Source of Truth 的資料。
- **FR-014**: Portal MUST 不自動建立缺少的 Workflow Label；缺少預設 Label 時必須保留異常狀態並回報原因。
- **FR-015**: Portal MUST 支援使用者在修復失敗後重新載入 Board 再次嘗試，且每次嘗試都以當下 Gitea 資料為準。
- **FR-016**: Portal MUST 在 Board 呈現前完成該次載入所觸發的所有 Workflow Label 修復嘗試；成功修復的 Card MUST 以重新讀取的 Gitea 資料呈現於預設欄位，失敗的 Card MUST 保留異常狀態並顯示個別錯誤。
- **FR-017**: 自動修復失敗的 Card MUST 仍可由使用者明確拖曳至有效 Workflow 欄位；Portal MUST 嘗試將目標 Workflow Label 寫入 Gitea，成功時呈現目標狀態，失敗時保留原異常狀態並顯示錯誤。

### Key Entities

- **Workflow Convention**: 具有 exact identity、版本、狀態集合、Label 名稱與排序；最小 `order` 狀態是該 Convention 的預設狀態。
- **Board Card**: 代表真實 Gitea Issue，包含目前 Workflow 狀態與可選的修復失敗原因。
- **Workflow Repair Result**: Board 載入時對單一 Issue 的修復結果，表示成功、未修復的異常狀態與失敗原因，不獨立保存為 Issue 資料。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 在預設 Label 存在且使用者有 Label 修改權限的驗證案例中，100% 的未設定 Issue 在一次 Board 載入後顯示於預設狀態欄位，且 Gitea Issue 具有該 Label。
- **SC-002**: 在預設 Label 存在且使用者有 Label 修改權限的驗證案例中，100% 的衝突 Issue 在一次 Board 載入後只保留一個該 Convention Workflow Label，且一般 Labels 完整保留。
- **SC-003**: 所有修復失敗案例中，Gitea 原始 Labels 不被靜默覆蓋，且使用者能在對應 Card 上辨識失敗原因。
- **SC-004**: Board 載入後，沒有 Card 的「未設定狀態」與「狀態衝突」欄位不出現在畫面；一般 Workflow 欄位仍可接受 Card。
- **SC-005**: Issue list 與 Issue detail 的讀取驗證案例不產生 Workflow Label mutation，且顯示資料仍與 Gitea 一致。
- **SC-006**: 使用者可在 3 秒內辨識 Board 中哪些 Card 已成功修復、哪些 Card 因權限、Label 或並行修改而未修復。
- **SC-007**: Board 每次載入完成時，所有該次修復嘗試都已結束；成功修復的 Card 不會先以異常欄位呈現後再移動，失敗的 Card 則可在同一畫面辨識其異常與原因。
- **SC-008**: 每個自動修復失敗的 Card 都可被使用者手動嘗試移動；手動操作成功時 Gitea 只保留目標 Workflow Label，操作失敗時原始 Gitea Labels 與異常呈現維持不變。

## Assumptions

- Workflow Convention 的狀態排序是有效且唯一的；不新增額外 `defaultStateKey` 欄位。
- 自動修復只發生在 Board 載入，不發生於 Issue list/detail。
- 使用者只能修復其 Gitea 帳號本身具有 Label 修改權限的 Repository。
- 預設 Workflow Label 必須預先存在於 Repository；Portal 不負責建立 Repository metadata。
- Gitea Issue 仍是唯一 Source of Truth；Portal 僅在明確的 Board 載入流程中對真實 Gitea Issue 執行修復。
- 行動裝置專用互動與完整批次修復管理不在本 feature 範圍內。
