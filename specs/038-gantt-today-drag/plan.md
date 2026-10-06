# Implementation Plan: Gantt 今天高亮與拖曳排程

**Branch**: `038-gantt-today-drag` | **Date**: 2026-10-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/038-gantt-today-drag/spec.md`

## Summary

沿用現有 React Gantt 時間軸、日期刻度和 Gitea Issue 更新流程。用整日色帶取代今天細線，並在 Gantt row 上加入日格對齊的拖曳 bar/端點、日期預覽、鍵盤控制和邊界自動延展。只在操作提交時送出一次既有 Issue 更新；任何成功或失敗後都從 Gitea 重新載入列資料，不新增 API、持久化或 Issue mirror。

## Technical Context

**Language/Version**: TypeScript 5.8、React 19、Node.js 22 workspace

**Primary Dependencies**: 現有 React、React Router、react-i18next、CSS variables、Vitest-free Storybook；不新增圖表套件

**Storage**: 不新增儲存；Start date 維持 Gitea `start-date:YYYY-MM-DD` Label，Due date 維持 Gitea 原生 due date

**Testing**: Storybook 三語系/兩主題/多刻度互動情境；`pnpm.cmd typecheck`、`pnpm.cmd build`、Web Storybook build；依 quickstart 覆核 Gitea 寫入與失敗刷新

**Target Platform**: Portal Web，桌面與窄螢幕瀏覽器；游標和鍵盤均可操作

**Project Type**: pnpm monorepo；本功能主要修改 `apps/web`

**Performance Goals**: 拖曳預覽只更新前端狀態，不發出網路請求；游標移動時每個繪製影格至多更新一次預覽；放開後每次操作送出一次 Portal Issue PATCH

**Constraints**: 遵守 Gitea delegated user 權限、`expectedUpdatedAt` 樂觀並行控制及 Label atomic replacement；日期-only PATCH 不要求或改動無關 Type/Priority/Labels；Start 與 Due 跨 Gitea 操作可能部分成功，失敗時以重讀值為準；沿用既有 theme token 與 zh-TW/en/ja i18n

**Scale/Scope**: All repos 與 Repository Gantt；四種 scale；既有已排程、單日、未排程及日期異常列；不更動 Issue 編輯頁或 Gitea API contract

## Constitution Check

| Principle | Gate | Design response |
|---|---|---|
| Gitea 是 Issue 資料唯一來源 | PASS | 拖曳預覽為暫態；已保存日期由 Gitea 更新與重新讀取提供。 |
| 操作權限跟隨目前使用者 | PASS | 使用既有 authenticated Issue update 路徑，不新增較高權限的服務身分。 |
| Gitea 寫入必須保全資料並可驗證 | PASS under Constitution Principle III exception | 沿用 `expectedUpdatedAt`、排程 Label atomic replacement、保留未修改欄位；由 spec 明確允許跨 Due date 與 Label 的依序寫入，失敗時重新讀取並呈現兩端實際值，不宣稱交易原子性。 |
| 跨來源彙整不得呈現部分結果為完整資料 | PASS | 刷新沿用現有 Gantt loader；必要讀取失敗時呈現既有載入錯誤，不把拖曳預覽當成 Gitea 結果。 |
| 共用固定 Issue Status 語意 | PASS | 不改狀態欄、狀態 Label、bar 狀態色或狀態轉移。 |
| 工作範圍與資料來源清楚 | PASS | 保留 All repos 的 Repository 欄與原本 Gantt row 身分。 |
| 使用者可見文字納入多語系 | PASS | 新增拖曳操作、錯誤及 live announcement 文字皆加入 zh-TW/en/ja。 |

無 Constitution violation；沒有複雜度例外。

## Design Decisions

1. **以日曆日定位**：沿用 `gantt-timeline.ts` 的日曆日 ordinal 與四種 scale cell。將今天轉成一日寬度區間；日期轉座標及座標轉日期都使用 cell 內真實日數，避免月格和 DST 偏移。
2. **拖曳手勢**：排程 bar 兩端各有可抓取的端點，中段移動整段；未排程列由按下處拖出含首尾日的區間。按下後未跨出原日期格即視為點擊，不寫入。日期均吸附至游標所在的日曆日。
3. **單日日期欄位**：僅有 Start 時，左端調整 Start、右端建立 Due；僅有 Due 時，左端建立 Start、右端調整 Due。中段拖曳只移動原有日期欄位。
4. **日期順序**：端點拖曳在另一端之前停止；bar 整段移動則 Start/Due 同步平移並保留日數。未排程拖出範圍時，不論拖曳方向，較早日為 Start、較晚日為 Due。
5. **邊界延展**：pointer 靠近水平 viewport 左右各 32px 時以每影格最多 12px 自動水平捲動；靠近日期軸資料兩端時每次增加 28 個日曆日，保持 pointer capture 與目前拖曳日期連續。操作結束後保留擴展後的範圍供檢視。
6. **儲存和錯誤**：pointer release 時送出一次日期 PATCH，更新欄位只包含實際變更日期；整段移動與未排程建立同時提交兩日期。API validator 允許日期-only 更新，schedule service 對未提交的 Type/Priority 保留目前 Label，不修改其他欄位。父層 `KanbanBoard` 提供 schedule mutation callback，沿用 Gantt loader 刷新。成功後以刷新資料取代預覽；失敗時先刷新實際 Gitea Issue 再顯示錯誤。Start date Label 與 Due date 分開寫入，依憲章 Principle III 明確例外接受部分保存，不自行回滾或宣稱原子性。
7. **鍵盤操作**：端點使用可聚焦控制項；方向鍵逐日預覽、Enter 儲存、Escape 還原。使用 aria-valuetext 宣告端點欄位及日期，使用 live region 宣告保存或失敗結果。
8. **展示層與 Storybook**：today tint 使用 theme-aware primary 混色；header label 強調，今天色帶高於 weekend、低於 Issue bar。Storybook 用 callback mock 呈現互動，demo 不呼叫 Gitea。

## Project Structure

### Documentation (this feature)

```text
specs/038-gantt-today-drag/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/gantt-schedule-drag.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/features/work-views/
├── GanttBoard.tsx                  # drag/save/preview lifecycle and timeline bounds
├── GanttIssueRow.tsx               # row bar, handles, pointer and keyboard interactions
├── GanttCalendarHeader.tsx         # full-day today overlay in date header
├── GanttBoard.stories.tsx          # board-scale and save/error stories
└── GanttIssueRow.stories.tsx       # row drag, unscheduled, single-date and anomaly stories
apps/web/src/i18n/resources/work-views.ts # zh-TW/en/ja interaction and announcements
apps/web/src/index.css              # today band, handle hit targets, drag preview states
apps/api/src/issues/issue-validation.ts # allow schedule-only PATCH payloads
apps/api/src/issues/issue-command-service.ts # coordinate date fields and report refreshed partial results
apps/api/src/issues/issue-schedule-service.ts # preserve omitted type/priority labels
```

**Structure Decision**: 沿用現有 `apps/web/src/features/work-views` 元件、API Issue update route 與 Gantt loader，不新增 workspace、資料層、endpoint 或 API 專案。GanttBoard 收到父層 callback，保留 Storybook `demo` 路徑的唯讀行為。

## Phase 0: Research

已檢查現有 Gantt 日期格、row overlay、Issue update、Gitea 排程服務、權限及既有日期規格；詳見 [research.md](research.md)。沒有待解的技術未知項。

## Phase 1: Design & Contracts

- [Data model](data-model.md) 描述暫態拖曳預覽及既有 Gitea Issue schedule，無新增保存欄位。
- [UI interaction contract](contracts/gantt-schedule-drag.md) 定義滑鼠、鍵盤、日期定位、日期順序與保存/錯誤流程。
- [Quickstart](quickstart.md) 列出 Storybook、主題/語言/scale 和授權 Gitea 驗收情境。

## Complexity Tracking

無 Constitution violation，無需例外或額外複雜度。
