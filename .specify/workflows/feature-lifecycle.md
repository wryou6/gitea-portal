# Feature 需求同步與生命週期

## 需求品質與實作狀態

- `specs/current/` 是已驗收且仍有效需求的權威來源；根層 feature 是進行中或待驗收的交付工作；`specs/archive/` 保存已完成的歷史交付紀錄。
- 日常需求判讀先讀 `specs/current/README.md` 及相關契約，再讀根層相關 feature。不得讀取 archive，除非使用者要求追查歷史，並標明其歷史性質。
- Specify/Clarify 維護 `checklists/requirements.md` 作為需求品質檢查。Checklist 勾選只代表需求品質檢視，不代表程式實作或交付完成。
- Plan、Tasks 產生後執行 Analyze 檢查跨文件一致性；Implement 後執行 Converge，將未完成的規格要求追加為 tasks。Converge 通過只代表可交付驗收，不代表使用者已接受。

## 現行契約同步

1. 找出變更涉及的已確認需求及產品領域，更新目前 feature 的 spec、plan、tasks。
2. 將仍有效的需求與必要技術約束同步到 `specs/current/`。不可僅依程式碼或舊規格推定新需求已獲使用者接受；不確定時標示待確認。
3. Current 契約按產品領域組織，不複製歷史 feature 清單；封存記錄不作為現行契約的依據。

## 驗收與封存

- Implement 與 Converge 完成後，回報結果並等待使用者明確驗收。沒有明確接受就留在根層並標示待驗收。
- 使用者接受後，先同步仍有效需求至 `specs/current/`，確認文件與交付一致，再將整個 feature 目錄移至 `specs/archive/`。
- 封存保留原編號與目錄名稱。新 feature 編號取根層及 archive 中最大編號加一，永不重用或重編號。
- 本 repo 首次回填既有 feature 時，使用者指定目前根層 feature 預設視為已驗收；可依此核對、同步與封存，不需逐項重新確認。這項一次性例外不適用於後續新 feature。

## 檢查

- 確認 current 僅包含仍有效且已驗收的需求；待確認內容不可寫成已接受要求。
- 確認封存項目已同步有效需求，根層項目狀態清楚，並檢查相對連結。
- 文件變更執行 `git diff --check` 並檢閱差異。
