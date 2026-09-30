# Research: 側邊導覽建立問題入口

## Decision: 將建立入口作為全域導覽連結

- **Decision**: 新增一般側欄導覽項目，放在 Issues 項目前；於收合狀態仍提供圖示、accessible name 與既有 tooltip 行為。
- **Rationale**: `AppShell` 已集中渲染登入後全域導覽，連結會自然出現在各登入頁，並已有展開/收合、鍵盤焦點與選中狀態支援。
- **Alternatives considered**: 在每個頁面分別加入建立按鈕，會造成入口重複及行為不一致；新增 API 或自訂建立流程會重複既有 Issue 建立能力。

## Decision: 重用現有建立路由與工作區上下文

- **Decision**: Repository 工作區使用既有 Repository 建立路由並保留來源 URL；All repos 及沒有 Repository 上下文的頁面使用現有全域建立路由。建立頁與成功、取消、錯誤流程維持現況。
- **Rationale**: `routes.ts` 已提供全域及 Repository 專用建立 URL；`IssueCreatePage` 已支援從 URL 載入 Repository 和返回位置。
- **Alternatives considered**: 新增建立頁或改變提交後的導覽會擴大本次入口搬移的範圍。

## Decision: 使用共通導覽翻譯資源

- **Decision**: 將入口名稱新增至 `common.ts` 的繁中、英文、日文資源，並沿用 Issue 建立頁對應語意的既有翻譯。
- **Rationale**: `AppShell` 使用 common namespace；專案憲章要求所有全域導覽文字涵蓋支援語系。
- **Alternatives considered**: 在 AppShell 硬編碼或從另一個 namespace 跨元件取字串會破壞現有資源邊界。
