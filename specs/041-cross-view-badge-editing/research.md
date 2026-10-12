# Research: 三個工作檢視的 Badge 快速編輯

## Findings and Decisions

### Type 與 Priority 更新

- **Decision**: 重用現有 Issue PATCH 命令，只送出所選欄位及 `expectedUpdatedAt`，成功後重新載入目前工作檢視。
- **Evidence**: `apps/api/src/issues/issue-command-service.ts` 對比 `expectedUpdatedAt`；`apps/api/src/issues/issue-schedule-service.ts` 將 Type／Priority 標籤維度替換並保留 Status、日期與其他標籤；寫入透過 `apps/api/src/gitea/label-replacement.ts` 原子替換。
- **Alternatives considered**: 新增專用 metadata endpoint 或前端自行修改 Labels。兩者都會重複既有更新契約，且前者擴大 API 範圍、後者無法安全維持 Label 規則。

### Status 更新

- **Decision**: List 與 Gantt badge 開啟既有 `StatusTransitionDialog`，不指定目標狀態，讓使用者從目前狀態可用的 action 中選擇；仍透過 `transitionIssue` 確認並提交。Kanban 延用拖曳。
- **Evidence**: `apps/web/src/features/issues/StatusTransitionDialog.tsx` 在未指定 target 時列出目前 Issue status 的所有 actions，並套用原因及 Assignee policy；`apps/web/src/lib/api.ts` 的 `transitionIssue` 帶 `expectedUpdatedAt`；`apps/web/src/features/work-views/KanbanBoard.tsx` 已共用此路徑。
- **Alternatives considered**: badge 直接改寫 status label 或呼叫一般 PATCH。兩者會繞過狀態原因、Assignee policy 與既有回復處理，違反憲章。

### 檢視資料流與互動元件

- **Decision**: 由持有資料和 `load()` 的頁面提供 Promise callback；row/card 僅呈現選單及呼叫 callback。新增共用 metadata badge editor，Status badge 維持專用狀態入口。
- **Evidence**: Issue List 由 `IssueListPage.tsx` 擁有 load 並渲染 `IssueRow.tsx`；Kanban／Gantt 共由 `KanbanBoard.tsx` 持有資料及錯誤，Gantt callback 經 `GanttBoard.tsx` 傳至 `GanttIssueRow.tsx`，Kanban card 經 `KanbanColumn.tsx` 傳遞。
- **Alternatives considered**: 在 badge 元件內直接呼叫 API。會讓呈現元件持有 Issue 身分、載入、錯誤及刷新責任，且跨 view 行為難以一致。

### 驗證與視覺檢查

- **Decision**: 使用現有 Storybook story 模式補足三個 badge editor 的有效、缺漏、衝突、保存中、失敗與窄版情境；執行 typecheck、production build、Storybook build，並依 quickstart 做實際開發環境驗收。
- **Evidence**: Web package 目前只有 `build`、`typecheck`、`storybook`、`build-storybook` scripts，未設定 unit-test runner。現有 row/card/story 檔提供可重用的虛構資料案例。
- **Alternatives considered**: 加裝測試框架。此功能不需要引入新工具鏈；以可互動 Storybook 加上現有建置和手動 Gitea 驗收符合專案現狀。

## Open Questions

無。規格未要求改變 API、持久資料或支援的 enum。
