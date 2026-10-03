---
description: "Task list for settings redesign and Status migration retirement"
---

# Tasks: 設定頁重設計與遷移功能退役

**Input**: Design documents from `specs/032-settings-redesign/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/settings-ui.md`, `quickstart.md`

**Tests**: No new automated test suite was requested. Add/extend Storybook stories for the visual and interaction acceptance criteria; run project-required typecheck/build and Storybook build.

**Organization**: Tasks are grouped by user story. Because the settings component, CSS, and locale resource are shared touchpoints, execute the phases sequentially as listed.

## Phase 1: Setup

**Purpose**: Reuse the existing workspace, settings route and Storybook setup.

- No setup changes or new dependencies are needed.

## Phase 2: Foundational

**Purpose**: No shared data model or API foundation is required; existing preference behavior and current Status contracts remain the base.

- No foundational code changes are needed.

---

## Phase 3: User Story 1 - 清楚瀏覽與調整個人設定 (Priority: P1) 🎯 MVP

**Goal**: Make the settings page's appearance, palette and language preferences easy to find, read and operate in every supported locale.

**Independent Test**: Review the page in zh-TW, en and ja at 375px, 768px, 1024px and 1440px; verify distinct sections, readable labels, selected values and keyboard operation.

### Implementation for User Story 1

- [X] T001 [US1] Restructure preference groups with interface language first, then appearance mode and palette, and accessible headings in `apps/web/src/features/settings/SettingsPage.tsx`.
- [X] T002 [US1] Replace the shared fixed-column settings layout with responsive per-group styles and visible focus treatment in `apps/web/src/index.css`.
- [X] T003 [P] [US1] Refine localized settings headings and descriptions for natural wrapping in `apps/web/src/i18n/resources/settings.ts`.
- [X] T004 [US1] Add Storybook coverage for zh-TW/en/ja, language-first section order, light/dark, keyboard focus and long translated copy in `apps/web/src/features/settings/SettingsPage.stories.tsx`.

**Checkpoint**: All three preference groups are distinguishable and operable in every supported locale and target width.

---

## Phase 4: User Story 2 - 比較各配色預覽 (Priority: P1)

**Goal**: Keep every palette preview visually independent while the selected palette controls the actual page theme.

**Independent Test**: Select each palette in light and dark modes; verify all previews remain distinct and unchanged except for the selection indicator and active page palette.

### Implementation for User Story 2

- [X] T005 [US2] Add Carbon, Ember and Glacier dark-first semantic tokens with readable light variants while preserving preview isolation in `apps/web/src/index.css`.
- [X] T006 [US2] Expand Storybook scenarios to compare all six previews in light and dark themes in `apps/web/src/features/settings/SettingsPage.stories.tsx`.
- [X] T016 [P] [US2] Extend `ColorPalette` values, preference validation and the settings palette list to support Carbon, Ember and Glacier in `apps/web/src/features/settings/theme-preference.ts` and `apps/web/src/features/settings/SettingsPage.tsx`.
- [X] T017 [P] [US2] Add localized names and concise descriptions for the three new palettes in zh-TW/en/ja in `apps/web/src/i18n/resources/settings.ts`.
- [X] T018 [US2] Replace duplicate palette swatches with previews that render actual surface, foreground, primary and production Status badge tokens scoped per palette in `apps/web/src/features/settings/SettingsPage.tsx` and `apps/web/src/index.css`.
- [X] T019 [US2] Render Gitea-provided label colors as a subtle theme-aware tint and blended border while keeping theme foreground text and leaving source data unchanged in `apps/web/src/features/issues/LabelList.tsx` and `apps/web/src/index.css`.
- [X] T020 [US2] Strengthen dark-mode Issue identifier contrast and add Storybook examples for arbitrary-color Labels and actual palette preview badge fidelity in `apps/web/src/index.css`, `apps/web/src/features/settings/SettingsPage.stories.tsx`, and `apps/web/src/components/ui/IssueBadgePalette.stories.tsx`.

**Checkpoint**: Cobalt, Juniper and Iris remain simultaneously identifiable after any selection in both themes.

---

## Phase 5: User Story 3 - 不再提供過時的標籤遷移 (Priority: P1)

**Goal**: Remove the migration operation and all runtime interpretation of historical workflow prefixes without changing any Gitea Labels.

**Independent Test**: Confirm the settings page and API expose no migration path, current Status Labels still work, and old-only open Issues follow the existing missing-status anomaly behavior without a Gitea write.

### Implementation for User Story 3

- [X] T007 [US3] Remove the migration section and migration-related local state/imports from `apps/web/src/features/settings/SettingsPage.tsx`; remove migration copy and its resource type keys from `apps/web/src/i18n/resources/settings.ts`.
- [X] T008 [P] [US3] Remove migration route registration and the route module from `apps/api/src/app.ts` and `apps/api/src/http/status-label-migration-routes.ts`.
- [X] T009 [P] [US3] Remove the migration service module `apps/api/src/issues/status-label-migration-service.ts` and its report type from `packages/gitea-contracts/src/portal.ts`.
- [X] T010 [P] [US3] Remove the matching migration report type from `apps/web/src/lib/api.ts`.
- [X] T011 [US3] Remove legacy status and action fallback while preserving current-prefix resolution in `packages/domain/src/issue-status-resolver.ts` and `apps/api/src/issues/issue-service.ts`.
- [X] T012 [US3] Remove legacy-prefix special cases while preserving current Status behavior, atomic replacement, and old Labels as unrelated data during other Issue writes in `apps/api/src/issues/issue-validation.ts`, `apps/api/src/issues/status-transition-service.ts`, `apps/api/src/issues/issue-schedule-service.ts`, and `apps/api/src/work-views/kanban-service.ts`.
- [X] T013 [US3] Remove legacy-prefix filtering from `apps/web/src/features/issues/IssueEditForm.tsx` so old Labels remain visible and are no longer treated as managed Status data.

**Checkpoint**: Portal has no migration operation or old-prefix compatibility; current `status:` / `status-action:` behavior and atomic writes remain intact.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Validate the combined UI, localization, current Status behavior and retired surface.

- [X] T014 Run `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook`; record outcomes against `specs/032-settings-redesign/quickstart.md`.
- [X] T015 Audit `apps/` and `packages/` for `status-label-migration`, `StatusLabelMigration`, `workflow:` and `workflow-action:` references; retain only historical documentation outside runtime code and update `specs/032-settings-redesign/quickstart.md` if validation steps change.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No work required.
- **Foundational (Phase 2)**: No work required.
- **User Story 1 (Phase 3)**: Independent; establishes the shared Settings page and layout.
- **User Story 2 (Phase 4)**: Follows US1 because it extends the same settings component, styles and stories.
- **User Story 3 (Phase 5)**: Follows US2 to avoid concurrent changes to the settings component and locale resources; current Status code changes are independent within this story.
- **Polish (Phase 6)**: Depends on all story phases.

### User Story Dependencies

- **US1 (P1)**: Can start immediately; establishes redesigned preference sections.
- **US2 (P1)**: Depends on the settings surface introduced in US1; no data dependency.
- **US3 (P1)**: Can be implemented independently in principle, but is sequenced after the shared UI tasks to avoid overlapping edits in `SettingsPage.tsx` and `settings.ts`.

### Parallel Opportunities

- T003 can proceed alongside T001/T002 because it edits only translation resources; T004 follows the main structure to keep stories aligned.
- T005, T016 and T017 touch independent files and can proceed together; T006 follows the palette token, type and localization work.
- T008, T009 and T010 edit separate API/contracts files and can proceed in parallel.
- T011, T012 and T013 edit separate domain/API/web files and can proceed in parallel after the migration surface is removed.

## Implementation Strategy

### MVP First

1. Complete US1 to deliver readable, localized settings sections.
2. Complete US2 to correct simultaneous palette previews.
3. Complete US3 to retire migration and legacy-prefix behavior.
4. Run Phase 6 checks before considering the feature complete.

### Incremental Delivery

Each story preserves existing user preferences and can be reviewed against its independent test. The final validation phase covers interactions between settings redesign, palette preview isolation and Status retirement.

## Notes

- Every implementation task names its target file or validation guide.
- `[P]` marks tasks that touch independent files and have no dependency on incomplete work.
- No task migrates, deletes or modifies Gitea Issue Labels.
