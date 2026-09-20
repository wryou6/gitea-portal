# Implementation Plan: 跨 Repository Gitea Issue 管理 Portal

**Branch**: `001-cross-repository-issue-portal` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-cross-repository-issue-portal/spec.md`

## Summary

建立一個 TypeScript/Node.js 內網 Web Portal：React + Vite 提供跨 Repository Issue 與共享 Board UI，Fastify 提供 session、權限邊界、Gitea API adapter 與 Board 設定 API。所有 Issue/Comment/Label/Assignee/Milestone/State 由目前使用者的 Gitea REST API read-through；Portal 只持久化共享 Board 設定與版本化 Workflow Convention 設定，不保存 Issue mirror。

使用 Gitea OAuth2 delegated access，讓 Gitea 每次判定使用者可查看與修改的 Repository/Issue。Board 狀態以該 Board 引用的 Workflow Convention version 所定義的 Gitea Labels 表達；既有 Board 固定引用版本，Repository 必須在集中設定中指定相同版本才能加入。

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22 LTS

**Primary Dependencies**: React 19, Vite, Fastify, Node.js filesystem APIs, typed Portal/Gitea boundary models, and the target instance Gitea REST API

**Storage**: Versioned JSON file for Board configuration with schema validation, atomic replacement and lock-file concurrency protection; no Issue/Comment mirror

**Testing**: The feature specification defines quickstart acceptance scenarios but does not require a specific automated test implementation. The current implementation is verified with workspace typecheck/build and manual browser validation against the local Gitea instance; formal measurement of SC-002, SC-003, SC-005, and SC-008 remains a later product-acceptance activity.

**Target Platform**: Internal web browsers and a Linux-compatible Node.js server inside the private network

**Project Type**: Web application with frontend and backend

**Performance Goals**: Target p95 user-visible list/detail/Board responses under 2 seconds for the agreed pilot scope, excluding Gitea downtime or network failure; SC-002, SC-003, SC-005, and SC-008 remain user-outcome targets measured during later acceptance

**Constraints**: No shared service token; no browser-held Gitea access token; no local Issue mirror; every mutation must be authorized by Gitea; Board state transitions must be atomic, and unsupported atomic replacement must be rejected before mutation

**Scale/Scope**: Initial pilot supports at least 3 accessible Repositories and the representative engineering team in SC-001/SC-008; exact concurrent-user and Issue-volume limits are deployment capacity decisions, not product requirements

## Constitution Check

The repository constitution is still the unfilled Spec Kit template: it contains no ratified principles, gates, or governance rules. Therefore no constitutional violation can be identified and the gate passes provisionally. The implementation must still preserve the explicit product constraints in `spec.md`, especially Gitea Source of Truth and delegated permissions.

**Gate status before research**: PASS (no ratified constitution rules present)

## Project Structure

### Documentation (this feature)

```text
specs/001-cross-repository-issue-portal/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md                 # generated later by $speckit-tasks
```

### Source Code (repository root)

```text
apps/
├── web/
│   ├── src/
│   │   ├── features/issues/
│   │   ├── features/boards/
│   │   ├── features/workflows/
│   │   ├── components/
│   │   └── lib/api.ts
└── api/
    ├── src/
    │   ├── auth/
    │   ├── gitea/
    │   ├── issues/
    │   ├── boards/
    │   ├── workflows/
    │   ├── persistence/       # versioned JSON Board store
    │   └── http/

config/
└── workflows/
    └── conventions.yaml     # published, versioned, read-only at runtime

packages/
├── domain/                  # shared types and invariants
└── gitea-contracts/         # typed Gitea/Portal boundary models

```

**Structure Decision**: Use a pnpm workspace with separate `apps/web` and `apps/api`, shared domain/contract packages, centralized versioned Workflow Convention configuration, and a backend-owned versioned JSON Board store. The backend is the only component allowed to call Gitea or access delegated tokens.

## Complexity Tracking

No constitution violations require justification. The two-app workspace is required to keep browser UI concerns separate from token handling, Gitea authorization, external API error mapping, and Board persistence.

## Phase 0: Research Output

Research is recorded in [research.md](./research.md). The key decisions are resolved: application stack, Gitea API boundary, OAuth2 delegated access, persistence boundary, read-through freshness, Workflow Convention versioning, and label transition behavior.

## Phase 1: Design Output

- [data-model.md](./data-model.md): persisted Board/config entities, external Issue model, identity rules, convention compatibility, and state transitions.
- [contracts/openapi.yaml](./contracts/openapi.yaml): Portal API boundary for session, repositories, Issues, comments, Boards, transitions, and read-only Workflow Conventions.
- [quickstart.md](./quickstart.md): end-to-end validation scenarios for search, mutations, permissions, Board compatibility, atomic state transitions, state conflicts, external Gitea changes, and JSON Board persistence.

**Gate status after design**: PASS. The design contains no local Issue mirror, no elevated shared Gitea credential, no owner/member model, and no unbounded custom Workflow engine. Board transitions require an atomic Gitea-supported label replacement; if the target Gitea capability cannot guarantee that result, the operation is rejected before mutation. Remaining choices are implementation-level items for task planning: exact OAuth provider configuration, Gitea version capability checks, JSON store path and file permissions, UI component choices, and deployment wiring.
