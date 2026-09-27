# Settings UI Contract

## Account Menu

- Available in the shared topbar when `/api/session` supplies an authenticated `login`.
- The trigger identifies the current account by login and can be opened by pointer or keyboard.
- The menu currently contains one action, **設定**, which navigates to `/settings`.
- Escape and outside activation close the open menu; focus remains usable and visible.

## Settings Page

- Route: `/settings`.
- Page heading: **設定**; appearance group offers **Light**, **Dark**, and **System**.
- The selected mode is exposed to assistive technology and visually indicated.
- Selecting a mode applies it immediately. System follows the current browser/OS color preference.
- The selection is local to the current browser and Portal login; it is not sent to an API.

## Existing Session Contract

- Reuse `GET /api/session` returning `{ "login": string }` for authenticated sessions.
- No API schema or server-side storage changes are part of this feature.
