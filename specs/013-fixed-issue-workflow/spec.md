# Feature Specification: 固定 Issue 工作流

**Feature Branch**: `013-fixed-issue-workflow`
**Created**: 2026-09-27
**Status**: Implemented
**Input**: User description: 將支援多套 Workflow Convention 的設計簡化為所有 Repository 共用的固定三狀態工作流，透過轉換原因標籤決定下一步動作，並以 Gitea Assignee 順序表示經手名單與目前負責人。

## Clarifications

### Session 2026-09-27

- Q: 舊 Convention 的 Issue 狀態要如何映射到固定三狀態？ → A: 完全依 Gitea 原生狀態映射：Open → Todo、Closed → Done；不保留舊狀態標籤所代表的 In Progress 語意。
- Q: Done → Done 是否允許操作？ → A: 允許修正結案原因，並指定下一步動作。
- Q: Done → Done 的下一步動作應如何指定？ → A: 由原因固定映射；「修正結案原因」固定顯示「確認結案資訊」。
- Q: 固定狀態與轉換原因的 Gitea Label 要用什麼命名方式？ → A: Label 使用穩定英文 key，Portal 顯示繁體中文名稱；例如 `workflow:todo`、`workflow:in-progress` 與 `workflow-action:start-work`。Done 只使用 Gitea Closed 狀態。
- Q: 哪些轉換原因需要選擇新的負責人？ → A: 明確改派時必須選人；「開始處理」時若尚無 Assignee 也必須指派；「送交審查」可選審查者但不強制；其他原因保留原第一位 Assignee。
- Q: Gitea Assignees 順序需要改變時，如何讓 Gitea 保存指定順序？ → A: 先清空既有 Assignees，再依完整目標順序寫回所有人員。本機 Gitea 實測三人順序可跨多次讀取及重複清空／寫回維持一致；直接用相同人員但不同順序更新不會重排。
- Q: 既有 Issue 和舊 Convention 要如何處理？ → A: 既有 Issues 是 dummy data，於本次實作時直接隨機分配到 Todo、In Progress、Done，並同步設定 Gitea Open／Closed；全部更新並驗證成功後刪除舊 Labels 和 Convention。不保留舊狀態對照紀錄，也不另做 Portal 遷移嚮導。
- Q: Portal 建立新 Issue 時的初始狀態為何？ → A: 一律建立為 Gitea Open，並加上 `workflow:todo` Label。
- Q: 「等待外部回覆」時如何指定內部跟進人？ → A: 內部跟進人就是目前負責人；沿用目前 Assignees 第一位，不另存角色或要求額外選人。
- Q: 本次要重新設計哪些既有主要畫面？ → A: Issue 列表、Kanban、Gantt；沿用 UI Styling 與 UI/UX Pro Max 的設計流程，並以 Storybook stories 呈現三個畫面。

## User Scenarios & Testing

### User Story 1 - 以固定狀態檢視工作 (Priority: P1)

工程師在任一 Repository 使用相同的 Todo、In Progress、Done 工作狀態，不需要選擇或設定 Workflow Convention。Issue 的 Gitea 開啟／關閉狀態與狀態標籤共同表達工作狀態。

**Why this priority**: 統一狀態是移除多套工作流程設定及減少跨 Repository 操作差異的核心價值。

**Independent Test**: 在至少兩個 Repository 查看處於三種狀態的 Issue，確認 Portal 使用相同狀態與順序，且更新後 Gitea 保存相同狀態。

**Acceptance Scenarios**:

1. **Given** 使用者可存取任一 Repository 的 Issue，**When** Issue 是 Todo 或 In Progress，**Then** Gitea Issue 保持 Open，且恰有一個固定工作狀態標籤表達其狀態。
2. **Given** 使用者把 Issue 移到 Done，**When** 轉換成功，**Then** Gitea Issue 為 Closed，且 Portal 顯示 Done。
3. **Given** 使用者在不同 Repository 查看 Issue，**When** Portal 判定其工作狀態，**Then** 使用相同三狀態語意，不受 Repository 或 Board 的 Convention 設定影響。
4. **Given** 使用者透過 Portal 建立 Issue，**When** 建立成功，**Then** Gitea Issue 為 Open 且包含 `workflow:todo`，Portal 顯示「待辦」。
5. **Given** 使用者開啟 Issue 列表、Kanban 或 Gantt，**When** 在桌面或窄螢幕檢視，**Then** 三個畫面使用一致的狀態／版面語彙並能清楚操作；每個畫面都有 Storybook story。

### User Story 2 - 以轉換原因執行狀態移動 (Priority: P1)

工程師選擇一個明確的轉換原因來移動 Issue。Portal 根據原因更新狀態及 Gitea 標籤，並顯示由原因決定的下一步動作；使用者不直接編輯狀態欄位來完成流程轉換。

**Why this priority**: 原因同時說明狀態為何改變與下一位負責人要做什麼，讓簡單狀態模型仍支援團隊交接。

**Independent Test**: 對每種狀態選取一個有效原因，確認可選目標狀態、保存的原因標籤、Issue 開關狀態及顯示的下一步動作一致。

**Acceptance Scenarios**:

1. **Given** 使用者檢視一個 Issue，**When** 使用者選取有效的轉換原因，**Then** Portal 依原因設定目標狀態及下一步動作。
2. **Given** 使用者選擇「重新指派負責人」，或開始處理且 Issue 尚無 Assignee，**When** 使用者選取既有 Assignee 或新增可指派的 Gitea 使用者，**Then** Portal 依目標順序清空後完整寫回 Gitea Assignees，且被選中的人排在第一位；「送交審查」允許但不要求選擇審查者。
3. **Given** 狀態轉換成功，**When** 使用者重新載入 Issue，**Then** Portal 從 Gitea 資料還原目前狀態、最後原因、下一步動作及 Assignee 順序。
4. **Given** Gitea 拒絕標籤、Assignee 或開關狀態更新，**When** 轉換未完成，**Then** Portal 不呈現轉換成功，並保留或回報可辨識的原狀。

### User Story 3 - 追蹤目前負責人及曾經手人員 (Priority: P1)

工程師查看 Issue 的 Gitea Assignees 名單，了解誰曾經處理 Issue，以及目前由誰接手。對未結案 Issue，第一位 Assignee 是目前負責人；其餘 Assignees 是曾經手的人員。Done Issue 保留經手名單，但不表示仍有目前負責人。

**Why this priority**: 即使工作已完成，保留經手名單仍可讓團隊辨識曾參與的人；開放工作則需要清楚顯示現任負責人。

**Independent Test**: 建立包含多位 Assignee 的 Open 與 Closed Issue，確認列表順序、目前負責人顯示與 Done 的呈現符合上述規則。

**Acceptance Scenarios**:

1. **Given** Open Issue 至少有一位 Assignee，**When** 使用者查看 Issue，**Then** 第一位 Assignee 顯示為目前負責人，其餘人員保留在經手名單。
2. **Given** 使用者交接給一位既有或新選取的 Gitea 使用者，**When** 交接成功，**Then** 該使用者成為第一位 Assignee，其他經手人仍保留。
3. **Given** Issue 已 Done，**When** 使用者查看經手名單，**Then** 名單仍可見，但不顯示其中任何人為目前負責人。
4. **Given** Open Issue 沒有 Assignee，**When** 使用者查看下一步動作，**Then** 顯示「指派負責人」；有經手名單時，初始下一步顯示「開始處理」。

### Edge Cases

- Issue 同時具有多個固定狀態標籤，或其 Gitea 開關狀態與標籤不一致時，Portal 必須指出衝突且不得自行挑選狀態。
- Issue 缺少固定狀態標籤時，Portal 不得默認推測為 Todo 或 In Progress。
- Issue 沒有 Assignee 時，Portal 不得虛構目前負責人；Done Issue 的 Assignees 只代表經手名單。
- 轉換原因要求等待外部人員，但該人沒有 Gitea 帳號時，仍可指定內部跟進負責人；不得要求將外部人員加入 Gitea Assignees。
- 轉換期間 Issue 被其他人修改、使用者失去 Gitea 權限、標籤不存在或 Gitea 無法回應時，不得顯示成功或靜默覆蓋新資料。
- 移動到目前相同狀態仍可能代表新的原因或交接；Portal 必須依選取的原因更新相應資料。
- 當 Assignees 人員集合相同但目標順序改變時，直接送出新順序不會改變 Gitea 中現有順序；Portal 必須清空後依完整目標順序寫回，並驗證讀回結果。
- 若清空 Assignees 成功但完整清單寫回失敗，Portal 必須嘗試還原原清單；還原也失敗時必須明確回報未能完成交接，不能顯示成功。

## Requirements

### Functional Requirements

- **FR-001**: Portal MUST 對所有可存取 Repository 套用同一固定工作流：Todo、In Progress、Done；Repository 與 Board MUST NOT 選擇或覆寫工作流定義。
- **FR-002**: Todo 與 In Progress MUST 對應 Gitea Open Issue；Done MUST 對應 Gitea Closed Issue。
- **FR-003**: 每個 Issue MUST 以 `workflow:todo` 或 `workflow:in-progress` 固定 Label 表示 Todo 或 In Progress；Done MUST 以 Gitea Closed 狀態表示，且不要求保留 Done 狀態標籤。Portal 的使用者可見狀態名稱 MUST 使用繁體中文。
- **FR-004**: Portal MUST 僅提供以轉換原因選擇狀態變更的主要流程；每個原因 MUST 定義來源狀態、目標狀態及顯示的下一步動作。
- **FR-005**: 工作流 MUST 支援 Todo、In Progress、Done 之間所有有定義的來源／目標組合，包括同狀態轉換；未定義的原因不得執行轉換。
- **FR-006**: Gitea Issue MUST 最多保存一個 `workflow-action:<stable-key>` 格式的最後轉換原因 Label；新原因成功寫入時取代前一原因，不保存完整的轉換原因歷史。Portal MUST 以繁體中文顯示原因名稱與對應的下一步動作。
- **FR-007**: Portal MUST 依目前狀態及最後轉換原因顯示下一步動作；下一步動作 MUST 是可執行的簡短描述，而非額外狀態欄位。
- **FR-008**: 原因為「開始處理」的初始 Todo Issue，在沒有 Assignees 時 MUST 顯示「指派負責人」；已有經手人員時 MUST 顯示「開始處理」。
- **FR-009**: Gitea Assignees MUST 同時作為 Issue 經手名單及目前負責人來源；Portal MUST NOT 將 Assignees 清單解讀成持久化的 Developer/Reviewer 角色分組。
- **FR-010**: 對 Open Issue，第一位 Gitea Assignee MUST 顯示為目前負責人；其餘人員 MUST 保留為經手名單；對 Closed Issue，所有 Assignees 僅表示曾經手人員，不顯示目前負責人。
- **FR-011**: 「重新指派負責人」MUST 要求使用者選擇既有經手人員或新增一位目前可指派的 Gitea 使用者；「開始處理」時若 Issue 沒有 Assignee 也 MUST 指派一人。「送交審查」MAY 選擇審查者。被選中的人 MUST 成為 Assignees 第一位，並保留其他經手人員；其餘轉換原因 MUST 保留原第一位 Assignee。需要改變既有 Assignees 順序時，Portal MUST 先清空全部 Assignees，再依完整目標順序寫回。
- **FR-012**: Reviewer MUST 為選擇性的工作角色語意，不得要求每個 Issue 都有 Reviewer；「送交審查」可選擇審查者但不得強制。原因及下一步動作可表達審查要求，Assignees 順序只表達人員經手與目前負責人。
- **FR-013**: 等待沒有 Gitea 帳號的外部人員時，Portal MUST 以目前負責人作為內部跟進人；MUST 保留目前 Assignees 順序，不另要求選擇或保存工作角色，並以轉換原因／下一步動作表達等待外部回覆。
- **FR-014**: 狀態、原因與 Assignees 的 Gitea 更新 MUST 遵守目前使用者權限；狀態標籤與原因標籤替換 MUST 保持原子性及既有 optimistic concurrency 行為。
- **FR-015**: Issue list 與 detail MUST 顯示完整 Labels；Portal 可在工作流程專屬呈現中隱藏內部狀態與原因標籤，但 MUST 保留讀取完整 Gitea Labels 的能力。
- **FR-016**: 本次實作 MUST 將現有 dummy Issues 直接改為固定工作流狀態，再刪除舊 Workflow Convention 及其專屬 workflow/status/reason Labels；MUST NOT 建立額外 Portal 遷移嚮導或保存舊狀態對照紀錄。
- **FR-017**: 清理 MUST 保留與工作流無關的 Issue Labels、Assignees、Milestone、Comments 及 Gitea Issue 資料；只刪除舊 Convention 定義及其專屬 workflow/status/reason Labels。
- **FR-018**: 本次實作 MUST 將所有現有 dummy Issues 分布到 Todo、In Progress、Done 三種狀態，並同步設定 Gitea Open／Closed；原本 Open／Closed 狀態不限制新狀態分配。
- **FR-019**: Portal MUST 對缺少狀態標籤、狀態標籤衝突或與 Gitea Open/Closed 狀態不一致的 Issue 顯示可辨識異常，且 MUST NOT 靜默猜測或修正。
- **FR-020**: Portal MUST 允許 Done → Done 轉換以修正結案原因，並固定顯示下一步動作「確認結案資訊」。
- **FR-021**: Assignees 清空後寫回失敗時，Portal MUST 嘗試還原變更前的完整清單；若還原失敗，MUST 回報交接未完成及目前實際狀態，不得呈現成功。
- **FR-022**: Portal 建立的新 Issue MUST 為 Gitea Open，並包含唯一的 `workflow:todo` 狀態 Label；初始原因 Label 為空，下一步依 Assignee 是否存在顯示「指派負責人」或「開始處理」。
- **FR-023**: Issue 列表、Kanban 與 Gantt MUST 依一致的 UI 設計系統重新設計，支援窄螢幕版面及可辨識的鍵盤焦點／操作；三個畫面 MUST 各有 Storybook story。

### Transition Reasons and Next Actions

下一步動作是使用者要執行的描述，不是第四種狀態。清單按來源狀態排序；Done → Done 的「修正結案原因」固定顯示「確認結案資訊」。狀態 Label 使用 `workflow:<stable-key>`；原因 Label 使用 `workflow-action:<stable-key>`；stable key 為穩定英文識別字，Portal 顯示繁體中文。

|   # | 來源        | 目標        | 轉換原因／動作     | 下一步動作     |
| --: | ----------- | ----------- | ------------------ | -------------- |
|   1 | Todo        | Todo        | 重新指派負責人     | 開始處理       |
|   2 | Todo        | Todo        | 釐清或補充需求     | 釐清需求       |
|   3 | Todo        | Todo        | 等待外部回覆       | 內部跟進       |
|   4 | Todo        | Todo        | 重新排期           | 重新排期       |
|   5 | Todo        | In Progress | 開始處理           | 開始實作       |
|   6 | Todo        | Done        | 重複 Issue         | 查看既有 Issue |
|   7 | Todo        | Done        | 不處理             | 無後續動作     |
|   8 | Todo        | Done        | 已在其他地方完成   | 確認完成結果   |
|   9 | In Progress | Todo        | 暫停並重新排入待辦 | 開始實作       |
|  10 | In Progress | Todo        | 等待外部回覆       | 內部跟進       |
|  11 | In Progress | Todo        | 重新排期           | 重新排期       |
|  12 | In Progress | Todo        | 釐清或補充需求     | 釐清需求       |
|  13 | In Progress | In Progress | 送交審查           | 審查 Issue     |
|  14 | In Progress | In Progress | 審查退回修改       | 修改並重新送審 |
|  15 | In Progress | Done        | 工作完成           | 確認完成結果   |
|  16 | In Progress | Done        | 重複 Issue         | 查看既有 Issue |
|  17 | In Progress | Done        | 不處理             | 無後續動作     |
|  18 | In Progress | Done        | 已被其他工作取代   | 查看取代項目   |
|  19 | Done        | Todo        | 重新評估           | 釐清需求       |
|  20 | Done        | Todo        | 需求變更，需釐清   | 釐清需求       |
|  21 | Done        | In Progress | 恢復處理           | 開始實作       |
|  22 | Done        | In Progress | 驗收未通過         | 修正後重新驗收 |
|  23 | Done        | In Progress | 發現回歸問題       | 修正問題       |
|  24 | Done        | Done        | 修正結案原因       | 確認結案資訊   |

### Key Entities

- **固定工作狀態**：Todo、In Progress、Done 三種全域一致的 Issue 工作狀態。
- **轉換原因**：使用者選擇的狀態移動原因，決定目標狀態、必要交接資料及下一步動作；每張 Issue 只保留最後一次原因。
- **下一步動作**：從目前狀態與最後原因推導、面向負責人的簡短行動文字，不構成額外狀態。
- **經手名單**：Gitea Assignees 的有序清單；Open Issue 第一位代表目前負責人，Closed Issue 清單只保留經手資訊。
- **工作流遷移結果**：既有 Issue 在新固定模型下的狀態判定與轉換結果；Gitea Issue 仍為唯一資料來源。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 所有可用 Repository 都顯示相同三個狀態，且不需 Repository 或 Board 的 Convention 選擇。
- **SC-002**: 九種狀態來源／目標組合都有明確的允許或拒絕規則；每個允許原因都有唯一目標狀態及下一步動作。
- **SC-003**: 成功轉換後重新讀取 Gitea，狀態、最後原因及 Assignee 順序與 Portal 顯示一致。
- **SC-004**: Open Issue 的目前負責人永遠對應第一位 Assignee；Done Issue 不顯示目前負責人，且經手名單仍可查看。
- **SC-005**: 本次實作完成後，所有現有 dummy Issues 均分布在固定三狀態，且 Gitea Open／Closed 與新狀態一致；舊 Convention 與 workflow/status/reason Labels 已移除。
- **SC-006**: Portal 不需要舊 Workflow Convention 即可查看或更新任何可存取 Repository 的工作狀態。
- **SC-007**: 每個透過 Portal 建立的新 Issue 都以 Open + `workflow:todo` 開始，且首次讀取顯示「待辦」。
- **SC-008**: Storybook 至少包含 Issue 列表、Kanban、Gantt 三個畫面的 story，且 Storybook production build 成功。

## Assumptions

- 「所有 Repository」指登入使用者可透過 Portal 存取、並依 Gitea 權限操作的 Repository；Portal 不擴大使用者權限。
- Todo 與 In Progress 使用固定狀態標籤，Done 以 Gitea Closed 表達；不保存 Portal 專屬 Issue 或狀態副本。
- 舊的 Workflow Convention 及其專屬 Label 在本次實作中直接刪除；現有 Issues 均為 dummy data，可任意分布到新固定狀態，並同步設定 Gitea Open／Closed，不建立舊新狀態對照紀錄或 Portal 遷移嚮導。
- 一般分類 Labels、Assignees、Milestone、Comments 及其他 Gitea Issue 資料維持原值。
- 固定狀態 Label 使用 `workflow:` namespace，轉換原因 Label 使用 `workflow-action:` namespace；兩者使用穩定英文 key，Portal 顯示繁體中文名稱。
- 每次轉換只保存最後原因；完整稽核歷史不屬於本功能。
- Reviewer 是可選的任務動作語意，不是 Assignees 中可被永久辨識的角色。
- Gitea 可指派人員以外的外部人員不會加入 Assignees；等待其回覆時由內部人員負責跟進。
