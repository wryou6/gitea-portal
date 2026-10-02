# Data Model: Issue list 欄位與預設排序調整

本功能不新增持久化實體或 Gitea 資料欄位；沿用既有 Issue view preference 與 Issue 欄位。

## Issue row identity

- All repos 中每筆 Issue 的 Title 下方以次要文字顯示來源 `owner/repo`，即使 Key 欄隱藏仍可辨識 Repository。
- Repository 專屬 Issue list 以工作區標題顯示 Repository，不重複在每筆 Title 下方呈現。
- `owner/repo` 直接取自 Issue 的 Repository 身分；不新增 API 欄位或儲存資料。

## Issue view preference

| 屬性 | 語意 | 本功能規則 |
|---|---|---|
| Visible fields | 使用者選擇顯示的 Issue list 欄位 | 產品預設包含 Title、不包含 Key；Key 可由 View Options 加入或移除。既有保存清單維持原值。 |
| Column order | Issue list 欄位順序 | 欄位完整順序維持現有值，隱藏欄位保留原位置；既有保存順序維持原值。 |
| Default sort field | 個人預設排序欄位 | 無已保存偏好時為 `dueDate`；舊保存值不遷移。 |
| Default sort direction | 個人預設排序方向 | 無已保存偏好時為 `asc`；舊保存值不遷移。 |

## Issue list resolution

- 有效的 URL sort/direction 優先於個人預設排序。
- 無有效 URL 排序時，使用登入帳號已保存的預設排序；無有效保存偏好時使用 `dueDate asc`。
- 恢復產品預設時，同時採用 Key 隱藏及 `dueDate asc`，並更新該帳號的偏好。
- Due Date 未設定者置後；同日期者以 Key 升冪排序。
- Issue 資料仍由 Gitea 提供；Portal 不新增 Issue snapshot 或 Gitea 寫入。

## Compatibility

- 偏好欄位結構與目前版本相同，不需 cookie/schema 版本遷移。
- 舊偏好包含 Key 時仍有效且保留可見；新預設不包含 Key。
- 偏好中沒有 Key 但有 Title 時視為有效；Title 仍為必要可見欄位。
