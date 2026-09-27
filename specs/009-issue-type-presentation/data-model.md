# Data Model: Issue Type 呈現統一

本功能沒有持久化資料、API 欄位或 Gitea Label 變更。下表描述 UI 消費的既有資訊。

## Issue Type Presentation

| Field          | Existing source                     | Constraint / display rule                                                         |
| -------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| `type`         | `Issue.type`                        | `bug`, `feature`, `task` 或 `null`；不新增值                                      |
| `labels`       | `Issue.labels`                      | 保留原始完整集合；保留前綴僅作資料識別，不作 Type badge 文案                      |
| `typeStatus`   | `issueTypeStatusFromLabels(labels)` | `valid`, `missing`, `conflict`; 衝突時不推測或選擇 Type                           |
| `displayName`  | `issueTypeDisplayName(type)`        | 有效 Type 顯示 `Bug`, `Feature`, `Task`                                           |
| `presentation` | UI-only derived value               | 每個有效 Type 固定語意樣式；missing 顯示「未設定」；conflict 顯示「衝突」與衝突值 |

## Form Selection

| Field           | Existing source             | Constraint / display rule                                            |
| --------------- | --------------------------- | -------------------------------------------------------------------- |
| `selectedType`  | Existing form state         | Native selector; required on create/save as already enforced         |
| `optionLabel`   | Existing standard Type list | Direct canonical names `Bug`, `Feature`, `Task`; no `type:` prefix   |
| `selectedStyle` | Derived from `selectedType` | Uses the same semantic color family as the badge; no data/API change |

## Relationships and Lifecycle

- Gitea labels remain the Source of Truth; API continues deriving `Issue.type` from those labels.
- Valid Type has one badge representation in title area. Its raw label is not duplicated in the adjacent general-label collection; other labels remain visible.
- Missing/conflicting Type is a presentation state only. Editing/recovery semantics remain those already defined by issue-type feature `008`.
- Kanban `visibleLabels` payload and workflow-convention filtering remain unchanged; the presentation layer avoids duplicate Type display.
