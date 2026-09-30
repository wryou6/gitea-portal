# Implementation Plan: Kanban 欄位與卡片版面調整

**Branch**: `020-kanban-card-layout` | **Date**: 2026-09-29 | **Spec**: [spec.md](spec.md)

**Input**: [Feature specification](spec.md)

## Summary

調整既有 Kanban 呈現：桌面欄位按目前可見欄數平分可用寬度；卡片以三行主要資訊顯示 key/Type/Priority、標題與小字下一步、負責人與 Due date。長標題以省略號截短。卡片不顯示狀態操作按鈕；看板拖曳保留既有狀態確認流程，鍵盤使用者可從標題連結進入 Issue detail 使用狀態動作。欄內由既有 API service 對已讀取的 Issue 排序；不改 API contract 或 Gitea 寫入流程。

## Technical Context

**Language/Version**: TypeScript 5.8、React 19、Node.js 22

**Primary Dependencies**: React、Vite、現有 Portal UI primitives、i18next、Storybook 8.6

**Storage**: N/A；不新增 persistence，Issue 與 Status 繼續以 Gitea 為唯一資料來源。

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`、`pnpm.cmd --filter @gitea-portal/web build-storybook`；以 Storybook 檢視卡片與看板 stories，並用兩筆本機 disposable Issue 分別驗證鍵盤選單與拖曳都先開啟既有轉換確認對話框，且確認後才更新 Gitea。

**Target Platform**: 內網瀏覽器 Web app；桌面與窄螢幕版面、light/dark theme。

**Project Type**: pnpm monorepo；Kanban 欄內排序由既有 API 工作檢視服務處理，卡片呈現沿用 React Web。

**Performance Goals**: 不增加資料請求、載入工作或 Issue 數量；版面操作沿用現有 render path。

**Constraints**: 保留 Gitea delegated permission、atomic Label replacement、optimistic concurrency、StatusTransitionDialog、拖曳、Anomaly 欄、repair/error 註記；所有新文字須提供 zh-TW、en、ja；不得引進 UI framework 或狀態寫入路徑。

**Scale/Scope**: 三個固定 Status 欄，資料異常時加一個 Anomaly 欄；所有卡片沿用既有 All repos 和單 Repository view。

## Constitution Check

- **Pass — Gitea 唯一資料來源**：僅重排 read-time Issue 資訊，不建立 mirror 或持久化狀態。
- **Pass — 使用者權限與安全寫入**：狀態選單只選目的 Status，仍由既有 transition dialog 和服務處理 Gitea 更新、授權與並行衝突。
- **Pass — 固定 Status 與異常辨識**：保留 Todo、In Progress、Done 欄位及 Anomaly 呈現；Anomaly 卡片不提供轉換操作。
- **Pass — 多語與無障礙**：用現有翻譯資源及 UI tokens；選單觸發器、目的狀態與焦點須可由鍵盤辨識與操作。
- **Pass — UI 品質 gate**：更新 Storybook 卡片／看板案例，並執行 typecheck、build、Storybook build；不新增 UI framework。

## Phase 0: Research Decisions

決策與依據記於 [research.md](research.md)：使用 CSS Grid 隱式欄軌依可見欄數平均伸展；沿用目前卡片子元件和 ScheduleDates 日期格式／異常邏輯，讓 Kanban 只顯示 Due date；以原生 disclosure 觸發狀態選單，選擇目的後開啟既有 StatusTransitionDialog，確認後才進行 Gitea 更新；Todo/In Progress/Anomaly 依優先級、到期日和停滯時間排序，Done 最近更新優先。Storybook 是本次版面與選單互動的主要設計檢視面，使用虛構 fixture 覆蓋三欄、四欄、缺漏資訊、長文字與主題；本機 Portal 用兩筆 disposable Issue 分別驗收鍵盤與拖曳 transition dialog 及 Gitea write gating。

## Phase 1: Design & Contracts

- [data-model.md](data-model.md) 確認此功能沒有新 entity、欄位或 API contract。
- [contracts/kanban-card-layout.md](contracts/kanban-card-layout.md) 定義卡片資訊順序、Due date 顯示、狀態 disclosure 行為、Anomaly 操作界線與響應式欄位規則。
- [quickstart.md](quickstart.md) 定義 typecheck、build、Storybook build、視覺／鍵盤檢查及本機 Portal Status transition 驗收步驟。

## Project Structure

### Documentation

```text
specs/020-kanban-card-layout/
├── plan.md
├── research.md
├── data-model.md
├── contracts/kanban-card-layout.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
apps/web/src/features/work-views/
├── KanbanCard.tsx                 # 三行資訊，不提供卡片狀態操作
├── KanbanColumn.tsx               # Anomaly 欄轉換界線
├── KanbanCard.stories.tsx         # 欄位、缺值與選單案例
└── KanbanBoard.stories.tsx        # 三欄／四欄與響應式看板
apps/api/src/work-views/
└── kanban-service.ts              # 依 Status 排序卡片，不新增資料讀取或寫入
apps/web/src/features/issues/
└── ScheduleDates.tsx              # 可重用的 due-only 顯示變體
apps/web/src/i18n/resources/
└── work-views.ts                  # 所有支援語系的 Status 操作文字
apps/web/src/
└── index.css                      # 等寬欄位與卡片資訊列樣式
apps/web/.storybook/
└── preview.tsx                     # Storybook locale toolbar for design review
```

**Structure Decision**: 沿用現有 `features/work-views`、共用 ScheduleDates、i18n 和全域 CSS tokens；在既有 Kanban API service 對已載入資料分欄排序，不變更 API contract 或 Gitea 資料。Storybook fixture 只使用虛構 Issue。

## Complexity Tracking

無 constitution 例外、新依賴或新增專案。
