---
description: "IIS 子路徑部署支援 implementation tasks"
---

# Tasks: IIS 子路徑部署支援

**Input**: Design documents from `specs/044-iis-subpath-deployment/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/deployment-path.md`, `quickstart.md`

**Tests**: No automated test additions were requested. Verification tasks use the existing workspace typecheck/build and inspect the generated deployment artifacts.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: The pnpm workspace and frontend/API projects already exist; no project initialization or new dependency is required.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No new shared persistence, API schema, or authorization infrastructure is needed. Existing API paths remain unchanged.

---

## Phase 3: User Story 1 - 在 IIS 子應用程式中使用 Portal (Priority: P1) 🎯 MVP

**Goal**: Serve all frontend, API, and authentication flows below the configured `/issue` path, including OAuth return and refreshed SPA routes.

**Independent Test**: Build with `/issue/`, inspect emitted resource/API/auth paths, and validate the frontend route and API cookie/return-path behavior from local code and artifacts. Live host acceptance remains a target-environment step.

### Implementation for User Story 1

- [x] T001 [P] [US1] Apply the configured Vite base path to production assets, React Router basename, API requests, login/logout navigation, and favicon references in `apps/web/vite.config.ts`, `apps/web/src/vite-env.d.ts`, `apps/web/src/main.tsx`, `apps/web/src/lib/api.ts`, `apps/web/src/features/auth/LoginPage.tsx`, and `apps/web/src/components/layout/AppShell.tsx`.
- [x] T002 [P] [US1] Derive the public child path from `WEB_ORIGIN` and use it consistently for session/CSRF and OAuth transaction cookie creation and clearing in `apps/api/src/config/web-path.ts`, `apps/api/src/auth/session.ts`, `apps/api/src/auth/oauth-state.ts`, `apps/api/src/http/error-handler.ts`, and `apps/api/src/http/routes.ts`.
- [x] T003 [US1] Preserve safe OAuth return destinations under the configured child path, including the default, callback success, cancellation, and failure paths, in `apps/api/src/auth/oauth-return-to.ts` and `apps/api/src/http/routes.ts`.
- [x] T004 [P] [US1] Document `/issue` build settings, public `WEB_ORIGIN` and OAuth callback values, host forwarding, and SPA fallback prerequisites in `README.md`, `specs/044-iis-subpath-deployment/contracts/deployment-path.md`, and `specs/044-iis-subpath-deployment/quickstart.md`.
- [x] T005 [P] [US1] Add an IIS `web.config` fallback rule to `apps/web/public/web.config` that rewrites only missing SPA routes to `index.html`, preserves existing files/directories, and excludes `api` and `auth` paths.

**Checkpoint**: `/issue` build emits scoped assets and browser URLs; API callbacks, return destinations, and cookies preserve the same public path.

---

## Phase 4: User Story 2 - 維持根目錄部署 (Priority: P2)

**Goal**: Keep current root-path behavior when no child path is configured.

**Independent Test**: Build without `VITE_BASE_PATH`, then confirm root asset and route prefixes; check root `WEB_ORIGIN` keeps API auth behavior and cookie paths at `/`.

### Implementation for User Story 2

- [x] T006 [US2] Preserve root defaults and normalize root/child path separators in `apps/web/vite.config.ts`, `apps/web/src/lib/api.ts`, `apps/web/src/main.tsx`, `apps/api/src/config/web-path.ts`, and `apps/api/src/auth/oauth-return-to.ts`.
- [x] T007 [US2] Run the root and `/issue/` build scenarios and workspace typecheck, inspect `apps/web/dist/index.html`, generated assets, and copied `apps/web/dist/web.config`, and record any remaining host-only acceptance boundary in `specs/044-iis-subpath-deployment/quickstart.md`.

**Checkpoint**: Root and child deployments produce matching paths without changing existing API route names.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No initialization tasks; the existing workspace is used.
- **Foundational (Phase 2)**: No new prerequisites.
- **User Story 1 (Phase 3)**: Can start immediately; T001, T002, T004, and T005 touch separate frontend/backend/documentation areas and can proceed in parallel. T003 depends on the backend path helper behavior from T002.
- **User Story 2 (Phase 4)**: Depends on User Story 1 path support; T006 validates root defaults and T007 verifies both variants.

### User Story Dependencies

- **US1 (P1)**: No story dependency; delivers the `/issue` deployment behavior.
- **US2 (P2)**: Depends on the shared path support in US1; verifies root compatibility.

### Parallel Opportunities

- T001, T002, T004, and T005 can proceed in parallel because they work in frontend source, API source, documentation, and the IIS fallback artifact respectively.
- T003 follows T002 where they share API authentication files.
- T006 and T007 follow completion of US1.

## Implementation Strategy

### MVP First (User Story 1)

1. Complete T001 through T005.
2. Build the `/issue/` variant and inspect generated browser-facing URLs.
3. Validate OAuth/cookie path behavior at source level; perform live host acceptance only when the target deployment is available.

### Incremental Delivery

1. Deliver `/issue` support (US1) while preserving current root defaults.
2. Verify root-path compatibility and trailing-slash normalization (US2).
3. Run workspace typecheck and both build variants before handoff.

## Notes

- Task identifiers are sequential and every implementation task names its target file path(s).
- Live IIS routing, application-pool behavior, and the real Gitea OAuth callback cannot be verified from this repository workspace.
