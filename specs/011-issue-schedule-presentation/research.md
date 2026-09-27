# Research: Issue 排程日期呈現改善

## Existing Repository Findings

- Web 使用 React 19、TypeScript 5.8 與 Storybook 8.6；Web 已有 `IssueRow`、`IssueDetailHeader`、`KanbanCard`、`GanttIssueRow` stories 和共用 CSS custom properties。
- `Issue.startDate` 與 `Issue.dueDate` 已是 `YYYY-MM-DD | null`。Gitea mapping 與 anomaly detection 已存在於 domain/API；本 feature 不需新增資料欄位或 API contract。
- Issue Row、Detail Header 與 Kanban Card 的一般 Label 顯示目前會漏出 `start-date:`；編輯表單已從一般 Labels 輸入中略過該前綴。
- Kanban Card 尚未呈現排程日期。Gantt Issue Row 顯示原始 ISO 值；單日項目會重複顯示同一日期，未排程項目目前合併成「沒有排程日期」。
- Issue date label parser 對無效或重複的開始日期會回傳 `null` 並標記 anomaly；對倒序日期保留兩個日期並標記 anomaly。各狀態可由既有 Issue response 表達。
- Storybook Preview 已提供 light/dark toolbar 與 theme wrapper，可在不新增主題基礎設施的情況下檢視兩種主題。

## Decisions

### Decision: Use one shared read-only date presenter

**Rationale**: Issue list/detail、Kanban 與 Gantt 需要相同的標籤、缺值語意、日期文字和輔助科技名稱。單一 presenter 能避免不同頁面逐步分歧。

**Alternatives considered**: 在各 feature 內重複組合日期文字；會延續現有不一致，也增加未來修改成本。

### Decision: Preserve date-only values while formatting

**Rationale**: 需求已指定 `YYYY/MM/DD`。以既有 ISO 日曆字串驗證並分段格式化，可避免將 `YYYY-MM-DD` 轉成帶時區時間後造成日期偏移。有效值使用 `<time dateTime="YYYY-MM-DD">`，未設定／異常則使用可讀文字。

**Alternatives considered**: `Date` 本地化格式會受使用者 locale 和時區影響，無法保證指定的格式與日曆日一致；相對時間也不符合固定起訖日期的用途。

### Decision: Hide only the internal start-date label from general label presentation

**Rationale**: 使用者明確要求不暴露 Label 實作。日期仍在專用日期欄位呈現，其他一般 Labels 與 Type parsing 保持不變。

**Alternatives considered**: 在一般 Label 區保留或重新命名原始 Label，仍會讓使用者接觸內部保存方式或造成重複資訊。

### Decision: Extend existing stories and add stories for the shared date controls

**Rationale**: 元件 stories 可以直接呈現所有日期狀態；現有 Gantt row/Kanban card stories 驗證整合後的版面。GanttBoard 依賴 session API 和 URL state，不適合作為孤立 story 的主要驗證單位。

**Alternatives considered**: 在每頁複製一套 Storybook mock 或為整個 Board mock API，工作量較大且不增加日期呈現覆蓋。

## UI/UX Guidance Applied

- UI UX search 的相關結果建議使用無歧義的在地日期格式，並依資訊語意區分靜態標籤與互動控制；本 feature 採明確固定格式及非互動文字。
- React stack search 未要求新增元件或依賴；保持元件簡單，遵守 hook rules。沒有既有測試框架或本次 TDD 要求，因此以 Storybook 情境檢視及專案既有 typecheck/build 驗證。
- 使用現有 theme tokens、換行與彈性版面；不依靠顏色單獨表達缺值或異常，也不新增 emoji 圖示。
