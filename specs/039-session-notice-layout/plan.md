# Implementation Plan: 重新登入提示版面修正

**Branch**: `039-session-notice-layout` | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/039-session-notice-layout/spec.md`

## Summary

重新登入成功後，現有提示被渲染在固定高度、會裁切溢出的工作區內容容器中，導致工作檢視高度被擠壓或內容遭裁切。將提示改為浮動且固定在視窗右下方，從文件流中移出；只讓通知面板及關閉控制接收指標事件，面板以外的底層工作區仍可操作。通知支援手動關閉，並以元件狀態維持至單頁瀏覽結束。沿用既有繁中、英文、日文 auth 資源及 Storybook 展示方式，不修改認證、API 或 Issue 資料流程。

## Technical Context

**Language/Version**: TypeScript 5.8、Node.js 22

**Primary Dependencies**: React 19、React DOM `createPortal`、react-i18next；Storybook 8.6 用於互動與版面檢視

**Storage**: 無新增持久化資料；通知關閉狀態只保留於目前 React 單頁工作階段

**Testing**: `pnpm.cmd typecheck`、`pnpm.cmd build`；以 Storybook 與瀏覽器手動確認通知的定位、換行、關閉及 View 尺寸

**Target Platform**: 支援寬度至少 320px 的桌面及窄螢幕瀏覽器

**Project Type**: pnpm workspace web application，通知屬於 `apps/web`

**Performance Goals**: 不增加網路請求或資料載入；顯示與關閉通知不應造成可察覺的 View 重排

**Constraints**: 通知浮在視窗右下角並留有視窗邊界；不得受 `.app-content` 或 Gantt/work-view 的 overflow 裁切。面板以外的指標操作穿透通知至底層工作區；通知面板本身仍可操作。保留登入回跳及不重送失敗操作的既有行為。使用者可透過鍵盤操作，所有可見文案沿用 zh-TW/en/ja。

**Scale/Scope**: 每次登入恢復最多顯示一則全域通知；涵蓋 authenticated shell 下的所有路由，不改 standalone login page 的逾期提示。

## Constitution Check

- **Gitea 為 Issue 資料來源**: PASS — 不讀寫或快取 Issue 草稿，不新增 Portal persistence。
- **遵守使用者授權與認證邊界**: PASS — 不更動 delegated token、OAuth、session/API contract 或失敗請求重送政策。
- **使用者可見文字與多語**: PASS — 關閉名稱加入 auth namespace 的 zh-TW/en/ja 資源。
- **UI 驗證要求**: PASS — 實作後執行 workspace typecheck/build，並檢視窄螢幕、各工作檢視與鍵盤操作。

## Research Decisions

- 將通知透過 `createPortal` 掛到 `document.body`，避免 `.app-content` 的固定高度與 `overflow: hidden` 限制浮動通知；專案已有 `UserIdentity` 的 body portal 與 fixed overlay 模式。
- 使用 `position: fixed`、視窗右下角邊界留白、可換行的最大寬度；層級高於頂部導覽與工作區控制。
- 通知外框不攔截底下 View 的指標操作；只讓面板本身及關閉控制接收事件，讓使用者可直接操作被通知文字覆蓋的非操作區域。
- 關閉控制放在通知元件內，使用 auth namespace 的本地化標籤；通知保持現有 `role="status"` / `aria-live="polite"`，關閉按鈕可鍵盤聚焦。
- 以元件本地狀態記錄關閉；React Router 切換路由時不重新顯示，整頁載入後則由現有一次性登入恢復旗標決定是否再顯示。
- 專案沒有通用 test script；本 feature 以現有 typecheck/build 和 Storybook 手動驗收，不新增測試框架。

## Project Structure

### Documentation

```text
specs/039-session-notice-layout/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code

```text
apps/web/src/features/auth/SessionExpiredNotice.tsx
apps/web/src/features/auth/SessionExpiredNotice.stories.tsx
apps/web/src/i18n/resources/auth.ts
apps/web/src/index.css
```

`apps/web/src/app/App.tsx` 保留通知是否應顯示的既有登入恢復判斷；只在元件/版面需要時調整掛載方式，不改認證狀態流程。

**Structure Decision**: 變更限於既有 Web auth 通知元件、其 auth 翻譯與全域樣式、Storybook story；不新增 workspace package、API 或資料庫結構。

## Design Gates

- Phase 0 research 完成，未留下 NEEDS CLARIFICATION。
- Phase 1 設計不新增持久化或 Gitea 操作；與 Constitution Check 一致。
- 實作驗收需涵蓋所有 authenticated route family、320px 以上寬度、三種語系、通知外框底層點擊穿透、關閉後路由切換、鍵盤操作及通知存在時的內容尺寸。

## Complexity Tracking

無 Constitution 違規或額外架構複雜度。
