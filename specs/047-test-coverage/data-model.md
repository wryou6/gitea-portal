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
