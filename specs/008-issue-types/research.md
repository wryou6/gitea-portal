# 技術研究：Issue Type 規範

## 現有程式路徑

- `POST /api/repositories/:owner/:repo/issues` 與 `PATCH /api/issues/:owner/:repo/:number` 是 Portal 的 Issue 建立及一般編輯入口。兩者都先檢查 Gitea Repository 權限，再呼叫 `createIssue` 或 `updateIssue`。
- `issue-command-service.ts` 負責驗證寫入內容並轉換 Gitea payload；`issue-schedule-service.ts` 負責完整 Label 替換與 Start date Labels。
- `replaceIssueLabelsAtomically` 會重新讀取 Issue、比對 `updatedAt` 與完整 Labels、替換 Label 集合，再讀回驗證結果。
- `mapIssue` 共用於 Issue 清單、詳情、Repository workspace、Board 與 Gantt response；在此推導 Type 可讓各 response 保持一致。
- 建立與編輯表單目前把一般 Labels 當逗號分隔文字送出；`IssueRow` 與 `IssueDetailHeader` 已顯示完整 Gitea Labels。
- Gitea 操作透過登入 Portal 的 request-scoped delegated client 執行；Label 操作必須繼續使用該 client。

## 設計決策

1. **Type 保存在 Gitea Labels**：Type 是由 Labels 推導的 domain 欄位，不是另一份持久化資料。如此可維持 Gitea 為唯一資料來源，並沿用 Repository-scoped Labels。
2. **寫入 payload 明確帶 `type`**：建立和編輯 request 都必須帶一個標準值。API 拒絕缺少或無效的 Type，包括目前 Type 缺少或衝突的 Issue。
3. **使用完整 Labels 原子替換**：Type、一般 Labels 與排程 Labels 在同一次完整 Label 集合替換中更新，沿用現有 optimistic concurrency 與讀回驗證。
4. **缺少 Label 定義時才建立**：先列出 Repository Labels，重用完全相同的名稱；若不存在，透過目前登入者權限建立。若另一個寫入者先建立，重新列出並重用；否則回報 Gitea 錯誤。
5. **異常時保留原始資料並提供修正方式**：若 Label 集合無法得出唯一標準 Type，API 回傳 `type: null`，但仍回傳完整 Labels；清單與詳情標示異常，編輯表單允許修正。

## Gitea API 依據

- 建立 Label API 要求名稱與顏色；既有 `GiteaClient.createLabel` 已封裝此操作：[建立 Label](https://docs.gitea.com/api/operations/issue-create-label/)。
- Issue Label 替換 API 以 `PUT` 接收完整 Label ID 或名稱集合；請傳入完整目標集合，不拆成逐一新增/移除：[替換 Issue 的 Labels](https://docs.gitea.com/api/operations/issue-replace-labels/)。
- 建立 Issue API 接收 Repository Label IDs：[建立 Issue](https://docs.gitea.com/api/operations/issue-create-issue/)。
- Repository Label 清單 API 可用來尋找並重用定義：[取得 Repository 的 Labels](https://docs.gitea.com/api/operations/issue-list-labels/)。

## 風險與處理方式

- 缺少或衝突 Type 的 Issue 仍可讀取；使用者必須在 Portal 編輯表單選擇一種有效 Type 才能儲存。
- 若建立 Label 定義成功、後續 Issue 寫入失敗，Repository 可能留下未使用的 Label 定義；這不會改動 Issue 資料。
- Gitea 無法把 Label 替換與其他 Issue 欄位更新合成單一交易。Type、一般 Labels 與排程 Labels 仍在同一次替換中更新；後續欄位更新沿用既有錯誤與 concurrency 處理。
- 直接在 Gitea UI/API 編輯可繞過 Portal 驗證；本功能只保證 Portal 的建立與一般編輯入口。
