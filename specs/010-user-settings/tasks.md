# Tasks: 使用者選單與外觀設定

**Input**: Design documents from `specs/010-user-settings/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/settings-ui.md`

**Tests**: The specification does not request new automated test suites. Validate with the manual scenarios in `quickstart.md`, plus the repository-required `pnpm.cmd typecheck` and `pnpm.cmd build`.

**Organization**: Tasks are grouped by the two P1 user stories. US2 extends the settings route introduced for US1.

## Phase 1: Setup

**Purpose**: No project initialization is needed; reuse the current pnpm workspace and dependencies.

No setup tasks. Do not add dependencies or change workspace configuration.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Load the authenticated identity once so both the account menu and account-scoped preference use the same login.

- [x] T001 Load the existing `/api/session` login before mounting the app and pass it into `App` in `apps/web/src/main.tsx` and `apps/web/src/app/App.tsx`; on unauthenticated/error response, continue with no account menu.

**Checkpoint**: The app has one resolved session identity available to both user stories; API contract remains unchanged.

---

## Phase 3: User Story 1 - 開啟使用者選單並前往設定 (Priority: P1) 🎯 MVP

**Goal**: Show the current login in the top-right account menu and navigate to a settings page.

**Independent Test**: Sign in, open the top-right menu with pointer and keyboard, confirm the login and sole「設定」action, then navigate to `/settings` and confirm the current mode is shown.

### Implementation for User Story 1

- [x] T002 [P] [US1] Add `routePaths.settings` and the `/settings` route type/resolution in `apps/web/src/app/routes.ts`.
- [x] T003 [P] [US1] Create the settings page shell showing the current mode and a labelled appearance section in `apps/web/src/features/settings/SettingsPage.tsx`.
- [x] T004 [US1] Render `SettingsPage` for `/settings` and pass the session login and initial `system` mode through `apps/web/src/app/App.tsx`.
- [x] T005 [US1] Add a top-right account trigger and menu showing the current login and a single「設定」link to `routePaths.settings` in `apps/web/src/components/layout/AppShell.tsx`; support keyboard open/close, Escape, and outside activation.
- [x] T006 [US1] Add responsive account-menu and settings-page shell styles in `apps/web/src/index.css`, preserving the existing light and `.dark` token behavior.

**Checkpoint**: A signed-in account can identify itself in the shared header and reach `/settings`; direct route use remains possible.

---

## Phase 4: User Story 2 - 選擇並保留外觀模式 (Priority: P1)

**Goal**: Select Light, Dark, or System; apply it across the app and preserve a separate preference per login in the same browser.

**Independent Test**: On `/settings`, choose each mode, reload, change OS appearance under System, and switch between two logins in one browser; each login retains only its own choice.

### Implementation for User Story 2

- [x] T007 [US2] Implement `ThemeMode`, per-login preference read/write, invalid/missing-value fallback, effective mode resolution, and System change subscription in `apps/web/src/features/settings/theme-preference.ts`.
- [x] T008 [US2] Bootstrap the login-scoped saved mode before the first app render, apply the existing `html.dark` class, and wire immediate save/apply state changes through `apps/web/src/main.tsx` and `apps/web/src/app/App.tsx`.
- [x] T009 [US2] Add selectable Light, Dark, and System controls with a programmatically exposed selected state and immediate `onThemeChange` behavior in `apps/web/src/features/settings/SettingsPage.tsx`.
- [x] T010 [US2] Style the theme choices, selected state, focus visibility, and narrow-screen layout in `apps/web/src/index.css`.

**Checkpoint**: All three modes apply across routes, System tracks OS changes, and same-browser accounts retain independent choices.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature and preserve the existing workspace behavior.

- [x] T011 Run the account-menu, theme, reload, OS-change, keyboard, and two-account scenarios from `specs/010-user-settings/quickstart.md` without changing Gitea or Issue data.
- [x] T012 Run `pnpm.cmd typecheck` from the repository root and resolve any feature-related type errors in the affected `apps/web/src/` files.
- [x] T013 Run `pnpm.cmd build` from the repository root and resolve any feature-related build errors in the affected `apps/web/src/` files.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No changes required.
- **Foundational (Phase 2)**: T001 loads the identity; blocks both user stories.
- **User Story 1 (Phase 3)**: Depends on T001. T002 and T003 touch separate files and can run in parallel; T004 depends on T002 and T003; T005 uses the route and login wiring; T006 follows the UI structure.
- **User Story 2 (Phase 4)**: Depends on US1 settings page. T007 establishes preference behavior; T008 connects it to startup and app state; T009 uses that state; T010 styles the finished controls.
- **Polish (Phase 5)**: Depends on both user stories; execute the manual walkthrough, typecheck, then build.

### User Story Dependencies

- **US1 (P1)**: Depends on the shared session identity task T001; no dependency on US2.
- **US2 (P1)**: Builds on the `/settings` route and page from US1 so its selector is reachable through the account menu.

### Parallel Opportunities

- T002 and T003 can run in parallel because they create/update different files and do not depend on each other.
- No later tasks are marked parallel because they either touch the same route/theme files or depend on earlier UI wiring.

## Parallel Example: User Story 1

```text
Task: T002 Add /settings route in apps/web/src/app/routes.ts
Task: T003 Create settings page shell in apps/web/src/features/settings/SettingsPage.tsx
```

## Implementation Strategy

Deliver the account entry and working theme settings together: both stories are P1 and a settings destination without the requested mode control is not a complete user outcome. Complete T001 and US1 first, then US2, then run the quickstart walkthrough and required typecheck/build commands.
