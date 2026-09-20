import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type AppConfig = {
  giteaBaseUrl: string;
  oauthClientId: string;
  oauthClientSecret: string;
  oauthRedirectUri: string;
  oauthScope: string;
  giteaTimeoutMs: number;
  sessionSecret: string;
  workflowConfigPath: string;
  boardStorePath: string;
  webOrigin: string;
  port: number;
};

function projectRoot(): string {
  const candidates = [process.cwd(), resolve(process.cwd(), '..', '..')];
  return candidates.find((candidate) => existsSync(resolve(candidate, 'apps')) && existsSync(resolve(candidate, 'config', 'workflows', 'conventions.yaml'))) ?? process.cwd();
}

function loadLocalEnv(): void {
  const path = [resolve(projectRoot(), '.env'), resolve(process.cwd(), '.env')].find((candidate) => existsSync(candidate));
  if (!path) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match?.[1] && process.env[match[1]] === undefined) process.env[match[1]] = match[2]?.replace(/^['"]|['"]$/g, '') ?? '';
  }
}

function resolveConfiguredPath(value: string): string {
  if (value.startsWith('/') || /^[A-Za-z]:[\\/]/.test(value)) return value;
  return resolve(projectRoot(), value);
}

export function loadConfig(env = process.env): AppConfig {
  loadLocalEnv();
  const required = (name: string): string => {
    const value = env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
  };
  return {
    giteaBaseUrl: required('GITEA_BASE_URL').replace(/\/$/, ''),
    oauthClientId: required('GITEA_OAUTH_CLIENT_ID'),
    oauthClientSecret: required('GITEA_OAUTH_CLIENT_SECRET'),
    oauthRedirectUri: required('GITEA_OAUTH_REDIRECT_URI'),
    oauthScope: env.GITEA_OAUTH_SCOPE ?? 'read:user read:repository read:issue write:issue',
    giteaTimeoutMs: Number(env.GITEA_API_TIMEOUT_MS ?? 10000),
    sessionSecret: required('PORTAL_SESSION_SECRET'),
    workflowConfigPath: resolveConfiguredPath(env.WORKFLOW_CONFIG_PATH ?? 'config/workflows/conventions.yaml'),
    boardStorePath: resolveConfiguredPath(env.BOARD_STORE_PATH ?? 'data/boards.json'),
    webOrigin: env.WEB_ORIGIN ?? 'http://localhost:5173',
    port: Number(env.API_PORT ?? 3000),
  };
}
