# Quickstart: Gantt 表格與日曆時間軸

## Prerequisites

- Existing Portal Web/API development setup is available.
- A user can open All repos Gantt and a readable Repository Gantt.
- Storybook fixtures include scheduled, single-day, unscheduled, invalid-date, and multi-repository issues.

## Validation scenarios

0. **Visible-row baseline**: Use the fixed Storybook fixture containing 8 scheduled Issues and a 1440×900 CSS-pixel viewport for before/after screenshots. Count a row when its Title cell is at least partly visible in the initial viewport. The post-change count must be at least 1.25 times the recorded baseline (round up to the next whole row).
   - Before (`BeforeReference`, original card height/content): 5 visible scheduled rows
   - After (`Default`, compact table): 8 visible scheduled rows (minimum: 7; +60%)
1. **Default table**: Open each Gantt workspace. Verify default core columns are Title, Assignee, Status; date columns are not offered; Issue rows are shorter than the current card rows; All repos shows Repository immediately to the left of Title, and Title contains only the Issue title. Repository-scoped Gantt has no Repository column. Hide the unscheduled section when no such issues exist.
2. **Column preferences**: Enable Type, Key, Priority, Created at, and Author; reorder by pointer and keyboard; save order; reload and switch Gantt workspace. Restore defaults and verify only the default three columns remain visible. Confirm Issues table/account preferences remain independent.
3. **Day timeline**: Verify two header tiers show month and daily dates; today is prominent, Saturday/Sunday backgrounds differ, and all scheduled bars align to dates. Check start-only, due-only, one-day, date range, unscheduled, and anomaly examples.
4. **Scale controls**: Select Week, 2 weeks, and Month. Verify Monday week boundaries, 14-day blocks anchored to the selected start date, calendar month boundaries, two-tier labels, and preserved exact Issue date positions.
5. **Start date and URL**: Verify default date is browser-local today minus 7 calendar days. Select another date and verify the viewport positions there while earlier data remains reachable by scrolling. Click localized Today to reset. Reload/copy the URL and verify date and Scale restore with existing filters intact. Verify invalid/missing values independently fall back to defaults.
6. **Responsive and accessible interaction**: At narrow viewport keep full chart and horizontally scroll; ensure header and rows remain aligned. Use keyboard to reorder fields and operate date/Scale controls. Verify focus visibility and today/weekend meaning in both light and dark themes.
7. **Localization**: Inspect all new field/calendar/control labels and Empty/Error stories in `zh-TW`, `en`, and `ja`; verify translated Today, scale names, date intervals and accessible names fit narrow layout. The product name is `甘特圖` / `Gantt Chart` / `ガントチャート` in those locales, including navigation, page labels, and View Options.
8. **Compact scrolling and order**: Use `ScrollableRows` at desktop and narrow viewport. Verify the page itself does not scroll vertically, the chart scrolls vertically, its always-visible bottom horizontal control scrolls the timeline and works by keyboard, rows are sorted by start date ascending within each section, and the Title cell contains no Issue Key (inspect `KeyColumnVisible` for the separate optional Key column).

## Project checks

- `pnpm.cmd --filter @gitea-portal/web typecheck`
- `pnpm.cmd --filter @gitea-portal/web build`
- `pnpm.cmd --filter @gitea-portal/web build-storybook`

These checks validate the Web UI and representative stories; the authenticated Portal checks recorded below cover URL reload/share and user-account preference behavior.

## Verification Results (2026-09-29)

- **Visible rows**: At 1440×900 with the fixed 8-Issue fixture, the original card layout shows 5 scheduled Issue titles and the compact default shows 8 (+60%). Screenshots: `output/playwright/gantt-before-reference.png` and `output/playwright/gantt-current.png`.
- **Authenticated Portal**: Earlier verification confirmed the default date was local today minus 14 days. The updated 7-day default is validated by the current implementation and Storybook; repeat authenticated date-reset verification before closing the feature.
- **URL state**: Selected a custom date and Month, reloaded, and confirmed both restored. Earlier verification reset to today minus 14 days while preserving Month; the updated reset target is today minus 7 days and needs authenticated recheck. Week and 2 weeks also updated their URL scale values. Issue detail `returnTo` retained both query parameters.
- **Columns and keyboard**: View Options listed the five optional fields and did not offer Start Date or Due Date. Enabled Type, moved it with the keyboard, saved the default order, reloaded, and confirmed the saved column state/order. Restored the account to the default three columns afterward. Source inspection confirmed the preference cookie is keyed by login and shared across that login's workspaces; a second-account sign-in was not available for an end-to-end comparison.
- **Responsive and localization**: At 390×844, the table and full timeline remained available with horizontal scrolling. Inspected Gantt labels in `zh-TW`, `en`, and `ja`; restored the test account language to English afterward.
- **Storybook layout regression**: Added `LongTitle` and `NarrowViewOptionsOpen`; visually confirmed long titles end in a clean ellipsis without pushing neighboring columns, and all view-option fields fit in the narrow dialog.
- **Compact scrolling and order**: In `ScrollableRows`, the preview stayed fixed while wheel scrolling moved Gantt rows under the sticky header. The default date is generated as browser-local today minus seven days. `KeyColumnVisible` verifies the Issue Key remains a separate optional column from Title. The persistent bottom timeline control is wired to the chart's horizontal scroll position.
- **Title and Repository columns**: All repos Storybook renders Repository, Title, Assignee, Status, then the timeline; Title contains no owner/repo or Issue Key. `RepositoryScoped` renders only the default three columns before the timeline.
- **Compact field widths** (2026-09-30): Storybook measures the widest visible cell value for Assignee, Status, and Repository, then shares those widths across the header and rows. At the default fixture, the `engineer` assignee, localized Status badge, and full Repository names fit without colliding with the timeline.
- **Conditional unscheduled section** (2026-09-30): `NoUnscheduledIssues` uses a long scheduled fixture without unscheduled issues; the empty section heading/message are omitted so the chart has the full viewport height for scheduled rows.
- **Gantt localization** (2026-09-30): Navigation and Gantt page/view-option names use `甘特圖` / `Gantt Chart` / `ガントチャート`; Today, Scale, and scale choices are localized in the Chinese and Japanese interfaces. Storybook page headers, issue-row field labels, Empty, and Error/Retry states use the active locale.
- **Runtime health**: Playwright reported 0 console errors and 0 warnings. Authenticated `GET /api/session`, `/api/repositories`, and `/api/repositories/gantt` requests returned 200.
- **Builds**: Web typecheck, production build, and Storybook build passed. Storybook emitted its existing `eval` and large-chunk warnings; build completed successfully.
