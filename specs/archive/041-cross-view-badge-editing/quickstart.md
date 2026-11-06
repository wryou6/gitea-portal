# Quickstart: 三個工作檢視的 Badge 快速編輯

## Prerequisites

- 使用專案既有登入方式連到開發 Gitea，並準備一筆可安全修改的測試 Issue。
- 測試帳號可更新該 Issue，且有 Repository Label 寫入權限。
- 以 repository root 執行：

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
```

## Manual Acceptance

1. 在 Issue List、Kanban、Gantt 分別開啟 Priority badge，確認四個選項；修改一級並確認資料刷新及其他 Labels 保留。
2. 在三個檢視分別選擇另一個 Type；確認選項為 Bug、Feature、Task，保存後僅 Type 維度變更。
3. 對缺少及衝突 Priority／Type 的測試 Issue 開啟 badge 選單，選擇有效值；確認異常被修復且非目標 Labels 不變。
4. 在 Issue List 與 Gantt 點有效 Status badge，確認出現既有 action/reason 選擇、適用 Assignee 控制與確認；取消時 Gitea 不變，確認後狀態及負責人依 action 更新。
5. 在 Kanban 拖曳 Issue 到其他 Status 欄，確認使用既有轉換流程；點擊卡片內 Priority／Type 選單不觸發拖曳。
6. 對保存中的 Issue 從另一個 Gitea session 做更新，再於 Portal 提交舊版本；確認 Portal 顯示衝突，不覆蓋新值並重載實際狀態。
7. 使用無 Label 寫入權限的帳號嘗試修改 metadata；確認顯示失敗且不回報保存成功。
8. 以鍵盤操作選單、Escape 取消及焦點返回；在 zh-TW、en、ja 與窄螢幕檢查選單、錯誤和 badge 可辨識。

## Expected Result

所有 view 顯示 Gitea 已保存值。Status 只經既有工作流變更；失敗或取消不顯示未保存值為成功。
