# Implementation Plan: Hover 展開側欄與工作檢視排序

**Branch**: `034-hover-expand-sidebar` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

## Summary

在共用 `AppShell` 將三種工作檢視入口調整為 Kanban、Gantt、List，並讓側欄常態保留窄圖示列。以側欄的 pointer hover 與 keyboard focus 狀態暫時顯示標籤；展開寬度覆蓋相鄰內容，固定窄版的 Grid 欄寬，避免推動工作檢視控制列或 Gantt 時間軸。移除手動開合按鈕及 sessionStorage 側欄偏好，不更動導覽路徑、工作檢視 URL 語意或資料操作。

## Technical Context

**Language/Version**: TypeScript 5.8.2、React 19、原生 CSS

**Primary Dependencies**: React Router 8、react-i18next、Vite 6、Storybook 8

**Storage**: N/A；側欄開合是短暫呈現狀態，不儲存

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`；Storybook 與瀏覽器互動驗收

**Target Platform**: Portal Web；桌面滑鼠、鍵盤及觸控輸入，支援現有窄視窗版面

**Project Type**: pnpm monorepo 中的 Web application (`apps/web`)

**Performance Goals**: 側欄狀態由 CSS 輸入狀態決定，不增加導覽 render 或網路請求

**Constraints**: 遵守既有 responsive grid、Gantt 全高版面、語系、focus-visible 與 work-view URL 行為；展開不得改變內容軌道寬度

**Scale/Scope**: 共用登入後 AppShell 的單一側欄與四個既有導覽入口

## Constitution Check

- **I–VI，Gitea 資料、使用者權限、原子寫入、彙整完整性、固定狀態、工作範圍**：本功能只調整 UI 導覽和呈現，不接觸 Issue 資料或 API，符合。
- **VII，多語系**：只重排既有翻譯入口；移除控制按鈕時不新增使用者可見文案。保留現有入口的 i18n labels 與輔助名稱。
- **Development Process**：維護本 feature spec、plan、tasks 並執行分析；UI 實作後執行 typecheck 與 build。

**Gate**: Pass；沒有憲章例外。

## Design Decisions

1. 導覽維持窄欄為 Grid 的固定第一軌；側欄自身可視寬度透過 overlay 展開，並以明確堆疊順序繪於 `.app-content` 上方。展開寬度不參與 Grid track sizing。
2. 以 `:hover` 和 `:focus-within` 作為展示狀態，只有 hover 規則套用至支援 hover 的指標；焦點狀態讓鍵盤使用者看見標籤。游標與焦點離開後由 CSS 自然回到窄欄，不增加 React 狀態、計時器或保存偏好。
3. 繼續使用入口本身的可存取名稱與 `aria-current`；取消側欄開合按鈕及專屬的展開/收合翻譯 key 使用處。觸控裝置以收合入口直接導覽，無需先切換側欄狀態。
4. 保持現有 AppShell grid 軌道、sticky / full-height work-view 差異與窄螢幕斷點；overlay 須在一般頁面與 Gantt/工作檢視父層均不被裁切。
5. 不新增 API、資料模型、持久偏好或工作檢視 URL 欄位。

## Project Structure

```text
specs/034-hover-expand-sidebar/
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── sidebar-navigation.md
├── quickstart.md
└── tasks.md

apps/web/src/
├── components/layout/AppShell.tsx
├── components/layout/Layout.stories.tsx
└── index.css
```

**Structure Decision**: 改動集中於 Web app 共用 AppShell 與全域 CSS；以 Layout Storybook story 承載人工視覺互動驗收。規格和 UI contract 位於 feature 文件夾。沒有後端、domain 或 Gitea contract 變更。

## Phase 0: Outline & Research

### Findings

- 現有 `AppShell` 已用 `navigationItems` 列表定義 Create、Issues、Kanban、Gantt 順序，並用 sessionStorage 保存展開狀態。
- `index.css` 以 expanded/collapsed class 改變 grid 第一軌寬度；工作檢視會另設 sidebar stretch，Gantt app layout 具有 overflow clipping 邊界。
- `Layout.stories.tsx` 已提供 All repos、Repository 工作區與建立流程 shell stories，可擴充成 overlay 驗收案例。
- 側欄排序和 hover/focus overlay 可完全沿用現有 UI 技術，不需要新套件、API、資料持久化或外部研究。

### Decision

- Decision: 使用既有 CSS Grid 預留窄導覽欄，將展開側欄疊放於內容層上方，並以 hover/focus-within 顯示標籤。
- Rationale: 可保留主要內容與控制列尺寸，避免增加 JS 狀態同步和持久偏好；CSS focus 狀態同時支援鍵盤閱讀標籤。
- Alternatives considered: 繼續以 grid 欄寬推開內容（違反覆蓋需求）；提供手動 pin/開關（與固定收合需求衝突）；保存展開偏好（狀態不是使用者偏好且和預設收合衝突）。

## Phase 1: Design & Contracts

- `data-model.md` 定義短暫呈現狀態與既有導覽項目的關係；無持久化資料。
- `contracts/sidebar-navigation.md` 定義導覽順序、狀態、互動及版面契約。
- `quickstart.md` 說明 typecheck/build 及 Storybook、桌面/窄視窗/鍵盤/觸控的手動驗收。

**Post-design Constitution Check**: Pass；沒有 API 或 Gitea 資料來源改變，並維持 i18n 入口名稱與 focus 可見性。

## Implementation Risks

- 工作檢視 app-layout 的 `overflow: hidden` 可能裁切疊層；Storybook 與實際 Gantt 版面都需確認 sidebar 的 stacking/overflow 邊界。
- Gantt 上層控制列可能建立 stacking context；側欄須在 app-layout 內容層中有明確 z-index，且不可蓋住 topbar。
- 窄螢幕標籤展開寬度受 viewport 限制，不能使整體頁面產生水平捲動。
