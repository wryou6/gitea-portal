# Research: Issue Type 呈現統一

## Findings

### 現有 Type 資料與呈現

- `Issue.type` 是由 `type:bug`、`type:feature`、`type:task` labels 推導的 nullable domain 值；`issueTypeDisplayName` 與 `issueTypeStatusFromLabels` 已提供顯示名稱和 valid/missing/conflict 狀態。
- `IssueRow` 與 `IssueDetailHeader` 都自行組出 `Type：...` metadata，並在 `LabelList` 再列出原始 `type:*` Label，造成位置與內容重複。
- API 的 Kanban `visibleLabels` 保留 Type Labels，只排除該 Board Convention 的 workflow labels；因此 badge 的重複抑制應在呈現層處理，不更動 contract/filter。
- `GanttBoard` 的 issue row 目前沒有 Type 呈現；需新增以符合明確的 Gantt 驗收範圍。已排程、未排程、日期異常列使用不同 render path，需共用 Type 呈現。
- Create/edit 表單使用共用原生 Select wrapper，選項目前已有描述；改用直接類型名稱並以所選值的樣式提示類別，不改選擇及送出邏輯。

### 現有 UI 與 Storybook 能力

- Web 使用 React 19、TypeScript、Tailwind CSS 4；現有視覺 token 與元件樣式主要在 `apps/web/src/index.css`。
- Storybook 8 已安裝，`.storybook/preview.tsx` 匯入同一份 CSS，並提供 light/dark 全域切換；現有 IssueRow 和 KanbanCard stories 可擴充。
- Storybook 目前沒有 Issue detail、Gantt row 或 Issue Type field stories，需新增以涵蓋這些表面。

## Decisions

### 共用 Type 呈現元件

- **Decision**: 新增 `IssueTypeBadge` 作為有效、未設定、衝突狀態唯一的呈現元件，跨 Issue 與 Board feature 重用。
- **Rationale**: 讓類型名稱、status、spacing、dark-mode palette 在所有位置一致，同時維持 domain helpers 為資料推導來源。
- **Alternatives considered**: 各頁自行加 class；拒絕，因現有重複的 metadata 已造成差異並容易再漂移。

### Type label 與一般 Labels

- **Decision**: badge 表達有效 Type；UI 不在一般 Labels 集合重複呈現該有效 Type Label，其餘 labels 保持原樣。多重／無效 reserved Type labels 轉成可辨識的衝突值，不以 `type:` 前綴作標籤文案。
- **Rationale**: 同時符合標題區位置、避免重複和完整呈現一般 labels；不變更 Gitea 中實際 label。
- **Alternatives considered**: 保留 `type:*` 原字串在 Labels 區；拒絕，會繼續顯示前綴並重複類型。

### Type 配色與可讀性

- **Decision**: Bug 使用紅色語意、Feature 使用藍色語意、Task 使用綠色語意；異常使用 amber/red。light/dark 各自提供語意前景、底色和邊框變數，文字對比至少 WCAG AA 4.5:1，且以可見文字辨識類型。
- **Rationale**: 沿用使用者選定的分色方向，亦符合現有 Portal 的 semantic-token 主題模式。
- **Alternatives considered**: 三種 Type 共用中性色；拒絕，較難快速掃讀；單靠顏色或 emoji；拒絕，不符合無障礙與 repo 規範。

### 表單呈現

- **Decision**: 保留原生 select；選項改成 Bug/Feature/Task，選中值套用同一類型 semantic colors。
- **Rationale**: 原生鍵盤與輔助科技操作維持不變；不必引進自製 combobox 或新相依套件。
- **Alternatives considered**: 自訂可帶彩色選項的 listbox；拒絕，增加互動與 accessibility surface，沒有此需求。

### Gantt row Storybook

- **Decision**: 將 Gantt Issue row 抽成獨立呈現元件並為 scheduled、unscheduled、anomaly 樣態建 stories。
- **Rationale**: 目前 row 巢狀在會發 session API request 的 GanttBoard 中，獨立 row stories 可直接、穩定地檢視版位且不需網路 mock。
- **Alternatives considered**: 對整個 GanttBoard story mock `/api/session`；拒絕，為檢視 Type 樣式引入不必要的非同步狀態。
