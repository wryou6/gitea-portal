# Feature Specification: 多位經手人的頭像提示

**Feature Branch**: `028-assignee-avatar-groups`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: 在 Issue List、Kanban、Gantt 三個 view 中，當經手人有多人時，在主要人員姓名後顯示其他經手人的大頭貼；呈現順序如「頭像1 姓名1 頭像2 頭像3」。

## Clarifications

### Session 2026-10-02

- Q: 多位經手人如何排列？ → A: 主要人員維持「頭像＋姓名」，其餘經手人以小頭像接在姓名後；最多顯示兩位其他經手人，其餘以 `+N` 表示。
- Q: 哪位人員是主要人員？ → A: 未完成 Issue 使用目前負責人；Done Issue 使用 Gitea 有序 Assignees 的第一位保留人員。其他頭像維持 Gitea 名單順序並排除主要人員。
- Q: 如何取得其他頭像代表的完整名單？ → A: 滑鼠提示及鍵盤／輔助科技名稱提供完整有序姓名與帳號；頭像本身不依顏色傳達身份。

## User Scenarios & Testing

### User Story 1 - 快速辨認 Issue 經手團隊 (Priority: P1)

工程師在 Issue List、Kanban 或 Gantt 查看負責人時，能立即辨識主要負責人，並從其姓名後方的其他頭像看出有多人參與；需要完整資訊時可取得有序姓名與帳號。

**Why this priority**: 三個工作檢視是日常掃描 Issue 與交接的主要入口；一致呈現能補足單一負責人欄位看不到其他經手人的資訊。

**Independent Test**: 使用一人、三人、超過三人、Done 及未指派 Issue fixture，檢視三個 view 的主要人員、額外頭像、`+N` 與完整人員提示。

**Acceptance Scenarios**:

1. **Given** Issue 只有一位經手人，**When** 工程師查看任一 view，**Then** 既有主要人員頭像與姓名照常顯示，沒有額外頭像或 `+N`。
2. **Given** 開放 Issue 有多位經手人，**When** 工程師查看任一 view，**Then** 目前負責人的頭像與姓名在前，最多兩位其他經手人頭像緊接姓名後，並依 Gitea 順序排列。
3. **Given** Issue 有超過三位經手人，**When** 工程師查看任一 view，**Then** 主要人員與最多兩位其他人員頭像可見，剩餘人數顯示為 `+N`。
4. **Given** Issue 已 Done，**When** 工程師查看負責人呈現，**Then** Gitea 有序 Assignees 第一位是主要人員，其餘保留人員依序顯示為額外頭像。
5. **Given** 工程師以滑鼠停留、鍵盤聚焦或輔助科技讀取人員群組，**When** 查看完整提示，**Then** 可取得完整有序姓名與帳號；群組順序與頭像一一對應。
6. **Given** Issue 沒有經手人，**When** 工程師查看任一 view，**Then** 保留既有未指派呈現，不顯示空頭像或虛構人員。

### User Story 2 - 在窄版面維持工作檢視可讀性 (Priority: P1)

工程師在窄 Kanban 卡片、Issue 表格或 Gantt 負責人欄中查看多人時，仍能辨識主要姓名與其他人數，頭像不遮住相鄰資料或破壞 Gantt 表頭對齊。

**Why this priority**: 三個 view 的版面密度不同；有限制的頭像數能保留群組線索而不讓寬度隨名單增加。

**Independent Test**: 在 1440、720、375 CSS 像素寬及三種語系檢查三個 view；確認額外頭像最多兩位、`+N` 正確、無重疊，Gantt 欄位和表頭保持對齊。

**Acceptance Scenarios**:

1. **Given** 名單長度增加，**When** 任一 view 顯示人員群組，**Then** 可見額外頭像仍不超過兩位，`+N` 代表未顯示的剩餘人數。
2. **Given** 窄視窗或長姓名，**When** 人員群組及相鄰內容排版，**Then** 內容可依既有容器規則換行或截短並保留完整提示，不重疊、不遮住 Status／日期／時間軸。
3. **Given** Gantt 顯示 Assignee 欄，**When** 多人頭像出現或語系切換，**Then** 表頭與資料列欄寬仍一致。

### Edge Cases

- Assignee 清單重複包含主要人員時，只顯示一次。
- 主要負責人不在有序清單但有有效帳號時，仍顯示主要人員，再依清單順序顯示其他經手人。
- 外觀資料或頭像缺失、圖片載入失敗時，沿用預設人像；人數、順序及完整姓名／帳號提示仍可用。
- 同名人員以帳號區分，不合併頭像或提示內容。
- 長姓名、缺少姓名與非拉丁字元不改變人員身份或排序。
- Kanban 完成項目及 Gantt／List 的 Done 項目均不得把保留人員標示為目前負責人；本功能只增加群組線索，不改變原有主要人員語意。

## Requirements

### Functional Requirements

- **FR-001**: 三個 Issue view MUST 以一致順序顯示多人員：主要人員頭像、主要人員姓名、最多兩位其他經手人頭像、可選的 `+N` 溢出計數。
- **FR-002**: 開放 Issue 的主要人員 MUST 依現有目前負責人規則選取；Done Issue MUST 依現有第一位保留 Assignee 規則選取；其他人員 MUST 沿用 Gitea Assignees 順序且不得重複。
- **FR-003**: 額外頭像數 MUST 固定上限為兩位，`+N` MUST 等於未呈現的其他經手人數；單一人員不得顯示額外頭像或計數。
- **FR-004**: 人員群組的 hover 提示、鍵盤焦點名稱及輔助科技名稱 MUST 提供完整有序姓名與帳號；同名人員 MUST 可區分。
- **FR-005**: 頭像缺失或圖片載入失敗 MUST 使用既有人像 fallback，不得影響姓名、人員順序或未指派狀態。
- **FR-006**: 本功能 MUST 只使用既有 Issue `assignees`、主要人員及 `userProfiles` 資料；MUST NOT 新增 API 請求、持久化、Gitea 寫入或 Issue 資料副本。
- **FR-007**: 頭像群組 MUST 在明暗主題、zh-TW／en／ja、長姓名與窄視窗下不遮蔽相鄰內容；Gantt Assignee 表頭與資料列 MUST 保持對齊。
- **FR-008**: 三個 view MUST 保留既有排序、Issue 狀態、篩選值、負責人選取與拖曳轉換語意。

### Key Entities

- **主要人員**：依 Issue 狀態及目前各 view 契約選取的主要負責人或 Done 保留人員。
- **經手人群組**：由主要人員與有序 Gitea Assignees 組成的唯讀呈現；不改變來源名單。
- **頭像溢出計數**：超過可見額外頭像上限的其他經手人數。

## Success Criteria

### Measurable Outcomes

- **SC-001**: List、Kanban、Gantt 在單人及多人情境下均呈現一致的主要姓名與額外頭像順序，驗收案例 100% 通過。
- **SC-002**: 任何名單最多顯示兩位額外頭像，且 `+N` 與隱藏人數完全相符。
- **SC-003**: 使用鍵盤或輔助科技可取得完整有序姓名與帳號；同名使用者 100% 可區分。
- **SC-004**: 1440、720、375 CSS 像素及 zh-TW／en／ja 檢視沒有頭像遮住相鄰欄位；Gantt 表頭和資料列對齊。
- **SC-005**: 驗收期間新增 Gitea 寫入、逐人網路請求及 Portal Issue 持久化資料皆為零。

## Assumptions

- Issue List、Kanban、Gantt 已取得完成此呈現所需的有序 Assignees 及 userProfiles。
- 主要人員沿用各 view 既有規則；本功能不重定義目前負責人或 Done 聯絡人的語意。
- 額外人員只顯示小頭像，完整文字清單透過提示取得；最多呈現兩個額外頭像，這是三個 view 間一致的密度界線。
- 新增的群組提示文案使用繁體中文、英文與日文；姓名及帳號保持來源文字，不翻譯。
