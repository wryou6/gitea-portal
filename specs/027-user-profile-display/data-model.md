# Data Model: 使用者外觀資料

## UserProfile / UserProfiles

| 欄位 | 契約 |
| --- | --- |
| login | 必填 string，唯一身份，不因姓名改變 |
| fullName | 選填 string，trim 後空白視為未設定 |
| avatarUrl | 選填 string；只顯示有效 HTTP／HTTPS 圖片網址 |

UserProfiles 為以 login 為 key 的 UserProfile 字典，只保存目前回應內人員。讀取必須只接受 own property，並核對 profile.login 與 key。相同姓名不合併身份；跨 Issue 合併依目前載入資料順序取最後一筆相同 login。

## IssueSummary

新增選填 userProfiles；author、assignee、assignees、currentOwner 及順序完全保持原契約。mapIssue 收錄建立者、單值負責人及完整指派人，確保即使單值負責人不在清單中仍可取得其外觀。

## GiteaUser / Comment

GiteaUser 使用 UserProfile 型別；Comment.user 保留其姓名與頭貼。Repository assignees endpoint 同樣傳遞外觀資料，選取與 mutation 仍使用 login。

## Session

既有 PortalSession 增加選填 fullName、avatarUrl；公共 Session 增加 avatarUrl，沿用 displayName 對應 fullName。更新外觀不得延長 expiresAt 或重建已有 csrfToken；來源清除欄位時同步清除舊值。旧 session 無外觀仍相容。

## 顯示規則

主要文字為 trim(fullName) 或 login。下拉選項有姓名時顯示「姓名（帳號）」；無姓名只顯示帳號。預設人像及圖片占用相同空間；不存在的人員沿用空狀態，不建立虛構 profile。
