# Implementation Plan: Gantt 表格與日曆時間軸

**Branch**: `019-gantt-table-timeline` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/019-gantt-table-timeline/spec.md`

## Summary

將既有 Gantt 多行 Issue 卡片改為左側可自訂欄位的精簡資料表與右側可水平捲動的日曆時間軸。重用目前 Issue 資料、Status 呈現、View Options、登入狀態與 URL 更新慣例；新增獨立的 Gantt 欄位偏好 cookie，並將起始日期和 Scale 保存於網址。以語意化 DOM/CSS 呈現，不新增 API、Issue 持久化或圖表套件。

## Technical Context

**Language/Version**: TypeScript 5.8、React 19、Node.js 22 ESM、pnpm 9 workspace

**Primary Dependencies**: 現有 React、react-i18next、Vite、Tailwind CSS v4 token 樣式、Storybook 8.6；不新增執行期相依套件

**Storage**: Gitea 維持 Issue 與排程唯一來源；Gantt 欄位偏好使用依登入名稱隔離的一年期 cookie；起始日期與 Scale 使用 URL query state

**Testing**: Web typecheck/build；Gantt Storybook 代表性欄位、時間軸、偏好與響應式狀態；依 quickstart 檢查日期定位、query reload/share、鍵盤與三語呈現

**Target Platform**: 內網桌面及窄螢幕瀏覽器

**Project Type**: pnpm monorepo；本功能僅修改 `apps/web`

**Performance Goals**: 以 8 筆排程 Issue 的固定 Storybook fixture 和 1440×900 viewport 比較，先記錄改版前首屏可見的 scheduled Issue 列數，改版後至少增加 25%；在既有完整 Issue 集合上建立日期軸，不新增逐 Issue 網路請求

**Constraints**: Gitea 是 Issue 資料唯一來源；All repos 維持完整聚合與 Repository 身分；日期使用日曆日計算；所有使用者文字支援 `zh-TW`、`en`、`ja`；窄螢幕保留整張時間軸並水平捲動；設計遵循 `$ui-styling` 與 `$ui-ux-pro-max`，並使用 Storybook 檢視實作

**Scale/Scope**: All repos 或單一 Repository 的既有 Issue 集合；Gantt 欄位模型有 8 欄（不含開始與到期日期），其中標題、負責人、狀態固定顯示，另有 Type、Key、Priority、Created at、Author 共 5 欄可開關

## Constitution Check

| Gate | 規範 | 設計處理 | 狀態 |
|---|---|---|---|
| I | Gitea 是 Issue 資料唯一來源 | 只讀取現有 Issue 欄位；cookie 只保存檢視欄位偏好；URL 只保存日期與尺度 | PASS |
| II | 操作遵循目前使用者權限 | 不新增 Gitea API 操作、權限或服務身份 | PASS |
| III | Gitea 寫入必須保全資料並可驗證 | 不修改 Issue、Label 或排程寫入路徑 | PASS |
| IV | 聚合讀取不得呈現部分結果 | 沿用現有 Gantt loader 與 all-or-error 語意 | PASS |
| V | Repository 共用固定 Status | 沿用 Issue 的既有 Portal Status 值及 presenter | PASS |
| VI | 工作範圍及來源清楚可辨 | All repos 使用獨立 Repository 欄標示來源；Title 欄只呈現 Issue 標題 | PASS |
| VII | 使用者文字支援所有語系 | 新增 control、Scale、日曆標頭及輔助文字同步更新三語 | PASS |
| UI quality | UI 須可存取、支援窄版與雙主題 | 語意表格、鍵盤欄序調整、狀態不只依賴顏色、Storybook 檢視 | PASS |
| Spec Kit gate | 實作前完成 spec、plan、tasks、analyze | 依指定流程完成分析後才實作 | PASS |

## Project Structure

### Documentation (this feature)

```text
specs/019-gantt-table-timeline/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── gantt-view-url.md
└── tasks.md
```

### Source Code

```text
apps/web/src/features/work-views/
├── GanttBoard.tsx                 # URL state, columns, calendar range and rows
├── GanttIssueRow.tsx              # compact table row and timeline bar
├── gantt-view-preference.ts       # account-scoped Gantt column preference
├── GanttCalendarHeader.tsx        # two-tier calendar labels and today/weekend cues
└── *.stories.tsx                  # representative Storybook states

apps/web/src/i18n/resources/
├── work-views.ts                  # timeline controls, scale, today and calendar labels
└── issues.ts                      # field labels reused by Gantt options

apps/web/src/index.css             # compact rows, split table/timeline and scroll behavior
```

**Structure Decision**: 維持現有 workspace 與 Gantt feature 位置。GanttBoard 負責共享 query/view state，GanttIssueRow 以語意表格列呈現欄位及時間軸內容；偏好 cookie 驗證採純函式 helper。新增日期 header 子元件與 story，避免擴張 API/domain package。

## Design Decisions

### Table and column preferences

- 定義獨立的 Gantt 欄位集合與預設值；沿用 `IssueSortField` 欄位型別及現有 Issues View Options 互動。可選欄為 Type、Key、Priority、Created at、Author；Title、Assignee、Status 固定顯示。
- 預設順序為 Title、Assignee、Status；預設可見欄只有這三欄。Gantt 欄位模型共 8 欄，其中 3 欄固定顯示、5 欄可開關；Start Date 與 Due Date 不可加入表格欄位，時間資訊只由時間軸呈現。
- 以版本化、login-keyed cookie 保存欄位可見性與順序；All repos 與 Repository 共用目前登入者 Gantt 偏好，Issues table cookie 維持獨立。
- 複用欄位拖曳/鍵盤操作、View Options、保存欄序、恢復預設與 reduced-motion reorder pattern；Gantt 不提供排序設定或排序指示，因 spec 未要求 Gantt 排序。
- All repos 在 Title 左側放置獨立 Repository 欄顯示 owner/name；該欄不屬於可選 Issue 欄位與欄序偏好，確保隱藏 Key 欄時來源仍清楚且 Title cell 只呈現標題。
- Assignee 與 Status 欄及 All repos 的 Repository 欄從目前所有可見列量測最大內容寬度，並將同一組欄寬套用到表頭與每列；資料或語系改變時重新量測，避免欄位溢入相鄰欄位。
- 只有存在未排程 Issue 時才渲染未排程區段；零筆時移除區段標題及空狀態，將可用高度留給排程列。

### Calendar timeline and URL state

- 以單一可捲動的日曆區域容納兩層日期標頭與列內容，表頭及所有列共用相同的日期分格寬度；桌面左側表格固定於時間軸左側，窄螢幕保留整體圖表並提供水平捲動。
- 以日期區間建立時間軸完整可瀏覽範圍，涵蓋所有有效排程日期；起始日期只決定初始 scroll position，過早日期仍能往前瀏覽。無排程日期時以選定起始日建立空時間軸定位及明確空狀態。
- Day 以日為格，Week 以週一為週界，2 weeks 以起始日期為 14 日分格錨點，Month 依日曆月分格。區間 bar 仍以真實 calendar date 計算。
- Month/interval header 顯示對應月份及日期區間；當 Scale 粗於 Day 時仍按實際日曆日期標示週末區段。今天在可見範圍時呈現有文字/標記與色彩的垂直定位提示。
- 使用 calendar-day ordinal/UTC 日界計算日期偏移，today 則取使用者瀏覽器本地日曆日；不得用當地午夜時間差計算日數，避免 DST 偏移。
- URL 使用 `gantt_start=YYYY-MM-DD` 與 `gantt_scale=day|week|two-weeks|month`；缺省分別為本地今天前 7 天與 Day。無效值回退預設，更新時保留其他工作區與 Gantt query 參數。Issue detail returnTo 必須包含這兩個參數。

### UI quality and stories

- 導入 `$ui-styling` 與 `$ui-ux-pro-max` 進行版面、可存取性、色彩與響應式檢視；遵循現有 CSS tokens，不引入 Canvas 或新圖表套件。
- Storybook 以明確 fixture 和偏好 props 呈現三語可測的預設/自訂欄位、獨立 Repository 欄、四種 Scale、跨月/週末/今日、URL 起始定位、scheduled/unscheduled/無未排程/anomaly、All repos 身分、窄螢幕及雙主題。
- 使用者可見文字、Scale label、today、兩層 header、欄位狀態與 aria-label 更新 `zh-TW`、`en`、`ja`。偏好 story 不讀寫實際 cookie。

## Complexity Tracking

無 Constitution 例外；不新增 API、持久化服務或 runtime dependency。
