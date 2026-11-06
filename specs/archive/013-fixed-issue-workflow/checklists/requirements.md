# Requirements Quality Checklist: 固定 Issue 工作流

**Purpose**: 檢查規格需求是否完整、清楚、一致且可驗收。
**Created**: 2026-09-27
**Feature**: [spec.md](../spec.md)

## Requirement Clarity

- [x] CHK001 每項功能需求都有明確主體與 MUST 行為。
- [x] CHK002 狀態、轉換原因、下一步動作及 Assignee 名單有分別定義。
- [x] CHK003 每個來源／目標狀態組合的允許規則均已定義，包含 Done → Done 修正結案原因。
- [x] CHK004 固定狀態與原因標籤使用穩定英文 key 及明確 namespace；Portal 顯示繁體中文名稱。
- [x] CHK005 dummy Issues 可分布到三種狀態，並同步設定 Gitea Open／Closed。

## Requirement Completeness

- [x] CHK006 Open、Closed、無 Assignee、外部等待及 Gitea 權限拒絕等情境均有描述。
- [x] CHK007 Issue 狀態、原因及 Assignee 更新失敗時不得錯誤顯示成功。
- [x] CHK008 Migration 遇到權限不足或資料衝突時標示待處理，且在完成遷移前保留舊標籤資料。
- [x] CHK009 移除舊 Convention／Labels 的範圍及保留一般 Labels 的規則已描述。
- [x] CHK010 Done Issue 保留經手名單但不顯示目前負責人的規則已描述。

## Requirement Consistency

- [x] CHK011 全域固定 workflow 與舊有每 Repository／Board Convention 的規則衝突已明確指出。
- [x] CHK012 Gitea 為 Issue、標籤、狀態及 Assignees 的唯一資料來源。
- [x] CHK013 規格不建立持久化 Developer／Reviewer 角色分類或 Issue mirror。

## Acceptance Readiness

- [x] CHK014 每個 P1 使用者情境可獨立驗收。
- [x] CHK015 所有成功標準都可藉由可觀察結果驗證，且涵蓋遷移完成條件。
- [x] CHK016 已將需使用者決策的需求寫入 Clarifications，並整合回需求與情境。
- [x] CHK017 需要或可選擇下一位 Assignee 的轉換情境，以及保留原負責人的預設規則已定義。

## Notes

- `[x]` 代表已完成需求品質檢查，不代表實作完成。
- 未勾選項目保留給 Clarify 階段或後續設計補足。
