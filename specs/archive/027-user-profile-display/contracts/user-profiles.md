# User Profile Contracts

## Gitea → Portal

Gitea User 的 login、full_name、avatar_url 分別對應 login、fullName、avatarUrl。共用正規化支援缺值及姓名清空；Issue、Comment、assignees、currentUser 皆使用同一規則。

## 公共讀取介面

- GET /api/session：回傳 { login, displayName?, avatarUrl? }。每次以 cookie token 讀 /user；不回傳 accessToken、csrfToken 或 expiresAt。401 沿用 auth.required；其他外觀故障回快取。登入者不符 cookie login 時清 session 並拒絕。
- Issue list/search/detail、All repos／Repository Kanban 與 Gantt：現有結構新增 userProfiles?，不改 author、assignee、assignees、currentOwner。
- GET /api/issues/:owner/:repo/:number/comments：user 增加選填 fullName、avatarUrl；讀取失敗維持錯誤。
- GET /api/repositories/:owner/:repo/assignees：每個 login/fullName 物件增加選填 avatarUrl；原權限驗證不變。
- 所有修改介面仍接受 login，不接受 fullName 作身份。

## UI 介面

UserIdentity 接受 UserProfile、size（24／32）、是否自建鍵盤焦點。主要文字姓名優先，帳號提示支援 keyboard/focus；圖片不重複朗讀。不新增使用者 profile fetch。

WorkViewFilterBar 及 WorkViewLayout 保留 string[] login 與現有 filters，增加選填 userProfiles；選項文字與篩選摘要依 profile 顯示姓名，值仍為 login。缺資料仍顯示 login。

## 相容及失敗驗收

舊 Issue／Session／Comment 缺少新增欄位不造成解析失敗。圖片故障只降級人像；profile refresh 不延長 session，來源姓名／圖片移除不保留舊值。必要工作資料錯誤不降級成完整結果。
