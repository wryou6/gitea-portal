# Research: Portal 中英日語系

## 1. React 語系資源與執行方式

**Decision**: 使用 `i18next` 與 `react-i18next`，三種語系資源靜態打包並在 React mount 前初始化；依 UI area 分 namespace，使用 TypeScript 資源 shape 檢查三語 key 完整度。使用 `i18next.changeLanguage` 即時更新 React UI，並同步設定根 HTML `lang`。

**Rationale**: 專案已是 React 19/Vite/TypeScript，但沒有 i18n 套件。此方案提供 interpolation、複數規則與 React hook，且不需另寫 lookup、複數或 rerender 系統。靜態打包三語避免首屏等待非同步翻譯；namespace 讓新增語系或功能時可按領域維護。

**Alternatives considered**:

- 手寫 TypeScript dictionary：不需依賴，但 interpolation、plural rules、React context 與 fallback 都會變成專案自維護能力。
- 載入 JSON 翻譯檔：常見且可外部維護；本專案使用 TS `as const`/`satisfies` 資源可直接檢查 key parity，避免單純 runtime fallback 隱藏漏譯。
- `i18next-browser-languagedetector`：不採用。Portal 必須先取得 session login，套用帳號本機偏好優先於 browser locale；現有 bootstrap 已負責登入解析。

References: [i18next TypeScript](https://www.i18next.com/overview/typescript), [react-i18next `useTranslation`](https://react.i18next.com/latest/usetranslation-hook), [i18next plurals](https://www.i18next.com/translation-function/plurals), [i18next formatting](https://www.i18next.com/translation-function/formatting).

## 2. Locale detection, persistence and formatting

**Decision**: 支援內部 locale `zh-TW`、`en`、`ja`；未保存偏好時依 `navigator.languages` 順序將 `zh-*` 映射到 `zh-TW`、`en-*` 到 `en`、`ja-*` 到 `ja`，都不支援時用 `zh-TW`。使用者選擇優先，依 `gitea-portal:locale:<encoded-login>` 存於 localStorage。無 login 時只用 browser locale。

**Rationale**: 與現有依 login 區隔的 theme preference 一致，不需新增 API 或使用者資料。`navigator.languages` 是有序的 BCP 47 使用者偏好。初始化在取得 `/api/session` 後、React 第一次 render 前完成，可以避免語系閃爍。

**Decision**: 使用原生 `Intl.DateTimeFormat`、`Intl.NumberFormat` 格式化日期、時間及數字；日曆日期以 UTC 或年月日欄位建立 formatter input，避免 date-only 值套用本地時區後偏移。

**Alternatives considered**:

- 將語系保存於 Portal server：可以跨裝置同步，但需要使用者偏好 persistence/API，超出已確認的本機設定邊界。
- 永遠依 browser locale：無法保留使用者手動選擇。
- 為日期加入外部套件：目前只有 locale 格式化需求，原生 Intl 已足夠。

References: [MDN `navigator.languages`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages), [MDN `Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).

## 3. Gitea terminology parity

**Decision**: Portal 與 Gitea 共享概念的介面詞彙以目前 Gitea `1.27.3` release locale catalogs 為固定審核依據。記錄 Portal 使用到的概念 key、Gitea catalog key、`zh-TW`/`en-US`/`ja-JP` 詞值及 release provenance；Portal 的 internal `en`/`ja` 分別對照 Gitea locale `en-US`/`ja-JP`。不將整套 Gitea catalog 複製進 Portal，也不在 runtime 請求 Gitea locale 檔。

**Rationale**: Gitea release 有固定 locale catalog；以版本標記的精簡詞彙對照表能實現使用者要求的中英日相同用語，同時避免部署 Gitea 多 instance、離線使用、上游版本漂移或 runtime 請求失敗影響 Portal。`Issue` 繁中詞值採 Gitea「問題」。Portal-only terms 使用 Portal 詞彙表，明確標示沒有 Gitea catalog key。

**Upgrade rule**: Gitea 支援版升級時，核對新 release 的三語 catalog key/value 差異，再更新 glossary provenance/value 與一致性驗收。不得跟隨 floating `main` 自動改變 Portal 用詞。

**Alternatives considered**:

- Runtime 抓取 Gitea 翻譯：Gitea API 不提供這項穩定介面，會引入網路依賴及版本不一致；不採用。
- 把全部 Gitea locale catalog 複製進 Portal：catalog 範圍遠大於 Portal 使用詞彙，並造成大量重複與升級負擔；不採用。
- 僅以 Portal 翻譯者自行翻譯共用詞：會延續目前 Gitea 與 Portal 用語歧異；不採用。

References: [Gitea v1.27.3 locale catalogs](https://github.com/go-gitea/gitea/tree/v1.27.3/options/locale), [Gitea English catalog](https://github.com/go-gitea/gitea/blob/v1.27.3/options/locale/locale_en-US.json), [Gitea translation contribution policy](https://github.com/go-gitea/gitea/blob/main/CONTRIBUTING.md#translation), [Gitea zh-TW `issues` wording](https://github.com/go-gitea/gitea/issues/6391).

## 4. Localizable API errors

**Decision**: API error responses add a stable `code` and optional interpolation `params`; keep the current `error` text additively for existing consumers. API-originated Gitea failure detail is carried separately as `detail`. Web renders a localized summary by `code`, and displays raw upstream `detail` unchanged. Unknown or absent code maps to a localized generic error.

**Rationale**: Current `api.ts` throws strings assembled from `{ error, detail }`; server errors include English, Chinese and upstream messages, so translating their rendered strings would be brittle. Stable semantic codes make translations independent from error wording. Keeping `error` and adding `code` is additive for any existing response consumers.

**Alternatives considered**:

- Translate by matching the current error message string: rejected because small wording changes silently break mapping.
- Translate Gitea's upstream `detail`: rejected because it is external content and may contain dynamic or version-specific diagnostic text.

## 5. Existing Web integration points

- `apps/web/src/main.tsx` already fetches `/api/session` and reads the account's theme before `createRoot`; initialize locale in the same bootstrap boundary.
- `apps/web/src/features/settings/SettingsPage.tsx` hosts current user settings; add the language selector there.
- `apps/web/src/features/settings/theme-preference.ts` is the account-scoped local preference pattern to follow.
- Hardcoded date locale exists in `IssueComments.tsx`, `IssueDetailHeader.tsx` and `IssueRow.tsx`; date-only scheduling uses `ScheduleDates.tsx` and Gantt calendar boundaries.
- Fixed Workflow response includes stable state/action keys; translate UI names using those keys, never by comparing mutable `displayName`, `nextAction` or Gitea Label text.
- Issue payload currently also exposes `nextAction` as localized prose. Add a stable `nextActionKey` beside it so detail/list/Board UI can translate derived next-step text without inspecting message strings; keep `lastActionKey` for the transition reason.
