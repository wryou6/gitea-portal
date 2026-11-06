import type { AppConfig } from "./env.js";

export function webBasePath(config: Pick<AppConfig, "webOrigin">): string {
  const segments = new URL(config.webOrigin).pathname.split("/").filter(Boolean);
  return segments.length === 0 ? "" : `/${segments.join("/")}`;
}
