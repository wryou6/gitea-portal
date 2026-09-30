# Quickstart: Issue List 斑馬紋與 Gantt Status 色彩

## Storybook review

1. Open `Issue badges/Palette` → `All Badge Families`; compare Status, Type, Priority, anomaly, conflict/missing and neutral Label badges. Confirm shared geometry and repeated semantic roles use the same colors.
2. Switch the palette to dark theme; verify all foreground/background pairs remain readable and the neutral Label treatment stays distinct.
3. Open `Screens/Issue List` → `AlternatingRows`; confirm adjacent Issue rows alternate subtly, Status badges match the palette, and hover is stronger than either stripe.
4. Open `Work views/Gantt` → `StatusColors`; confirm Todo, In Progress, Done and anomaly Status keep the same colors in badges, row surfaces and scheduled bars, including unscheduled/date-anomaly rows.
5. Review Storybook in zh-TW/en/ja and desktop/narrow viewports. Confirm anomaly text and Status text remain visible and there is no horizontal page overflow.

## Required checks

```powershell
pnpm.cmd typecheck
pnpm.cmd build
pnpm.cmd --filter @gitea-portal/web build-storybook
```

No authenticated Gitea write or migration scenario applies; this change is presentation-only.
