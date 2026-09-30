# Quickstart: 驗證工作檢視共用篩選與全域搜尋

## Prerequisites

- Install workspace dependencies and configure a reachable Gitea OAuth application using `.env.example`.
- Sign in with an account that can read at least two repositories containing Issues with varied Status, Type, Priority, assignees, Labels, and Milestones.
- Start the app with `pnpm.cmd dev`.

## Manual scenarios

1. **Shared filters**: In All repos List, select a priority, Type, Status, and assignee. Confirm each change immediately updates results and query parameters. Remove one chip and clear all; verify only selected conditions change.
2. **Cross-view state**: With shared filters active, navigate List → Kanban → Gantt → List. Confirm the same filter query remains and each view contains only matching Issues. Verify default filter values are omitted and invalid URL values do not break the page.
3. **Advanced filters**: Expand advanced filters in All repos, select Repository, Label, and Milestone, then collapse and switch views. Confirm selected values stay active and the advanced active count is accurate. In a Repository workspace, confirm the Repository selector is absent.
4. **Gantt Status**: Confirm the Gantt Open/Closed controls are gone; Todo/In Progress/Done use the common Status filter. Confirm date range, Scale, and Gantt view options still work and remain in the URL.
5. **Global search**: From a Repository view, search for an Issue in a different readable Repository. Confirm results appear in the top-bar dropdown, show Repository identity, and selecting a result opens that Issue. Return from detail and confirm the original view is restored. Verify no-results, loading, read-error, keyboard navigation, and Escape dismissal.
6. **Responsive/theme/i18n**: Review 375px, tablet, and desktop widths in light and dark themes for zh-TW, en, and ja. Confirm no horizontal page overflow, visible focus, and readable dropdown/active chips.
7. **Read failures**: Simulate required aggregate read failure and confirm existing error/retry presentation remains whole-view; zero filtered results remain an empty result, not an error.

## Storybook

Run `pnpm.cmd --filter @gitea-portal/web build-storybook`. Inspect shared filter bar and top search stories using fixture data only; stories must not call live APIs or mutate the Storybook URL.

## Static checks

Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root.
