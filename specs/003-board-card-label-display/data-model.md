# Data Model: Board Card Label Display

## Persistence Boundary

本 feature 不新增持久化 Entity。Board 設定仍由既有 JSON store 保存；Issue、完整 Labels、Workflow 狀態與既有 repair side effects 仍由 Gitea 保存。`visibleLabels` 是 Board load 時建立的 read-time view data，不保存、不同步、不建立 snapshot；其計算不新增或觸發 mutation。

## Workflow Convention

| Field | Meaning |
|---|---|
| `id` | Convention identity |
| `version` | Exact version selected by the Board |
| `states` | Ordered states, each with `key`, `labelName`, `displayName`, `order` |

The hidden Label set is exactly `{ state.labelName | state in Board.workflowConvention.states }`.

## Board Card View

Board Card continues to represent one real Gitea Issue:

| Field | Source / rule |
|---|---|
| Repository, number, title | Current Gitea Issue |
| `labels` | Complete labels from the current Gitea read; not persisted by Portal |
| `visibleLabels` | `labels` excluding labels whose names belong to the Board Convention |
| `workflowState` | Existing Board workflow classification |
| `workflowRepair` | Existing optional read-time repair annotation |
| assignee, state, milestone, updated time, URL | Existing Gitea Issue read-through data |

Invariants:

1. `visibleLabels` is a subset of the current Issue `labels`.
2. No Label is added, removed, renamed, or persisted by this feature.
3. No label in the selected Convention appears in `visibleLabels`.
4. Labels from other conventions are not mutated; they remain available as source data and are handled according to the Board view's explicit display rule.
5. An empty `visibleLabels` list results in no Label UI container.

## Relationships

```text
Board
  └── selects exactly one Workflow Convention
        └── defines hidden Workflow Label names
              └── derives Board Card visibleLabels from Gitea Issue labels
```

## State and Error Behavior

This feature introduces no new workflow state. Existing `todo`, `wip`, `done`, `unconfigured`, and `conflict` behavior remains unchanged. Existing repair success/failure annotations and manual retry behavior remain visible even when Workflow Labels are hidden from the Label area.
