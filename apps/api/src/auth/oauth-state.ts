import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppConfig } from "../config/env.js";

const COOKIE_NAME = "portal_oauth_transaction";
const COOKIE_PATH = "/auth/callback";
const TRANSACTION_LIFETIME_MS = 10 * 60 * 1000;

export type OAuthTransaction = {
  state: string;
  returnTo: string;
  expiresAt: number;
};

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function secureCookie(config: AppConfig): boolean {
  return new URL(config.webOrigin).protocol === "https:";
}

function appendSetCookie(reply: FastifyReply, cookie: string): void {
  const current = reply.getHeader("set-cookie");
  const cookies = Array.isArray(current)
    ? current.map(String)
    : current
      ? [String(current)]
      : [];
  reply.header("set-cookie", [...cookies, cookie]);
}

export function createOAuthTransaction(
  reply: FastifyReply,
  config: AppConfig,
  returnTo: string,
): string {
  const transaction: OAuthTransaction = {
    state: randomBytes(32).toString("base64url"),
    returnTo,
    expiresAt: Date.now() + TRANSACTION_LIFETIME_MS,
  };
  const payload = Buffer.from(JSON.stringify(transaction)).toString("base64url");
  const value = `${payload}.${sign(payload, config.sessionSecret)}`;
  const secure = secureCookie(config) ? "; Secure" : "";

  appendSetCookie(
    reply,
    `${COOKIE_NAME}=${value}; HttpOnly; SameSite=Lax; Path=${COOKIE_PATH}; Max-Age=${TRANSACTION_LIFETIME_MS / 1000}${secure}`,
  );
  return transaction.state;
}

function equal(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function consumeOAuthTransaction(
  request: FastifyRequest,
  config: AppConfig,
  suppliedState: string | undefined,
): OAuthTransaction | undefined {
  const cookie = request.headers.cookie?.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`),
  )?.[1];
  if (!cookie || typeof suppliedState !== "string" || !suppliedState)
    return undefined;

  const [payload, signature] = cookie.split(".");
  if (!payload || !signature) return undefined;
  if (!equal(sign(payload, config.sessionSecret), signature)) return undefined;

  try {
    const transaction = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as OAuthTransaction;
    if (
      typeof transaction.state !== "string" ||
      typeof transaction.returnTo !== "string" ||
      typeof transaction.expiresAt !== "number" ||
      transaction.expiresAt <= Date.now() ||
      !equal(transaction.state, suppliedState)
    ) {
      return undefined;
    }
    return transaction;
  } catch {
    return undefined;
  }
}

export function clearOAuthTransactionCookie(
  reply: FastifyReply,
  config: AppConfig,
): void {
  const secure = secureCookie(config) ? "; Secure" : "";
  appendSetCookie(
    reply,
    `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=${COOKIE_PATH}; Max-Age=0${secure}`,
  );
}
