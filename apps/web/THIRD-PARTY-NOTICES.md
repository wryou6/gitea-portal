# 前端第三方套件授權

本專案的直接前端依賴由 `apps/web/package.json` 與根目錄 `pnpm-lock.yaml` 定義。安裝與發佈前請依 lockfile 實際版本核對其授權與著作權聲明。

本次 UI 遷移的主要直接依賴：

- Tailwind CSS：MIT
- `@tailwindcss/vite`：MIT
- shadcn/ui 採 source-owned component pattern；使用的底層輔助套件 `clsx`、`tailwind-merge`：MIT
- Chart.js：MIT
- Storybook 與 `@storybook/react`、`@storybook/react-vite`、`@storybook/addon-essentials`：MIT

間接依賴的完整授權資訊以套件管理器安裝結果與各套件發佈內容為準；本檔案不取代上游授權文件。
