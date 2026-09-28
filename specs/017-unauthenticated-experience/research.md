# Research: 未登入與 Session 過期處理

## 決策 1：以三態 session bootstrap 決定進入頁面

- **Decision**: 首次渲染前查詢既有 session；成功顯示登入後 Portal，明確未授權顯示獨立登入頁，網路或服務錯誤顯示可重試頁。
- **Rationale**: 現在 bootstrap 把所有例外都吞掉，導致 API 故障會被當成匿名；三態能保留來源錯誤並避免顯示受保護資料。
- **Alternatives considered**: 所有失敗都顯示登入頁，會把服務中斷轉成錯誤的登入指示；先顯示 App 再查 session 會短暫洩漏登入後導覽及錯誤主題。

## 決策 2：使用集中 401 轉場並重新載入原位置

- **Decision**: 受保護請求收到 `auth.required` 後記錄一次性過期提示並重新載入目前 URL；bootstrap 轉顯登入頁。成功重新登入後返回相同路徑與查詢參數，重新讀取資料，並在 Issue 表單顯示需重新輸入提示。
- **Session invalidation**: Gitea delegated request 回 401 時，API 清除 Portal session cookie，確保重新載入後 `/api/session` 也判定為匿名；Portal session 本身逾期時沿用現有 401 行為。
- **Rationale**: 現有頁面已有各自的載入與錯誤狀態；一次集中轉場避免每個頁面各自實作重新登入，重新載入也確保舊的表單狀態不被意外送出或保留。
- **Alternatives considered**: 在各資料區顯示 inline 401 會造成一致性差；自動重送原請求可能重複執行寫入，不安全。

## 決策 3：將回跳目標綁定到已驗證的 OAuth state

- **Decision**: 登入入口只接受已知 Portal 路由，建立短效 HttpOnly、SameSite=Lax OAuth transaction cookie，將隨機 state 與 sanitized return target 綁定；callback 驗證一次性 state 後才換 token 並導回 `WEB_ORIGIN`。缺失或不合法目標使用 Portal 首頁。
- **Rationale**: OAuth state 同時避免偽造 callback 並保護回跳位置；後端 callback 必須直接將瀏覽器送回 Web origin，不能固定重導至 API `/`。
- **Alternatives considered**: 未驗證 state 或直接信任 query return target 會有 callback forgery／open redirect 風險；只靠前端 `sessionStorage` 不適合作為 callback 驗證。

## 決策 4：以局部 flash 狀態呈現登入失敗

- **Decision**: callback 將拒絕授權或 token exchange 失敗結果以固定錯誤代碼帶回原 Portal 位置；Web 只顯示本地化訊息，不顯示 token、provider response body 或內部錯誤細節。回跳驗證失敗則回 Portal 首頁的通用登入錯誤。
- **Rationale**: 使用者留在原本深連結並能重試，同時不將後端診斷資料暴露到頁面或 URL。
- **Alternatives considered**: callback 直接回傳 JSON 502 對一般使用者無法操作；輸出 provider 細節可能暴露內部資訊。

## 決策 5：沿用現有 UI 與本地化基礎

- **Decision**: 使用現有 CSS variables、`html.dark` theme、瀏覽器／帳號語系解析、原生 button/link；新增 zh-TW/en/ja auth 文案與 Storybook loading/error/login stories。
- **Rationale**: 與既有 Portal 一致，不新增 UI dependency；匿名使用者沒有帳號語系時沿用 `resolveBrowserLocale`。
- **Alternatives considered**: 新增 auth 專用 theme 或共用帳號偏好會重複既有呈現責任。
