# Data Model: 最近完成項目篩選與完整 Issue List

此功能只擴充 Gitea Issue 的讀取資料並增加頁面暫時狀態，不新增 Portal persistence。

## Issue 摘要

| Field | Type | Source | Rule |
|---|---|---|---|
| `dueDate` | Calendar date (`YYYY-MM-DD`) or null | Existing Gitea due date and schedule normalization | Null or invalid values do not qualify for the recent-Done window. |
| `status` | Existing fixed status or `anomaly` | Existing Portal status resolver | The due-date predicate applies only when this value is `done`. |

The due date is read-through only. It must flow through the existing Issue read model without being stored independently.

## Unpaginated Issue List result

The Issue List result contains all Issue summaries matching the current user-readable repository scope, search, filters, and sort order. It has no page number, page size, or `hasNext` state. The result count is the number of returned summaries.

## Recent-Done control state

| Property | Type | Default | Lifetime |
|---|---|---|---|
| `showRecentDoneOnly` | Boolean | `true` | Current mounted work-view page only; resets to `true` after reload or navigation away and back. |

This state is not part of the shared URL query or account preferences. When true, Done Issues qualify when `dueDate` is on or after local today minus 29 calendar days and on or before local today. The inclusive window contains exactly 30 local calendar dates. Missing or invalid due dates do not qualify. When false, no due-date filter is applied.
