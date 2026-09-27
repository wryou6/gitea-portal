# Quickstart: 使用者選單與外觀設定

## Prerequisites

- Node.js 22, pnpm 9, and the existing Gitea OAuth development configuration.
- A working Portal login. Two Gitea accounts are needed to verify account-scoped preference behavior.

## Start

From the repository root, run `pnpm.cmd dev` and open the Web URL printed by Vite. Sign in through the existing Gitea OAuth flow.

## Manual acceptance scenarios

1. Confirm the top-right account entry shows the signed-in login. Open it with pointer and keyboard; confirm **設定** is the only action and opens `/settings`.
2. Select **Light**, **Dark**, then **System**. Confirm each selection applies immediately on the settings page and across issue/board pages; in System mode change the OS appearance and confirm the page follows.
3. Reload after selecting each mode. Confirm the selected mode remains visible and applied.
4. In one browser, set a preference for account A, sign in as account B, and set a different preference. Switch back and confirm both account preferences remain separate. A login with no saved selection uses System.
5. Clear the feature's browser-local preference or provide an invalid stored value. Confirm startup falls back to System and the settings page remains usable.
6. At a narrow viewport, use only the keyboard to open/close the account menu, navigate to Settings, and change the selected mode. Confirm focus remains visible.

## Project validation

Run `pnpm.cmd typecheck` and `pnpm.cmd build` from the repository root. No new package installation or API configuration is required.
