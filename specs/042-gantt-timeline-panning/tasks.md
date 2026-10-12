# Tasks: Gantt 時間軸拖曳平移

**Input**: Design documents from `specs/042-gantt-timeline-panning/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: 不新增自動化測試套件；此 UI 互動依 Storybook 情境、手動驗收及 Web typecheck/build 驗證。

**Organization**: 依 User Story 拆分，讓單一捲軸/鍵盤能力與空白格拖曳平移可分別驗收。

## Phase 1: Setup

**Purpose**: 建立涵蓋兩種圖表狀態與既有排程互動的展示情境。

- [X] T001 Add a dedicated Gantt interaction Storybook story with scheduled, unscheduled, editable-bar, and no-schedule-date fixtures in `apps/web/src/features/work-views/GanttBoard.stories.tsx`.

## Phase 2: Foundational

**Purpose**: No additional shared infrastructure is needed; `GanttBoard.tsx` already owns both chart scroll containers, and the existing row component owns schedule gestures.

## Phase 3: User Story 1 - 用單一捲軸瀏覽時間軸 (Priority: P1)

**Goal**: Keep one horizontal scroll control and retain clear keyboard access after removing the mirrored slider.

**Independent Test**: Open an overflowing scheduled and empty-timeline story; verify the duplicated range input is absent, the chart has one native horizontal scroll surface, and keyboard navigation changes its scroll position.

### Implementation for User Story 1

- [X] T002 [US1] Remove both `.gantt-horizontal-scrollbar` inputs and slider-only `chartMaxScroll`/`chartScrollLeft` state and calculations from `apps/web/src/features/work-views/GanttBoard.tsx`; remove the custom slider rules from `apps/web/src/index.css`.
- [X] T003 [US1] Make both `.gantt-chart-scroll` variants focusable, support ArrowLeft/ArrowRight and Home/End on the container itself in `apps/web/src/features/work-views/GanttBoard.tsx`, and add visible keyboard focus styling in `apps/web/src/index.css` without intercepting child controls.
- [X] T004 [US1] Extend the Gantt interaction stories in `apps/web/src/features/work-views/GanttBoard.stories.tsx` to demonstrate overflowing and non-overflowing scheduled/empty timeline layouts; confirm the story entries compile in Storybook.

## Phase 4: User Story 2 - 保留未排程 Issue 的排程建立操作 (Priority: P1)

**Goal**: Pan from eligible blank timeline areas with mouse, pen, and touch; on 390px mobile layouts allow touch to start in non-interactive fixed-field whitespace when the timeline is covered, while preserving unscheduled range creation, schedule bars, and vertical touch scrolling.

**Independent Test**: At 390px, drag from non-interactive fixed-field whitespace to pan; drag an unscheduled row to create a schedule; operate links, buttons, and bars; confirm only the intended gesture runs in each area and vertical touch scrolling remains available.

### Implementation for User Story 2

- [X] T005 [US2] Add shared pointer-pan start/move/end/cancel/lost-capture handling to both chart containers in `apps/web/src/features/work-views/GanttBoard.tsx`; allow touch starts in non-interactive `.gantt-header-fields` and `.gantt-row-fields` whitespace when narrow fixed fields cover the timeline, exclude unscheduled create-range tracks, `.gantt-bar`, `[data-drag-mode]`, links, buttons, and form controls, and update only the chart `scrollLeft`.
- [X] T006 [US2] Add grab/grabbing and text-selection styles plus horizontal-touch/vertical-pan behavior for `.gantt-chart-scroll` in `apps/web/src/index.css`, preserving the existing `touch-action: none` behavior on unscheduled create-range tracks and bar handles.
- [X] T007 [US2] Extend the interaction stories in `apps/web/src/features/work-views/GanttBoard.stories.tsx` to demonstrate drag-pan, unscheduled creation, bar editing, touch/narrow viewport including fixed-field whitespace, and empty-timeline cases.

## Phase 5: Polish & Cross-Cutting Validation

**Purpose**: Validate the final UI and record implementation evidence.

- [X] T008 Run Web typecheck, production build, and Storybook build; resolve failures in changed `apps/web/src/` files and record build/story-catalog outcomes in `specs/042-gantt-timeline-panning/quickstart.md`.
- [X] T009 Review `apps/web/src/features/work-views/GanttBoard.tsx`, `apps/web/src/features/work-views/GanttIssueRow.tsx`, and `apps/web/src/index.css` to confirm the new pan path introduces no schedule mutation and existing create/move/resize/repair/anomaly interactions remain available; update `specs/042-gantt-timeline-panning/spec.md` or this task list if evidence requires it.
- [X] T010 Complete the manual mouse, touch, keyboard, and gesture-isolation scenarios in `specs/042-gantt-timeline-panning/quickstart.md` using a browser with touch emulation or a touch device; include 390px fixed-field whitespace, control/create isolation, and vertical scroll; record the observed results in that file.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 provides the fixture used by both user stories.
- **Foundational (Phase 2)**: No code task is required; the existing shared chart scroll container and row event handling are the feature foundation.
- **User Story 1 (Phase 3)**: T002 → T003 → T004; establishes the single scroll surface and keyboard path.
- **User Story 2 (Phase 4)**: Depends on T001 and T002; implement T005 → T006 → T007 so pointer pan uses the final single scroll surface and can be checked against fixture states.
- **Polish (Phase 5)**: T008, T009, and T010 depend on both stories being complete; T010 also requires an available browser/touch device.

### Parallel Opportunities

- T002 and T003 share `GanttBoard.tsx`; execute sequentially. T004 depends on both.
- T005 and T006 touch separate files and may be implemented in parallel after T002; T007 follows both.
- T008 and T009 may be performed in parallel after T007 because they update separate artifacts; T010 records the later browser interaction evidence in `quickstart.md`.

## Implementation Strategy

### MVP First

1. Complete T001-T004 to remove the duplicate control and retain keyboard browsing.
2. Independently verify User Story 1 before adding pointer gesture behavior.
3. Complete T005-T007 to add mouse/pen/touch pan while preserving schedule gestures.
4. Complete T008-T010 and rerun `$speckit-converge` against the final code and artifacts.

### Notes

- Keep every pan operation view-only; only the pre-existing unscheduled-create and scheduled-bar handlers may write schedule data.
- Do not add translations unless implementation introduces new visible/accessibility text; existing Gantt labels are already localized.
