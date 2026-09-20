# Data Model: 跨 Repository Gitea Issue 管理 Portal

## Persistence boundary

Portal 使用版本化 JSON store 只保存 Board 與 Workflow reference 設定。Store document 包含 `schemaVersion`、單調遞增 `revision` 與 `boards[]`；寫入以同目錄 temporary file flush + rename 完成，lock file 防止多程序並行寫入。Gitea Issue、Comment、Label、Assignee、Milestone、State 與 Updated Time 不在 Portal 持久化；以下標示為 **external/read-through** 的資料只存在於請求處理與 UI state。

## Entities

### WorkflowConvention (configuration)

- `id`: stable convention identifier.
- `version`: immutable version identifier.
- `name`: human-readable name.
- `states[]`: ordered state definitions.
- `states[].key`: stable state key.
- `states[].labelName`: exact Gitea Label name used for the state.
- `states[].displayName`: Board column label.
- `states[].order`: explicit display order.
- `repositoryAssignments[]`: repository identity mapped to exactly one convention version.

Rules:

- A convention version is immutable after publication; changes create a new version.
- A Repository is assigned exactly one convention version in the centralized configuration.
- A convention must define a unique state key, unique Label name, and deterministic order.

### Board (persisted)

- `id`: Portal-generated stable identifier.
- `name`: shared Board display name.
- `repositoryRefs[]`: selected Gitea repository identities.
- `workflowConventionId`: selected convention identifier.
- `workflowConventionVersion`: selected immutable version.
- `createdAt`, `updatedAt`: Portal configuration timestamps.

Rules:

- All Boards are shared in v1; there is no owner/member relation.
- Any authenticated Portal user may create, edit, or delete Board configuration.
- A Board may contain multiple repositories only when every selected repository is assigned the same convention version.
- Deleting a Board deletes configuration only; it never deletes or modifies Gitea Issues.

### BoardRepository (persisted relation)

- `boardId`: Board reference.
- `repositoryOwner`, `repositoryName`: canonical Gitea repository identity.
- `addedAt`: configuration timestamp.

Identity rule: `(repositoryOwner, repositoryName)` is the canonical repository key; it is never inferred from an Issue Number.

### GiteaIssue (external/read-through)

- `repositoryOwner`, `repositoryName`, `number`: composite identity.
- `title`, `body`, `state`, `assignee`, `labels`, `milestone`, `updatedAt`.
- `htmlUrl`: original Gitea Issue URL.
- `comments[]`: read-through comment/timeline entries.

Rules:

- No Portal-owned copy is persisted.
- A user only receives an Issue if the delegated Gitea request authorizes it.
- An Issue with no Workflow Label renders in the Board's `unconfigured` presentation state.
- An Issue with multiple labels belonging to the selected convention renders in the Board's `conflict` presentation state; Portal does not guess.

### GiteaComment (external/read-through)

- `id`, `author`, `body`, `createdAt`, `updatedAt`.
- Belongs to exactly one external Gitea Issue.
- Creation is delegated to Gitea and the returned comment is displayed after success.

### PermissionContext (derived)

- Current Gitea identity and delegated access token/session.
- Repository and operation permissions are derived from Gitea responses, not Portal-owned roles.
- Board visibility is global to Portal users, but Issue visibility and mutations remain per-user and per-Repository.

## State transitions

```text
Issue workflow state:
  no workflow label -> unconfigured
  exactly one convention label -> that ordered state
  multiple convention labels -> conflict

Board card transition:
  valid state + authorized user + atomic replacement capability
    -> validate current Issue, target Label, and exact Convention version
    -> atomically replace same-Convention state Labels with target Label
    -> re-read Issue from Gitea
  preflight failure or unsupported atomic operation -> reject before mutation
  atomic mutation failure -> report failure; original Labels must remain
```

## Validation invariants

- Board convention version equals every selected Repository assignment version.
- Repository selection rejects unknown, unassigned, or mismatched convention versions.
- A Board transition is executable only when the target Gitea operation can atomically replace the same-Convention state Labels; otherwise it is rejected before mutation.
- Board configuration never contains Issue bodies, comments, labels, users, or milestones as persisted fields.
- Issue operations identify an Issue by Repository owner/name plus number.
