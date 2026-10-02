# Research: 最近完成項目篩選與完整 Issue List

## 決策：用 Gitea 關閉時間判斷完成日期

- **Decision**: 將 Gitea Issue 的 `closed_at` 正規化為 Portal Issue 摘要的可空完成時間，傳給 Web work views。
- **Rationale**: Done 對應 Gitea Closed；`updated_at` 表示最後更新而非完成時間，Issue 關閉後再編輯會錯誤改變近期範圍。Gitea Issue API 將 `closed_at` 定義為 date-time 欄位。[Gitea API: Get an issue](https://docs.gitea.com/api/operations/issue-get-issue/)
- **Alternatives considered**: 使用 `updated_at`（不代表完成）；從關閉事件時間線查詢（增加每個 Issue 的額外請求且不符合現有讀取模型）。

## 決策：以使用者當地日期套用 30 日視窗

- **Decision**: 取當地今天及往前 29 個日曆日；將 Gitea 關閉時間轉成使用者當地日期後比較，起始日包含在內。缺少或無效的完成時間不符合近期條件。
- **Rationale**: 與已確認的「含今天的最近 30 個日曆日」一致，且跨 DST、月份及年份時仍按本地日曆日期運作。
- **Alternatives considered**: 固定最近 30×24 小時（可能讓同一當地日期依時刻改變可見性）；以 `updated_at` 代替完成日期（語意錯誤）。

## 決策：沿用現有完整 Gitea 讀取，取消 Portal Issue List 分頁

- **Decision**: 保留 Issue search read-through 對所有 Repository 讀取所有 Gitea 頁面的行為，讓 Portal API 回傳排序後的完整符合結果；Web 移除 page/has-next 狀態及翻頁控制，忽略舊網址的 `page` 參數。
- **Rationale**: 現有 `searchIssuesReadThrough` 已聚合每個 Repository 的全部 Gitea pages，分頁只在彙整後以 50 筆切片。移除 Portal 切片可達成一個連續 Issue List，而無需新的資料來源或快取。
- **Alternatives considered**: 保留 Portal 分頁（不符合需求）；以新 API 取得不完整結果或只隱藏頁面控制項（會遺漏資料）。

## 決策：近期完成開關使用暫時頁面狀態

- **Decision**: 在共用控制面板提供預設勾選的「只顯示最近完成的項目」核取方塊；每頁本地狀態控制，變更即時生效，不寫入 URL 或偏好儲存。
- **Rationale**: 符合使用者選擇，並與既有可分享的篩選參數及帳號偏好分離；重新載入或離開頁面後回到預設。
- **Alternatives considered**: 加入共用 URL 篩選（會違反目前頁面限定）；存成個人偏好（會跨頁保存）。

## 決策：只對 Done 套用 predicate

- **Decision**: 先套用既有 Issue 條件，再只對 `status === "done"` 的項目檢查完成日期；其他狀態及異常項目維持可見。
- **Rationale**: 開放中的工作沒有完成時間；近期限制只為縮短 Done 歷史欄，不應改變 Todo/In Progress 工作集合。
- **Alternatives considered**: 對所有 Issue 套日期條件（會隱藏尚未完成工作）；改動 Gitea 狀態或搬移歷史項目（超出檢視功能範圍）。

## 資料流與錯誤處理

Gitea repository issue pages → API 正規化及 Issue 摘要 → 完整 Issue search response / work-view data → Web 既有篩選與近期 Done predicate → result count 和檢視。

任何必要 Repository 或 Gitea page 讀取失敗仍沿用整體請求錯誤，不得顯示部分 Issue List 並宣稱完整。篩選為零筆時使用既有空結果呈現。
