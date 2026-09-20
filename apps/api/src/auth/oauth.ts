import type { AppConfig } from '../config/env.js';

export function oauthAuthorizeUrl(config: AppConfig, state: string): string {
  const url = new URL(`${config.giteaBaseUrl}/login/oauth/authorize`);
  url.searchParams.set('client_id', config.oauthClientId);
  url.searchParams.set('redirect_uri', config.oauthRedirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  return url.toString();
}
