# Quickstart: 跨檢視逾期日期提示

## Prerequisites

- Use a local Portal with an authenticated Gitea account and readable Issues in at least one Repository.
- Have Issues with due dates before today, today, and after today; include one closed Issue and one schedule-anomaly Issue.

## Validation

1. Open the same overdue, open Issue in Issue List, Kanban, Gantt, and Issue detail. Confirm each shows a clearly recognizable fire silhouette in a red circular frame without visible text. In Gantt, confirm the compact icon appears by the title without tinting the full row.
2. Open Issues due today and in the future in all four views. Confirm neither has the overdue indicator.
3. Open a closed Issue whose due date is in the past. Confirm no overdue indicator appears.
4. Open an Issue with an invalid due date or reversed start/due range. Confirm the schedule anomaly remains visible and no overdue marker appears.
5. Open an Issue with a start-date anomaly and a valid past due date. Confirm both the anomaly and overdue state remain visible.
6. Change the browser-local date past an Issue's due date, then reload or cause the view to render again. Confirm the overdue indicator is recalculated without editing the Issue.
7. Confirm the existing sort order, filters, status, and Gitea values are unchanged. Confirm a screen reader announces the translated overdue accessible name; the icon is not a separate keyboard control.
8. Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root.

## Expected result

The same open, valid, past-due Issue is identifiable as overdue in every covered view, while boundary dates, closed Issues, and invalid due dates follow the rules in [spec.md](spec.md).

## Validation record (2026-10-06)

- Passed: `pnpm.cmd -r --workspace-concurrency=1 typecheck`.
- Passed: `pnpm.cmd -r --workspace-concurrency=1 build`; Vite reported the existing >500 kB chunk-size advisory.
- Passed: `pnpm.cmd --filter @gitea-portal/web build-storybook`; Storybook reported its existing large docs chunk and `eval` advisories.
- Not run: Browser visual, keyboard, and screen-reader acceptance. The computer-use browser surface reported no available apps or browsers, and Storybook port 6006 prompted to select another port. Static Storybook build confirms stories compile but does not replace browser acceptance.
- No Gitea data was changed.
