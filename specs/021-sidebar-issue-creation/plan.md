# Implementation Plan: 側邊導覽建立問題入口

**Branch**: `021-sidebar-issue-creation` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: [Feature specification](spec.md)

## Summary

將既有 Issue 建立入口從 Issues 頁標題區移至登入後全域左側導覽。重用 `AppShell` 的導覽項目、現有 Issue 建立頁與 URL builders；Repository 脈絡沿用目前工作區，All repos 仍讓使用者選擇 Repository。補上三語導覽文字、收合側欄的建立圖示，並調整 Layout Storybook 案例以反映入口搬移。建立表單、權限與成功/返回流程不變。

## Technical Context

**Language/Version**: TypeScript 5.x, React 19

**Primary Dependencies**: React Router-style application routing via `apps/web/src/app/routes.ts`; i18next; existing inline SVG navigation icons

**Storage**: N/A; no new persisted data

**Testing**: Existing Storybook layout composition; `pnpm.cmd typecheck`; `pnpm.cmd build`

**Target Platform**: Authenticated web Portal in supported desktop and narrow viewports

**Project Type**: pnpm monorepo; change limited to `apps/web`

**Performance Goals**: No additional network request on navigation render; reuse existing links and page loading behavior

**Constraints**: Preserve delegated Gitea authorization and all existing issue-create behavior; use localized strings; collapsed sidebar links retain accessible names

**Scale/Scope**: One new global navigation item; one removed Issues-page CTA; no API, domain, or persistence changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Gitea is the Issue source of truth**: Pass — the existing Issue create page remains the only write path.
- **II. Operations follow current user permissions**: Pass — no new endpoint or elevated identity is introduced.
- **III. Gitea writes preserve data and are verifiable**: Pass — no Gitea write behavior changes.
- **IV. Aggregates do not show partial data as complete**: Pass — no aggregate reads change.
- **V. Fixed Issue Status semantics**: Pass — Status behavior is untouched.
- **VI. Workspace scope is clear**: Pass — Repository links retain Repository identity; All repos keeps its existing selection flow.
- **VII. User-visible text is localized**: Pass — add the entry label in Traditional Chinese, English, and Japanese using common i18n resources.

## Project Structure

### Documentation (this feature)

```text
specs/021-sidebar-issue-creation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sidebar-issue-creation.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/
├── components/layout/AppShell.tsx       # Global navigation item and icon
├── components/layout/Layout.stories.tsx # Issues composition without page CTA
├── features/issues/IssueListPage.tsx    # Remove duplicated create CTA
├── app/routes.ts                        # Reuse existing create routes
└── i18n/resources/common.ts             # Localized global navigation label
```

**Structure Decision**: Keep the change in the existing Web shell, Issues view, shared route helpers, and common locale resources. No backend or shared package changes are needed.

## Complexity Tracking

No Constitution violations or additional architectural complexity.
