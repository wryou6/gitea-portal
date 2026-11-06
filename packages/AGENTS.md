# 共用 packages 指引

`domain` 維護 API 與 Web 共用的業務型別和規則；`gitea-contracts` 維護 Gitea 與 Portal API 的資料合約。

- 共用 package 不依賴 `apps/api` 或 `apps/web` 的應用程式實作。
- 修改公開型別或 API contract 時，同步檢查 `packages/domain`、`packages/gitea-contracts`、`apps/api`、`apps/web` 的型別與呼叫端。
- Issue Status、Type、Priority 等跨 Repository 定義集中在 domain；不要在單一 app 建立衝突的第二份 canonical 定義。
- 型別與建置驗證使用根目錄 `pnpm.cmd typecheck` 及 `pnpm.cmd build`。
