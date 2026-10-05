# Implementation Plan: Kanban 欄位獨立捲動

**Branch**: `[036-kanban-independent-scroll]` | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/036-kanban-independent-scroll/spec.md`

## Summary

將 Kanban 固定在既有全視窗工作檢視版面中，讓每個欄位的卡片清單在固定標題下獨立垂直捲動。桌面保留欄位水平瀏覽；窄視窗預設收合共用篩選器、沿用狀態選擇器，讓選中欄位取得可用高度。只調整 Web 呈現，不改 API、Gitea Issue 寫入或狀態轉移。

## Technical Context

**Language/Version**: TypeScript 5.8、CSS

**Primary Dependencies**: React 19、Vite、React Router；使用現有 work-view 元件與 CSS，無新增依賴。

**Storage**: N/A；Kanban 仍讀取 Gitea read-through 資料，不新增持久化。

**Testing**: Storybook 現有 Kanban 範例的視覺/互動檢視；`pnpm.cmd typecheck` 與 `pnpm.cmd build`。

**Target Platform**: 目前支援的桌面與窄視窗瀏覽器。

**Project Type**: pnpm monorepo Web UI (`apps/web`)，本功能不涉及 API 或共用 package。

**Performance Goals**: 欄位捲動保持瀏覽器原生捲動，不引入每幀 JavaScript 處理或額外資料請求。

**Constraints**: App shell 已固定為 `100dvh` 並隱藏溢出；Kanban 目前位於共用 `work-view-content` 的 `overflow: auto` 容器。須限制範圍，只讓 Kanban 內容區不再垂直捲動，避免影響 List/Gantt。窄版四組共用篩選器預設收合，透過具翻譯與無障礙狀態的控制展開；桌面仍顯示篩選器。欄位可拖放狀態轉移、標題/計數、異常欄及既有窄版 lane picker 必須保留。卡片清單需鍵盤可聚焦且名稱連結到欄位標題。

**Scale/Scope**: All repos 與單一 Repository Kanban；正式三個 Status 欄及可能出現的 Anomaly 欄。無資料模型/API/URL 變更；新增篩選器切換的三語系文字。

## Constitution Check

| Principle | Gate | Design response |
|-----------|------|-----------------|
| I. Gitea 是 Issue 資料唯一來源 | PASS | 只改呈現與捲動容器，不新增資料副本或持久化。 |
| II. 操作權限跟隨目前使用者 | PASS | 不改讀取或寫入路徑及權限。 |
| III. Gitea 寫入保全且可驗證 | PASS | 保留既有狀態轉移實作，不新增 Gitea 寫入。 |
| IV. 聚合結果完整且狀態可辨識 | PASS | 不改載入、錯誤、空資料與聚合行為；仍使用原有畫面狀態。 |
| V. 固定 Issue Status 語意 | PASS | 欄位與狀態值不變，Anomaly 仍維持原有不可作為 drop target 的行為。 |
| VI. 工作範圍清楚 | PASS | 不改標題、Repository 識別及卡片內容。 |
| VII. 使用者可見文字多語系 | PASS | 卡片清單名稱重用已翻譯的狀態欄標題；篩選器 disclosure 新增的展開/收合文字列入 zh-TW、English、Japanese 資源。 |

## Project Structure

### Documentation (this feature)

```text
specs/036-kanban-independent-scroll/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/features/work-views/
├── KanbanBoard.tsx       # Kanban board and responsive lane selection
├── KanbanColumn.tsx      # Column heading and independently scrollable card list
└── WorkViewLayout.tsx    # Opt-in mobile filter disclosure

apps/web/src/i18n/resources/work-views.ts # Localized mobile filter toggle labels
apps/web/src/index.css    # Full-height work view, board and lane overflow layout
```

**Structure Decision**: Reuse the existing Web work-view feature and global stylesheet. Keep the card list wrapper and its accessible scroll behavior in `KanbanColumn`; scope height/overflow changes to Kanban selectors in `apps/web/src/index.css`. Pass an opt-in mobile filter disclosure from `KanbanBoard` to the shared `WorkViewLayout` so List and Gantt remain unchanged. Add its translated labels to `apps/web/src/i18n/resources/work-views.ts`. No API, domain, Gitea contracts or persistence changes are in scope.

## Phase 0: Research

See [research.md](research.md). Existing app shell and work-view layout already constrain the page to viewport height. The shared content container currently scrolls vertically, while the board only handles horizontal overflow; narrow screens select one lane and stack the board. The design moves vertical scrolling to each column's card-list region, collapses only Kanban's common filters by default on narrow screens, and gives the board the remaining height with a Kanban-only content overflow override.

## Phase 1: Design

- [Data model](data-model.md): presentation-only relationship between a status column and its Issue card list; no persisted or API entity changes.
- Interface contracts: no external API or contract changes; the mobile filter disclosure labels are included in the existing localized work-view resources.
- [Quickstart](quickstart.md): manual desktop/narrow viewport, filter disclosure, independent scroll, keyboard, empty lane, and drag/drop verification scenarios.

## Complexity Tracking

No constitution violations or additional architecture introduced.
