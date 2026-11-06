# Implementation Plan: Issue Markdown Rendering

**Branch**: `043-issue-markdown-rendering` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/043-issue-markdown-rendering/spec.md`

## Summary

Render Gitea Issue descriptions and comments using a shared React Markdown view with GFM support. Use `react-markdown` with `remark-gfm`, keep raw HTML disabled, retain the renderer's safe URL handling, and style structured content to fit both full-page and dialog layouts. No API, persistence, or write behavior changes.

## Technical Context

**Language/Version**: TypeScript 5.8, React 19

**Primary Dependencies**: `react-markdown`, `remark-gfm` (add to `apps/web`)

**Storage**: N/A; continue reading raw description and comment text from the existing Gitea-backed API.

**Testing**: `pnpm.cmd typecheck` and `pnpm.cmd build`; manually inspect representative Markdown in the Issue page and dialog.

**Target Platform**: Existing desktop and responsive web application.

**Project Type**: pnpm monorepo web application (`apps/web`, `apps/api`, shared packages).

**Performance Goals**: Render normal Issue descriptions and comments synchronously without a separate service request.

**Constraints**: Disable raw HTML; preserve safe link URL validation; content tables and code blocks must not cause page-level horizontal overflow; do not change API contracts or Gitea persistence.

**Scale/Scope**: One shared renderer for Issue descriptions and comments in the existing full page and dialog presentations.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- I. Gitea is the only Issue data source: PASS. The renderer consumes existing values and creates no persisted copy.
- II. Current user permissions: PASS. Existing delegated API reads remain unchanged.
- III. Safe Gitea writes: PASS. No writes or mutation flows are changed.
- IV. Complete aggregated reads: PASS. No aggregation or loading behavior is changed.
- V. Fixed Issue Status semantics: PASS. Status is not touched.
- VI. Scope clarity: PASS. Existing Issue identity and repository context remain unchanged.
- VII. Localized visible text: PASS. No new user-facing strings are required.
- Development process: PASS. This feature has spec, plan, tasks, and an analysis gate; UI changes will run typecheck and build.

## Project Structure

### Documentation (this feature)

```text
specs/043-issue-markdown-rendering/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/
├── package.json
└── src/
    ├── features/issues/
    │   ├── IssueDetailPage.tsx
    │   ├── IssueComments.tsx
    │   └── MarkdownContent.tsx
    └── index.css
pnpm-lock.yaml
```

**Structure Decision**: Keep the feature in the existing Web app. Add one reusable presentation component under the Issue feature and use it for both description and comment bodies. No API, domain, Gitea contract, or persistence changes are needed.

## Complexity Tracking

No constitution violations or additional architectural components.
