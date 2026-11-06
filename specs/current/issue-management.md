# Issue 管理、帳戶與導覽需求

## Issue 建立與編輯

- 使用者可建立及編輯 Issue 標題、描述、類型、優先度、Assignee、Labels、Milestone、排程與 Open/Close 狀態；所有資料由 Gitea 保存。
- 建立 Issue 必須符合固定 Issue Type 契約；既有未知或非標準值不可在編輯時被靜默刪除。
- 類型與優先度使用明確、跨 Repository 一致的 canonical label/value 定義；表單需避免使用者誤選 workflow Labels 作一般分類。
- Issue 描述與留言支援安全 Markdown 呈現，原始文字仍可編輯；外部連結與不受信任內容不可執行腳本。
- 編輯操作遵守目前使用者 Gitea 權限，顯示載入、成功、驗證錯誤、權限拒絕與並行衝突；失敗後以重新讀取的伺服器資料為準。

## 使用者與 Session

- Portal 使用 Gitea OAuth delegated access。未登入時引導登入；登出清除 Portal session；逾期 session 提供重新登入並保留可恢復的工作檢視路徑。
- Session 過期與暫時服務故障要能區別，不把網路錯誤誤報為使用者已登出。
- 顯示 Gitea 使用者姓名優先於帳號，帳號可在提示／選項中辨識；缺少姓名或頭像時回退帳號及預設頭像。
- Token 僅存後端 session，不進入前端 bundle、日誌或持久化資料。

## 導覽及設定

- 首頁為 All repos Gantt；Issues、Kanban、Gantt 與 Repository 工作區有一致導覽及可辨識的選取狀態。
- 使用者設定可保存工作檢視偏好，包括 Done Issue 顯示方式；設定不得複製或持久化 Gitea Issue 資料。
- 個人介面偏好包含繁體中文、英文、日文，以及 Light、Dark、System 外觀和六種配色；缺少或無效偏好使用產品預設值。偏好不得保存 Issue 資料。
- Issues 表格與 Gantt 欄位支援欄位／欄序偏好；不得跨帳戶套用，明確指定的排序優先於預設排序。
- Repository 工作檢視標題顯示 Repository 身分及 Issue 編號，避免跨 Repository 相同編號造成混淆。
- SPA 內部切換不整頁閃白；直接載入子路由、重新整理、返回與查詢參數皆維持可用。
- 所有使用者可見文字經 i18n 資源提供，所有支援語系同步更新；日期及數字格式按使用者語系呈現。
- Issue Markdown 安全呈現於描述與留言；Issue detail 可用對話框快速檢視，鍵盤焦點進出及返回來源檢視須維持可預期。

## 部署

- 根路徑與 IIS 子應用程式路徑均可部署；前端 base path、OAuth callback、WEB_ORIGIN 與反向代理路徑一致。
- IIS 對前端子路徑提供 SPA fallback，API/auth 路徑正確轉送並移除部署前綴；憑證只由 API 環境設定提供。
