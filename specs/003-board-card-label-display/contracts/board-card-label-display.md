# Board Card Label Display Contract

## `GET /api/boards/:id`

The existing Board view response gains a read-time `visibleLabels` field on each Card.

```json
{
  "columns": [
    {
      "stateKey": "todo",
      "displayName": "Todo",
      "cards": [
        {
          "owner": "admin",
          "name": "portal-test-web",
          "number": 3,
          "title": "Example issue",
          "workflowState": "todo",
          "labels": [
            { "name": "bug" },
            { "name": "priority-high" },
            { "name": "workflow-a:todo" }
          ],
          "visibleLabels": [
            { "name": "bug" },
            { "name": "priority-high" }
          ]
        }
      ]
    }
  ]
}
```

Contract rules:

- `visibleLabels` is derived from the Board's exact Workflow Convention for this response only.
- `visibleLabels` contains no Label whose name matches a state `labelName` in that Convention.
- `labels` remains the complete current Issue read-through data for compatibility and source-data visibility; the Board Card UI renders `visibleLabels`.
- An empty `visibleLabels` array means the UI omits the Label container.
- `workflowState`, anomaly columns, `workflowRepair`, drag transition, and error behavior are unchanged.
- The `visibleLabels` derivation performs no Gitea or Portal persistence mutation; existing Workflow auto-repair behavior and its side effects remain unchanged.

## Unchanged Interfaces

- Issue list and Issue detail responses continue returning and displaying complete `labels`.
- Board transition request and response semantics are unchanged.
- The original Gitea Issue URL continues to expose the complete Issue data.
