# Data Model: 負責人快速篩選

本功能不新增持久化實體。篩選值存在瀏覽器 URL 和現有 React 檢視狀態；目前登入者 login 來自 Portal session。

## Work View Filters

| 欄位 | 值 | 語意 |
|---|---|---|
| `assignee` | login 字串 | 僅顯示指派給該登入名稱的 Issue |
| `assignee` | `me` | 僅顯示指派給目前登入者的 Issue；分享後依收件者身分解析 |
| `assignee` | `unassigned` | 僅顯示沒有負責人的 Issue；沿用既有語意 |
| `assignee` | `all` | 內部篩選狀態不依負責人限制；網址不輸出此值 |
| `assignee` | 缺省 | 網址狀態不依負責人限制；Portal 預設導覽連結另帶 `assignee=me` |
| `priority`, `issueType`, `state`, `repository`, `label`, `milestone` | 現有 filter 值 | 快速切換負責人時原值保留 |

## URL Rules

- Portal 從非工作檢視頁面建立的預設工作檢視連結加入 `assignee=me`。
- 缺少 `assignee` 表示所有負責人；選「所有負責人」時移除此參數。
- `assignee=me` 依目前登入者解析，讓個人範圍分享給其他使用者時依收件者身分篩選。
- 明確 login、`unassigned` 與其他既有有效篩選值依現有解析規則還原。
- 選「自己」序列化為 `assignee=me`；選「所有負責人」時不輸出 `assignee=all`。
- Clear 重建其他條件的預設值並將負責人設為 `me`；固定 Repository workspace 繼續以路由 Repository 為準。

## Data Ownership

Issue 與 assignee roster 仍由 Gitea 提供。篩選條件是檢視狀態，不會新增 Portal Issue mirror 或變更 Gitea assignee。
