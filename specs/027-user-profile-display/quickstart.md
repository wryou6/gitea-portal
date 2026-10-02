# Quickstart: 大頭貼與姓名驗收

## 準備與程式檢查

使用既有 pnpm workspace，不新增 credentials 或更改 Gitea 使用者資料。

```powershell
$env:NODE_USE_SYSTEM_CA = '1'
pnpm.cmd install --frozen-lockfile
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
pnpm.cmd storybook
```

## 瀏覽器驗收

開啟 Storybook 的「使用者／外觀驗收」；依三語系、明暗主題及 1440／720／375 寬度檢視帳戶、清單、Kanban、Gantt、詳情與留言。核對正常／缺圖／失敗頭貼、長姓名、未設定姓名、同名不同帳號、鍵盤帳號提示、人員篩選及 Gantt 對齊。欄位與資料細節見 [contracts](contracts/user-profiles.md)。

## 契約與回歸

使用本機模擬 Gitea，不連真實修改介面，驗證：
- Issue/comment/assignees 正規化完整保留資料且不增加逐人請求。
- /api/session 更新、清空外觀、舊 cookie、timeout／503／403 fallback、401 清 session、身份不符拒絕。
- Authorization header 不覆寫 cookie 身份；回應不含 token／CSRF／expiry。
- 姓名 fallback、特殊 login 字典安全、同名選項與 login 篩選。
- 讀取只有 GET；篩選、指派身份、Kanban owner 選取與原排序規則不變。

## 真實整合與證據

已有授權登入狀態時檢視 Portal，各視圖與 Gitea 同一人頭貼／姓名應一致。真實頭貼變更情境需使用者授權修改測試帳戶；未有此條件時記錄為未驗證，不自行更改帳戶。

## Validation Record

### 2026-10-02

- **API mock**：`pnpm.cmd --filter @gitea-portal/api validate:user-profiles` 通過。涵蓋 GET-only、cookie delegated token 優先於 Authorization header、response 不含 token／CSRF／expiry、成功更新與清除姓名／頭貼、403／503／timeout fallback、Gitea 401、login 不符及 session expiry／CSRF 保留。
- **Workspace**：`pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd --filter @gitea-portal/web build-storybook` 通過。Storybook build 仍有既有 dependency `eval` 與大 chunk 警告。
- **格式與空白**：新增 profile domain、helper、identity component、stories 及 mock script 通過針對性 Prettier 檢查；`git diff --check` 通過。根目錄 `pnpm.cmd format:check` 仍失敗，掃描到 224 個 repository 檔案，包含既有 skill、舊 specs、source 與未追蹤 `output/` 內容；因此不把全 repo 格式檢查記為通過。
- **Storybook browser**：檢視 Issues row、Kanban card、Gantt row／board、Issue detail、Settings、同名帳號及長姓名；確認姓名與帳號輔助標籤、篩選選項、帳戶選單操作、預設頭像與 Gantt 表頭／列對齊。抽查 zh-TW light 的 1440／720／375 CSS px、en dark 的 375 px、en light 的 Issues/Gantt 1440 px 與 Gantt 375 px、ja dark 的 long-name/detail 375 px 與 Gantt 1440 px。截圖保存在 `output/playwright/027-*.png`，只作本機證據。
- **Storybook 限制**：Settings screen fixture 會對 Storybook host 的 `/api/repositories` 發出兩個 404；身份元件及 work-view stories 無 console error。這兩個 fixture 404 不代表已驗證登入後 API。
- **真實 Gitea**：尚未使用授權測試帳戶驗證更名／換頭貼後的 reload；mock 與 Storybook 不替代此項真實整合驗收。本次沒有修改 Gitea 使用者或 Issue 資料。
