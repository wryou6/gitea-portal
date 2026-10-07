---
description: "Implementation tasks for the reauthentication notice layout fix"
---

# Tasks: 重新登入提示版面修正

**Input**: Design documents from `/specs/039-session-notice-layout/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, and `data-model.md`

**Tests**: No automated test framework task is added; the feature uses Storybook/manual interaction plus the required workspace typecheck/build.

## Phase 1: Setup

**Purpose**: Existing Web workspace; no project initialization or dependency changes are needed.

## Phase 2: Foundational

**Purpose**: No shared infrastructure changes are required; the single user story can begin directly.

---

## Phase 3: User Story 1 - 重新登入後繼續檢視工作 (Priority: P1) 🎯 MVP

**Goal**: 顯示不改變任何工作 View 尺寸的可關閉重新登入提醒。

**Independent Test**: 顯示提醒並檢查 Issues、Kanban、Gantt、Dashboard、Settings 與 Repository 工作頁；確認尺寸及捲動範圍不變，繁中/英文/日文在 320px 以上均完整可見，且滑鼠與鍵盤都能關閉提醒。

### Implementation

- [X] T001 [P] [US1] Add localized dismiss-button labels for zh-TW, en, and ja in `apps/web/src/i18n/resources/auth.ts`.
- [X] T002 [P] [US1] Add fixed bottom-right notice styles with viewport insets, bounded width, wrapping, and pointer-event pass-through outside the panel in `apps/web/src/index.css`.
- [X] T003 [US1] Render `SessionExpiredNotice` through a body portal, add a labelled keyboard-operable dismiss control, and retain closed state across SPA route changes in `apps/web/src/features/auth/SessionExpiredNotice.tsx` (depends on T001 and T002).
- [X] T004 [US1] Extend the reauthenticated notice story to demonstrate dismissal and narrow viewport wrapping in `apps/web/src/features/auth/SessionExpiredNotice.stories.tsx` (depends on T003).

**Checkpoint**: User Story 1 is independently usable when the notice is visible, dismissible, localized, and does not change the workspace layout.

---

## Phase 4: Polish & Cross-Cutting Validation

**Purpose**: Verify the feature across the supported views and responsive states.

- [X] T005 Run workspace typecheck, production build, and Storybook build; record command results in `specs/039-session-notice-layout/quickstart.md`.
- [ ] T006 [US1] Complete the browser-only responsive, click-through, and dismissal scenarios and record results in `specs/039-session-notice-layout/quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No project initialization required.
- **Foundational (Phase 2)**: No shared foundation required.
- **User Story 1 (Phase 3)**: Can start immediately; T001 and T002 can run in parallel, then T003, then T004.
- **Polish (Phase 4)**: Depends on the User Story 1 tasks.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on another user story; it is the MVP.

### Parallel Opportunities

- T001 and T002 edit separate files and have no dependencies.

## Parallel Example: User Story 1

```text
Task: T001 Add localized dismiss-button labels in apps/web/src/i18n/resources/auth.ts
Task: T002 Add fixed responsive notice styles in apps/web/src/index.css
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete T001 and T002 in parallel.
2. Complete T003 and T004.
3. Validate all required view families and responsive/localized states with T005.

### Incremental Delivery

This feature has one independently testable story; complete the MVP before cross-cutting validation.
