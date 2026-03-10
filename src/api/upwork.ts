import 'dotenv/config';
import { getSetting, setSetting } from '../db/settings';

const UPWORK_TOKEN_URL = 'https://www.upwork.com/api/v3/oauth2/token';
const UPWORK_GRAPHQL_URL = 'https://api.upwork.com/graphql';

interface UpworkTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // timestamp in ms
}

export async function refreshUpworkTokens(): Promise<string> {
  const clientId = process.env.UPWORK_CLIENT_ID;
  const clientSecret = process.env.UPWORK_CLIENT_SECRET;
  const refreshToken = getSetting('upwork_refresh_token');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Upwork API credentials or refresh token.');
  }

  const response = await fetch(UPWORK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to refresh Upwork tokens: ${response.statusText} - ${errorData}`);
  }

  const data = await response.json() as any;
  const tokens: UpworkTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  setSetting('upwork_access_token', tokens.access_token);
  setSetting('upwork_refresh_token', tokens.refresh_token);
  setSetting('upwork_access_token_expires_at', tokens.expires_at.toString());

  return tokens.access_token;
}

export async function getValidUpworkAccessToken(): Promise<string> {
  const accessToken = getSetting('upwork_access_token');
  const expiresAt = parseInt(getSetting('upwork_access_token_expires_at') || '0');

  // Buffer: refresh if expiring in less than 5 minutes
  if (accessToken && expiresAt > Date.now() + 5 * 60 * 1000) {
    return accessToken;
  }

  return await refreshUpworkTokens();
}

export async function fetchUpworkJobs(query: string, variables: any = {}): Promise<any> {
  const accessToken = await getValidUpworkAccessToken();

  const response = await fetch(UPWORK_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Upwork GraphQL error: ${response.statusText} - ${errorData}`);
  }

  return await response.json();
}
