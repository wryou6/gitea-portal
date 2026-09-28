export type SessionBootstrapState =
  | { status: "authenticated"; login: string }
  | { status: "anonymous"; error?: "denied" | "failed" }
  | { status: "unavailable" };
