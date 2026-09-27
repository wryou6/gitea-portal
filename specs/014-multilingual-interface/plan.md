# Implementation Plan: Portal 中英日語系

**Branch**: `014-multilingual-interface` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/014-multilingual-interface/spec.md`

## Summary

為 Portal Web 加入繁體中文、英文與日文語系。使用 `i18next` 與 `react-i18next` 管理靜態、具型別的分功能詞彙資源；首次載入從瀏覽器語言偵測，使用者選擇後依目前 Portal login 存在瀏覽器 localStorage。所有 Portal UI、自有錯誤、固定欄位及格式化資料使用所選語系；Gitea 使用者資料及 stable IDs 維持原值。

與 Gitea 共用概念的詞彙以目前 Gitea `1.27.3` 對應 locale catalog 為依據，將使用到的詞彙及來源 key 固定記錄在 Portal 詞彙表；不在執行時載入完整 Gitea catalog。Portal API 錯誤增加穩定 code 與可選參數，Web 以 code 翻譯摘要，Gitea 原始錯誤 detail 原樣保留。

## Technical Context

**Language/Version**: TypeScript 5.8、React 19、Node.js 22

**Primary Dependencies**: Vite 6、Tailwind CSS 4；新增 `i18next`、`react-i18next`。日期／數字使用原生 `Intl`，不新增格式化套件或 browser language detector。

**Storage**: Browser `localStorage`，以 Portal login 隔離語系偏好；不新增伺服器端偏好或資料庫。

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`，並依 `quickstart.md` 手動驗收。現有 Web package 沒有自動化測試 runner。

**Target Platform**: 現有 Portal 桌面及窄螢幕瀏覽器；沿用目前 React/Vite Web app。

**Project Type**: pnpm monorepo web application，跨 `apps/web`、`apps/api` 與 `packages/domain`。

**Performance Goals**: 初始畫面第一次 render 即使用已解析語系，不顯示錯誤語系閃爍；使用者選擇後一秒內更新可見文案。

**Constraints**: 保持 Gitea 為 Issue、Comment、Label、Assignee、Milestone 與 Workflow 狀態唯一資料來源；不得因翻譯改寫 Gitea 值或現有權限邊界。Locale preference 僅本機依帳號保存。Gitea 術語基準固定記錄版本與 catalog key，Gitea 升級時需核對變更。

**Scale/Scope**: 現有 Portal 所有使用者可見 Web routes、表單、feedback、aria labels、固定 Type/Priority/status/action 名稱及日期時間；三種 locale `zh-TW`、`en`、`ja`。

## Constitution Check

`.specify/memory/constitution.md` 仍是未填寫範本，沒有已 ratify 的原則 gate。依 repository `AGENTS.md` 檢查：

- **PASS**：不建立 Issue mirror、不將偏好寫入 Portal server persistence；Gitea 使用者資料維持唯一來源。
- **PASS**：維持既有 pnpm workspace，不新增 workspace package；只增加 Web i18n dependencies 及必要 API/domain contract types。
- **PASS**：不改 Gitea label、workflow key、Board persistence、使用者權限或 Gitea mutation 行為。
- **PASS**：API 錯誤 contract 變更同步更新 `packages/domain`、`apps/api` 與 `apps/web`。
- **PASS**：UI 完成後跑 `pnpm.cmd typecheck` 與 `pnpm.cmd build`。

## Project Structure

### Documentation (this feature)

```text
specs/014-multilingual-interface/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── portal-api-errors.md
│   └── workflow-display.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/
├── i18n/
│   ├── index.ts                  # singleton and React integration
│   ├── locales.ts                # supported locale resolution/types
│   ├── resources/                # common/settings/issues/boards/feedback/api-errors
│   └── terminology.md            # Gitea catalog key and release provenance
├── features/settings/            # locale preference and language control
├── app/                          # bootstrap and selected locale propagation
├── components/                   # shared shell and feedback text
└── features/{issues,boards,repositories}/  # localized feature surfaces
apps/api/src/                      # stable API error codes and response mapping
packages/domain/src/               # shared API error code/response types
```

**Structure Decision**: 保持 i18n runtime、locale resources 與詞彙表在 `apps/web/src/i18n`；既有 `features/settings` 管理本機偏好；以目前 `main.tsx` bootstrap 在 mount 前解決語系。API error codes 由既有 domain package 共用，無需新增 package。Gitea-backed terms 的版號與對照 key 記錄在 locale glossary provenance。

Namespace resources are separate TypeScript modules under `apps/web/src/i18n/resources/` (`common`, `settings`, `issues`, `boards`, `feedback`, `api-errors`) so features share terminology keys without editing one monolithic catalog. Fixed workflow next-step copy is resolved by a stable `nextActionKey`; the existing localized `nextAction` field may remain for compatibility.

## Phase 0: Research

技術選型、瀏覽器語系解析、Gitea locale provenance 與錯誤 contract 決策見 [research.md](research.md)。目前 Gitea 基準為 `1.27.3`；未有尚待解決的技術未知數。

## Phase 1: Design

- [資料模型](data-model.md)：帳號語系偏好、locale 資源、Gitea 術語對照與 API error。
- [Portal API error contract](contracts/portal-api-errors.md)：穩定錯誤碼、插值參數及原始 Gitea detail。
- [Workflow 顯示 contract](contracts/workflow-display.md)：穩定 state/action/next-action key 與原有 Gitea 值的關係。
- [Quickstart](quickstart.md)：型別／production build 及三語主要流程驗收。

## Post-Design Constitution Check

- **PASS**：偏好只在使用者瀏覽器依 login 保存；不新增伺服器端使用者資料。
- **PASS**：Gitea terms 的 locale 文字只控制 Portal 顯示；Gitea identifiers、labels、source data 與權限不變。
- **PASS**：API error contract 可被 API/Web 共用型別檢查，原始 upstream detail 不被當作翻譯字串。
- **PASS**：使用原生 `Intl` 保留 date-only 日曆語意；不更動 Gantt/Board persistence 或工作流狀態轉換。
