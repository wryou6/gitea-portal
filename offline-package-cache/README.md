# pnpm 離線安裝包

`pnpm-virtual-store.tar.gz` 是由此 Repository 已安裝的 `node_modules/.pnpm` 製作，只包含此 workspace 的套件檔案，不包含機器共用 pnpm store。

在 Repository 根目錄執行：

```powershell
New-Item -ItemType Directory -Force node_modules | Out-Null
tar.exe -xzf offline-package-cache/pnpm-virtual-store.tar.gz -C node_modules
pnpm install --offline --frozen-lockfile
```

此包以 pnpm 9.15.0、Windows x64 產生。它包含該平台安裝的 optional/native packages；其他 OS、CPU 或 libc 可能需要各自的平台套件包。Node.js 與 pnpm 本身不包含在此包內。
