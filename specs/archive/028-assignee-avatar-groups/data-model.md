# Data Model: 多位經手人的頭像提示

本功能只讀取現有 Issue 人員資料，不新增 domain entity、API shape、持久資料或請求。

## Existing data

- `assignee`: Gitea 的單值負責人 fallback。
- `currentOwner`: 開放 Issue 的目前負責人；已完成 Issue 不視為目前負責人。
- `assignees`: Gitea 提供的有序經手人 login 清單。
- `userProfiles`: login 對應姓名與頭像的選填資料。

## Display derivation

1. 開放 Issue 的主要 login 為 `currentOwner`，缺少時沿用既有 `assignee`／名單第一位 fallback。
2. Done Issue 的主要 login 為有序 `assignees` 第一位，缺少時沿用既有單值 `assignee` fallback。
3. 其他 login 依既有有序名單排列，排除重複的主要 login。
4. 可見列為主要頭像與姓名、最多兩個額外小頭像，以及代表未顯示人數的 `+N`。
5. 所有顯示名稱和圖片均經 `UserProfile` helper 取得；缺 profile 或破圖時沿用帳號及預設人像 fallback。
