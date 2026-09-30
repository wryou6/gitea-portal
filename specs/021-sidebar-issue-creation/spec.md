# Feature Specification: 側邊導覽建立問題入口

**Feature Branch**: `021-sidebar-issue-creation`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: 將 Issues view 的「建立問題」按鈕移除，並將建立問題入口獨立放到左側 navigation bar；入口在所有登入後頁面顯示。

## Clarifications

### Session 2026-09-29

- Q: 左側「建立問題」要在哪些工作區顯示？ → A: 全域顯示於所有登入後頁面；Repository 工作區沿用目前 Repository，All repos 沿用既有 Repository 選擇流程。
- Q: 將建立入口移到側欄是否也要改變建立流程的返回行為？ → A: 不需要；本功能只移動入口，既有建立與返回行為維持不變。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 從左側導覽建立問題 (Priority: P1)

工程師在 Portal 任一登入後頁面，都能從左側導覽開啟建立問題頁面，不必先回到 Issues 清單。從 Repository 工作區開始建立時，表單使用目前 Repository；從 All repos 工作區開始時，使用者依既有流程選擇 Repository。

**Why this priority**: 把建立入口從 Issues 清單操作中獨立出來，讓工程師在其他工作頁面也能快速建立問題。

**Independent Test**: 分別由 All repos 與 Repository 的 Issues、Kanban、Gantt 頁面啟動建立流程，確認入口可用、Repository 範圍正確，且問題仍由 Gitea 建立。

**Acceptance Scenarios**:

1. **Given** 使用者已登入並位於任一主要頁面，**When** 查看左側導覽，**Then** 可辨識並操作「建立問題」入口。
2. **Given** 使用者位於 Repository 工作區，**When** 選擇「建立問題」，**Then** 建立表單使用該 Repository，使用者不需重新選擇。
3. **Given** 使用者位於 All repos 工作區，**When** 選擇「建立問題」，**Then** 使用者可依既有流程選擇要建立問題的 Repository。
4. **Given** 使用者在 Issues 頁面，**When** 查看頁面標題區，**Then** 不再顯示原有的「建立問題」按鈕，且仍可從左側導覽開始建立。
5. **Given** 側邊導覽已收合或使用者以鍵盤操作，**When** 使用者尋找建立入口，**Then** 入口仍可操作且名稱可辨識。
6. **Given** 使用者查看 Issues 導覽項目與建立問題入口，**When** 使用繁體中文、英文或日文，**Then** Issues 項目分別顯示「問題清單」、「Issue list」或「課題一覧」，並與建立入口清楚區分。

### Edge Cases

- 使用者目前 Repository 不再可存取或無權建立問題時，建立流程須沿用既有權限錯誤呈現，不得以 Portal 權限代替 Gitea 權限。
- 建立流程頁面載入或送出失敗時，側邊導覽仍可用，且錯誤不應被誤認為建立成功。
- 使用者尚未登入時不顯示登入後的建立入口。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Portal MUST 在所有登入後頁面的左側全域導覽提供「建立問題」入口。
- **FR-002**: 「建立問題」入口 MUST 開啟既有的 Issue 建立流程；Repository 工作區須帶入目前 Repository，All repos 工作區須保留既有的 Repository 選擇流程。
- **FR-003**: Issues 清單頁 MUST 移除頁面標題區原有的「建立問題」按鈕，並保留從全域導覽進入建立流程的能力。
- **FR-004**: 建立流程 MUST 繼續使用目前登入者的 Gitea 權限；Portal MUST NOT 建立獨立 Issue 副本或繞過 Gitea 授權。
- **FR-005**: 建立入口 MUST 在側欄展開與收合狀態下可辨識、可操作，並支援鍵盤及輔助科技。
- **FR-006**: 新增或修改的使用者可見文字 MUST 使用現有 i18n 資源並支援所有支援語系。
- **FR-007**: Issues 清單導覽標籤 MUST 與建立問題入口區分，並在繁體中文、英文、日文分別顯示「問題清單」、「Issue list」、「課題一覧」。

### Key Entities *(include if data involved)*

- **建立問題入口**：全域側邊導覽中的操作項目，開啟 Issue 建立流程並依目前工作區保留建立目標脈絡。
- **建立目標 Repository**：Issue 寫入的 Gitea Repository；可由目前 Repository 工作區帶入，或由 All repos 建立流程選取。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% 的登入後主要頁面都能從左側導覽到達 Issue 建立流程。
- **SC-002**: 從 Repository 工作區啟動時，建立表單帶入目前 Repository；從 All repos 啟動時，使用者能選擇目標 Repository。
- **SC-003**: Issues 頁面標題區不再出現建立問題按鈕，且使用者仍可由側邊導覽成功建立 Gitea Issue。
- **SC-004**: 側欄展開、收合與鍵盤操作情境均可辨識並使用建立入口。

## Assumptions

- 「全域」指所有登入後的 Portal 頁面，包含 Issues、Kanban、Gantt、Dashboard、Issue 詳情與設定頁。
- 使用現有 Issue 建立表單與權限處理；本功能改變入口位置與可達範圍，不改變建立資料或 Gitea 寫入行為。
- 建立表單沿用目前的取消、成功與失敗導覽行為。
