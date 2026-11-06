# Implementation Plan: Issue Type 規範

**Branch**: `008-issue-types` | **Date**: 2026-09-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-issue-types/spec.md`

## Summary

為透過 Portal 建立或編輯的 Issue 加上必填且互斥的 Bug、Feature、Task 類型。Gitea Repository Label 是唯一保存方式；Portal API 從完整 Labels 推導 Type，表單以獨立欄位維護 Type。新增 Type Label 時使用目前登入者的 Gitea 權限；更新 Labels 沿用既有原子替換與 optimistic concurrency 保護。

## Technical Context

**Language/Version**: TypeScript 5.8，Node.js 22，React 19
**Primary Dependencies**: Fastify 5、React 19、Vite 6、pnpm workspace 9
**Storage**: Gitea Labels；Portal 不增加 persistence
**Testing**: 現有 repository 無測試執行器；執行 `pnpm.cmd typecheck`、`pnpm.cmd build`，並依 quickstart 驗證 API/UI 與 Gitea Label 結果
**Target Platform**: 內網 Gitea 與現代瀏覽器
**Project Type**: Web application（Fastify API + React frontend + shared domain/contracts）
**Performance Goals**: Type 正規化不額外增加 Issue list/detail request；Label definition 僅在寫入 Type 時讀取，缺少時建立
**Constraints**: 使用 request-scoped delegated Gitea client；Type Label 為 Repository-scoped；完整 Labels 原子替換；衝突時拒絕覆寫；不攔截直接 Gitea 操作

## Constitution Check

`constitution.md` 目前仍是未填寫的 Spec Kit 範本，沒有已 ratify 的專案 gate。依據 repository `AGENTS.md` 檢查：

- Gitea 維持 Issue/Label 唯一 Source of Truth；不新增 Issue mirror 或 Portal persistence。
- API 與前端共享 domain/contract Type；不新增 workspace package。
- Labels 更新沿用 `replaceIssueLabelsAtomically` 與現有 `expectedUpdatedAt` optimistic concurrency。
- Gitea 寫入經過登入者既有 delegated token 與權限檢查。
- UI 變更完成後執行 typecheck 與 build。

**Gate result**: PASS；未發現與 repository 約束衝突的設計。

## Project Structure

### Documentation (this feature)

```text
specs/008-issue-types/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── issue-type-api.md
└── tasks.md
```

### Source Code

```text
packages/domain/src/issue.ts                 # IssueSummary.type 與 IssueType
packages/domain/src/issue-type.ts            # type values、label mapping、正規化
packages/domain/src/index.ts                 # domain exports
packages/gitea-contracts/src/portal.ts       # API response follows IssueSummary
apps/api/src/issues/issue-validation.ts      # Type required and payload validation
apps/api/src/issues/issue-command-service.ts # create/update Type labels
apps/api/src/issues/issue-schedule-service.ts# preserve schedule/general/type labels atomically
apps/api/src/issues/issue-service.ts         # derive API Type from Gitea labels
apps/web/src/lib/api.ts                      # frontend Issue.type
apps/web/src/features/issues/IssueCreatePage.tsx
apps/web/src/features/issues/IssueEditForm.tsx
apps/web/src/features/issues/IssueRow.tsx
apps/web/src/features/issues/IssueDetailHeader.tsx
```

**Structure Decision**: Extend existing domain, Gitea adapter, API, and issue feature modules. No new service, database, route, or migration surface is needed.

## Design Decisions

- Canonical values are `bug`, `feature`, `task`; their Gitea labels are `type:bug`, `type:feature`, `type:task`.
- The API returns `type: IssueType | null`, derived only from the live Gitea label set. Missing, multiple, or invalid `type:` labels produce `null`; full Labels remain in the response.
- Create and update payloads require one canonical Type. General-label input cannot manipulate reserved Type labels.
- Ensure the selected repository label exists before assigning it. On a concurrent create, re-read labels and reuse the matching definition; otherwise return the Gitea failure.
- Put Type, general labels, and start-date labels into the same existing complete-label replacement. Preserve labels not edited by the user and verify concurrency/readback.
- Show Type or an unset/conflict status in issue list and detail. The edit form allows repair by selecting one canonical Type.
- No migration utility, separate Type store, or new endpoint is introduced.

## Complexity Tracking

No constitution violations or additional architectural complexity.
