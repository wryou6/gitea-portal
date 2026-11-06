# Data Model: 分層自動化測試

本 feature 不新增產品資料模型或持久化。

## Test fixture

- **Purpose**: 為單一測試提供隔離的請求、session、Gitea response 或 Issue 資料。
- **Lifecycle**: 每個測試建立自己的 fixture；測試結束即丟棄，不共用可變狀態。
- **Constraints**: 不含真實 credentials、私密資料或正式 Gitea 資料；需要 token 時使用明確的假值。

## Mock Gitea response

- **Purpose**: 控制 adapter 所見的 HTTP status、headers、body、延遲與失敗情境。
- **Lifecycle**: 由測試建立並攔截；測試結束必須復原攔截器。
- **Constraints**: 除非測試明確安排，未預期的 Gitea request 必須使測試失敗，避免意外連線外部服務。

## Authenticated request fixture

- **Purpose**: 透過 Fastify inject 執行帶簽章 session、CSRF 與 repository permission 的 API route 測試。
- **Lifecycle**: 每個測試自行建立 session/user/repository 權限與 Gitea response；測試結束即丟棄。
- **Constraints**: 權限遵循 route 實際要求；拒絕案例必須斷言 Gitea write 次數為零。

## Transition fixture

- **Purpose**: 表示 Issue 版本、一般 Labels、workflow Label 和預期 status transition。
- **Lifecycle**: 僅存在於測試替身及瀏覽器 route mock。
- **Constraints**: 成功結果保留一般 Labels 並以一次 atomic replacement 更新；衝突不得呈現為已保存。

## Browser interaction case

- **Purpose**: 驗證 WorkViewFilterBar 和 Kanban transition 的可觀察 DOM、URL、keyboard 與錯誤行為。
- **Lifecycle**: Playwright 建立隔離頁面；API response 由 route mock 提供。
- **Constraints**: 不使用正式 Gitea；不得把未保存的樂觀狀態當作成功。
