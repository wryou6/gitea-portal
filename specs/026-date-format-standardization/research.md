# Research: 日期格式統一

## 1. 固定數字格式與本地 timestamp 顯示

**Decision**: 使用既有 `Intl.DateTimeFormat` 的 `formatToParts` 取得 Gregorian 年月日時分欄位，再以補零與固定 `/`、`:` 組合日期字串。timestamp formatter 使用瀏覽器本地時區及 `hourCycle: "h23"`；日期-only formatter 使用 UTC，並固定 Gregorian calendar 與 Latin digits。

**Rationale**: `dateStyle`／`timeStyle` 的分隔符、日期順序、曆法與 12／24 小時呈現都受 locale 影響，不能滿足跨 zh-TW、en、ja 完全相同的格式。讀取各欄位再組合可固定輸出，同時保留 Intl 對本地時區與 DST 的轉換。

**Alternatives considered**:

- 依賴 locale 的 `dateStyle`／`timeStyle`：現行作法；各語系格式可能不同，且可能出現年月日文字或 12 小時制，不採用。
- 以 UTC 顯示 timestamp：會改變現有本地時間語意，不採用。
- 新增日期格式化套件：現有平台 API 足以處理欄位與時區，增加套件沒有必要。

## 2. 日期-only 與甘特圖呈現邊界

**Decision**: 對排程日期保持日曆值語意，使用 UTC 或原始年月日欄位組合，不讓本地時區造成跨日。Issue／Comment 明確日期時間、Issue 排程日期及甘特圖完整日期提示使用共用格式；月份列與按尺度縮短的日／日期範圍刻度維持現況。原生日期輸入框仍由瀏覽器呈現。

**Rationale**: 甘特圖刻度需要短標籤以便在既有欄寬中閱讀；使用者已確認保留精簡刻度與原生輸入框。完整日期提示及無障礙名稱仍可一致呈現指定格式。

**Alternatives considered**:

- 將完整年份日期放入每個甘特圖刻度：會超出既有刻度欄寬並降低可讀性，不採用。
- 將原生日期輸入框換成自訂控制項：會擴大互動及無障礙驗收範圍，不採用。

## 3. Validation approach

**Decision**: 不新增測試框架。使用現有 workspace `typecheck`／`build`，再按 `quickstart.md` 檢查三種語系、24 小時制、時區邊界、Gantt 精簡刻度及無效值。

**Rationale**: Web package 目前沒有自動化測試 runner；本次範圍是既有 formatter 及少數 UI 呼叫點，使用專案既定 UI 驗證門檻及明確手動案例即可。

**Alternatives considered**:

- 引入測試框架只驗證此 formatter：會增加 feature 外的依賴與設定；目前不採用。
