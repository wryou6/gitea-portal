# Tasks: Hover 展開側欄與工作檢視排序

**Input**: Design documents from `specs/034-hover-expand-sidebar/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/sidebar-navigation.md`, `quickstart.md`

**Tests**: No automated test suite tasks were requested. Required project validation (`typecheck` and `build`) and the UI walkthrough are included in the final validation task.

## Phase 1: Setup

**Purpose**: Existing pnpm, AppShell, CSS and Storybook infrastructure is sufficient; no setup changes or dependencies are required.

## Phase 2: Foundational

**Purpose**: No shared blocking changes are needed before the independently testable user stories.

## Phase 3: User Story 1 - 快速切換工作檢視 (Priority: P1) - MVP

**Goal**: 導覽入口順序為建立問題、Kanban、Gantt、List，且既有 route 與工作脈絡不變。

**Independent Test**: 由 AppShell 開啟四個入口，確認標籤順序、active 標示、Repository workspace 及有效 URL 狀態。

- [x] T001 [US1] Reorder `navigationItems` to Create issue, Kanban, Gantt, Issues/List in `apps/web/src/components/layout/AppShell.tsx`, preserving existing destinations and work-view search-state logic.

**Checkpoint**: User Story 1 is independently demonstrable; the new order does not depend on the overlay behavior.

## Phase 4: User Story 2 - 以窄側欄保留工作區空間 (Priority: P1)

**Goal**: 側欄預設收合，hover/focus 時覆蓋內容展開，且不改變控制列與工作內容幾何位置。

**Independent Test**: 在一般與 Gantt/工作檢視版面移入、移出側欄及移動鍵盤焦點，檢查展開標籤、收合時機、內容位置與 clipping。

- [x] T002 [US2] Remove expanded-state React logic, sessionStorage persistence and the sidebar toggle button from `apps/web/src/components/layout/AppShell.tsx`; render the sidebar in the fixed-collapsed shell state.
- [x] T003 [US2] Replace expanded/collapsed grid-width styling with a compact reserved track and overlay expansion on hover/focus in `apps/web/src/index.css`; keep general sticky and full-height work-view layouts, and constrain expansion to the viewport.

**Checkpoint**: User Story 2 is independently demonstrable with mouse and keyboard without shifting content or work-view controls.

## Phase 5: User Story 3 - 在觸控與輔助科技環境操作側欄 (Priority: P2)

**Goal**: 觸控直接操作入口；鍵盤與輔助科技可辨識名稱、焦點及目前頁面。

**Independent Test**: 在收合狀態使用鍵盤、screen reader 與 touch interaction 逐一操作入口；確認標籤展開不遮住 focus。

- [x] T004 [US3] Add AppShell Storybook scenarios for collapsed navigation, keyboard focus expansion and narrow viewport overlay in `apps/web/src/components/layout/Layout.stories.tsx`, using existing localized link names and active-route state.
- [x] T005 [US3] Verify each navigation link retains its accessible name, `aria-current` state, visible keyboard focus and direct touch activation in `apps/web/src/components/layout/AppShell.tsx`; update `apps/web/src/index.css` focus and coarse-pointer rules only where required by the UI contract.

**Checkpoint**: User Story 3 is independently demonstrable without a click-to-expand mode or added navigation copy.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate shared-shell integration and all target input/viewport scenarios.

- [x] T006 Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root, then execute the UI scenarios in `specs/034-hover-expand-sidebar/quickstart.md` against Layout Storybook and the Gantt work-view layout.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No code changes; existing project configuration is used.
- **Foundational (Phase 2)**: No separate prerequisite tasks.
- **User Story 1 (Phase 3)**: Independent of other stories.
- **User Story 2 (Phase 4)**: Builds on the reordered navigation; T002 precedes T003 because CSS depends on removing the expanded shell state.
- **User Story 3 (Phase 5)**: Depends on US1 and US2 markup/styling; T004 and T005 can be completed in either order after T002/T003.
- **Polish (Phase 6)**: Depends on all three stories.

### User Story Dependencies

- **US1 (P1)**: No dependencies; delivers the new order as the MVP slice.
- **US2 (P1)**: May begin after US1 to avoid editing `AppShell.tsx` concurrently.
- **US3 (P2)**: Depends on the final collapsed/expanded behavior from US2 for meaningful input and focus validation.

### Parallel Opportunities

- No implementation tasks are marked `[P]`: the AppShell and CSS changes have a deliberate order, and the accessibility walkthrough depends on the completed overlay behavior.

## Implementation Strategy

### MVP First

1. Complete T001 and verify navigation order and existing route behavior.
2. Complete T002-T003 and verify overlay behavior on standard and full-height work-view layouts.
3. Complete T004-T005 for keyboard, touch and screen reader use.
4. Complete T006 before handoff.

### Incremental Delivery

1. Deliver reordered work-view links (US1).
2. Add fixed collapsed and overlay expansion behavior (US2).
3. Complete accessible touch/keyboard navigation (US3).
4. Run static validation and the quickstart matrix (T006).

## Notes

- Each task is checkbox-formatted, has a unique sequential ID and story label where required, and names the target file or validation guide.
- No API, persisted preference, package dependency or Gitea data change is planned.
