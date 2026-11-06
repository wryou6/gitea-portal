# IIS 子應用程式部署與操作手冊

本文記錄 Portal 部署於 `http://10.90.108.137/issue/` 的建置、API 執行、IIS 轉送及驗收設定。所有 Secret 僅存放於 API 主機的 `.env`，不得貼入文件或提交至 Git。

## 部署拓撲

| 元件 | 部署位置／網址 | 用途 |
| --- | --- | --- |
| Portal 前端 | IIS `/issue` 應用程式；實體路徑以 IIS 設定為準 | 提供 `apps/web/dist` 的靜態檔案與 SPA 深層路徑回退 |
| Portal API | `FCSVR`，`C:\gitea-portal`，TCP `3001` | Node.js/Fastify API，入口 `apps/api/dist/server.js` |
| Gitea | `http://10.90.108.137:3000` | OAuth 授權與 Gitea API |
| 使用者入口 | `http://10.90.108.137/issue/` | Portal 公開網址 |

IIS 直接提供前端靜態檔，並將公開 `/issue/api/*`、`/issue/auth/*` 反向代理至本機 `http://127.0.0.1:3001/api/*`、`http://127.0.0.1:3001/auth/*`。API 是獨立 Node.js 程序，不是 IIS 靜態檔。

## 前端建置與複製

在專案根目錄建置 `/issue` 版本：

```powershell
$env:VITE_BASE_PATH = "/issue/"
pnpm.cmd build
Remove-Item Env:VITE_BASE_PATH
```

將 `apps/web/dist` **內容**複製到 IIS `/issue` 應用程式設定的實體路徑。實體資料夾名稱不必是 `issue`。產物包含 `web.config`，供 IIS URL Rewrite 將不存在的前端路徑回退至 `index.html`，並排除 `api`、`auth` 路徑。IIS 需安裝 URL Rewrite。

## API 安裝與環境設定

API 主機使用 Node.js 與 pnpm，專案根目錄為 `C:\gitea-portal`。部署內容需包含 workspace、`apps/api/dist`、`packages/domain/dist`、`packages/gitea-contracts/dist` 和 lockfile；不要將 `.env`、`.git` 或 `node_modules` 從開發機複製過去。於 API 主機專案根目錄安裝執行相依套件：

```powershell
Set-Location C:\gitea-portal
pnpm.cmd install --prod --frozen-lockfile --filter "@gitea-portal/api..."
```

在 `C:\gitea-portal\.env` 設定下列值。OAuth Client ID、Client Secret 和 Session Secret 需填入實際值；不得提交 `.env`：

```dotenv
GITEA_BASE_URL=http://10.90.108.137:3000
GITEA_OAUTH_CLIENT_ID=<API 主機專用 Client ID>
GITEA_OAUTH_CLIENT_SECRET=<API 主機專用 Client Secret>
GITEA_OAUTH_REDIRECT_URI=http://10.90.108.137/issue/auth/callback
GITEA_OAUTH_SCOPE=read:user read:repository read:issue write:issue
GITEA_API_TIMEOUT_MS=10000
PORTAL_SESSION_SECRET=<隨機產生的 Session Secret>
API_PORT=3001
WEB_ORIGIN=http://10.90.108.137/issue/
```

建議為 IIS 部署建立獨立的 Gitea OAuth2 Application，以免更改本機開發環境使用的 OAuth 設定。其 Redirect URI 必須完全符合 `GITEA_OAUTH_REDIRECT_URI`。若 Windows 環境變數已設定同名值，程式會優先採用環境變數而非 `.env`。

手動啟動方式：

```powershell
Set-Location C:\gitea-portal
node apps/api/dist/server.js
```

## IIS 反向代理

IIS 伺服器需啟用 URL Rewrite 與 ARR。ARR Proxy 設定如下：

- `Enable proxy`：啟用。
- `Reverse rewrite host in response headers`：停用，使 API/Gitea 回應中的 `Location` 保留 Gitea 的 `:3000` 連接埠。此為伺服器層級設定。

在 IIS `/issue` 應用程式層級建立輸入規則：

| 欄位 | 值 |
| --- | --- |
| 名稱 | `Gitea Portal API and Auth Proxy` |
| 模式 | `^(api|auth)(/.*)?$` |
| 動作類型 | Rewrite |
| 重寫 URL | `http://127.0.0.1:3001/{R:1}{R:2}` |
| 附加查詢字串 | 是 |
| 停止處理後續規則 | 是 |

規則必須設在 `/issue` 應用程式層級，因為模式是相對於該應用程式路徑。

## API 開機自動啟動

Windows 工作排程器工作 `Gitea Portal API` 的設定：

- 帳號：`FCSVR\TWAdmin`，使用「不論使用者是否登入均執行」。
- 觸發程序：系統啟動時。
- 程式：`C:\Program Files\nodejs\node.exe`。
- 引數：`C:\gitea-portal\apps\api\dist\server.js`。
- 開始位置：`C:\gitea-portal`，確保程式能載入 `.env`。
- 若工作已在執行：不要啟動新執行個體。
- 失敗時每分鐘重新啟動，最多 3 次。

執行帳號需能讀取專案與 `.env`，並連線至 Gitea。可用以下指令檢查工作狀態與 API：

```powershell
Get-ScheduledTask -TaskName 'Gitea Portal API' | Select-Object TaskName, State
curl.exe -i http://127.0.0.1:3001/api/session
```

未登入時 API 回應 `401`、`auth.required` 屬預期結果。

## 驗收結果與範圍

- `pnpm.cmd typecheck` 與 `VITE_BASE_PATH=/issue/` 的 `pnpm.cmd build` 已通過。
- IIS `/issue/api/session` 已成功轉送至 API；未登入回應 `401 auth.required`。
- IIS 轉送及 API 直接回應的 OAuth `Location` 均指向 `http://10.90.108.137:3000`。
- Gitea OAuth 登入、Portal session 與 Repository/Issue 資料載入已由使用者確認正常。
- `Gitea Portal API` 排程工作目前為 `Running`，開機觸發已設定；尚未透過實際重開機驗證。
- 未驗證其他 IIS 主機或其他站台設定。ARR 的回應標頭選項為伺服器層級設定，調整前需確認對同機其他 ARR 站台的影響。
