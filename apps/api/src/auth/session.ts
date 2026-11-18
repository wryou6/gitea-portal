import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppConfig } from "../config/env.js";
import { webBasePath } from "../config/web-path.js";

export type PortalSession = {
  version: 2;
  login: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  issuedAt: number;
  lastActivityAt: number;
  absoluteExpiresAt: number;
  csrfToken?: string;
  fullName?: string;
  avatarUrl?: string;
};

const COOKIE = "portal_session";
const COOKIE_VERSION = "v2";
const NONCE_BYTES = 12;
const TAG_BYTES = 16;
const MAX_COOKIE_VALUE_BYTES = 3800;

function encryptionKey(secret: string): Buffer {
  return Buffer.from(hkdfSync("sha256", secret, "gitea-portal-session", "cookie-v2", 32));
}

export function encodeSession(session: PortalSession, secret: string): string {
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(secret), nonce);
  cipher.setAAD(Buffer.from(COOKIE_VERSION));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    COOKIE_VERSION,
    nonce.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

function isPortalSession(value: unknown): value is PortalSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<PortalSession>;
  return (
    session.version === 2 &&
    typeof session.login === "string" &&
    typeof session.accessToken === "string" &&
    typeof session.refreshToken === "string" &&
    Number.isFinite(session.accessTokenExpiresAt) &&
    Number.isFinite(session.issuedAt) &&
    Number.isFinite(session.lastActivityAt) &&
    Number.isFinite(session.absoluteExpiresAt)
  );
}

export function decodeSession(
  value: string | undefined,
  secret: string,
  idleTimeoutMs: number,
  now = Date.now(),
): PortalSession | undefined {
  if (!value || Buffer.byteLength(value, "utf8") > MAX_COOKIE_VALUE_BYTES)
    return undefined;
  const [version, nonceText, tagText, ciphertextText] = value.split(".");
  if (version !== COOKIE_VERSION || !nonceText || !tagText || !ciphertextText)
    return undefined;
  try {
    const nonce = Buffer.from(nonceText, "base64url");
    const tag = Buffer.from(tagText, "base64url");
    if (nonce.length !== NONCE_BYTES || tag.length !== TAG_BYTES) return undefined;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(secret), nonce);
    decipher.setAAD(Buffer.from(COOKIE_VERSION));
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const session: unknown = JSON.parse(plaintext);
    if (!isPortalSession(session)) return undefined;
    if (
      session.absoluteExpiresAt <= now ||
      session.lastActivityAt + idleTimeoutMs <= now
    )
      return undefined;
    return session;
  } catch {
    return undefined;
  }
}

export function readSession(
  request: FastifyRequest,
  config: AppConfig,
): PortalSession | undefined {
  const cookie = request.headers.cookie?.match(
    /(?:^|;\s*)portal_session=([^;]+)/,
  )?.[1];
  return decodeSession(cookie, config.sessionSecret, config.sessionIdleTimeoutMs);
}

export function setSession(
  reply: FastifyReply,
  session: PortalSession,
  config: AppConfig,
): void {
  const csrfToken = session.csrfToken ?? randomBytes(24).toString("base64url");
  const next = { ...session, csrfToken };
  const encoded = encodeSession(next, config.sessionSecret);
  if (Buffer.byteLength(encoded, "utf8") > MAX_COOKIE_VALUE_BYTES)
    throw new Error("Portal session cookie exceeds the supported size");
  const cookiePath = webBasePath(config) || "/";
  const maxAge = Math.max(
    0,
    Math.floor(
      Math.min(config.sessionIdleTimeoutMs, next.absoluteExpiresAt - Date.now()) /
        1000,
    ),
  );
  const secure = new URL(config.webOrigin).protocol === "https:" ? "; Secure" : "";
  reply.header("Set-Cookie", [
    `${COOKIE}=${encoded}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=${cookiePath}${secure}`,
    `portal_csrf=${csrfToken}; SameSite=Lax; Max-Age=${maxAge}; Path=${cookiePath}${secure}`,
  ]);
}

export function clearSession(reply: FastifyReply, config: AppConfig): void {
  const cookiePath = webBasePath(config) || "/";
  const secure = new URL(config.webOrigin).protocol === "https:" ? "; Secure" : "";
  reply.header("Set-Cookie", [
    `${COOKIE}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=${cookiePath}${secure}`,
    `portal_csrf=; SameSite=Lax; Max-Age=0; Path=${cookiePath}${secure}`,
  ]);
}
