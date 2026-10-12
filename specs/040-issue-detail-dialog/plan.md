# Implementation Plan: 三個工作檢視的 Issue 浮窗

**Branch**: `040-issue-detail-dialog` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/040-issue-detail-dialog/spec.md`

## Summary

在 Issue List、Kanban、Gantt 的既有 Issue key／標題連結上，使用 React Router 8 `Link.mask` 將瀏覽器網址顯示為 Issue URL，同時讓 Router 仍以來源工作檢視作為目前 location。這保留原本的列表／看板／甘特圖元件及其暫態狀態。浮窗讀取 `location.mask` 顯示同一 Issue；關閉時返回上一個 history entry。重新整理後首次載入以 masked Issue URL 顯示完整頁面；展開控制以 replace 導航至完整 Issue 頁面，使返回可回到來源檢視。Issue detail 查詢與所有寫入沿用既有元件及 API，不新增後端契約或 Portal Issue 資料。

## Technical Context

**Router Mode Correction**: React Router 8.4 accepts `Link.mask` in the TypeScript API, but Declarative `BrowserRouter` does not forward that navigation option to history. The Web entrypoint must use `createBrowserRouter` and `RouterProvider` so masked navigation is active at runtime.

**Language/Version**: TypeScript 5.8、React 19

**Primary Dependencies**: 現有 React Router 8 declarative APIs、React i18next、既有 Dialog 與 Issue detail components

**Storage**: N/A；遮罩路徑暫存於瀏覽器 history state，Issue 資料仍即時讀寫 Gitea

**Testing**: `pnpm.cmd --filter @gitea-portal/web exec storybook build`、`pnpm.cmd typecheck`、`pnpm.cmd build`；手動瀏覽器驗收三種 view 的開啟、返回、展開、直接載入與重新整理

**Target Platform**: 現有桌面與行動瀏覽器 Web UI

**Project Type**: pnpm monorepo 中的 React Web 前端功能；不修改 API 或共用 Gitea contract

**Performance Goals**: 開啟浮窗沿用既有 Issue detail 的兩個並行讀取與載入回饋；不額外載入另一份 Issue list/detail 資料副本

**Constraints**: 保留 `returnTo` 安全驗證及工作檢視 URL 清理規則；首次載入或重新整理時，即使 `location.mask` 存在仍顯示完整頁面；不得攔截 Kanban drag 與 Gantt timeline pointer／keyboard 排程操作；新 UI 文字與無障礙名稱更新 zh-TW、en、ja

**Scale/Scope**: All repos 與 Repository workspace 的 Issues、Kanban、Gantt 既有 Issue key／標題連結；不新增 API、Gitea 權限或持久化範圍

## Constitution Check

- Gitea 仍是 Issue、Comment、Labels、狀態與排程資料唯一來源；不增加 Portal mirror 或 persistence。 **PASS**
- Issue 詳情讀取與編輯、留言、狀態操作沿用目前使用者授權及現有 API。 **PASS**
- 不修改共用 API contracts、domain types 或 Gitea 寫入行為。 **PASS**
- 載入、錯誤及保存成功／失敗狀態沿用完整詳情既有回饋；不把未保存預覽當成已完成。 **PASS**
- 新增對話框控制與無障礙文字須同步更新 zh-TW、en、ja。 **PASS**
- 返回路徑必須通過既有 `safeReturnTo`；外部連結、modified click 與新分頁行為維持原生。 **PASS**

## Project Structure

### Documentation

```text
specs/040-issue-detail-dialog/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/issue-detail-navigation.md
└── tasks.md
```

### Source Code

```text
apps/web/src/
├── app/App.tsx                              # Render source work view and route-backed Issue dialog
├── app/routes.ts                           # Parse masked Issue URL and validate return target
├── features/issues/IssueDetailPage.tsx     # Reuse complete detail behavior with modal/page presentation
├── features/issues/IssueRow.tsx            # Mask Issue URL on key/title links
├── features/issues/IssueListPage.tsx       # Keep list URL state on the Router location
├── features/issues/issue-list-state.ts     # Keep list history updates on the active work-view location
├── features/work-views/KanbanCard.tsx      # Mask Issue URL on card title link
├── features/work-views/KanbanBoard.tsx     # Build return targets from Router location, not address bar mask
├── features/work-views/GanttIssueRow.tsx   # Mask Issue URL on key/title links
├── features/work-views/GanttBoard.tsx      # Keep Gantt state on unmasked Router location
├── components/ui/Dialog.tsx               # Allow modal heading actions and focus return
├── i18n/resources/issues.ts                # Localize expand-to-page action and accessible labels
└── index.css                                # Large responsive Issue dialog layout
```

**Structure Decision**: Keep the feature in the existing Web route resolver and detail/view components. React Router 8 stable `Link.mask` keeps the unmasked work-view location active while showing the Issue URL in the address bar. `App` renders the source view normally and overlays Issue detail only after an in-session masked navigation. On the app's initial render, a masked location is instead interpreted as a direct Issue page; this also covers refresh where the mask is restored from browser history state. Existing view hooks continue to read their own Router location. Replace `window.location` reads used to build work-view state with Router location reads because the address bar is masked during the overlay.

## Design Decisions

1. Each Issue key/title link pushes the current view URL as the Router destination and uses its Issue URL, including sanitized `returnTo`, as the mask. Explicitly disable same-path replacement so Back and dismissal return to the source view.
2. `App` parses `location.mask` as an Issue route and renders the Issue detail dialog only after an in-session masked navigation. On initial application render, the masked location is treated as a full Issue page, so direct opens and reloads meet the standalone URL contract.
3. Change work-view `window.location.pathname/search` reads to Router location reads where they construct return targets or view query updates. The underlying Router location remains the source view, so URL-backed filters and Gantt range continue to use their existing state flow.
4. Reuse `IssueDetailPage` and existing loading, error, comment, edit, and status flows. Add a presentation option for modal heading/navigation; the modal heading provides close and expand-to-page actions, while the standalone page retains its return link.
5. Close, Escape and backdrop dismissal navigate back one history entry. Expand replaces the masked entry with the Issue URL as the actual Router location and no mask, so browser Back returns to the source view.
6. Use the existing Dialog accessibility behavior with focus return to the activating key/title link. When the Issue detail dialog opens its existing nested Status transition dialog, only the topmost dialog handles Escape and traps focus. Keep dialog content vertically scrollable, with header actions available on narrow screens. Do not apply click handlers to cards, rows, or Gantt timeline regions.
7. Preserve standard anchor semantics for modified clicks and new tabs; they load the Issue URL as a full page. Do not modify API, Gitea contracts, or issue persistence.

## Implementation Phases

1. Add helpers to parse the masked Issue route and safely resolve its return target; preserve All repos and Repository workspace context.
2. Add mask navigation to the three sets of key/title links and render the complete Issue detail dialog while keeping the source work view mounted.
3. Add close, keyboard/backdrop dismissal, focus restoration, and replace-to-full-page actions; ensure initial/direct Issue loads and refreshes remain full pages.
4. Add localized dialog action/accessibility strings and responsive dialog sizing; preserve drag, schedule resize, and ordinary link behavior.
5. Add/update focused Storybook states and validate route/history behavior, localized layout, typecheck and production build.

## Complexity Tracking

無憲章例外或 workspace 結構擴張。
