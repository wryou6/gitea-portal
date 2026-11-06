# Implementation Plan: 工作檢視網址參數範圍

**Branch**: `030-work-view-url-cleanup` | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/030-work-view-url-cleanup/spec.md`

## Summary

Make work-view navigation produce URLs containing only state applicable to the destination view. Preserve shared filters across List, Kanban, and Gantt; keep `gantt_start` and `gantt_scale` only on Gantt URLs; retain the full Gantt URL only in Issue return targets created from Gantt. Apply one route-aware policy to sidebar navigation, workspace selection, filter URL updates, and return targets.

## Technical Context

**Language/Version**: TypeScript, Node.js 22 workspace
**Primary Dependencies**: Existing React/Vite web app and browser `URL` / `URLSearchParams`; no new dependency
**Storage**: Browser URL only; no new persistence
**Testing**: Manual URL transition scenarios in `quickstart.md`; workspace `pnpm.cmd typecheck` and `pnpm.cmd build`
**Target Platform**: Authenticated browser UI
**Project Type**: pnpm monorepo; change is limited to `apps/web`
**Performance Goals**: URL construction remains synchronous and adds no network requests
**Constraints**: Keep shared filter URL semantics and Gantt defaults; preserve issue return flow; do not change APIs, Gitea data, or unrelated query state contracts
**Scale/Scope**: All repos and Repository workspaces; List, Kanban, Gantt, Issue detail, and Issue creation navigation

## Constitution Check

- Gitea remains the sole source for Issue data; this feature changes browser navigation state only. **PASS**
- No permission or API behavior changes. **PASS**
- No new persistence or Issue mirror. **PASS**
- User-visible text and UI layout are unchanged; no localization changes are needed. **PASS**
- Required verification for Web changes: `pnpm.cmd typecheck` and `pnpm.cmd build`. **PASS**

## Design

### URL State Policy

- Shared filter keys (`priority`, `issueType`, `state`, `assignee`) carry across work-view navigation.
- Gantt keys (`gantt_start`, `gantt_scale`) are copied only when the source context is Gantt and are included only in a Gantt destination URL or a return target to that source Gantt.
- List keys (`sort`, `direction`) are copied only when both source and destination are List, including List-to-List workspace changes; they are omitted from Kanban/Gantt destinations.
- Non-Gantt view URL updates remove Gantt-only and retired Gantt filter keys. Issue return targets preserve only the originating view's applicable state, including List sort when the origin is List.
- Navigation builds a destination from its canonical path and the explicitly allowed state; it does not copy arbitrary source query keys.
- Issue detail/create `returnTo` continues to identify the originating view. A Gantt origin keeps its date, scale, and shared filters; other origins do not gain Gantt state.

### Source Structure

```text
apps/web/src/
├── app/                         # canonical route and view context helpers
├── components/layout/           # sidebar navigation and workspace selection
└── features/
    ├── issues/                  # List query state and Issue return targets
    └── work-views/              # shared query policy and Gantt URL state
specs/030-work-view-url-cleanup/ # contract and manual acceptance scenarios
```

**Structure Decision**: Keep the policy in the existing Web work-view URL utilities and route helpers, then use it from the current navigation and query-state owners. Do not add a new package, API, or persisted state.

## Implementation Phases

1. Define explicit shared, Gantt-only, and retired query key policies with source/target view semantics.
2. Apply the policy to sidebar links, workspace switching, shared-filter updates, Gantt URL synchronization, and Issue return targets.
3. Verify All repos and Repository routes, stale query cleanup, Gantt-origin return restoration, and shared filter retention; run workspace typecheck/build.

## Complexity Tracking

No constitution violations or new architectural components.
