# Data Model: Issue List 斑馬紋與 Gantt Status 色彩

No application data model changes are introduced.

## Presentation Inputs

- **Issue Status**: Existing `todo`, `in-progress`, `done`, or anomaly value supplied by the Issue view model.
- **Theme**: Existing light or dark theme tokens used by CSS custom properties.
- **List row position**: Existing DOM position among Issue data rows; used only for alternating surface presentation.
- **Badge semantic role**: Existing presentation classification (`danger`, `warning`, `caution`, `info`, `success`, or neutral) shared by Status, Type, Priority and Label badge families.

## Presentation Outputs

- **Status semantic color**: A stable mapping from Status to info, warning, success, or danger badge tokens.
- **Gantt row tint and bar**: CSS presentation derived from the row's existing Status attribute.
- **List stripe**: CSS presentation derived from the Issue row's existing table position.

These values are derived at render time. They are not persisted and do not write to Gitea.
