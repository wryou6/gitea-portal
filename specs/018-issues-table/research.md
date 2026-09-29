# Research: Issues 表格與 Status 統一

本文件記錄以現有程式碼、已澄清需求與專案規範為依據的設計決定。Status Label 遷移由登入的 Gitea `admin` 透過 Portal 管理入口執行；這項既有 feature 工作與 Issues table View Options 分開驗收。

## Issues table 與查詢

### Decision: 在 API 聚合完整 Issue 集合後做過濾、排序與分頁

- **Rationale**: `searchIssuesReadThrough` 已完整讀取使用者可讀 Repository 的 Issues，並在 API 篩選及分頁；排序只在目前前端 50 筆做會造成跨頁及跨 Repository 錯序。沿用 read-through 架構，在切頁前採用白名單排序欄位排序，再取最多 50 筆。
- **Alternatives considered**: 將排序放前端（不符合全結果排序）；逐欄向 Gitea 搜尋（Gitea 查詢不足以表達 Portal 衍生欄位，且跨 Repository 結果不完整）。

### Decision: URL 與 API 以 `sort`、`direction` 表示目前排序，個人預設僅補足未指定的 URL 排序

- **Rationale**: 排序需與現有篩選、頁碼一樣可分享及重載還原。有效欄位與方向採固定白名單；新的欄位預設升冪，同欄位再次觸發切換方向；查詢狀態改變時回到第 1 頁。URL 同時有有效 `sort` 和 `direction` 時優先使用 URL；沒有明確排序時載入帳號預設。第一次套用個人排序後 URL 更新為該排序，保留目前排序 URL 可分享的行為。
- **Alternatives considered**: 只保存於元件 state（重載遺失）；以 client-side sort（只涵蓋當頁）；cookie 永遠覆蓋 URL（無法保留分享連結指定的排序）。

### Decision: 每頁限制 50 筆

- **Rationale**: Web 預設目前是 50，但 API 可接受至 100；API contract 要把上限一致收斂至 50，避免呼叫端繞過 UI 限制。
- **Alternatives considered**: 只限制前端（不保證 API 回應上限）。

## Issue 欄位與排序

### Decision: 從 Gitea Issue 原生欄位補齊建立時間與建立者

- **Rationale**: 現有 Gitea client 尚未映射 `created_at` 與 `user`。將其經 `GiteaIssue`、domain `IssueSummary`、API 與 Web contract 傳遞；不從 Comment 或其他資料推測 Author。
- **Alternatives considered**: 在 Web 另外讀 Issue 詳情（產生 N+1 請求）；使用最後更新者（語意錯誤）。

### Decision: 排序器使用各欄位語意值及穩定 Key tie-breaker

- **Rationale**: 日期使用日曆日期或建立時間排序；Status 與 Priority 使用 domain 定義順序；字串欄位採一致語系無關比較；缺值永遠置底；排序結果以 Key 升冪固定 tie-breaker。Key 的跨 Repository 表示採規格中的 `owner/repo#number`。
- **Alternatives considered**: 把所有值當文字排序（Priority/Status 語意不正確）；只比較目前欄位（同值結果不穩定）。

### Decision: 使用語意化 table headers 和鍵盤可操作排序按鈕

- **Rationale**: 既有 `components/ui/Table.tsx` 提供水平捲動及原生 table 結構，可配合 `<th aria-sort>`、按鈕焦點樣式與目前方向標示；窄視窗保留所有欄位。
- **Alternatives considered**: 可點擊但無鍵盤焦點的表頭文字；窄視窗隱藏必要欄位（違反需求）。

### Decision: View Options 使用兩項入口與既有 Dialog 表單控制

- **Rationale**: View Options 第一層只列欄位可見性和預設排序兩項，選取後再顯示對應表單；欄位順序直接由 table 表頭拖曳，按 toolbar action 保存。沿用 `components/ui/Dialog.tsx`、`Button.tsx`、checkbox/select 等原生表單控制，不引入新 UI 套件。對話框已有 Escape 關閉與焦點圈定行為。
- **Alternatives considered**: 在 View Options 再放十項欄序清單（與 table 拖曳重複）；另裝 component/DnD 套件（現有 UI 元件已足夠，不增加依賴）。

### Decision: 直接拖曳表頭標題並明確保存預設欄序

- **Rationale**: Table 標頭文字本身是拖放起點，拖動只改當次顯示順序；僅在順序改變時顯示「設為預設欄位順序」，按下後保存 cookie。排序按鈕支援 Shift+Space 抓取、左右方向鍵移動、Space 放下及 Esc 取消的鍵盤替代。重排使用 FLIP 動畫並尊重 `prefers-reduced-motion`。所有十欄都可排序；即使排序欄被隱藏，排序設定頁仍會呈現目前預設排序欄與方向。
- **Alternatives considered**: 每次 table 標頭拖拉都自動覆寫預設（不利於試排）；使用專用握把（增加不必要控制項）；只提供 pointer 拖拉（缺少鍵盤替代）；增加方向按鈕（重複顯示拖曳已有的操作，增加表格雜訊）。

### Decision: 以帳號分開的一年期 cookie 保存 View Options

- **Rationale**: `App` 已取得 `/api/session` 的登入 `login`，無需新增 session 請求。使用每帳號一個小型版本化 JSON cookie，cookie 名含 `encodeURIComponent(login)`，值包含完整欄序、可見欄位和預設排序；`Path=/; Max-Age=31536000; SameSite=Lax`，HTTPS 加 `Secure`，不設 `Domain`。偏好不敏感且不含 Issue/token，需由 Web 讀寫所以不設 HttpOnly。欄位或版本不合法時整份退回產品預設；無 login 或 cookie 寫入不可用時，本次頁面仍可操作。
- **Alternatives considered**: localStorage（與使用者明確指定 cookie 相悖）；單一 cookie 裝所有帳號設定（帳號增加後易達 cookie 大小限制）；session cookie（關閉瀏覽器後設定消失）。

### Decision: Storybook 使用注入式偏好 fixture 並檢視三語及無障礙操作

- **Rationale**: `IssueListPage` 已提供 demo props，Stories 可注入偏好與 callback，避免真實 cookie/URL 副作用。Storybook locale toolbar 可切換 zh-TW/en/ja，覆蓋初始/修改後欄位顯示、排序與欄序、窄視窗和鍵盤拖曳；介面用字沿用現有 Issues 翻譯，若 Gitea 有相同意義的詞彙則維持一致。
- **Alternatives considered**: Storybook 直接操作真實 cookie（故事互相污染、不確定）；只在靜態 build 存在但不檢視互動狀態。

### Decision: Due Date 逾期判斷使用使用者當地日曆日

- **Rationale**: `dueDate` 為 `YYYY-MM-DD`，直接與當地今日的日曆字串比較可避免 UTC timestamp 偏移。僅日期文字與火焰圖示使用逾期色彩；Today、未來、closed、缺漏及 anomaly 不顯示逾期標記。
- **Alternatives considered**: 將日曆值轉成 UTC instant 比較（可能造成前後一天偏移）；整列警示（需求明確限制日期 cell）。

## Status 命名與 Label 遷移

### Decision: 保留 Portal 三態與 Gitea 原生 Open/Closed 的區別

- **Rationale**: 現有 domain resolver 將 Todo、In Progress 映射到 Gitea Open labels，Done 映射到 Gitea Closed state。遷移只改 Label 名稱前綴與 Portal 識別字，不新增 `status:done`，也不把 Status 等同原生 state。
- **Alternatives considered**: 將 Status 縮成 Open/Closed（丟失 Portal 三態）；建立 `status:done`（造成 Gitea state 與 label 雙重真相）。

### Decision: 重用逐 Issue Label 全集原子替換、樂觀檢查及回讀

- **Rationale**: `replaceIssueLabelsAtomically` 會重新讀取 Issue、比較 `updatedAt` 與 Labels，再透過 Gitea Labels PUT 一次取代全集，最後回讀驗證。遷移應只替換精確已知的 prefix、保留所有其他 Labels；遇到版本改變、未知舊 prefix 或狀態衝突時回報，不靜默選擇或覆蓋。
- **Alternatives considered**: 每個 Label 分開刪除/新增（會留下部分替換）；直接使用後端高權 token（違反授權原則）。

### Decision: 已有新 prefix Label 優先於舊 prefix Label

- **Rationale**: 使用者選擇新 prefix 作為權威值。同一 Issue 已有新 prefix 時，遷移保留新 Label 並移除所有相應舊 prefix Label；不因舊值不同而回退或覆蓋新狀態／動作原因。沒有新 Label 時才將已知舊 Label 映射為新名稱。
- **Alternatives considered**: 對任何新舊值不同都阻止遷移（使用者選擇讓新值優先）；偏好舊值（可能覆蓋較新的更新）。

### Decision: 以重掃 Gitea 狀態支援續跑與完成驗證

- **Rationale**: 每個 Issue 的更新是獨立操作，Gitea Label 現況可作為冪等進度：已完成者略過、未完成者可重試。任何 Repository 或 Issue 頁面讀取失敗、殘留舊 prefix 或衝突，都不得宣告全域完成。
- **Alternatives considered**: Portal 資料庫 checkpoint（增加第二份遷移真相）；部分成功即整體完成（會移除仍需要的相容性）。
- **Scope**: 唯一執行者為 Gitea `admin`；Portal 管理入口使用該登入 session 遍歷其完整目標 Repository 範圍。任一必要讀取失敗都會阻止確認。

### Decision: 舊 feature specs 僅保留歷史記錄

- **Rationale**: 使用者要求現行程式、契約、設定、翻譯與維護文件在切換後統一使用 Status；舊 feature spec 保留當時設計脈絡，不是維護中的產品說明。現行 Constitution、AGENTS.md、README、config 與程式識別字要更新。
- **Alternatives considered**: 全量改寫舊 feature specs（會改變歷史記錄，且非維護中內容）。
