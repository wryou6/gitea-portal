# Implementation Plan: 站內畫面切換不閃白

**Branch**: `main` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/033-spa-navigation/spec.md`

## Summary

Use React Router's declarative browser router for same-origin Portal navigation while retaining the current client-rendered app, session bootstrap, route resolver, API loading flows, and shared AppShell. Replace application-owned full-document navigation and direct History API writes with Router links or navigation. Preserve Feature 030/031 URL rules and browser history behavior.

## Technical Context

**Language/Version**: TypeScript 5.8, React 19

**Primary Dependencies**: Add React Router declarative APIs (`BrowserRouter`, `Link`, `useLocation`, `useNavigate`) to `apps/web`; retain Vite 6 and existing application route/URL helpers.

**Storage**: N/A; navigation state stays in the URL and browser history.

**Testing**: `pnpm.cmd typecheck`, `pnpm.cmd build`, `pnpm.cmd --filter @gitea-portal/web build-storybook`; authenticated Playwright walkthrough using navigation timing, rendered shell continuity, URL state, and browser history.

**Target Platform**: Existing supported browsers for the Vite React web application.

**Project Type**: Web application; frontend-only behavior change.

**Performance Goals**: Same-origin route changes do not create a new document navigation; the shared shell remains rendered while the destination page loads. Direct-open/refresh acceptance is limited to the current local Vite environment.

**Constraints**: Preserve OAuth and external Gitea navigation; avoid raw `history.pushState`/`replaceState` for route state; do not change APIs, Gitea access, or persisted Issue data. Existing production hosting is not configured in this repository; verify deep-link refresh only on the current local Vite environment. Treat application-path fallback, with `/api` and `/auth` routed to the API, as a production deployment requirement outside this feature's host-configuration scope.

**Scale/Scope**: All same-origin Portal pages and controls that navigate among Dashboard, Settings, Issue create/detail/list, All repos views, and Repository workspaces. No API or Gitea contract changes.

## Constitution Check

- Gitea remains the only source of Issue data; this change modifies browser navigation only. **PASS**
- Existing Gitea delegated authorization and mutation behavior remain unchanged. **PASS**
- Existing API contracts remain unchanged. **PASS**
- Existing page loading, empty, and error states remain distinct and visible during route changes. **PASS**
- No new user-facing copy is required; any incidental copy change must update zh-TW, en, and ja resources. **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/033-spa-navigation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── portal-navigation.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/
├── main.tsx                         # Mount BrowserRouter after session bootstrap
├── app/
│   ├── App.tsx                      # Subscribe to Router location and retain route resolver
│   └── routes.ts                    # Existing path parsing and URL policies
├── components/layout/               # Router links and programmatic navigation
├── features/issues/                 # Issue links, return links, and List URL state
├── features/work-views/             # Kanban/Gantt links and URL state
└── **/*.stories.tsx                 # MemoryRouter context for routed stories
```

**Structure Decision**: Keep all production changes in the existing Web application. Mount one `BrowserRouter` around `App`; read its location in `App` and continue using `resolveAppRoute` so existing path aliases and route-specific behavior remain canonical. Use Router `Link` for same-origin links and `useNavigate` for event-driven navigation. Keep API fetching in the existing page hooks rather than moving it into Router loaders.

## Design Decisions

1. Use React Router declarative mode with `BrowserRouter`, not a framework/SSR mode or a second route table. Existing `resolveAppRoute` remains the page-selection source; Router location changes cause `App` to render the matching page.
2. Keep `AppShell` mounted across route transitions. Its route-dependent active navigation and workspace context update from Router location; account and sidebar state remain React state in the same shell instance.
3. Convert same-origin Portal anchors to Router `Link`, including sidebar/dashboard/settings/workspace/Issue/result/return links. Preserve ordinary anchors for OAuth, external Gitea pages, and external destinations. Use `useNavigate` for keyboard-selected Issue search results, workspace selection, and Issue creation completion.
4. Route every application URL mutation through Router navigation, including the current List `pushState`/`replaceState`, Kanban filter `pushState`, and Gantt preference `replaceState`. Use Router location as the source for URL-backed state; on POP navigation restore the URL's filters/sort and results without duplicate `popstate` state owners.
5. Preserve standard link behavior for modifier-click, middle-click, and opening a link in a new tab. Existing auth bootstrap runs once per document load, not on same-document transitions.
6. Do not add a new global loading overlay. Keep page-level loading/error/empty states; after route changes, use the authenticated browser walkthrough to check whether a separate content-area loading improvement is still needed.
7. The repository has no production static-host or reverse-proxy configuration. Keep Vite's existing SPA fallback, and record the production host's `index.html` fallback plus `/api` and `/auth` routing as a deployment requirement rather than inventing an ungrounded hosting configuration.

## Implementation Phases

1. Add the Router dependency and mount the router around the current app after bootstrap; subscribe the route resolver and AppShell context to Router location.
2. Migrate all same-origin anchors and event-driven page transitions to Router navigation. Leave OAuth and external Gitea links as document navigations.
3. Migrate URL-backed filter, sort, and Gantt state writes to Router navigation; synchronize state on PUSH, REPLACE, and POP while preserving the Feature 030/031 URL policy.
4. Add MemoryRouter decorators to affected Storybook entries, then validate browser navigation, direct route loading, current URL semantics, and existing error/loading behavior.
5. Run Web Storybook build, workspace typecheck/build, and the authenticated browser acceptance scenarios; compare measured route switches against the existing full-document baseline.

## Complexity Tracking

No constitution violations or project-structure expansion.
