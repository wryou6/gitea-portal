# Data Model: 未登入與 Session 過期處理

本功能只管理導覽與驗證流程狀態，不建立 Portal 帳號資料或 Issue 草稿。

## SessionBootstrapState

代表 Web 啟動時對目前 session 的判定。

| 狀態 | 內容 | 生命週期 | 行為 |
|---|---|---|---|
| `authenticated` | Gitea login | 目前有效 session | 顯示既有 Portal shell 與頁面 |
| `anonymous` | 無 login | 目前瀏覽狀態 | 隱藏受保護內容並顯示登入頁 |
| `unavailable` | 非授權錯誤或網路錯誤摘要 | 到使用者重試為止 | 顯示錯誤與重新查詢操作 |

只有明確 `401 auth.required` 代表 `anonymous`；其他 session 查詢失敗均為 `unavailable`。

## PortalLogout

代表使用者主動結束目前瀏覽器中的 Portal 登入狀態。登出請求成功前，UI 保持 authenticated；API 回覆成功後清除 `portal_session` 與 `portal_csrf` cookies，Web 導向登入頁。失敗時維持目前狀態並提供重試，不呼叫 Gitea logout，也不清除 Gitea IdP cookie。

## OAuthTransaction

代表一次 Gitea OAuth 往返，保存於短效 HttpOnly transaction cookie。

| 欄位 | 約束 | 說明 |
|---|---|---|
| `state` | 密碼學安全隨機值；單次使用 | 與 callback query state 比對 |
| `returnTo` | 已知 Portal 路徑與原 query；同站且無 protocol-relative／反斜線目標 | callback 成功後回到原頁 |
| `expiresAt` | 短效，建議 10 分鐘 | 超時 transaction 拒絕使用 |

成功、拒絕或失敗的 callback 均清除 transaction cookie。state 無效時不可建立 session，也不可使用未驗證的 return target。

## AuthReturnTarget

一次性站內目的地；包含受允許 Portal 路徑及 query，不包含 origin 或任意 fragment。已知路徑涵蓋首頁、Dashboard、Issue 清單／建立／詳情、設定、All repos views、Repository views。未知路徑、外部 origin、`//`、反斜線與無法解析值一律回 Portal 首頁。

## SessionExpiredNotice

同一瀏覽器分頁內一次性旗標，用於跨 OAuth 頂層導覽提醒 session 已逾期。不得含使用者輸入資料；成功 bootstrap 後消耗。若 Issue 建立或編輯頁返回，顯示未送出欄位未保存、需要重新輸入的提示。
