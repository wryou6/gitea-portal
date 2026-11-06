# 快速驗收：Priority 統一與跨頁呈現

## 編譯與元件展示

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
pnpm.cmd --filter @gitea-portal/web storybook
```

在 Storybook 檢視 Critical/High/Medium/Low、missing、conflict/invalid、create/edit field、Issue row/detail、Kanban card、Gantt row，並切換 light/dark theme。確認文字、層級順序、鍵盤可辨識性及窄版面呈現一致。

## Gitea 手動驗收情境

使用指定的非正式環境測試 Repository 與具有 Issue/Label 寫入權限的登入者；勿在正式 Repository 執行此驗收：

1. 逐一以四個 Priority 建立 Issue；確認 Gitea 中恰有對應 `priority:*` Label，且同一 Repository 重用 Label definition。
2. 僅改 Priority 後編輯 Issue；確認新級別取代舊級別，Type、Workflow、排程與一般 Labels 保留。
3. 修改一般 Labels、Priority、Type 與排程欄位後儲存；確認一次更新後所有選定及保留 Labels 均存在。
4. 在 Gitea 移除 Priority、加入多個 Priority，或加入未知 `priority:*` Label；確認 Portal 分別顯示未設定或衝突／無效，編輯表單可修復。
5. 在 Portal 開啟編輯表單後從 Gitea 修改 Issue；提交舊資料時確認 optimistic concurrency 拒絕覆寫並提示重新載入。
6. 移除 Label 寫入權限或模擬 Gitea Label 操作失敗；確認畫面回報失敗且不顯示成功狀態。
7. 檢視 Issue list/detail、Kanban、Gantt；確認 Priority 等級一致，一般 Labels 依既有完整資料呈現規則可用。

Gitea 是唯一持久化來源；以 Gitea 實際 Label 集合及 Portal 重新載入結果確認寫入與讀取一致。

## 執行紀錄（2026-09-27）

- 指定 Repository：`admin/portal-test-ops`（dummy Repository，workflow convention 為 `workflow-a@1`）。Gitea MCP 的 `admin` 身分可建立 Issue、Label 並讀回結果；Portal delegated session 權限尚未驗證。
- 建立 dummy Issues #5–#8，分別以四級 Priority 建立，Gitea 回傳各自唯一的 `priority:critical`、`priority:high`、`priority:medium`、`priority:low` Label，且重用 Repository 已有的 Priority Label definitions。
- Issue #5 從 `priority:critical` 改為 `priority:high`，讀回確認 `type:task` 與 `workflow-a:todo` 保留。
- Issue #6 的標籤集合改為 `priority:medium`、`type:bug`、`workflow-a:todo`、`start-date:2026-10-06`、`area:priority-test`；Gitea 讀回確認選定的標籤集合完整。Gitea MCP 更新 due date 回傳 `2026-10-07T07:59:59+08:00`，因此這不等同 Portal schedule 表單驗收。
- Issue #7 依序設為無 Priority、同時有 critical/high、未知 `priority:urgent`；Gitea 讀回確認三種標籤狀態。之後已還原為有效的 `priority:critical`。暫時建立的 `priority:urgent` Label 已刪除；Issue 保留 `area:priority-test`。
- **未完成 Portal 端驗收**：直接讀取 `http://localhost:5173/api/repositories`、`/api/issues/admin/portal-test-ops/1` 均回 HTTP 401，且本次沒有已登入的 Portal 瀏覽器 session。因此無法確認 Portal create/edit 表單、錯誤提示、optimistic concurrency、權限失敗回報，或 Issue list/detail/Kanban/Gantt 的即時呈現；未變更 Repository 權限。
- Playwright CLI 不在本機快取，離線 `npx` 無法取得套件，故沒有完成瀏覽器自動化。Storybook build 已依 T019 通過，不能替代上述 Portal 整合驗收。
