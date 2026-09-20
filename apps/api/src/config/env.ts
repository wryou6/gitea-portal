export type AppConfig = {
  giteaBaseUrl: string;
  oauthClientId: string;
  oauthClientSecret: string;
  oauthRedirectUri: string;
  sessionSecret: string;
  workflowConfigPath: string;
  port: number;
};

export function loadConfig(env = process.env): AppConfig {
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
    sessionSecret: required('PORTAL_SESSION_SECRET'),
    workflowConfigPath: env.WORKFLOW_CONFIG_PATH ?? 'config/workflows/conventions.yaml',
    port: Number(env.API_PORT ?? 3000),
  };
}
