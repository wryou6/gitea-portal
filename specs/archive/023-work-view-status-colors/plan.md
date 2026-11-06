# Implementation Plan: 工作檢視色彩與可切換配色

**Branch**: `023-work-view-status-colors` | **Date**: 2026-10-01 | **Spec**: [spec.md](spec.md)

## Summary

為 Issues List 資料列加入主題適應的交替底色；建立霧藍、鼠尾草、鳶尾三套完整 light/dark semantic token palettes，並讓登入使用者在 Settings 中即時切換。配色涵蓋 Portal surfaces、Badge families、Issue List、Kanban 與 Gantt。沿用共用 Status badge 幾何及語意角色；Gantt 整列背景與排程 bar 依同一 Status token。只增加 per-account localStorage 外觀偏好，不新增 API、Issue 資料模型或 Gitea 持久化。

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, CSS
**Primary Dependencies**: 現有 pnpm workspace、i18next、Storybook
**Storage**: Account-scoped browser localStorage for palette preference; no server or issue persistence.
**Testing**: Storybook review; `pnpm.cmd typecheck`; `pnpm.cmd build`; `pnpm.cmd --filter @gitea-portal/web build-storybook`
**Target Platform**: Responsive browser UI, light and dark themes, zh-TW/en/ja
**Project Type**: Web application
**Performance Goals**: CSS-only visual updates; no additional runtime work per row
**Constraints**: Gitea remains sole source of truth; preserve existing Status/anomaly text and all Issue operations; status color must not be the sole signal
**Scale/Scope**: Shared palette tokens across app surfaces, Issues List, Kanban and Gantt; account preference in Settings; Storybook coverage

## Constitution Check

- I–IV: Pass. No Issue data, API, authorization, or Gitea behavior changes. The new localStorage key stores only the visual palette preference per account.
- V: Pass. Existing fixed Status values and anomaly visibility remain unchanged.
- VI: Pass. Repository identity and existing Issue content remain unchanged.
- VII: Pass. New palette names/descriptions are localized in zh-TW/en/ja; Storybook review covers supported locales and themes.
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
apps/web/src/features/settings/theme-preference.ts
apps/web/src/features/settings/SettingsPage.tsx
apps/web/src/app/App.tsx
apps/web/src/main.tsx
apps/web/src/i18n/resources/settings.ts
apps/web/src/features/settings/SettingsPage.stories.tsx
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
- Expose three named palette options in Settings with compact surface/status swatches. Store palette separately per account from light/dark/system mode; apply the palette through shared CSS semantic tokens so all surfaces and Issue views update together.
- Keep the Status role mapping stable within each palette: Todo/info, In Progress/warning, Done/success, anomaly/danger. Palette selection may shift a role's hue while its meaning remains consistent.

## Complexity Tracking

No constitution violations or additional system complexity.
