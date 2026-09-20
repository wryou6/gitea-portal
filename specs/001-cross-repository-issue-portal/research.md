# Research: 跨 Repository Gitea Issue 管理 Portal

**Date**: 2026-09-20

## Decision 1: Gitea integration contract

- **Decision**: 使用 Gitea REST API v1 作為所有 Issue、Repository、Label、Milestone、Comment 與使用者權限資料的外部來源；Portal 不建立 Issue mirror。
- **Rationale**: Gitea 官方 API 提供跨 Repository Issue search、Issue detail/update、Comments、Labels、Milestones 與 Repository operations；這直接符合 Gitea 唯一 Source of Truth 原則。
- **Alternatives considered**: 直接讀取 Gitea Database 被排除，因為會繞過 Gitea 權限與版本相容性；建立本地 Issue mirror 被排除，因為會產生第二份 Issue 狀態。
- **Evidence**: [Gitea API 1.27.3](https://docs.gitea.com/api/)、[跨 Repository Issue search](https://docs.gitea.com/api/operations/issue-search-issues/)、[Issue labels](https://docs.gitea.com/api/operations/issue-get-labels/)。

## Decision 2: User authorization

- **Decision**: 使用 Gitea OAuth2 Authorization Code flow 建立 Portal session；後端以目前使用者的 delegated Gitea access token 呼叫 API，不使用高權限 service account 代替使用者。
- **Rationale**: 每次查詢與變更都由 Gitea 以該使用者的身分授權，能維持 Repository / Issue 的原有權限邊界。Token 不暴露給瀏覽器 JavaScript。
- **Alternatives considered**: 共用 Portal API token 被排除，因為會讓 Portal 可能擴大一般使用者權限；Basic Auth 被排除，因為 OAuth2 更適合 Web session 與內網既有 Gitea 身分。
- **Evidence**: [Gitea API authentication and OAuth2](https://docs.gitea.com/1.26/development/api-usage)。實際可用 scope 與 OAuth 設定仍需依目標內網 Gitea 版本確認。

## Decision 3: Local persistence boundary

- **Decision**: 使用 PostgreSQL 只保存 Board 設定、Board-Repository 關聯、Board 選用的 Workflow Convention version，以及集中 Workflow Convention config 的同步版本；不保存 Issue、Comment、Label、Assignee 或 Milestone mirror。
- **Rationale**: Board 是 Portal 的工作視圖設定，需要跨 session 保存；Issue 內容仍每次從 Gitea 取得，避免 stale local copy。
- **Alternatives considered**: 不保存 Board 設定會無法實現共享 Board；保存完整 Issue snapshot 會違反 Source of Truth 原則；使用檔案保存可行但不適合多人同時修改共享 Board。

## Decision 4: Workflow Convention configuration

- **Decision**: Workflow Convention 以版本化、集中管理的設定檔提供；每個版本至少提供 Convention ID、版本、狀態 key/名稱、狀態順序與對應的 exact Gitea Label name。Portal runtime 只讀取，不提供 Convention 編輯介面。每個 Repository 明確指派一套 Convention version；Board 固定引用一個 Convention version。prefix/namespace 的實際字串格式保持可配置，不在本階段鎖定單一語法。
- **Rationale**: 符合使用者決策，避免 Portal 變成自訂 Workflow Engine；必要語意欄位讓相容性與狀態順序可判定；版本化可確保既有 Board 不因設定更新而改變欄位語意。
- **Alternatives considered**: 由 Issue Labels 自動推測被排除，因為缺少 Label 時無法可靠判定；讓 Portal 使用者編輯 Convention 被排除，因為本階段不建立管理者與自訂 Workflow 編輯能力。

## Decision 5: Freshness and external changes

- **Decision**: Issue list/detail/Board 讀取採 Gitea read-through；成功的 mutation 以 Gitea response 為準並重新讀取 affected Issue。第一版不保存 Issue cache，也不把 webhook 作為正確性依賴。
- **Rationale**: Gitea 直接修改後，Portal 下一次查看即可取得最新資料；不需要處理本地 Issue cache invalidation 或 webhook delivery backlog。
- **Alternatives considered**: 本地 cache + webhook invalidation 可降低延遲，但會增加 stale data、簽章驗證、重送與版本衝突複雜度；留給後續效能階段。
- **Evidence**: [Gitea Webhooks](https://docs.gitea.com/usage/repository/webhooks/)。

## Decision 6: Board status transition

- **Decision**: Card transition 必須使用能原子替換 Issue Labels 的 Gitea 操作，或等效的 Gitea-supported atomic operation。修改前先驗證目前 Issue、使用者權限、Board 與 Repository 的 exact Convention version、target Label 存在，以及目標 Gitea instance 是否能保證原子結果。若無法保證，Portal 必須在修改前拒絕操作；不得先移除舊 Label 再補加 target Label。
- **Rationale**: 保持單一 Workflow 狀態 Label，且狀態能在 Portal 不存在時仍由 Gitea 保存。原子替換可避免失敗後留下沒有狀態或多個狀態的中間結果；所有拒絕或失敗情況都必須保留原始 Labels。
- **Alternatives considered**: remove-then-add 被排除，因為可能留下部分變更；只新增 target Label 會造成多狀態衝突；只改 Portal 狀態違反 Source of Truth；自動建立缺少的 Label 會讓 Portal 未授權地改變 Repository metadata。若目標 Gitea 版本不支援可驗證的原子操作，該轉換能力應停用或拒絕，而不是退回部分更新。

## Decision 7: Application shape

- **Decision**: TypeScript 5.x / Node.js 22 LTS，React 19 + Vite frontend，Fastify backend，pnpm workspace；後端是唯一 Gitea API boundary。
- **Rationale**: 以一個 repository 清楚分隔 UI、session/authorization、Gitea adapter 與 Board config persistence，適合內網部署與後續 contract testing。
- **Alternatives considered**: 全部由瀏覽器直接呼叫 Gitea 被排除，因為會暴露 token 並把權限/錯誤處理散落在 client；Next.js full-stack 也可行，但本 feature 的明確 backend boundary 與 API contract 更適合分層 workspace。
