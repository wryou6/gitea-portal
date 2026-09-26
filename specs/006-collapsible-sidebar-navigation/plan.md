# Implementation Plan: 可收合側邊導覽

**Branch**: `006-collapsible-sidebar-navigation` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-collapsible-sidebar-navigation/spec.md`

## Summary

在全站 `AppShell` 加入四項側邊導覽並保留頂部品牌列，移除頂部 Issues/Boards 連結。側欄收合偏好限目前瀏覽器工作階段。使用 canonical UI routes；沒有 Board 脈絡時由 `/kanban` 或 `/gantt` 開啟 Board 選擇，選取後進入所選 Board 的對應檢視。舊路徑保留為相容入口。這項 UI 變更不新增 API、Board/Issue 資料或伺服器端偏好。

## Technical Context

**Language/Version**: TypeScript 5.8.2、React 19.0.0

**Primary Dependencies**: Vite 6.1、Tailwind CSS 4.3；沿用 React 與原生 SVG，不新增 icon 套件或 router。

**Storage**: 瀏覽器 `sessionStorage` 僅保存側欄展開狀態；Board 與 Issue 的既有保存方式不變。

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`；依規格手動檢查主要導覽流程、鍵盤操作與窄視窗。此 feature 不要求新增測試程式。

**Target Platform**: 現有桌面與窄視窗瀏覽器版 Portal。

**Project Type**: pnpm monorepo 的 React/Vite Web 前端功能。

**Performance Goals**: 不新增網路請求；側欄切換由本地 UI 狀態完成。

**Constraints**: 保留頂部品牌列；側欄四項名稱和目前頁面可辨識；選定 Board 的 Kanban/Gantt 切換保留 Board；無 Board 脈絡時從 Board 清單選擇；窄視窗側欄不得覆蓋頁面；不得新增 Issue/Board persistence 或改變 Gitea 權限行為。

**Scale/Scope**: 全站 Issue 清單、新增/詳情、Board 清單、Kanban 及 Gantt 頁面；四個導覽項目；修改集中於 Web shell、Board 選擇導向與全域樣式。

**Canonical Routes**: `/issues`, `/issues/new`, `/issues/:owner/:repo/:number`, `/kanban`, `/gantt`, `/boards`, `/boards/:boardId/kanban`, `/boards/:boardId/gantt`。`/`, `/issue/...` 與 `/boards?view=...` 為相容入口。

## Constitution Check

`.specify/memory/constitution.md` 目前仍是未填寫的模板，沒有已 ratify 的原則可作為額外 gate。依專案 `AGENTS.md` 檢查：

| Gate | 結果 | 理由 |
|---|---|---|
| Gitea 是 Issue 資料唯一來源，不建立 mirror | PASS | 只調整導覽呈現與暫時性側欄偏好。 |
| Board JSON 保存規則與資料格式不變 | PASS | 不修改 Board store、API 或 Board schema。 |
| Gitea authorization 不變 | PASS | 不新增 Gitea 操作或後端身份。 |
| Workflow Label、Kanban transition 與 Issue Labels 規則不變 | PASS | 不修改 Board Card 或 Issue 編輯行為。 |
| UI 修改後執行 typecheck/build | PASS | Quickstart 列出兩項專案規定的驗證命令。 |

**Pre-design gate**: PASS。無 Constitution Check 違規或需複雜度例外的變更。

## Phase 0: Research Decisions

決策與替代方案整理於 [research.md](research.md)。重點為沿用手寫路由、集中管理 canonical route helpers、用目前 Board URL 保留檢視脈絡，以及使用 session 範圍的瀏覽器狀態保存收合選擇。

## Phase 1: Design

### Data Model

導覽只增加短生命週期的 UI 狀態，細節見 [data-model.md](data-model.md)。不建立 server-side entity、Issue 欄位或 Board JSON 欄位。

### Contracts

不新增外部 API 或跨套件 contract，因此不建立 `contracts/`。

### Validation Guide

手動驗收步驟及命令見 [quickstart.md](quickstart.md)。

## Project Structure

### Documentation (this feature)

```text
specs/006-collapsible-sidebar-navigation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
apps/web/src/
├── app/App.tsx                              # Board selection intent and current route
├── app/routes.ts                            # Canonical UI routes and legacy aliases
├── components/layout/AppShell.tsx           # Top bar and shared sidebar
├── features/boards/BoardListPage.tsx        # Board choice for the requested view
└── index.css                                # Shell, sidebar and responsive layout
```

**Structure Decision**: 保持現有 `apps/web` 功能模組；全站導覽集中在 `AppShell`，Board 清單只處理無目前 Board 時的檢視選擇，路由仍由既有 `App.tsx` 判斷。沒有 API、domain package 或資料保存層變更。

## Post-design Constitution Check

**Result**: PASS。設計仍只涉及 Web UI、URL 導覽和工作階段內的顯示偏好，不新增業務資料保存，也不改變 Gitea 或 Board store 行為。

## Complexity Tracking

無需例外或額外專案複雜度。
