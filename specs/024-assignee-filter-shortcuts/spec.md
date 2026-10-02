# Feature Specification: 負責人快速篩選

**Feature Branch**: `024-assignee-filter-shortcuts`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "篩選負責人的預設是自己，三個頁面都是，下面多兩個快速方便用按鈕，一個是點下去負責人直接指定成自己，另一個是按下去變成所有負責人"

## Clarifications

### Session 2026-10-02

- Q: 預設自己與所有負責人的篩選網址應如何區分？ → A: 直接開啟且缺少 assignee 的網址代表所有負責人；Portal 產生的預設檢視連結帶 `assignee=me`，讓收件者各自看到自己的 Issue；使用者點「所有負責人」時移除 assignee 參數。
- Q: 自己快捷操作及下拉選擇實際負責人時，網址要如何表示？ → A: 自己快捷操作使用特殊值 `assignee=me`；從下拉選單選到實際負責人時使用其 login；所有負責人由缺少 assignee 表示，不使用明確的 `assignee=all` URL 值。
- Q: 已有選取值時如何更換下拉選單中的負責人？ → A: 使用真正的下拉選單；展開時直接顯示可選負責人，不要求先清空目前選取值。將「自己／所有負責人」快捷按鈕與指定負責人選單編排為清楚且可響應式換行的同一區塊。

## User Scenarios & Testing

### User Story 1 - 預設查看自己的工作 (Priority: P1)

工程師透過 Portal 的預設檢視連結開啟 Issues List、Kanban 或 Gantt 時，負責人篩選預設為目前登入者；直接開啟缺少 assignee 的網址時則顯示所有負責人。

**Why this priority**: Portal 預設檢視聚焦個人工作；無參數分享連結維持所有負責人的完整結果。

**Independent Test**: 從 Portal 的預設檢視連結開啟 All repos 與 Repository 工作區的三種檢視，確認套用 `me`；再直接開啟沒有 assignee 的 URL，確認涵蓋所有負責人。

**Acceptance Scenarios**:

1. **Given** 使用者透過 Portal 預設檢視連結進入工作檢視，**When** 連結帶有 `assignee=me`，**Then** 篩選目前登入者的 Issue。
2. **Given** 已登入且直接開啟缺少 assignee 的網址，**When** 開啟 Issues List、Kanban 或 Gantt，**Then** 不限制負責人且結果包含所有負責人的 Issue。
3. **Given** 使用者切換 List、Kanban 與 Gantt，**When** 檢視延續相同工作區篩選，**Then** 目前負責人條件持續生效。
4. **Given** 使用者清除全部篩選，**When** 篩選重設，**Then** 負責人回到目前登入者，其他條件回到各自預設值。

### User Story 2 - 快速切換負責人範圍 (Priority: P1)

工程師可在負責人篩選下方使用「自己」與「所有負責人」按鈕，快速切換結果範圍。

**Why this priority**: 快速查看自己工作或全團隊工作是高頻操作，不應要求使用者手動輸入或清除負責人。

**Independent Test**: 在三種檢視各自點選兩個按鈕，確認只改變負責人條件，其他條件保留，且結果立即更新。

**Acceptance Scenarios**:

1. **Given** 任一工作檢視已有篩選條件，**When** 使用者點選「自己」，**Then** 負責人改為目前登入者，其他篩選條件不變。
2. **Given** 任一工作檢視已有篩選條件，**When** 使用者點選「所有負責人」，**Then** 負責人條件移除，其他篩選條件不變，結果包含所有負責人的 Issue。
3. **Given** 使用者鍵盤操作篩選區，**When** 移至快速按鈕並啟用，**Then** 兩個操作均可使用鍵盤完成，且目前選擇可由輔助科技辨認。
4. **Given** 使用者要設定優先級、類型或狀態，**When** 點選該組其中一個選項，**Then** 篩選立即切換到該單一選項，且目前選擇可由輔助科技辨認。

### User Story 3 - 分享及還原負責人篩選 (Priority: P2)

工程師可分享目前工作檢視網址；重新開啟時，`me` 會解析為收件者本人，實際 login 會保持指定負責人，而缺少 assignee 條件表示所有負責人。

**Why this priority**: 工作檢視網址可分享；個人捷徑可以個人化解析，指定 login 的連結則保留精確目標。

**Independent Test**: 分別以 `assignee=me`、實際 login 及缺少 assignee 建立網址，在新分頁開啟並確認收件者本人、指定負責人及所有負責人三種結果。

**Acceptance Scenarios**:

1. **Given** 網址明確指定 `assignee=me`，**When** 不同使用者開啟連結，**Then** 負責人依各自登入者解析。
2. **Given** 網址沒有 assignee 條件，**When** 使用者開啟或重新整理連結，**Then** 負責人條件為所有負責人，且網址不需要 `assignee=all`。
3. **Given** 網址明確指定目前登入者以外的負責人，**When** 使用者開啟連結，**Then** 指定的負責人條件保留。

### Edge Cases

- All repos 與單一 Repository 工作區均使用相同的預設及快速切換行為。
- 快速切換負責人不得清除優先度、類型、狀態、Repository、Label 或 Milestone 條件。
- 快速切換只篩選 Gitea 提供的 Issue，不得修改 Issue 指派或其他 Gitea 資料。
- 使用者快速切換後，零筆符合結果仍須呈現為正常篩選結果，不得呈現為載入錯誤。

## Requirements

### Functional Requirements

- **FR-001**: Issues List、Kanban 與 Gantt MUST 將缺少 assignee 的網址解析為所有負責人；Portal 產生的預設檢視連結 MUST 使用 `assignee=me` 讓目前登入者看到自己的 Issue。
- **FR-002**: 三種工作檢視 MUST 在負責人篩選下提供「自己」與「所有負責人」兩個快速操作。
- **FR-003**: 「自己」操作 MUST 將負責人篩選設為特殊值 `me`；「所有負責人」操作 MUST 移除負責人條件並從網址移除 assignee 參數。
- **FR-004**: 快速操作 MUST 僅變更負責人篩選，並保留其餘有效篩選條件。
- **FR-005**: 負責人條件變更 MUST 立即更新目前檢視結果與可分享網址。
- **FR-006**: 網址缺少 assignee 條件時 MUST 還原為所有負責人；`assignee=me` MUST 解析為目前登入者；明確指定實際 login 時 MUST 還原該負責人。
- **FR-007**: 清除全部篩選 MUST 將負責人重設為目前登入者並序列化為 `assignee=me`，其餘條件重設為各自預設值。
- **FR-008**: 快速操作 MUST 可透過鍵盤使用，且目前選擇 MUST 有適當的輔助科技名稱及狀態。
- **FR-009**: 新增或修改的使用者可見文字 MUST 支援繁體中文、英文與日文。
- **FR-010**: 本功能 MUST 僅改變檢視範圍，不得寫入或持久保存 Gitea Issue 指派變更。
- **FR-011**: 負責人標籤、快速操作與直接 login 輸入 MUST 組成清楚的單一篩選區；窄版 MUST 依序換行且不得產生水平捲動。
- **FR-012**: 指定負責人 MUST 使用可直接展開顯示候選人的下拉選單；更換選擇時不需先清除目前值。
- **FR-013**: 「自己」或「所有負責人」是預設範圍時，單獨選取該範圍 MUST NOT 啟用「清除篩選」；其他有效篩選或明確指定 login 仍可啟用清除操作。
- **FR-014**: 優先級、類型與狀態 MUST 以可直接點選的互斥選項按鈕呈現，並包含「全部」選項；更新任一組 MUST 保留其他篩選，且目前選擇 MUST 可由輔助科技辨認。

### Key Entities

- **負責人篩選**：工作檢視目前採用的負責人範圍，可為目前登入者、所有負責人，或使用者明確指定的負責人。
- **工作檢視網址**：可還原工作區、檢視及有效篩選條件的連結狀態。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 在 Portal 預設檢視連結的 All repos 與 Repository 工作區 List、Kanban、Gantt 六種組合中均套用 `me`；直接開啟無 assignee 的網址均顯示所有負責人的結果。
- **SC-002**: 使用者可透過一次啟用「自己」或「所有負責人」按鈕完成範圍切換，且其他篩選條件保持不變。
- **SC-003**: 三種工作檢視間切換或重新開啟分享網址後，`me` 解析為收件者本人、實際 login 保留指定負責人，且缺少 assignee 解析為所有負責人。
- **SC-004**: 所有支援語系中的快速操作均可辨認，並能透過鍵盤及輔助科技使用。
- **SC-005**: 優先級、類型與狀態均可在不開啟下拉選單的情況下直接選取；切換各組時其他篩選值不變，並可透過鍵盤操作及辨識選取狀態。

## Assumptions

- 目標使用者已登入 Portal，且 Portal 已取得目前登入者身分。
- 「三個頁面」指 Issues List、Kanban、Gantt，並適用於 All repos 及 Repository 工作區。
- Portal 產生的預設檢視連結以 `assignee=me` 套用目前登入者；直接缺少 assignee 的網址表示所有負責人；實際 login 表示固定負責人；所有負責人不輸出 `assignee=all`。
- 快速操作只改變負責人條件；清除全部篩選將負責人重設為 `me`，其餘條件重設為各自預設值。
- 當負責人為 `me` 或 `all` 且沒有其他有效篩選時，清除按鈕保持停用。
- Gitea 仍是 Issue 與 Assignee 的唯一資料來源；本功能不修改 Gitea 資料。
