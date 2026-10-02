# Implementation Plan: 日期格式統一

**Branch**: `026-date-format-standardization` | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/026-date-format-standardization/spec.md`

## Summary

將 Portal 自行顯示的完整日期與日期時間統一為 ASCII 數字格式 `YYYY/MM/DD` 與 `YYYY/MM/DD HH:MM`。在 Web 共用 formatter 集中處理日期-only 的 UTC 日曆語意與 timestamp 的本地時間語意；保留緊湊甘特圖刻度、原生日期輸入框、Gitea 資料與其他翻譯文案。

## Technical Context

**Language/Version**: TypeScript 5.8、React 19

**Primary Dependencies**: 既有 `Intl.DateTimeFormat`；不新增套件。

**Storage**: N/A；格式化只影響 Web 顯示，不改 API 欄位、Gitea 資料或 Portal persistence。

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build` 及 `quickstart.md` 手動情境；目前沒有 Web 自動化測試 runner。

**Target Platform**: Portal 現有支援的瀏覽器；本 feature 不執行窄螢幕驗收。

**Project Type**: pnpm monorepo 中的 Web UI，變更限於 `apps/web` 與 feature 文件。

**Performance Goals**: 日期格式化需維持同步、直接呈現，不增加網路請求或可感知的頁面延遲。

**Constraints**: 顯示固定使用 Gregorian 年、Latin digits、`/` 與 `:`；日期時間使用瀏覽器本地時區及 24 小時制。日期-only 值維持原日曆日。甘特圖緊湊刻度與原生日期輸入框不變；缺失／無效值沿用欄位既有處理。

**Scale/Scope**: Issue list/detail、Comment、排程、Gantt 完整日期文字、提示與無障礙名稱；不改 Gitea API、Issue mutation 或資料持久化。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **PASS — Gitea source of truth**: 日期值仍取自既有 Issue／Comment 資料；不新增 mirror、欄位或 persistence。
- **PASS — User authorization**: 不增加 Gitea API 操作或改變目前使用者權限。
- **PASS — Verified Gitea writes**: 不變更 Issue、Label、狀態或日期寫入流程。
- **PASS — Complete aggregation states**: 不變更資料讀取或聚合行為。
- **PASS — Fixed workflow semantics**: 不變更 Issue Status。
- **PASS — Visible text localization**: 不新增硬編碼文案；現有星期／weekend 等語系文案維持翻譯，日期數字格式跨語系固定。
- **EXCEPTION — Narrow viewport acceptance (Constitution VII)**: 依使用者指示，本 feature 不執行窄螢幕可讀性驗收。理由：本次將驗收範圍限於日期格式行為；影響：固定日期字串在窄螢幕可能裁切或換行，未宣稱已驗證；後續：若需求恢復窄螢幕驗收，須補做檢查再宣稱通過。此例外依 Constitution Governance 記錄理由、影響與後續處理。
- **PASS — Spec and tasks**: 本 feature 維護 spec、plan、tasks 與分析。
- **PASS — UI validation**: 實作後執行 workspace typecheck/build 並按 quickstart 驗收。

## Project Structure

### Documentation (this feature)

```text
specs/026-date-format-standardization/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

No external API contract is changed, so `contracts/` is not needed.

### Source Code (repository root)

```text
apps/web/src/i18n/format.ts
apps/web/src/features/issues/IssueComments.tsx
apps/web/src/features/issues/IssueDetailHeader.tsx
apps/web/src/features/issues/IssueRow.tsx
apps/web/src/features/issues/ScheduleDates.tsx
apps/web/src/features/work-views/GanttIssueRow.tsx
apps/web/src/features/work-views/GanttCalendarHeader.tsx
apps/web/src/features/work-views/GanttBoard.tsx
```

**Structure Decision**: 以現有 `apps/web/src/i18n/format.ts` 作為日期格式單一入口，更新其呼叫端移除日期 locale 依賴；甘特圖月份與緊湊刻度繼續使用目前 formatter，完整日期提示改用共用日曆日期 formatter。

## Complexity Tracking

No constitution violations or additional architectural complexity.
