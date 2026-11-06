# Feature Specification: Issue 排程日期與甘特圖

**Feature Branch**: `005-issue-scheduling-gantt`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: 支援 Issue start date，讓團隊能在 Board 中使用甘特圖規劃工作。

## Clarifications

### Session 2026-09-26

- Q: Start date 與甘特圖日期資料應如何保存？ → A: Start date 保存為 Gitea Issue Label；Gitea due date 作為排程結束日。
- Q: 甘特圖應放在哪個工作入口？ → A: 放在既有 Board，讓使用者切換 Kanban 與甘特圖。
- Q: 甘特圖預設顯示哪些負責人與 Issue 狀態？ → A: 預設只顯示目前使用者負責的 Issues；可切換負責人，並可篩選 Open 與 Closed。
- Q: 甘特圖應涵蓋多少筆符合條件的 Issue？ → A: 載入所有分頁，不設固定筆數上限。
- Q: Issue 只有 start date 或 due date 時應如何呈現？ → A: 將已設定的日期作為單日項目呈現，不寫回或推測修改 Gitea 資料。
- Q: 甘特圖中的 Issue 如果同時沒有 start date 和 due date，應該怎麼呈現？ → A: 列在圖表下方的「未排程」區，不畫日期區間。
- Q: start date 的 Gitea Label 應採什麼命名與建立方式？ → A: 使用 `start-date:YYYY-MM-DD`；Portal 依登入者權限建立或重用 Repository Label 定義；清除 Issue 日期時保留未使用的定義。

## User Scenarios & Testing

### User Story 1 - 為 Issue 設定排程日期 (Priority: P1)

工程師建立或編輯 Issue 時，可以設定 start date 與 due date，並在 Issue 清單及詳情辨識日期。Start date 屬於 Gitea Issue 的 Label 資料；due date 使用 Gitea 的原生 Issue 日期。

**Why this priority**: 甘特圖需要持久且可從 Gitea 重新讀取的 Issue 日期，否則排程會在重新載入或改用 Gitea 時消失。

**Independent Test**: 在有權限的 Repository 建立或編輯 Issue，設定及清除兩個日期，再從 Portal 與 Gitea 重新查看，確認日期與 Labels 一致。

**Acceptance Scenarios**:

1. **Given** 使用者可建立 Issue，**When** 建立 Issue 時設定 start date 與 due date，**Then** 日期保存到該 Gitea Issue，重新載入後仍顯示相同日期。
2. **Given** 使用者可修改 Issue，**When** 設定或清除 start date，**Then** Portal 更新代表 start date 的 Gitea Label，且保留 Workflow 與其他 Labels。
3. **Given** 使用者可修改 Issue，**When** 設定或清除 due date，**Then** Portal 更新或移除 Gitea 原生 due date，重新載入後反映 Gitea 的實際值。
4. **Given** 使用者沒有對應 Gitea 寫入權限，**When** 使用者設定日期，**Then** Portal 顯示拒絕或失敗，不宣稱日期已保存，也不使用較高權限身分代為寫入。

---

### User Story 2 - 在 Board 甘特圖檢視排程 (Priority: P1)

工程師可以在既有 Board 切換至甘特圖，檢視 Board Repository 範圍內可存取 Issues 的排程起訖日期。每筆 Issue 均能以 Repository、Issue number 與標題辨識，並能開啟 Issue 詳情。

**Why this priority**: 團隊需要在既有共享 Board 的 Repository 範圍中查看跨 Repository 時間安排，不必另外維護一份 Issue 清單。

**Independent Test**: 建立包含多個 Repository、不同日期及不同狀態的 Board，切換甘特圖並確認每個符合篩選條件的 Issue 都有正確且可辨識的排程列。

**Acceptance Scenarios**:

1. **Given** Board 包含具有 start date 與 due date 的 Issues，**When** 使用者切換至甘特圖，**Then** 每筆 Issue 顯示從 start date 到 due date 的日期區間。
2. **Given** Issue 只有其中一個日期，**When** 使用者查看甘特圖，**Then** 該 Issue 以該日期的單日項目呈現，且檢視行為不修改 Gitea Issue。
3. **Given** Board 中符合條件的 Issues 超過 100 筆，**When** 甘特圖載入，**Then** 顯示所有分頁中的符合 Issues，不靜默截斷結果。
4. **Given** 甘特圖載入任一必要 Repository 或 Issue 分頁失敗，**When** 使用者查看結果，**Then** Portal 顯示載入錯誤，不把不完整結果呈現為完整 Board。

---

### User Story 3 - 篩選負責人與 Issue 狀態 (Priority: P2)

工程師可以依負責人及 Open／Closed 狀態調整甘特圖內容。初次開啟時只載入目前使用者負責的 Issues，並可切換為其他負責人或所有負責人。

**Why this priority**: 團隊成員先看到自己的排程，同時仍能查看其他負責人的工作與已結束項目。

**Independent Test**: 使用不同負責人及狀態的 Issues 開啟甘特圖，確認預設結果、負責人切換及 Open／Closed 篩選都符合所選條件。

**Acceptance Scenarios**:

1. **Given** 使用者有權查看自己與其他人負責的 Issues，**When** 首次開啟 Board 甘特圖，**Then** 預設只顯示目前使用者負責的 Issues。
2. **Given** 使用者選擇其他負責人或所有負責人，**When** 篩選完成，**Then** 甘特圖更新為符合所選負責人且使用者有權查看的 Issues。
3. **Given** Board 中同時有 Open 與 Closed Issues，**When** 使用者切換狀態篩選，**Then** 甘特圖只顯示所選狀態，且狀態切換不會修改 Issue。

### Edge Cases

- 日期必須是有效的日曆日期；start date 晚於 due date 時，Portal 不可繪製成有效排程，並應顯示可辨識的日期錯誤。
- Start date 的 Gitea Label 格式錯誤或同一 Issue 有多個 start date Labels 時，Portal 不可任選其中一個日期；應標示需要修正。
- 建立日期 Label 定義遭 Gitea 拒絕時，Portal 不可更新該 Issue 的 start date，且不得宣稱日期已保存；清除 Issue 日期時不刪除未使用的 Repository Label 定義。
- 僅有一個日期時使用該日作為單日項目，僅屬甘特圖呈現計算，不得由讀取流程回寫或補齊 Gitea 日期。
- 沒有 start date 與 due date 的 Issue 列在甘特圖下方的「未排程」區，不畫日期區間，也不會因沒有排程日期而從 Board 甘特圖結果中消失。
- Gitea Label 建立或日期更新遭拒、發生併發變更或 Gitea 無法回應時，Portal 應顯示實際失敗，不得顯示未保存的日期。
- 同一 Board 不同 Repository 可以有相同 Issue number；甘特圖列必須同時顯示 Repository 與 Issue number。
- 窄視窗或鍵盤操作時，甘特圖的日期、Issue 身分與必要操作仍須可取得；圖表需有可讀取的替代清單。

## Requirements

### Functional Requirements

- **FR-001**: Portal MUST 允許使用者在建立與編輯 Issue 時設定有效的 start date 與 due date；兩者皆可分別清除。
- **FR-002**: Start date MUST 保存為 `start-date:YYYY-MM-DD` Gitea Issue Label；若 Repository 尚無該日期的 Label 定義，Portal MUST 依目前使用者權限建立並重用；清除日期時 MUST 保留未使用的 Repository Label 定義。日期讀取與更新 MUST 以 Gitea 為唯一來源，不得保存 Issue 日期副本於 Portal persistence。
- **FR-003**: 日期 Label 的建立、套用與移除 MUST 遵守目前使用者的 Gitea 權限；Portal MUST NOT 以更高權限身分代替使用者完成操作。
- **FR-004**: 更新或清除 start date MUST 保留 Workflow Labels 與其他一般 Labels；日期 Label 由日期欄位管理，編輯一般 Labels 時 MUST 保留目前日期 Label；Issue list/detail MUST 持續顯示完整 Gitea Labels。
- **FR-005**: Due date MUST 讀取及更新 Gitea Issue 的原生 due date，並作為甘特圖排程的結束日期。
- **FR-006**: Board MUST 以不同 URL 提供 Kanban 與甘特圖頁面，並可在兩種頁面之間導覽；甘特圖只涵蓋該 Board Repository 範圍內、目前使用者可讀取的 Issues。
- **FR-007**: 甘特圖 MUST 預設只顯示目前使用者負責的 Issues，並允許篩選所有負責人或指定負責人；Open 與 Closed 狀態 MUST 可分別篩選，預設兩者皆顯示。
- **FR-008**: 甘特圖 MUST 載入所有符合條件的 Gitea 分頁，不得設定固定 Issue 筆數上限；必要分頁讀取失敗時 MUST 顯示載入錯誤，不得靜默顯示部分結果為完整資料。
- **FR-009**: Start date 與 due date 都有效且順序正確時，甘特圖 MUST 顯示完整日期區間；只設定其中一個日期時 MUST 顯示該日的單日項目，且 MUST NOT 修改 Gitea 資料。
- **FR-010**: Start date 格式錯誤、多個 start date Labels 或 start date 晚於 due date 時，甘特圖 MUST 明確標示日期異常，不得將其畫成有效區間。
- **FR-011**: 甘特圖 MUST 讓使用者以 Repository、Issue number 與 Title 辨識 Issue，並提供前往 Issue detail 的入口。
- **FR-012**: 甘特圖 MUST 支援鍵盤操作及可讀取的替代 Issue／日期清單，並在窄視窗維持必要資訊可用。
- **FR-013**: 日期欄位、篩選或甘特圖載入失敗時，Portal MUST 顯示錯誤與實際保存結果；不得把未成功的操作呈現為成功。
- **FR-014**: Issue 編輯 MUST 傳回讀取時的 Gitea `updatedAt`；若 Issue 在讀取後已於 Gitea 變更，Portal MUST 在任何寫入前以衝突錯誤拒絕整筆更新，避免舊表單覆蓋併發 Label 或欄位變更。

### Key Entities

- **Issue Schedule**: 由一個可選 start date（以 `start-date:YYYY-MM-DD` Gitea Label 表示）與一個可選 Gitea due date 組成的日期安排；不代表 Portal 擁有或鏡像 Issue。
- **Scheduled Issue**: Board Repository 範圍內、使用者有權查看且具備有效排程日期的 Gitea Issue。
- **Unscheduled Issue**: 缺少 start date 與 due date 的 Gitea Issue；列於甘特圖下方的「未排程」區，不畫日期區間。
- **Schedule Filter**: 甘特圖的負責人與 Open／Closed 狀態篩選條件。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 使用者設定或清除日期後，重新載入 Portal 可見的日期與 Gitea Issue 實際保存值一致。
- **SC-002**: 對 Board 中所有符合負責人、狀態及 Repository 條件的 Issues，甘特圖均有對應的日期列、單日項目或明確的日期狀態；不因超過 100 筆而遺漏。
- **SC-003**: 甘特圖的負責人與狀態篩選結果 100% 符合使用者所選條件及其 Gitea 可見權限。
- **SC-004**: 所有無效或互相矛盾的排程日期都能與有效時間區間明確區分；單日期推算不會改變 Gitea Issue。
- **SC-005**: 使用鍵盤及 375 px 窄視窗仍可辨識 Issue、日期與必要的查看操作，且日期資訊有非 Canvas 的可讀替代呈現。
- **SC-006**: Gitea 權限拒絕、併發變更或服務錯誤時，0 次未成功日期更新會被呈現為已成功。

## Assumptions

- 日期採日期而非時間點語意，Portal 不因瀏覽器時區改變所選日曆日期。
- Gitea 是 Issue、Label、Assignee、狀態與 due date 的唯一 Source of Truth；Board JSON 結構與 Issue persistence 邊界維持不變。
- 甘特圖預設顯示 Open 與 Closed Issues，並以目前登入者作為預設負責人篩選值。
- 使用者設定 start date 需要能依其 Gitea 權限建立或更新 `start-date:YYYY-MM-DD` Label；建立/重用後的 Repository Label 定義即使無 Issue 使用仍保留。讀取時推算單日項目則不需任何寫入權限。
- 本功能不包含 Issue dependency links、拖曳改期、資源工時分配或獨立日期資料庫。
- 沒有任何日期的 Issue 顯示於「未排程」區，不畫日期區間。
