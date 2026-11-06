# Feature Specification: Issue Markdown Rendering

**Feature Branch**: `043-issue-markdown-rendering`

**Created**: 2026-11-03

**Status**: Draft

**Input**: User description: "想要 issue page 可以渲染 markdown"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 閱讀 Issue 描述與留言 (Priority: P1)

工程師在 Issue 完整頁面或浮窗查看描述和留言時，可以直接閱讀格式化後的內容，不必把 Markdown 標記當一般文字解讀。

**Why this priority**: 描述與留言是 Issue 頁面的主要內容，正確呈現能讓工程師快速理解需求、討論與程式碼範例。

**Independent Test**: 開啟含有 Markdown 的 Issue，確認描述與多則留言都能分別呈現格式，且一般文字與空內容仍可閱讀。

**Acceptance Scenarios**:

1. **Given** Issue 描述包含標題、段落、清單、連結、表格、刪除線、核取清單或程式碼區塊，**When** 使用者開啟 Issue 完整頁面或浮窗，**Then** 描述以常見 Markdown 與 GFM 格式呈現。
2. **Given** Issue 留言包含 Markdown，**When** 使用者查看留言，**Then** 每則留言內容都以相同格式支援呈現，並保留留言者與時間資訊。
3. **Given** 描述或留言包含原始 HTML 或不安全連結格式，**When** 內容呈現，**Then** 原始 HTML 不會執行，不安全連結不可操作。
4. **Given** 描述或留言是一般文字、空值或空白，**When** 使用者查看內容，**Then** 文字可讀，空內容仍顯示既有空狀態或空白處理。

## Edge Cases

- 長程式碼行、長網址及寬表格不得讓頁面整體超出可視寬度；內容區域需可辨識並適當處理溢出。
- Markdown 內含不支援或不安全的 URI scheme 時，不得形成可執行導覽。
- 原始 HTML 標籤與事件處理屬性不得被當成可執行元素插入頁面。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Issue 詳情頁 MUST 將 Issue 描述及每則留言的 Markdown 內容呈現為格式化內容。
- **FR-002**: Markdown MUST 支援常見 Markdown 與 GFM 的標題、段落、清單、連結、表格、刪除線、核取清單及程式碼區塊。
- **FR-003**: 呈現 Issue 內容 MUST NOT 執行原始 HTML；不安全連結 MUST NOT 可操作。
- **FR-004**: 描述與留言 MUST 保留 Gitea 提供的原始內容為唯一資料來源；本功能 MUST NOT 新增內容副本或改變讀寫 API 與保存格式。
- **FR-005**: 一般純文字、空描述及無留言情況 MUST 保持可辨識且符合目前空內容呈現。
- **FR-006**: Markdown 內容的長程式碼行、長網址與寬表格 MUST 在 Issue 詳情版面中保持可閱讀，不得造成整頁非預期的水平溢出。

### Key Entities _(include if feature involves data)_

- **Issue 描述**：Gitea Issue 提供的原始 Markdown 文字，由 Issue 詳情頁讀取並呈現。
- **Issue 留言**：Gitea Issue 提供的留言原始 Markdown 文字；留言者與建立時間仍依既有資料呈現。

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Issue 描述與留言均能呈現 FR-002 列出的 8 類 Markdown/GFM 元素，完整頁面與浮窗呈現一致。
- **SC-002**: 原始 HTML 不會執行；不安全 URI 不會觸發導覽；一般安全連結仍可使用。
- **SC-003**: 一般文字與空內容的既有呈現維持可辨識，且窄螢幕、長程式碼行及寬表格不造成整頁水平溢出。

## Assumptions

- 「Issue page」涵蓋 Issue 詳情完整頁面與從 Issue List、Kanban、Gantt 開啟的詳情浮窗。
- 此功能只處理既有描述與留言的顯示，不新增編輯 Issue 或新增留言的 Markdown 預覽。
- 使用常見 Markdown 與 GFM 語法；不要求完整複製 Gitea 專屬 renderer 行為。
- 原始 HTML 不執行為安全預設；HTML 擴充語法不在本功能範圍。
