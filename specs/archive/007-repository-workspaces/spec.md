# Feature Specification: Repository 工作區與跨庫看板

**Feature Branch**: `007-repository-workspaces`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: 在頂部導覽切換單一 Repository 工作區與可檢視複數 Repository 的共用 Board；單一 Repository 與跨庫 Board 都可查看 Issues、Kanban 與甘特圖。

## Clarifications

### Session 2026-09-26

- Q: 上方導覽要怎麼切換單 repo 與跨 repo？ → A: 使用「工作區」下拉選擇器，切換 Repository 工作區或跨庫看板。
- Q: 代表多個 Repository 的共用視角要使用什麼名稱？ → A: 使用「跨庫看板」。
- Q: 尚未綁定 Workflow Convention 的 Repository 應如何呈現？ → A: Issues 仍可使用；Kanban 與甘特圖顯示設定提示。
- Q: 既有只涵蓋一個 Repository 的 Board，導入「跨庫看板」後應如何處理？ → A: 改列為該 Repository 的工作區並保留 Board 設定，不再作為 Board 顯示。
- Q: 使用者開啟既有單 repo Board 的舊 URL 時，Portal 應如何處理？ → A: 顯示說明頁，要求使用者重新選擇 Repository。
- Q: Legacy 單 repo Board 的 Convention 與 Repository 目前 YAML 不同時，工作區應採用哪個設定？ → A: 使用目前 YAML assignment，原樣保留 Board 設定；缺少有效設定或與保留設定不一致時，在 Kanban/甘特圖顯示提示。

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 在單一 Repository 工作區處理 Issues (Priority: P1)

工程師從頂部工作區選擇器挑選一個 Repository，並在同一工作區查看該 Repository 的 Issues、Kanban 與甘特圖。Issue 清單與檢視中的每一筆工作都屬於目前選定的 Repository。

**Why this priority**: 工程師需要直接進入單一 Repository 工作，不必先建立一個跨庫 Board 才能查看工作狀態。

**Independent Test**: 選擇含有 Issues 的 Repository，逐一開啟 Issues、Kanban 與甘特圖，確認每個檢視都只顯示該 Repository 的 Gitea 資料。

**Acceptance Scenarios**:

1. **Given** 使用者可讀取多個 Repository，**When** 使用者在工作區選擇器選取一個 Repository，**Then** Portal 開啟該 Repository 的工作區並清楚顯示其名稱。
2. **Given** 使用者位於單一 Repository 工作區，**When** 使用者切換 Issues、Kanban 或甘特圖，**Then** 每個檢視都只包含所選 Repository 的 Issues，且切換後仍保留 Repository 脈絡。
3. **Given** 使用者由單一 Repository 工作區建立 Issue，**When** 建立表單開啟，**Then** 目標 Repository 預先選為目前工作區 Repository。
4. **Given** 使用者重新載入或分享單一 Repository 檢視網址，**When** Portal 載入該網址，**Then** 顯示相同 Repository 與檢視。
5. **Given** 使用者從 Repository 工作區的 Issue 清單或甘特圖開啟 Issue 詳情，**When** 使用者返回，**Then** Portal 回到原 Repository 工作區與檢視。

---

### User Story 2 - 在跨庫看板檢視多個 Repository (Priority: P1)

工程師從工作區選擇器選擇一個「跨庫看板」，在該看板所涵蓋的 Repository 範圍內查看 Issues、Kanban 與甘特圖，並可在三種檢視間切換。

**Why this priority**: 團隊需要保留共用 Board，集中掌握分散在多個 Repository 的工作，而不複製或搬移 Gitea Issue。

**Independent Test**: 選擇包含多個 Repository 的 Board，在三種檢視間切換並確認每個 Issue 都屬於該 Board 設定的 Repository 範圍。

**Acceptance Scenarios**:

1. **Given** 使用者可讀取一個跨庫看板，**When** 使用者選取該 Board，**Then** Portal 顯示 Board 名稱與涵蓋的 Repository。
2. **Given** 使用者位於跨庫看板，**When** 使用者切換 Issues、Kanban 或甘特圖，**Then** 每種檢視只涵蓋該 Board 設定的 Repository，並保留 Board 脈絡。
3. **Given** 不同 Repository 有相同 Issue number，**When** 使用者查看跨庫結果，**Then** Portal 以 Repository 與 Issue number 區分 Issue。
4. **Given** 使用者重新載入或分享跨庫看板檢視網址，**When** Portal 載入該網址，**Then** 顯示相同 Board 與檢視。
5. **Given** 使用者建立或編輯跨庫看板，**When** Board 尚未涵蓋至少兩個 Repository，**Then** Portal 阻止儲存並說明需選擇至少兩個 Repository。
6. **Given** 使用者有既有單 Repository Board，**When** 使用者從工作區選擇器開啟其 Repository 工作區，**Then** 該資源不再列為 Board，且原 Board 設定仍被保留。
7. **Given** 使用者從跨庫看板的 Issue 清單或甘特圖開啟 Issue 詳情，**When** 使用者返回，**Then** Portal 回到原 Board 與檢視。

---

### User Story 3 - 切換工作區並理解不可用的檢視 (Priority: P2)

工程師可以從 Portal 頂部選擇 Repository 工作區或跨庫看板，並能辨識目前位置與有哪些檢視可用。若 Repository 尚未設定 Kanban 所需的 Workflow Convention，使用者仍可查看 Issues，並獲得可理解的設定提示。

**Why this priority**: 清楚的上下文切換可避免使用者把不同 Repository 的工作混在一起；明確的設定提示可避免空白或錯誤的 Kanban/Gantt 頁面。

**Independent Test**: 以鍵盤和滑鼠切換不同 Repository 與 Board；另選未綁定 Workflow Convention 的 Repository，確認 Issues 可用且其他檢視說明所需設定。

**Acceptance Scenarios**:

1. **Given** 使用者在任一主要頁面，**When** 使用者開啟工作區選擇器並切換上下文，**Then** 目前選定的 Repository 或 Board 及其檢視均可辨識。
2. **Given** Repository 尚未綁定 Workflow Convention，**When** 使用者開啟該 Repository 的 Issues，**Then** Issue 清單正常顯示。
3. **Given** Repository 尚未綁定 Workflow Convention，**When** 使用者開啟該 Repository 的 Kanban 或甘特圖，**Then** Portal 說明需先設定相符的 Workflow Convention，且提供可繼續使用的返回或管理入口。
4. **Given** 使用者以鍵盤操作工作區選擇器，**When** 選取 Repository、Board 或檢視，**Then** 每個操作項目名稱與目前選取狀態皆可取得，且有可見焦點。
5. **Given** 使用者在工作區選擇器選中可完整存取的跨庫看板，**When** 側邊導覽顯示，**Then** 顯示「跨庫看板設定」入口；若目前選中 Repository、全部 Issues 或沒有有效工作區，則隱藏該入口。
6. **Given** 使用者位於 Kanban 或甘特圖頁面，**When** 查看頁面內容，**Then** 頁面內不提供切換到另一種檢視的按鈕；使用者仍可使用全域側邊導覽切換工作區檢視。

### Edge Cases

- Repository 或 Board 清單尚未載入、載入失敗或沒有可用項目時，選擇器與頁面提供清楚的載入、錯誤或空狀態，不呈現看似成功的空白檢視。
- 使用者失去某 Repository 的 Gitea 讀取權限、Repository 被移除，或 Board 不存在時，Portal 顯示錯誤及返回工作區選擇器的入口。
- Board 任一必要 Repository 或 Issue 頁面讀取失敗時，Portal 不得把部分結果呈現為完整 Board 檢視。
- 既有單 Repository Board 改由其 Repository 工作區呈現；原設定保留，但不得繼續以 Board 選項顯示。
- 頂部工作區選擇器在窄視窗仍可操作，不得遮住主要頁面內容或造成整頁水平捲動。
- Issue 清單、Kanban 與甘特圖維持各自既有的錯誤、異常、空狀態與排程日期語意。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Portal MUST 在頂部提供工作區選擇器，讓使用者選取可讀取的單一 Repository 或可存取的跨庫看板。
- **FR-002**: Repository 工作區 MUST 提供 Issues、Kanban 與甘特圖三種檢視；三種檢視 MUST 只包含該 Repository 的 Issue。
- **FR-003**: 跨庫看板 MUST 提供 Issues、Kanban 與甘特圖三種檢視；三種檢視 MUST 只包含該 Board 所設定 Repository 的 Issue。
- **FR-004**: 切換同一 Repository 或 Board 的檢視時，Portal MUST 保留目前上下文；目前選定的上下文及檢視 MUST 能透過可分享網址重現。從 scoped Issue 清單或甘特圖開啟 Issue 詳情再返回時，Portal MUST 回到原 Repository/Board 與檢視。
- **FR-005**: Repository 工作區的 Issue 建立入口 MUST 預先指定目前 Repository；Issue 寫入 MUST 依目前使用者的 Gitea 權限執行。
- **FR-006**: 導覽與 Issue 檢視 MUST 清楚呈現目前的 Repository 或 Board 名稱；跨 Repository 的 Issue MUST 可由 Repository 身分及 Issue number 區分。
- **FR-007**: 尚未綁定有效 Workflow Convention 的 Repository MUST 仍可使用 Issues；該 Repository 的 Kanban 與甘特圖 MUST 說明所需設定及可繼續操作的入口。若目前 YAML assignment 與保留的 legacy Board Convention 不同，Kanban 與甘特圖 MUST 顯示差異提示，並依目前 YAML assignment 提供檢視。
- **FR-008**: Repository 與 Board 清單載入中、空集合、讀取失敗、所選資源不存在或權限變更時，Portal MUST 顯示相應狀態及可理解的後續操作。
- **FR-009**: Board 檢視 MUST 在必要的 Repository 或 Issue 讀取失敗時回報失敗，不得把部分資料宣稱為完整結果。
- **FR-010**: 工作區切換 MUST NOT 建立 Issue mirror、Issue 副本或額外 Board persistence；Gitea 維持 Issue、狀態與排程資料的唯一來源。
- **FR-011**: 工作區選擇器與檢視切換 MUST 可由鍵盤操作，提供可見焦點及可存取的名稱與選取狀態；窄視窗不得因選擇器造成主要內容不可用。
- **FR-012**: Portal MUST 保留現有跨 Repository Issues 入口，讓使用者仍能查看所有可讀 Repository 的 Issues。
- **FR-013**: 新建或編輯後儲存的「跨庫看板」MUST 涵蓋至少兩個不同 Repository；既有只涵蓋一個 Repository 的 Board MUST 改由該 Repository 工作區呈現、不得再作為 Board 選項顯示，且 MUST 保留原 Board 設定。
- **FR-014**: 使用者開啟既有單 Repository Board 的舊 /boards/:id、/boards/:id/kanban 或 /boards/:id/gantt URL 時，Portal MUST 顯示重新分類說明並要求從工作區選擇器重新選 Repository；MUST NOT 自動導向 Repository URL，也 MUST NOT 呼叫 Board view API。
- **FR-015**: 「跨庫看板設定」導覽入口 MUST 僅在工作區選擇器目前選中可完整存取的跨庫看板時顯示；選中 Repository、全部 Issues、legacy 單 repo Board 或無效/不可存取的看板時 MUST 隱藏。
- **FR-016**: Kanban 與甘特圖頁面 MUST NOT 顯示頁面內互相切換的導覽按鈕；全域側邊導覽仍可提供檢視切換。

### Key Entities _(include if feature involves data)_

- **Repository 工作區**：以一個 Gitea Repository 為範圍的使用上下文，可切換 Issues、Kanban 與甘特圖。
- **跨庫看板**：既有 Board 設定及其 Repository 集合所定義的跨 Repository 使用上下文。
- **工作區檢視**：在指定 Repository 或 Board 上選取的 Issues、Kanban 或甘特圖檢視。
- **全部 Issues 檢視**：涵蓋使用者目前可讀取之所有 Repository 的既有 Issue 清單入口。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 使用者能從頂部工作區選擇器進入任一可讀 Repository 或跨庫看板，並在不重新選擇上下文的情況下切換三種檢視。
- **SC-002**: 對 Repository 工作區的 Issues、Kanban 與甘特圖結果，100% 的 Issue 均來自目前選定的單一 Repository。
- **SC-003**: 對跨庫看板的 Issues、Kanban 與甘特圖結果，100% 的 Issue 均來自該 Board 設定的 Repository 範圍；不同 Repository 的同號 Issue 可明確區分。
- **SC-004**: 使用者直接開啟或重新載入有效檢視網址時，100% 都能回到網址指定的 Repository/Board 與檢視。
- **SC-005**: 未綁定 Workflow Convention 的 Repository 可成功載入 Issues；Kanban 與甘特圖均顯示明確的設定原因及繼續路徑。
- **SC-006**: 在鍵盤操作及 375 px 寬視窗下，使用者仍可選取工作區與檢視，並取得目前上下文和必要 Issue 身分資訊。
- **SC-007**: 工作區切換不會改變 Gitea Issue 資料，且任何 Gitea 權限拒絕均不會被呈現為成功操作。
- **SC-008**: 升級前建立的單 Repository Board 100% 保留原設定且不再以 Board 顯示；該 Repository 工作區仍可查看 Issues，Kanban 與甘特圖依 Repository 目前 YAML 指派的 exact Workflow Convention 提供檢視，未設定有效 Convention 時顯示設定提示；新建或儲存後的跨庫看板均至少涵蓋兩個不同 Repository。
- **SC-009**: 從 scoped Issue 清單或甘特圖開啟 Issue 詳情並返回時，100% 回到原 Repository/Board 與檢視。
- **SC-010**: 所有開啟舊單 Repository Board URL 的使用者都會看到重新分類說明並被要求重新選擇 Repository；該流程不會自動導向 Repository，也不會呼叫 Board view API。若 legacy Board Convention 與目前 YAML assignment 不同，Kanban 與甘特圖仍使用 YAML 指派且顯示差異提示。
- **SC-011**: 跨庫看板設定入口只會在工作區選擇器選中可完整存取的跨庫看板時出現；其他工作區狀態下均不顯示。
- **SC-012**: Repository 與跨庫看板的 Kanban/Gantt 頁面均不顯示頁面內的互相切換按鈕；全域側邊導覽可正常切換檢視。

## Assumptions

- 頂部選擇器分類顯示可讀 Repository 與跨庫看板；Repository/Board 的選擇與 Issues、Kanban、甘特圖的檢視切換屬於同一工作區流程。
- 現有全部 Repository Issues 清單繼續保留，與單一 Repository 工作區及 Board 範圍的 Issues 檢視並存。
- Repository 的 Kanban 與甘特圖沿用目前設定且 exact match 的 Workflow Convention；本功能不提供建立或變更 Convention 的流程。
- 現有 Board 設定、甘特圖排程規則、Kanban 狀態轉換與 Gitea 權限行為維持既有定義。
- 「跨庫看板」定義為涵蓋至少兩個 Repository；既有單 Repository Board 由 Repository 工作區取代其入口，原 Board 設定保留。
- 不新增 Issue 或工作區資料持久化。
