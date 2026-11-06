# Feature Specification: Kanban 欄位與卡片版面調整

**Feature Branch**: `[020-kanban-card-layout]`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: 調整看板欄位與卡片排版；卡片第一行顯示 Issue key、Type、Priority，第二行在 Title 後面並排顯示小字下一步，第三行顯示負責人和 Due date；卡片不顯示狀態操作按鈕。

## Clarifications

### Session 2026-09-29

- Q: 移除卡片上的狀態下拉欄位後，鍵盤使用者要透過哪種入口轉換 Status？ → A: 使用精簡的「移動狀態」按鈕開啟可鍵盤操作的選單。
- Q: 鍵盤使用者從新選單選擇目的 Status 後，是否仍應開啟現有的 StatusTransitionDialog，讓使用者選擇轉換原因／負責人後再更新 Gitea？ → A: 是；選擇目的 Status 後開啟現有的 StatusTransitionDialog，由使用者選擇轉換原因及適用的負責人選項後確認更新。
- Q: 本機 Portal 驗收是否要同時測試「鍵盤選單選目的 Status」和「拖曳卡片」兩種操作，並確認兩者都先開啟狀態轉換確認對話框？ → A: 是；分別驗收鍵盤選單和拖曳，兩者都先開啟確認對話框，且確認前不得更新 Gitea。

### Session 2026-09-30

- Q: 卡片上的精簡「移至狀態」按鈕是否保留，Issue key 要放在哪裡？ → A: 移除卡片上的按鈕，將 Issue key 移到第一行。看板仍可拖曳轉換；鍵盤使用者可從卡片標題進入 Issue detail，使用既有的狀態動作按鈕。
- Q: Done 卡片如何呈現負責人？ → A: 顯示「最後負責人」，使用 Gitea 保留的有序 Assignees 第一位；不把 Closed Issue 標為目前負責人。若無保留 Assignee，顯示未記錄。（此決策於 2026-10-02 更新為不顯示角色標籤。）

### Session 2026-10-02

- Q: 卡片是否要標示「目前負責人」或「最後負責人」？ → A: 不需要；保留人名，依卡片所在 Status 欄辨識其脈絡。Done 卡片仍使用第一位保留的 Gitea Assignee，沒有 Assignee 時顯示未記錄。
- Q: 下一步放在哪一行？ → A: 標題獨占第二行；第三行左側顯示負責人，右側依序顯示 Due date 與靠右對齊的下一步。窄欄允許第三行內容換行，不得互相重疊。

## User Scenarios & Testing

### User Story 1 - 快速掃描 Issue 卡片 (Priority: P1)

工程師查看看板時，能在第一行辨識 Issue key、分類與優先級；第二行閱讀完整標題；第三行查看負責人、到期日與較小字級且靠右的下一步。負責人不重複標示目前或最後角色，Done 卡片仍顯示保留的聯絡對象。

**Why this priority**: 卡片是 Kanban 的主要資訊單位，固定視覺順序可加快掃描與比較。

**Independent Test**: 使用完整欄位和長標題／長下一步的 Issue fixture 檢視卡片，確認標題獨占第二行、第三行下一步靠右，且窄欄內容不重疊。

**Acceptance Scenarios**:

1. **Given** Issue 有 Type、Priority、下一步、Title、Repository/Issue key、負責人和 Due date，**When** 工程師查看卡片，**Then** 第一行顯示 Repository/Issue key、Type 和 Priority，第二行只顯示 Title，第三行左側顯示負責人、右側顯示 Due date 與靠右的小字下一步；長標題以省略號截斷，窄欄不得重疊。
2. **Given** Issue 位於 Done 欄且保留一位以上 Assignee，**When** 工程師查看卡片，**Then** 第三行顯示有序名單第一位且不加「最後負責人」標籤；沒有保留 Assignee 時顯示「未記錄」。
3. **Given** Issue 帶有通用 Labels 或排程異常，**When** 工程師查看卡片，**Then** 卡片不顯示未用於卡片欄位的通用 Labels，排程異常資訊仍清楚可辨；完整 Labels 仍可從 Issue list/detail 檢視。
4. **Given** 多張 Issue 位於同一欄，**When** 工程師查看看板，**Then** Todo、In Progress 和 Anomaly 依優先級、有效 Due date、最久未更新的順序排列；Done 依最近更新排列，同值以 Repository 和 Issue 身分穩定排序。

### User Story 2 - 使用更寬敞的 Kanban 欄位 (Priority: P1)

工程師在桌面寬螢幕檢視 Kanban 時，三個 Status 欄位能使用看板的可用寬度；有異常 Issue 時仍能辨認額外的 Anomaly 欄位。

**Why this priority**: 現有欄寬固定，三欄後方留下大片空間，降低工作區利用率。

**Independent Test**: 在寬螢幕檢視三欄與含 Anomaly 欄的 Kanban，確認所有欄位平均分配可用寬度；在窄螢幕確認單欄檢視仍可使用。

**Acceptance Scenarios**:

1. **Given** 桌面版 Kanban 有 Todo、In Progress、Done 三欄，**When** 看板載入，**Then** 三欄等寬填滿看板可用寬度。
2. **Given** Kanban 顯示 Anomaly 欄，**When** 看板載入，**Then** 該欄與三個 Status 欄一同排列，且各欄寬度相等。
3. **Given** 使用者以窄螢幕檢視 Kanban，**When** 看板載入，**Then** 維持現有單欄與選欄操作。

### User Story 3 - 移動 Issue Status (Priority: P1)

工程師可拖曳看板卡片轉換 Issue Status。卡片不提供「移至狀態」按鈕；鍵盤使用者可開啟卡片標題進入 Issue detail，再使用既有狀態動作操作。

**Why this priority**: 移除卡片上的額外操作按鈕，讓卡片專注呈現 Issue；保留看板拖曳和 Issue detail 的狀態操作路徑。

**Independent Test**: 確認卡片不再顯示狀態操作按鈕，拖曳仍開啟既有確認對話框，卡片標題可鍵盤操作並連到 Issue detail。

**Acceptance Scenarios**:

1. **Given** Issue 位於可轉換的 Status 欄，**When** 工程師查看卡片，**Then** 不顯示「移至狀態／選擇狀態」下拉欄位。
2. **Given** Issue 可轉換 Status，**When** 鍵盤使用者從卡片標題進入 Issue detail，**Then** 可使用既有「記錄狀態動作」控制開啟狀態轉換確認對話框，並在確認前不更新 Gitea。
3. **Given** Issue 可轉換至另一個 Status，**When** 工程師拖曳卡片，**Then** Portal 開啟相同的狀態轉換確認對話框，確認前不更新 Gitea，且完成確認流程後回報成功或失敗。

### Edge Cases

- Type、Priority、負責人或 Due date 缺少時，沿用目前的缺漏呈現（缺少 Type/Priority 標示為缺漏、負責人顯示未指派／未記錄、Due date 顯示未設定）；卡片仍須維持資訊順序。
- 下一步、Title 或 Issue key 缺少時，卡片仍須可辨識且不錯置其他欄位。
- Anomaly 卡片不得提供會覆寫異常狀態的 Status 轉換操作。
- Status 轉換遇到權限不足、資料過期或 Gitea 更新失敗時，必須保留既有錯誤回饋與恢復行為。
- 日期異常與卡片連結不得因版面調整而消失或失效；完整 Labels 仍由 Issue list/detail 呈現。

## Requirements

### Functional Requirements

- **FR-001**: Kanban Card MUST 以三行主要資訊呈現：第一行左側依序為 Priority、Type，右側為 Repository/Issue key；第二行只顯示 Title；第三行左側顯示負責人，右側依序顯示 Due date 與靠右的小字下一步。負責人 MUST NOT 顯示「目前負責人」或「最後負責人」角色標籤。Done 卡片 MUST 顯示第一位保留 Assignee；無 Assignee 時 MUST 顯示未記錄。長標題 MUST 以省略號截斷，窄欄內容 MUST 可換行且不得重疊。
- **FR-002**: Issue key MUST 包含 Repository 身分及 Issue 編號，避免跨 Repository Kanban 中的相同編號混淆。
- **FR-003**: Kanban Card MUST NOT 顯示「移至狀態／選擇狀態」下拉選單。
- **FR-004**: Kanban Card MUST NOT 顯示 Status 操作按鈕。看板拖曳 MUST 開啟既有狀態轉換確認對話框；鍵盤使用者 MUST 能透過可聚焦的 Issue 標題進入 Issue detail，並由既有狀態動作控制開啟確認對話框。Gitea MUST 只在使用者確認後更新。
- **FR-005**: Status 轉換 MUST 延續既有 Gitea 資料來源、權限、原子更新、並行控制及錯誤回饋規則。
- **FR-006**: 桌面 Kanban MUST 讓全部可見欄位等寬填滿看板可用寬度；Anomaly 欄若出現，MUST 與 Status 欄一同排列。
- **FR-007**: 窄螢幕 MUST 保留現有單欄 Kanban 與選欄操作。
- **FR-008**: Kanban Card MUST NOT 顯示沒有用於卡片欄位的通用 Labels；完整 Gitea Labels MUST 仍可從 Issue list/detail 檢視。日期異常註記、Issue 連結和 Anomaly 欄 MUST 保持可辨識。
- **FR-009**: 新增或修改的使用者可見文字 MUST 提供所有支援語系的翻譯及可辨識的無障礙名稱。
- **FR-010**: Todo、In Progress 與 Anomaly 卡片 MUST 依優先級（critical、high、medium、low，缺少／衝突最後）、有效 Due date 由近到遠（缺少／無效最後）、最久未更新優先排序；Done 卡片 MUST 依最近更新優先排序。相同值 MUST 以 Repository owner、name、Issue number 作穩定排序。

## Key Entities

- **Kanban Card**: 由 Gitea Issue 資料組成的呈現項目，包含 Type、Priority、下一步、Title、Repository/Issue key、負責人、Due date 及必要異常資訊；不顯示未用於卡片欄位的通用 Labels。
- **Issue Status**: Portal 固定的 Todo、In Progress、Done 狀態；異常資料仍以 Anomaly 呈現，且狀態資料仍由 Gitea 提供。

## Success Criteria

### Measurable Outcomes

- **SC-001**: 在桌面寬螢幕的三欄與四欄情境中，欄位寬度相同，且可見欄位使用看板全部可用寬度。
- **SC-002**: 完整資料的卡片以三行主要資訊呈現；首行包含 Repository/Issue key、Type、Priority，第二行單獨顯示可省略的 Title，第三行顯示負責人、Due date 與靠右的小字下一步。
- **SC-003**: Kanban 卡片不顯示 Status 操作按鈕；拖曳和 Issue detail 鍵盤操作都先開啟狀態確認對話框，Gitea Status 僅在使用者確認後更新。
- **SC-004**: 窄螢幕仍可檢視及選擇 Status 欄；日期異常和錯誤狀態仍可辨識，未用於卡片欄位的通用 Labels 不出現在卡片上。

## Assumptions

- Issue key 使用目前顯示的 `owner/name #number` 格式。
- Status 欄固定為 Todo、In Progress、Done；資料異常時可能另外出現 Anomaly 欄。
- 不新增 Issue 狀態來源或改變 Gitea 資料保存方式。
- 日期異常資訊保留在三行主要資訊之後；完整 Labels 在 Issue list/detail 檢視。
