---
description: "Implementation tasks for unauthenticated and expired-session experience"
---

# Tasks: 未登入與 Session 過期處理

**Input**: Design documents from `/specs/017-unauthenticated-experience/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-flow.md

**Tests**: No new automated test framework or standalone tests were requested. Verify representative UI states in Storybook, run required typecheck/build, and execute the manual validation guide when OAuth is available.

## Phase 1: Setup

**Purpose**: Reuse the current pnpm workspace and project conventions; no project initialization is required.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define route validation and session bootstrap behavior used by the login and recovery flows.

- [X] T001 [P] Implement short-lived signed OAuth transaction cookie creation, state comparison, expiration, and clearing in `apps/api/src/auth/oauth-state.ts`.
- [X] T002 [P] Implement server-side allow-list validation for known Portal return paths and safe Web-origin redirect construction in `apps/api/src/auth/oauth-return-to.ts`.
- [X] T003 [P] Extend `safeReturnTo` in `apps/web/src/app/routes.ts` to recognize every protected route, preserve its query, and reject external, unknown, and reserved auth-flash targets.
- [X] T004 Classify initial session lookup as authenticated, anonymous (`auth.required`), or unavailable before rendering in `apps/web/src/main.tsx`.
- [X] T005 [P] Proxy `/auth` to the API in `apps/web/vite.config.ts` while retaining the existing `/api` proxy.

**Checkpoint**: Bootstrap state and both redirect validators are defined before feature views are connected.

---

## Phase 3: User Story 1 - 未登入時登入 Portal (Priority: P1) 🎯 MVP

**Goal**: Show a standalone, localized Gitea sign-in page to anonymous visitors and return them to their original Portal route after successful OAuth.

**Independent Test**: Clear Portal cookies, open representative protected routes, confirm the login page replaces protected content, then complete OAuth and confirm the original route and query are restored.

### Implementation for User Story 1

- [X] T006 [US1] Update `apps/api/src/http/routes.ts` so login creates a validated OAuth transaction and callback validates state, handles denial/failure, establishes session, and redirects to the configured Web origin plus safe return target.
- [X] T007 [P] [US1] Add Traditional Chinese, English, and Japanese login, authorization-failure, and error copy in `apps/web/src/i18n/resources/auth.ts` and register the auth namespace in `apps/web/src/i18n/index.ts`.
- [X] T008 [US1] Create the standalone login view with Gitea CTA, safe return target, and localized OAuth failure display in `apps/web/src/features/auth/LoginPage.tsx`.
- [X] T009 [US1] Gate `AppShell` and all protected route content on session state, render the login view only for anonymous users, keep unavailable sessions fail-closed, and retain authenticated route behavior in `apps/web/src/app/App.tsx`.
- [X] T010 [P] [US1] Add Storybook coverage for anonymous login and OAuth failure views in `apps/web/src/features/auth/LoginPage.stories.tsx`.

**Checkpoint**: Anonymous direct links show no protected content; unknown session status also stays fail-closed; successful OAuth returns to a validated Portal route.

---

## Phase 4: User Story 2 - Session 過期後繼續原工作 (Priority: P1)

**Goal**: Convert a protected-request authentication failure into a re-login flow, restore the route after OAuth, and make unsaved Issue input loss explicit.

**Independent Test**: Cause a protected request to return `auth.required`, complete sign-in, confirm route/data reload, confirm the failed mutation was not retried, and confirm an Issue form is empty with a re-entry notice.

### Implementation for User Story 2

- [X] T011 [US2] Clear the Portal session cookie when a delegated Gitea request returns 401 in `apps/api/src/http/error-handler.ts`; on protected API `auth.required` responses, store only a one-time expiry marker and reload the current URL, excluding `/api/session` and never retrying the failed request in `apps/web/src/lib/api.ts`.
- [X] T012 [US2] Consume the expiry marker only after successful session bootstrap and pass a one-time reauthentication notice into the app in `apps/web/src/main.tsx` and `apps/web/src/app/App.tsx`.
- [X] T013 [US2] Render localized session-expired and unsaved-Issue-input notices in `apps/web/src/features/auth/SessionExpiredNotice.tsx` and add all three locale strings to `apps/web/src/i18n/resources/auth.ts`.
- [X] T014 [P] [US2] Add Storybook coverage for the session-expired and unsaved-input notice in `apps/web/src/features/auth/SessionExpiredNotice.stories.tsx`.

**Checkpoint**: Session expiry returns to the same route after sign-in without saving form input or replaying the rejected mutation.

---

## Phase 5: User Story 3 - 分辨登入狀態與暫時服務故障 (Priority: P1)

**Goal**: Present session lookup failures as recoverable service errors instead of anonymous login state.

**Independent Test**: Simulate a network or server failure from session lookup, confirm no login CTA is presented as the resolution, restore the service, and use retry to reach the correct authenticated or anonymous view.

### Implementation for User Story 3

- [X] T015 [US3] Create a localized unavailable-state view with an accessible retry action in `apps/web/src/features/auth/SessionUnavailable.tsx`.
- [X] T016 [US3] Render the unavailable view for non-authentication bootstrap failures and retry the session lookup without rendering `AppShell` in `apps/web/src/app/App.tsx`.
- [X] T017 [P] [US3] Add Storybook coverage for service-unavailable and retry states in `apps/web/src/features/auth/SessionUnavailable.stories.tsx`.

**Checkpoint**: Only an explicit unauthenticated response opens the login view; network/server failure shows a retryable service error.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify localization, responsive/accessibility states, OAuth redirects, and workspace integration.

- [X] T018 [P] Add responsive, light/dark, focus-visible, and reduced-motion styles for auth views in `apps/web/src/index.css`.
- [X] T019 Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root `package.json`; fix any errors in feature files.
- [X] T020 Execute the available scenarios in `specs/017-unauthenticated-experience/quickstart.md` and record any unavailable OAuth environment prerequisite or unverified live-login scenario in that guide.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No work; existing workspace is reused.
- **Foundational (Phase 2)**: Required before OAuth callback and UI integration. T001–T005 touch separate files and can be done in parallel where marked.
- **User Story 1 (Phase 3)**: Depends on T001–T005; establishes the anonymous login entry path.
- **User Story 2 (Phase 4)**: Depends on the session gate from US1 and the OAuth callback; route restoration relies on the validated return target.
- **User Story 3 (Phase 5)**: Depends on bootstrap state from T004 and auth gate from US1.
- **Polish (Phase 6)**: Depends on all three stories.

### User Story Dependencies

- **US1 (P1)**: Starts after foundational redirect and bootstrap behavior; MVP scope.
- **US2 (P1)**: Depends on US1 login and callback to recover after session expiry.
- **US3 (P1)**: Depends on shared bootstrap/gate; can be implemented independently from US2 once US1 is integrated.

### Parallel Opportunities

- T001, T002, T003, T004, and T005 can start in parallel because each owns a different file.
- In US1, T007 and T010 can proceed independently of API callback T006 and login view T008; App wiring T009 follows T008 and T004.
- In US2, T011 follows API foundation; T014 is independent after T013.
- In US3, T015 and T017 can proceed in parallel; T016 wires the state after T015 and T004.
- T018 can start after the auth view markup is stable; T019/T020 follow all implementation work.

## Parallel Example: Foundation and User Story 1

```text
Task: T001 Implement OAuth transaction cookie helpers in apps/api/src/auth/oauth-state.ts
Task: T002 Implement backend safe return target validation in apps/api/src/auth/oauth-return-to.ts
Task: T003 Extend known return route validation in apps/web/src/app/routes.ts
Task: T005 Add the /auth dev proxy in apps/web/vite.config.ts

Then, after the foundational checkpoint:
Task: T007 Add auth translations in apps/web/src/i18n/resources/auth.ts and apps/web/src/i18n/index.ts
Task: T010 Add login state stories in apps/web/src/features/auth/LoginPage.stories.tsx
```

## Implementation Strategy

1. Complete the foundational route validation, OAuth transaction, session bootstrap, and dev proxy.
2. Deliver US1 first as the MVP; validate anonymous deep links and one successful OAuth round trip.
3. Add US2 recovery and no-draft warning, then US3 service retry state.
4. Finish localization/responsive styles, run typecheck/build, then execute the quickstart scenarios supported by the configured environment.

## Phase 7: Convergence

- [X] T021 Review the previously unrequested `POST /auth/logout` endpoint in `apps/api/src/http/routes.ts`; complete the specified and validated sign-out flow in T022–T025.

## Phase 8: User Story 4 - 主動登出 Portal (Priority: P1)

**Goal**: Let an authenticated user end only the current Portal session from the account menu, with confirmed completion and retryable failure behavior.

**Independent Test**: Sign in, select sign out, confirm the login page replaces the shell, revisit a protected URL and confirm it remains anonymous, then start Gitea login and confirm the retained IdP session can be reused. Force the logout request to fail and confirm the authenticated shell remains visible with an actionable localized error.

### Implementation for User Story 4

- [X] T022 [P] [US4] Add Traditional Chinese, English, and Japanese account-menu logout and logout-error messages in `apps/web/src/i18n/resources/common.ts` and `apps/web/src/i18n/resources/auth.ts`.
- [X] T023 [US4] Add an accessible account-menu logout action in `apps/web/src/components/layout/AppShell.tsx` and show it in the authenticated `apps/web/src/components/layout/Layout.stories.tsx`; call `POST /auth/logout`, disable duplicate submission while pending, navigate to the standalone login page only after success, and retain the authenticated shell with localized retry feedback on failure.
- [X] T024 [P] [US4] Update `clearSession` in `apps/api/src/auth/session.ts` to expire both Portal session and CSRF cookies while leaving Gitea IdP state untouched; confirm `POST /auth/logout` returns success only after both clear-cookie headers are sent in `apps/api/src/http/routes.ts`.
- [X] T025 [US4] Exercise logout success, anonymous protected-route access, and request-failure retry; verify the Portal logout contract does not call Gitea logout or clear IdP cookies, and record the unverified live SSO round trip in `specs/017-unauthenticated-experience/quickstart.md`.
