# Quickstart: Kanban 欄位與卡片版面調整

## Automated project checks

Run from repository root:

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
```

## Storybook design review

1. Start `pnpm.cmd --filter @gitea-portal/web storybook` and open the Work views/Kanban card and Work views/Kanban stories.
2. Inspect the three main card rows in zh-TW, English, and Japanese: Priority then Type on the left and key on the right; title alone on row two; assignee on the left of the footer, with Due and Next as matching label/value groups on the right. Confirm Next has no colon, assignees have no current/last role label, Done cards use the first retained assignee, and long titles truncate without overlap.
3. Inspect missing Type/Priority, unassigned and unset Due date, long title/key, and repair/schedule anomaly. Confirm generic Labels not used by card fields are hidden.
4. Confirm cards have no Status action button. Keyboard-focus the issue title and verify it links to Issue detail. Anomaly cards must not be draggable. Storybook uses fictional callbacks and must not issue live Gitea requests.
5. Inspect three Status columns and four columns including Anomaly at desktop and tablet widths; confirm equal widths and no clipped cards. At the narrow breakpoint, confirm the existing lane picker and single-column view remain usable.
6. Switch light/dark theme and check text, focus, key metadata, badges, and anomaly contrast.
7. Confirm Todo/In Progress/Anomaly order: Priority high-to-low, usable Due date soon-to-later, then least recently updated first; missing/conflicting Priority and missing/invalid Due date sort after usable values. Confirm Done uses most recently updated first and ties use Repository owner/name/Issue number.

## Acceptance

- Card layout and Status interaction satisfy [kanban-card-layout.md](contracts/kanban-card-layout.md).
- Storybook contains fictional data only; no live Gitea requests or mutations are needed for design review.
- Portal Status transitions continue to use the existing authenticated Gitea flow.

## Validation record — 2026-09-29

- `pnpm.cmd typecheck`: PASS for all four workspace packages.
- `pnpm.cmd build`: PASS for domain, contracts, Web, and API.
- `pnpm.cmd --filter @gitea-portal/web build-storybook`: PASS. Storybook/Vite emitted the existing `eval` and large-chunk warnings; no build errors.
- Browser review used this worktree's Storybook on `localhost:6007` because the existing `localhost:6006` instance served stale stories. Reviewed the three-column board, four-column Anomaly board, card row order, zh-TW/en/ja locale toolbar, light/dark themes, and 375px narrow layout with the lane picker. Selecting the Anomaly lane showed the schedule annotation and no Status action. Keyboard activation reached a destination and closed the disclosure. Browser console reported zero errors and zero warnings. Tablet-width visual review remains pending.
- Convergence follow-up: the Anomaly card's DOM reports `draggable=false`; it has no Status disclosure, while regular Status cards remain draggable.
- The Portal API is unavailable in this worktree, and the OAuth runtime configuration needed to run it is absent. No Issue was created or changed; the signed-in keyboard/drag transition acceptance is still pending.

## Validation record — 2026-09-30

- `pnpm.cmd typecheck`: PASS across all four workspace packages.
- `pnpm.cmd build`: PASS for domain, contracts, Web, and API.
- `pnpm.cmd --filter @gitea-portal/web build-storybook`: PASS. Storybook/Vite emitted the existing `eval` and large-chunk warnings; no build errors.
- Browser review at 1024×768 with the four-column Anomaly story confirmed equal-width columns, visible cards, and wrapping long titles and repository keys without overlap. The Anomaly card has no Status disclosure.
- Keyboard review opened a regular card's disclosure with Enter. The Todo card offered only In Progress and Done; Anomaly was not a destination. Browser console reported zero errors and zero warnings.
- T011 tablet review is complete. T012 remains pending because no local Gitea/API service was listening on the usual ports during this review. No Issue was created or changed.
- `pnpm.cmd format:check` remains failing on 179 workspace files, including pre-existing files outside feature 020. The feature-only check also reports formatting warnings in several touched files; no workspace-wide formatting was applied.

## Layout revision — 2026-09-30

- Removed the in-card Status disclosure and arranged the card into three main rows: `owner/name #number` with Type/Priority; title followed by smaller next-action text; assignee/Due date.
- The zh-TW navigation label and Kanban eyebrow now use 「看板」. Keyboard Status changes use the Issue detail page's existing Status action; Kanban drag transitions still use the existing confirmation dialog.
- Storybook review for this layout revision is recorded below. Signed-in Issue detail and drag transition verification remains pending under T012.

## Three-row visual review — 2026-09-30

- At 1440px, the card presents three main rows: key with Type/Priority; title followed by small next-action text; assignee with Due date. Anomaly notes follow; generic Labels are hidden from the card.
- At 1024px and 375px, metadata wraps without overlap. Long titles truncate with an ellipsis to preserve space for the next action; the Issue link retains the full title. The card has no Status button.
- Checked zh-TW, Japanese, and dark theme. The long Japanese Anomaly heading wraps without overlapping its count. Browser console had zero errors or warnings.
- `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook` passed for this revision.
- Follow-up review: validated the title/next-action row at 1440px, 1024px, and 375px. Screenshots are in `output/playwright/kanban-title-action-board.png`, `output/playwright/kanban-title-action-tablet.png`, and `output/playwright/kanban-title-action-mobile.png`. The dedicated long-metadata card story was also reviewed at desktop width.
- Done-card follow-up: the `CompletedWithLastAssignee` Storybook story displays the first retained Gitea Assignee under 「最後負責人」, while open cards retain 「目前負責人」. The `CompletedWithoutLastAssignee` story shows 「未記錄」. Browser review at 1280px confirmed the label, no generic Label chips, and zero console errors or warnings; screenshot: `output/playwright/kanban-done-last-assignee.png`.
- Label follow-up: generic Gitea Labels not used by card fields are hidden from Kanban cards; full Labels remain in Issue list/detail.
- Follow-up checks: `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook` passed. Storybook reported its existing `eval` and large-chunk warnings; there were no build errors.
- Footer spacing follow-up: aligned the assignee and Due date as separate groups with a subtle divider. Reviewed the Kanban board story at 1440px and 375px; the groups remain distinct, the card retains its three main rows, and the browser console had zero errors or warnings. Screenshots: `output/playwright/kanban-footer-separation-desktop.png` and `output/playwright/kanban-footer-separation-mobile.png`. Typecheck, production build, and Storybook build passed.
- First-row follow-up: moved Type/Priority badges to the left and aligned the Repository/Issue key to the right. Reviewed the three-column board at 1440px and the long-metadata card at 375px; the key wraps without covering the badges. Browser console had zero errors or warnings. Screenshots: `output/playwright/kanban-meta-left-desktop.png` and `output/playwright/kanban-meta-left-long-mobile.png`. Typecheck, production build, and Storybook build passed.
- Badge-order follow-up: ordered Priority before Type to surface urgency first.
- Final first-row review: confirmed Priority then Type at the left and the Repository/Issue key at the right in the 1440px board screenshot; at 375px the long key wraps without overlap. Screenshots: `output/playwright/kanban-priority-before-type-desktop.png` and `output/playwright/kanban-priority-before-type-mobile.png`. `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook` passed; Storybook emitted its existing `eval` and large-chunk warnings.
- Card-order follow-up: Todo/In Progress/Anomaly now sort by Priority, nearest usable Due date, then oldest `updatedAt`; Done sorts by newest `updatedAt`. Missing Priority/Due date sorts after usable values, and Repository/name/number break ties. `pnpm.cmd typecheck` and `pnpm.cmd build` passed.

## Footer layout revision — 2026-10-02

- Removed the current/last role label from assignee names. The second row now gives the Issue title full width; the footer places the assignee on the left and Due date followed by the right-aligned next action on the right.
- Added `LongFooterMetadata` to review long assignee and next-action text wrapping in narrow columns. Validation results are recorded after the code checks below.
- Storybook browser review at 375px confirmed the long assignee wraps onto its own line and the Due date/next-action group stays right-aligned without overlap in zh-TW, English, and Japanese. At 1440px, the assignee remains left while Due date and next action align at the right. Browser console had no errors or warnings (React DevTools info only).
- `pnpm.cmd typecheck`, `pnpm.cmd build`, and `pnpm.cmd --filter @gitea-portal/web build-storybook` passed after the revision. Storybook emitted its existing `eval` and large-chunk warnings; no build errors. `git diff --check` passed.

## Signed-in local Portal scenario

1. Use an isolated browser session and two disposable local Gitea Issues in a test Repository.
2. On the first Issue, use the card title to open Issue detail, activate its Status action with the keyboard, and choose a valid destination. Confirm the existing dialog shows applicable reasons and assignee options, then verify Gitea has not changed before confirmation.
3. Choose a reason and any required assignee, confirm, and verify the first Issue's updated Status and existing success/error feedback.
4. On the second Issue, drag the card to a valid destination. Confirm the same dialog opens and Gitea has not changed before confirmation; choose a reason and any required assignee, confirm, and verify the updated Status and feedback.
