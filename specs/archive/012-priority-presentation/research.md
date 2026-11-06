# Research: Priority 統一與跨頁呈現

## 決策 1：沿用 Label-backed Issue Type 的資料流

- **Decision**: Priority 以共用 domain 值域對應 Gitea Labels，由 API 從完整 Labels 推導，沿用 create/update endpoint。
- **Rationale**: Issue Type 已採相同模式，能維持 Gitea 為唯一來源，且符合 Portal 不建立 Issue mirror 的專案邊界。
- **Alternatives considered**: 新增 Portal 資料庫欄位或獨立 Priority API；兩者會造成 Gitea 與 Portal 狀態分裂。

## 決策 2：Repository scoped Label 與原子更新

- **Decision**: 寫入前從目標 Repository 查找或建立標準 Priority Label；更新時把選定 Priority 與完整預期 Label 集合交給 `replaceIssueLabelsAtomically`。
- **Rationale**: Gitea Label ID 是 Repository-specific；原子替換、並行檢查與回讀驗證可避免 Priority 更新吞掉 Type、Workflow、排程或一般 Labels。
- **Alternatives considered**: 先刪後加、只更新 Priority Label、直接依另一 Repository 的 Label ID 寫入；這些方式可能造成部分寫入、遺失其他標籤或使用無效 ID。

## 決策 3：共用 domain/呈現狀態

- **Decision**: 使用 `critical | high | medium | low`；從 Label 集合推導有效、missing 或 conflict/invalid。未知 `priority:` 名稱和多個 Priority Labels 都不推定成有效級別。
- **Rationale**: 共用 resolver 可讓 list/detail/Board 與 API 採相同判斷；缺漏和衝突可沿用 Issue Type 的修復互動模型。
- **Alternatives considered**: 使用 Label 顏色或自訂名稱推導等級；顏色與每 Repository 的名稱並非穩定契約。

## 決策 4：沿用現有 Storybook 與語意 tokens

- **Decision**: 使用現有 Storybook stories、theme toolbar、CSS variables 及 UI primitives 設計 Priority badge/field 與不同版面案例，不新增元件套件。
- **Rationale**: 使用者明確指定 Storybook 作為設計入口；現有 light/dark decorators 已適合檢查不同主題，既有 tokens 可確保跨頁一致並控制依賴。
- **Alternatives considered**: 各頁自行設計 badge 或引入新 UI library；會重複視覺邏輯並增加依賴。

## 決策 5：驗收使用現有品質工具與手動 Gitea 情境

- **Decision**: 執行 workspace typecheck、production build、Storybook build，並按 quickstart 使用有權限的 Gitea 測試 Repository 做端到端驗收。
- **Rationale**: Repository 沒有測試 runner；增加 runner 不屬此功能範圍。API 權限、Repository Label 建立及實際 Gitea 寫入仍需整合驗收。
- **Alternatives considered**: 此功能中新增測試框架；會擴大依賴與維護範圍，且不能取代 Gitea 實際權限驗收。
