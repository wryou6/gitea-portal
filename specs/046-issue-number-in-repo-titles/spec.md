# Feature Specification: Repository 工作檢視標題顯示 Issue 編號

**Feature Branch**: `046-issue-number-in-repo-titles`
**Status**: Implemented
**Input**: Repository 工作區的 Issues、Kanban、Gantt 標題預設顯示 Issue 編號。

## User Story

工程師在 All repos 或單一 Repository 的 Issues、Kanban 或 Gantt 檢視中瀏覽工作時，可直接從標題辨識 Issue 編號。

## Acceptance Scenarios

1. **Given** 使用者位於 All repos 或 Repository 工作區，**When** 查看 Issues、Kanban 或 Gantt，**Then** 每個標題以 `#編號 標題` 顯示。
2. **Given** 使用者位於 Issue detail，**When** 查看 Issue 標題，**Then** 標題維持原樣，不加編號前綴。
3. **Given** Gitea Issue 標題已以相同 `#編號` 開頭，**When** 在任一工作檢視查看，**Then** 不重複顯示該前綴。
4. **Given** 使用者點選加上編號的標題，**When** 開啟 Issue，**Then** 仍開啟原本的 Issue，且 Gitea 標題與資料不變。

## Requirements

- **FR-001**: All repos 與 Repository 工作區的 Issues、Kanban、Gantt MUST 在 Issue 標題前顯示 `#<number> `。
- **FR-002**: Issue detail MUST 維持原有標題呈現。
- **FR-003**: 已有相同編號前綴的標題 MUST 不重複加上前綴。
- **FR-004**: 本功能 MUST 僅改變顯示，不得寫入或改變 Gitea Issue 標題、API contract 或 Issue persistence。
- **FR-005**: 標題連結、Issue 導覽、排序及其他工作檢視行為 MUST 維持不變。

## Assumptions

- 此規則套用到 All repos 與任一 Repository 工作區，不限特定 Repository 名稱。
- 編號使用 Gitea Issue 的 number，格式為 `#123 標題`。
