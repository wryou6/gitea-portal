# Implementation Plan: Issue List 斑馬紋與 Gantt Status 色彩

**Branch**: `023-work-view-status-colors` | **Date**: 2026-10-01 | **Spec**: [spec.md](spec.md)

## Summary

為 Issues List 資料列加入主題適應的交替底色；建立共用的 semantic badge palette，讓 Status、Type、Priority、異常及一般 Label 使用一致的 badge 幾何、色彩角色與明暗主題。Status badge 透過同一元件呈現在 Issue List、detail 與 Gantt；Gantt 整列背景與排程 bar 依 Status 映射。僅修改 Web 呈現與 Storybook，不新增 API、資料模型或持久化。

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, CSS
**Primary Dependencies**: 現有 pnpm workspace、i18next、Storybook
**Storage**: N/A
**Testing**: Storybook review; `pnpm.cmd typecheck`; `pnpm.cmd build`; `pnpm.cmd --filter @gitea-portal/web build-storybook`
**Target Platform**: Responsive browser UI, light and dark themes, zh-TW/en/ja
**Project Type**: Web application
**Performance Goals**: CSS-only visual updates; no additional runtime work per row
**Constraints**: Gitea remains sole source of truth; preserve existing Status/anomaly text and all Issue operations; status color must not be the sole signal
**Scale/Scope**: Issues List and Gantt presentation plus Storybook coverage

## Constitution Check

- I–IV: Pass. No Issue data, API, persistence, authorization, or Gitea behavior changes.
- V: Pass. Existing fixed Status values and anomaly visibility remain unchanged.
- VI: Pass. Repository identity and existing Issue content remain unchanged.
- VII: Pass. No new visible text; existing Status labels continue through i18n. Storybook review covers supported locales and themes.
- Development process: Feature spec, plan, tasks and analysis precede implementation; UI validation includes typecheck and build.

## Project Structure

```text
specs/023-work-view-status-colors/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md

apps/web/src/index.css
apps/web/src/components/ui/IssueStatusBadge.tsx
apps/web/src/components/ui/IssueBadgePalette.stories.tsx
apps/web/src/features/issues/IssueListPage.stories.tsx
apps/web/src/features/issues/IssueRow.tsx
apps/web/src/features/issues/IssueDetailHeader.tsx
apps/web/src/features/work-views/GanttIssueRow.tsx
apps/web/src/features/work-views/GanttBoard.stories.tsx
```

**Structure Decision**: Add one shared Issue Status badge component beside the existing Type/Priority badge components, centralize their palettes in theme CSS tokens, and add a Storybook palette for cross-family review. No dependency is added.

## Design Decisions

- Define danger/red, warning/amber, caution/orange, info/blue and success/green badge tokens with readable foreground/background/border pairs for light and dark themes. Map Status to info, warning, success and danger; map Type and Priority to the same roles while preserving their existing category distinction.
- Use the shared `Badge` primitive and one `IssueStatusBadge` component so Status badges have the same shape and density as Type/Priority badges across List, detail and Gantt.
- Keep user-defined Label badges neutral so they do not compete with semantic state colors.
- Use theme surface tokens mixed at low intensity for alternating Issues List rows; preserve the existing hover highlight above both stripe tones.
- Put the Gantt Status on each row as a data attribute. CSS uses that value for a low-intensity row tint and the matching scheduled bar color. Unscheduled and date-anomaly rows receive the same tint; anomaly annotation remains visible.
- Keep status words visible in badges. No extra legend or translated copy is required because the existing labels remain present.

## Complexity Tracking

No constitution violations or additional system complexity.
