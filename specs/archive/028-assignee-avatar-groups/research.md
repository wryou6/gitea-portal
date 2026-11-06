# Research: 多位經手人的頭像提示

## Existing behavior

- `Issue` 已包含 `assignee`、有序 `assignees`、`currentOwner` 與選填 `userProfiles`。
- Issue List、Gantt 目前只呈現單一 `assignee`；Kanban 依狀態選取 `currentOwner` 或 Done 的第一位保留 Assignee。
- `UserIdentity` 已負責主要人員頭像、姓名、帳號提示及圖片失敗 fallback。
- Gantt 的 Assignee 欄採內容量測；任意數量頭像會無限制擴張欄寬並壓縮時間軸。

## Decisions

### 維持 view 既有的主要人員

開放 Issue 以 `currentOwner` 為主，fallback 到既有單值 Assignee；Done Issue 以第一位有序 Assignee 為主。每個其他 login 依 Gitea 順序呈現且排除主 login，避免重複頭像或語意改變。

### 顯示最多兩個額外頭像

主要人員保留 24px 頭像和姓名；其餘人員用 16px 頭像接在主要姓名後方。最多顯示兩個額外頭像，剩餘人數顯示 `+N`。上限避免人員數增加時擴大 Issue 表格、Kanban footer 或 Gantt Assignee 欄。

### 將完整名單放在單一可及群組上

群組 tooltip、鍵盤焦點的可及名稱列出完整有序姓名及 login。額外頭像為裝飾內容，完整人員文字只由群組提供一次，避免輔助科技逐個重複朗讀。

### 共用頭像 fallback

把現有 UserIdentity 的頭像 fallback 抽成 `UserAvatar`，讓 16px 額外頭像沿用同一來源驗證、圖片載入失敗處理及預設人像，不另造第二套圖片邏輯。

## Rejected alternatives

- 顯示所有額外頭像：會讓 Gantt 欄寬隨人員數增加，且在窄 Kanban 卡片搶占日期與下一步的空間。
- 在每張小頭像旁重複姓名：無法維持緊湊行內格式，也會與主要人員姓名競爭視覺層級。
- 重新查詢每一位使用者：所需 profiles 已隨 Issue 回應提供，逐人查詢會增加負載且不符合 Gitea 權限邊界。
