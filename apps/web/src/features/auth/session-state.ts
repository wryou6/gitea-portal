export type SessionBootstrapState =
  | { status: "authenticated"; login: string; displayName?: string; avatarUrl?: string }
  | { status: "anonymous"; error?: "denied" | "failed" }
  | { status: "unavailable" };
