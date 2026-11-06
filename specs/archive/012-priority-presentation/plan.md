# Implementation Plan: Priority 統一與跨頁呈現

**Branch**: `012-priority-presentation` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-priority-presentation/spec.md`

## Summary

在共用 domain 定義四級 Priority 與從 Gitea Labels 推導的狀態；既有 Issue create/update contract 新增必填 Priority，將 Repository-scoped Priority Label 與排程、Type、一般 Labels 一起寫回 Gitea。前端以共用欄位與徽章呈現在建立／編輯、Issue list/detail、Kanban、Gantt，並用 Storybook 展示狀態與頁面密度。

## Technical Context

**Language/Version**: TypeScript 5.8、Node.js 22、React 19
**Primary Dependencies**: Fastify 5、React 19、Vite 6、Storybook 8.6、pnpm workspace 9
**Storage**: Gitea Repository Labels；不新增 Portal persistence
**Testing**: 專案沒有測試 runner；依 quickstart 手動驗收 API/UI/Gitea 結果，並執行 `pnpm.cmd typecheck`、`pnpm.cmd build`、Storybook build
**Target Platform**: 內網 Gitea 與現代桌面／窄版瀏覽器
**Project Type**: Web application（Fastify API + React frontend + shared domain/contracts）
**Performance Goals**: Issue read/list 不增加額外 Gitea Label API request；以既有 Issue Label payload 推導 Priority
**Constraints**: Gitea 是唯一資料來源；Label definition 為 Repository-scoped；維持使用者 delegated 權限、atomic label replacement 與 optimistic concurrency；不遷移既有資料
**Scale/Scope**: 四級 Priority、兩種異常狀態及六個表單／Issue／Board 呈現位置；不加 Priority filter、sort 或自訂 Repository 值域

## Constitution Check

`.specify/memory/constitution.md` 仍是未填寫的 Spec Kit 範本，沒有 ratified gates。依 repository `AGENTS.md` 檢查：

- Gitea Labels 保持唯一資料來源，不新增 Issue mirror、資料庫或 Board persistence。
- Domain、API、contracts 與 Web 共用 Priority 型別；現有 endpoint 擴充，不另開服務或路由。
- Repository Label 透過目前使用者權限建立；Issue Labels 一次原子替換並保留 optimistic concurrency/readback 驗證。
- Issue list/detail 保持所有原始 Labels 可用；Priority 另以語意元件呈現，Kanban 仍遵守 Board 的 `visibleLabels` 邊界。
- 使用現有 Storybook、CSS semantic tokens 與 UI primitives，不增加 runtime dependency。
- UI 完成後執行 typecheck/build；Storybook 以虛構資料，不連線 Gitea。

**Gate result**: PASS；未發現與 repository 約束衝突的設計。

## Design Decisions

- 共用值為 `critical`、`high`、`medium`、`low`，對應 `priority:critical`、`priority:high`、`priority:medium`、`priority:low`；介面名稱為「緊急」、「高」、「中」、「低」。
- Domain 從完整 Labels 推導 Priority：恰有一個標準 Label 為有效；沒有 Priority Label 為 missing；多個或未知 `priority:` Label 為 conflict/invalid。API response 加入 `priority: Priority | null`，保留完整 `labels`，前端由 Labels 推導異常狀態。
- create/update request 都要求一個有效 `priority`；一般 Labels 欄位不可寫入 `priority:` 前綴。讀取及編輯異常 Issue 時提供修復選項。
- 建立時先在該 Repository 找到或建立所選 Label，再用 Label ID 建立 Issue。更新時將 Priority、Type、一般 Labels 與排程 Labels 一起組成完整 Label replacement，交由既有 optimistic concurrency 與 readback 檢查保護。
- Label 建立競態時重讀並重用同名定義；權限不足或 Gitea 寫入失敗時回報錯誤，不呈現成功。
- 建立共用 Priority badge 與 field；在 Issue list/detail、Kanban card、Gantt row 及 create/edit 使用。呈現使用既有語意 tokens、文字標籤和等級順序，狀態不只靠顏色表達。
- Storybook 展示四級、missing、conflict/invalid、表單選項、上述頁面密度及 light/dark 主題；不新增 Storybook addon 或圖示套件。
- 不新增測試 runner；以手動 Gitea 驗收、Storybook review、typecheck/build 作為驗證途徑。

## Project Structure

### Documentation

```text
specs/012-priority-presentation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/issue-priority-api.md
└── tasks.md
```

### Source Code

```text
packages/domain/src/issue-priority.ts
packages/domain/src/issue.ts
packages/domain/src/index.ts
packages/gitea-contracts/src/portal.ts
apps/api/src/issues/issue-validation.ts
apps/api/src/issues/issue-command-service.ts
apps/api/src/issues/issue-schedule-service.ts
apps/api/src/issues/issue-service.ts
apps/web/src/lib/api.ts
apps/web/src/features/issues/IssueCreatePage.tsx
apps/web/src/features/issues/IssueEditForm.tsx
apps/web/src/features/issues/IssueRow.tsx
apps/web/src/features/issues/IssueDetailHeader.tsx
apps/web/src/features/issues/issueLabelPresentation.ts
apps/web/src/features/boards/KanbanCard.tsx
apps/web/src/features/boards/GanttIssueRow.tsx
apps/web/src/components/ui/PriorityBadge.tsx
apps/web/src/features/issues/PriorityField.tsx
apps/web/src/index.css
apps/web/src/stories/fixtures.ts
apps/web/src/components/ui/PriorityBadge.stories.tsx
apps/web/src/features/issues/PriorityField.stories.tsx
```

**Structure Decision**: Extend current shared domain, Gitea write path, issue API mapping and UI feature modules. No workspace, persistence, route, or dependency changes are required.

## Complexity Tracking

No constitution violations or additional architectural complexity.
