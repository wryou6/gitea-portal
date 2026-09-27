# Quickstart: Portal 中英日語系驗收

## Prerequisites

- Node.js 22 and pnpm 9 installed.
- Dependencies installed with `pnpm.cmd install`.
- Gitea is reachable for signed-in account preference checks; Gitea remains the source of Issue and workflow data.

## Build checks

```powershell
pnpm.cmd typecheck
pnpm.cmd build
```

Expected: all workspace type checks and builds pass; all three locale resource shapes satisfy the same typed keys.

## Locale and account preference

1. With a browser locale set to `ja-JP` and no saved Portal language preference, open Portal; expect Japanese before the first page is rendered.
2. Switch to `zh-TW`, navigate across Issue list, Issue detail, create/edit forms, repository workspace, Kanban, Gantt and Settings; expect the selected locale on each Portal-owned label and feedback message.
3. Reload, then switch Portal accounts in the same browser; each account must restore only its own saved locale.
4. Set browser language to an unsupported locale with no saved preference; expect `zh-TW`. Block localStorage writes and switch locale; expect the current page to change without an exception.
5. Inspect the document language attribute after each change; expect `zh-TW`, `en` or `ja`.

## Gitea vocabulary and data preservation

1. Compare each shared term used by Portal to its mapped catalog key for Gitea v1.27.3 in `zh-TW`, `en-US` and `ja-JP`; Portal-only terms must have a glossary entry.
2. View Todo, In Progress and Done, transition reasons and next-step actions in all locales; expect localized labels while Gitea stable keys and English Labels remain unchanged.
3. Switch locale with Issue title/body, Comment, Label, Repository/Board names, Assignee and Milestone values containing source text; expect every source value unchanged.
4. Verify Issue and Comment timestamps follow the selected locale. Verify date-only schedule dates keep the same calendar date in time zones east and west of UTC.

## Error behavior

1. Trigger authentication, permission, validation, conflict and Gitea availability errors; expect a localized summary for each stable code.
2. Trigger a Gitea API failure with a detail; expect the summary translated and the original detail unchanged.
3. Simulate an absent/unknown error code; expect the localized generic error without exposing a translated guess from raw text.

## Acceptance

All three locales complete the scenarios above, no Portal-owned string falls back because its catalog key is absent, localized terms match the pinned Gitea catalog where concepts overlap, and Issue/Workflow data is unchanged.

## Implementation run notes (2026-09-28)

- `pnpm.cmd typecheck` and `pnpm.cmd build` pass; all four workspace packages typecheck and API/Web production builds complete.
- Authenticated Playwright checks used the normal Portal OAuth flow at `http://localhost:5173/` with the supplied local Gitea test account. The saved account locale survives reload; unsupported `fr-FR` falls back to `zh-TW`, and blocking locale storage writes does not prevent an in-page language switch.
- Settings, Issue list/detail/create/edit, repository workspace, Kanban, Gantt and workflow transition reasons were checked in the three locales. These checks found and fixed the missing Issue `nextAction`/`cancel` translations and removed Portal-managed Workflow Labels from the editable normal-label field.
- Account-key isolation was checked by serving `admin` and `admin2` from a mocked `/api/session` response in the isolated browser: each restored its own locale key. Only `admin` was authenticated against Gitea.
- Issue and Comment API payload fingerprints were identical after selecting `zh-TW`, `en` and `ja`. Source titles, bodies, comments, labels, assignees and Board names remained unchanged. Date-only schedule dates matched in `Pacific/Honolulu` and `Pacific/Kiritimati`.
- Stable error summaries and raw details were checked in all locales. Real API requests returned `permission.denied` (403), `validation.invalid_request` (422) and `resource.conflict` (409); the conflict probe left `updatedAt` unchanged. Error-code response simulation also verified localized authentication, Gitea-unavailable and unknown-code fallback behavior.
- A targeted Prettier check still flags existing formatting in `issues.ts` and `IssueEditForm.tsx`; no broad file rewrite was made. `git diff --check` passes.
- The existing Vite server at `http://localhost:5173/` was left running; Storybook was not touched.
