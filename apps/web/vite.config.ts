import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function normalizeBasePath(value: string | undefined): string {
  const path = value?.trim() ?? "/";
  if (path === "" || path === "/") return "/";
  if (!path.startsWith("/") || path.startsWith("//") || /[?#\\]/.test(path)) {
    throw new Error("VITE_BASE_PATH must be a root-relative path, such as /issue/");
  }

  const segments = path.split("/").filter(Boolean);
  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error("VITE_BASE_PATH cannot contain dot path segments");
  }
  return `/${segments.join("/")}/`;
}

export default defineConfig({
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
      "/auth": "http://localhost:3001",
    },
  },
});
