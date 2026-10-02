# Quickstart: 多位經手人頭像驗收

## 程式檢查

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
pnpm.cmd storybook
```

## Storybook 瀏覽器驗收

1. 檢視 IssueRow、KanbanCard、GanttIssueRow 的單人、三人、五人、Done、未指派及缺少／破損頭像案例；另看 GanttBoard 的 `MultipleAssignees`，核對表頭與每列欄位對齊。
2. 確認順序為主要頭像、主要姓名、最多兩張額外頭像及正確的 `+N`；Done 使用第一位保留人員。
3. 以滑鼠停留、Tab 聚焦和輔助科技檢查完整有序姓名與 login 提示；同名帳號需能區分。
4. 在 zh-TW、en、ja，light/dark 及 1440、720、375 CSS px 檢查；確認窄版不遮住相鄰欄位，Gantt 表頭與 Assignee 列對齊。
5. 確認空人員維持既有未指派呈現，頭像失敗時顯示預設人像；Storybook 不發出任何 Gitea write 或新增 profile 查詢。

## 完成紀錄

- `pnpm.cmd typecheck`：通過；`pnpm.cmd build`：通過；`pnpm.cmd --filter @gitea-portal/web build-storybook`：通過。
- Storybook 瀏覽器確認 IssueRow、KanbanCard、GanttBoard 的多人 overflow 群組：每組最多顯示兩張額外頭像，五人案例顯示 `+2`；完整有序姓名/login 可由群組可及名稱取得，同名使用者可區分。
- 瀏覽器尺寸覆核：三種 view 在 375 CSS px 可見；GanttBoard 另於 720 與 1440 CSS px 覆核，標題、Assignee、Status 與時間軸表頭對齊；Storybook 頁面在 720 CSS px 無水平溢位。
- GanttBoard 多人案例在 zh-TW、en、ja 與 light、dark globals 下均可呈現；預設頭像 fallback 正常。未執行 Gitea runtime/write 驗證，因本變更只改顯示層。
- Storybook build 有既有 `eval` 與大型 chunk 警告，建置成功。
