# Fixed Workflow Display Contract

Fixed workflow values remain stable and locale-independent in Gitea. The Web UI localizes presentation using stable semantic keys.

## Existing fixed values

- State keys: `todo`, `in-progress`, `done`, plus anomaly presentation keys where applicable.
- Workflow action keys: existing stable `WORKFLOW_ACTIONS[].key` values.
- Gitea labels and Open/Closed state: unchanged English identifiers and existing values.

## Issue display fields

Issue responses retain the existing `workflowState`, `lastActionKey` and `nextAction` fields and add required `nextActionKey`:

- `workflowState` selects the localized state name.
- `lastActionKey` selects the localized last transition reason; null means no recognized reason.
- `nextActionKey` selects the localized next-step message, including derived defaults for an unassigned Todo, ordinary In Progress/Done, or anomalous workflow state.
- `nextAction` remains during this additive change for existing consumers. Web MUST render the locale resource selected by `nextActionKey`, never map the human-readable `nextAction` string.

Workflow definition action names are localized from their stable action key. Localization does not alter state transitions, expected-updated-at checks, labels, assignees, or Gitea permissions.
