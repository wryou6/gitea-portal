# Research: 使用者選單與外觀設定

## Decisions

### 使用既有 Portal session login 顯示目前帳號

- **Decision**: Web 啟動流程使用現有 `GET /api/session` 的 `{ login }`，將 login 顯示於右上角選單，並作為本機外觀偏好的帳號識別。
- **Rationale**: API 已提供此欄位，能滿足辨認目前帳號和區分同瀏覽器多帳號偏好的需求，不必新增 Gitea 查詢、欄位或後端契約。
- **Alternatives considered**: 新增 profile API / 查詢 Gitea user profile。兩者都超出只顯示現有 login 的需求並增加 API 範圍。

### 使用每帳號一筆瀏覽器本機偏好

- **Decision**: 將 `light`、`dark` 或 `system` 以 login 隔離後保存在 `localStorage`；缺少、無效或無法讀取時使用 System。儲存失敗不阻止當次的外觀變更。
- **Rationale**: 能跨重新載入保留選擇、讓同瀏覽器不同帳號互不影響，且不把外觀偏好寫入 Portal 或 Gitea 後端。
- **Alternatives considered**: 單一共用 preference 會讓帳號互相覆蓋；伺服器端偏好違反本功能限定本機保存的要求；`sessionStorage` 無法滿足後續使用仍保留的驗收。

### 延用既有 CSS dark class，System 由瀏覽器媒體偏好解析

- **Decision**: 用 `html.dark` 控制目前存在的深色 CSS variables 與 `color-scheme`；System 模式透過 `matchMedia('(prefers-color-scheme: dark)')` 解析並監聽變更。
- **Rationale**: 專案已有 `.dark` token set，無需新增 theme framework 或重寫 component styles。瀏覽器媒體偏好即提供作業系統的 Light/Dark 狀態。
- **Alternatives considered**: 另加 theme dependency 或複製一套 theme variables 會重複現有能力並擴大維護面。

### 在顯示 App 前解析 session 和初始 theme

- **Decision**: React root 建立前取得 session；依 login 讀取偏好、設定初始 theme，再 render App。session 請求失敗時以匿名狀態及 System theme 繼續 render。
- **Rationale**: account-scoped preference 無法在不知道 login 時選對；先套用再 render 可避免載入時閃過另一帳號的主題，也不讓 session API 失敗阻止現有 UI 啟動。
- **Alternatives considered**: 在 App mount 後載入 session/theme 會先畫出錯誤帳號或預設主題；把偏好改成跨帳號共用則違反已確認的需求。

## Repository Evidence

- `apps/api/src/http/routes.ts` 已有 `GET /api/session`，回傳目前登入帳號 `login`，未登入時回 401。
- `apps/web/src/app/routes.ts` 使用手動 path resolver；新增 Settings route 不需路由套件。
- `apps/web/src/components/layout/AppShell.tsx` 提供共用 topbar，可放置帳號選單與 settings link。
- `apps/web/src/index.css` 已定義淺色 root variables、`.dark` variables 與 `html.dark` 的 `color-scheme`。
- 目前沒有共用 profile 元件、settings route 或 theme persistence helper。
