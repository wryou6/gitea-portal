# Implementation Plan: 工作檢視共用篩選與全域搜尋

**Branch**: `022-shared-work-view-filters` | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/022-shared-work-view-filters/spec.md`

## Summary

將 List、Kanban、Gantt 的篩選與檢視設定集中在左側 240px 控制面板，使用共用 `WorkViewLayout` 提供收合、獨立捲動與主要內容上方的純文字摘要。清單摘要依分頁狀態明確標示當頁筆數；看板摘要計算所有符合卡片，包含異常欄且不受手機選取欄位影響；甘特摘要包含排程、未排程及日期異常項目。全域搜尋仍在頂部導覽，篩選依既有 URL 模型立即套用。

Use one web filter model/parser/predicate. List continues to use its read-through query before pagination, extended for priority and Issue Type; Kanban and Gantt filter their already-loaded complete workspace data with the same predicate. Do not persist filter state or mutate Gitea data.

## Technical Context

**Language/Version**: TypeScript 5.8.2, React 19

**Primary Dependencies**: Vite 6.1, Fastify 5.2, react-i18next 17, existing Portal API and Gitea client

**Storage**: 篩選仍使用 Browser URL query；控制面板收合偏好存於 sessionStorage，與 Issue 資料無關。

**Testing**: `pnpm.cmd typecheck`, `pnpm.cmd build`, web Storybook build; manual browser checks described in `quickstart.md`

**Target Platform**: Authenticated desktop and responsive web UI

**Project Type**: pnpm workspace web application with API and shared domain packages

**Performance Goals**: Filter changes update the visible view immediately; autocomplete requests are debounced and stale responses do not replace newer results.

**Constraints**: Gitea remains the sole Issue source; use delegated user permissions; preserve complete aggregate-read failure behavior; no Issue mutations. Global search ignores current workspace and covers all readable repositories. Shared filters remain scoped to the current workspace.

**Scale/Scope**: One shared filter bar across three work views, one global top-bar autocomplete, All repos and Repository workspaces, and zh-TW/en/ja.

## Constitution Check

| Principle | Gate | Plan result |
|---|---|---|
| I. Gitea is the Issue source of truth | No Issue mirror or persisted filter snapshot | PASS; filters and query text live in the URL, Issue data remains read-through. |
| II. Use current user permissions | Search and work-view data use delegated Gitea access | PASS; search is limited to repositories readable by the current user. |
| III. Safe Gitea writes | This feature is read-only | PASS; no Gitea writes are introduced. |
| IV. Complete aggregate results | Required repository failures remain whole-view errors | PASS; existing API aggregation and retry behavior is retained. |
| V. Fixed Issue Status | Shared filter uses Todo/In Progress/Done; Gantt removes duplicate Open/Closed control | PASS; map existing fixed Portal Status to its Gitea state semantics. |
| VI. Clear work scope | Shared filters are workspace-scoped; global search results identify repository | PASS. |
| VII. Multilingual user text | All added labels, feedback, and accessible names use i18n | PASS; update zh-TW/en/ja resources. |

No constitution violations or exceptions are required.

## Design Decisions

1. Keep global keyword search in `AppShell` top bar, alongside `WorkspaceSelector`. Debounce typing, show a bounded accessible result list with loading/empty/error states, and label each result with its Repository. Search across all readable repositories regardless of workspace. Selecting a result opens Issue detail with the originating URL as `returnTo`.
2. Create shared filter URL parsing, serialization, validation, and matching under `apps/web/src/features/work-views/`. Preserve existing query names where possible (`state`, `assignee`, `repository`, `label`, `milestone`) and add `priority` and `issueType`; omit default values from URLs. Carry shared parameters through the left navigation when moving among List, Kanban, and Gantt in the same workspace.
3. 將 Priority、Type、Portal Status 與 Assignee 垂直排列於左側控制面板，Repository（All repos）、Label、Milestone 留在預設收合的進階區。可移除條件與清除操作留在面板，主內容上方使用不具互動樣式的純文字條件與結果筆數摘要。最左側全域導覽初次進入工作檢視預設為圖示列，保留使用者曾選擇的展開偏好。
4. For List, extend `/api/issues` query handling so priority and Issue Type filter the complete matched set before page slicing. For Kanban/Gantt, filter the complete loaded cards/issues in the web layer using the shared matcher; preserve status columns (including anomaly handling) and Gantt schedule grouping. Use any member of the Issue's assignee list for a named Assignee match.
5. In Gantt, remove the Open/Closed checkboxes and old `gantt_assignee` filter. Shared Portal Status and Assignee provide those filters; retain Gantt start date, scale, and view preferences. Ignore legacy `gantt_open`, `gantt_closed`, and `gantt_assignee` query keys; keep `gantt_start` and `gantt_scale`.
6. Build the global search and shared filter UI as Storybook-ready components with deterministic fixtures; avoid live API requests and URL mutation in stories.

## Project Structure

### Documentation

```text
specs/022-shared-work-view-filters/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── work-view-search-and-filter.md
└── tasks.md
```

### Source Code

```text
apps/api/src/issues/issue-routes.ts              # Parse added list filters
apps/api/src/issues/issue-search-service.ts      # Filter priority/type before pagination
apps/web/src/components/layout/AppShell.tsx      # Global search top-bar composition
apps/web/src/features/issues/IssueListPage.tsx   # Shared bar integration and paged results
apps/web/src/features/issues/issue-list-state.ts # Filter URL/request synchronization
apps/web/src/features/work-views/                # Shared state, bar, matcher, Kanban/Gantt integration
apps/web/src/i18n/                                # zh-TW/en/ja resources
apps/web/src/index.css                            # Responsive filter/search presentation
```

**Structure Decision**: Extend the existing web work-view and issue-search modules; keep API query parsing/filtering in the API issue-search layer. No new package, persistence layer, or Gitea endpoint is introduced.

## Phase 0: Research

See [research.md](research.md). Repository inspection established that List queries the API and paginates after read-through filtering, while Kanban and Gantt already receive complete workspace Issue sets. No new technology choice or unresolved external dependency remains.

## Phase 1: Design & Contracts

- [Data model](data-model.md) defines URL-backed shared filter state and transient search state.
- [Search/filter contract](contracts/work-view-search-and-filter.md) defines URL keys, list-query additions, top-bar search result behavior, and view matching semantics.
- [Quickstart](quickstart.md) defines Storybook, responsive/theme, navigation, URL restoration, and authenticated read-failure checks.

## Complexity Tracking

No constitution violations; no additional project/package or persistence complexity is introduced.
