# Data Model: 工作檢視色彩與帳號配色偏好

No application data model changes are introduced.

## Presentation Inputs

- **Issue Status**: Existing `todo`, `in-progress`, `done`, or anomaly value supplied by the Issue view model.
- **Theme**: Existing light/dark/system appearance preference and selected Cobalt, Juniper or Iris palette tokens used by CSS custom properties.
- **Palette preference**: Visual-only `cobalt`, `juniper` or `iris` selection stored under `gitea-portal:palette:<encoded-login>` in localStorage, separate from Issue data and appearance mode.
- **List row position**: Existing DOM position among Issue data rows; used only for alternating surface presentation.
- **Badge semantic role**: Existing presentation classification (`danger`, `warning`, `caution`, `info`, `success`, or neutral) shared by Status, Type, Priority and Label badge families.

## Presentation Outputs

- **Status semantic color**: A stable mapping from Status to info, warning, success, or danger badge tokens.
- **Gantt row tint and bar**: CSS presentation derived from the row's existing Status attribute.
- **List stripe**: CSS presentation derived from the Issue row's existing table position.

Status color and row presentation are derived at render time and never write to Gitea. Only the selected visual palette preference is persisted per account in the browser.
