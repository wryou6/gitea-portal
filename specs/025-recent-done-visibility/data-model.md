# Data Model: 最近完成項目篩選與完整 Issue List

此功能只擴充 Gitea Issue 的讀取資料並增加頁面暫時狀態，不新增 Portal persistence。

## Issue 摘要

| Field | Type | Source | Rule |
|---|---|---|---|
| `closedAt` | ISO 8601 date-time or null | Gitea `closed_at` | Represents the most recent time Gitea reports the Issue closed; null or invalid values do not qualify for the recent-Done window. |
| `status` | Existing fixed status or `anomaly` | Existing Portal status resolver | The completion-date predicate applies only when this value is `done`. |

The field is read-through only. It must flow through Gitea contract, domain summary, Portal response, and Web Issue type without being stored independently.

## Unpaginated Issue List result

The Issue List result contains all Issue summaries matching the current user-readable repository scope, search, filters, and sort order. It has no page number, page size, or `hasNext` state. The result count is the number of returned summaries.

## Recent-Done control state

| Property | Type | Default | Lifetime |
|---|---|---|---|
| `showRecentDoneOnly` | Boolean | `true` | Current mounted work-view page only; resets to `true` after reload or navigation away and back. |

This state is not part of the shared URL query or account preferences. When true, Done Issues qualify when the local calendar date of `closedAt` is on or after local today minus 29 calendar days. The inclusive window contains exactly 30 local calendar dates. When false, no completion-date filter is applied.
