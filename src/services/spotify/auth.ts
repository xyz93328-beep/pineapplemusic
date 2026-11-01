import {
  SPOTIFY_ACCOUNTS_URL,
  SPOTIFY_SCOPES,
  getRedirectUri,
  getSpotifyClientId,
} from '@/config/spotify';
import { createCodeChallenge, createRandomString } from './pkce';

const VERIFIER_KEY = 'music-pkce-verifier';
const STATE_KEY = 'music-pkce-state';

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function createAuthorizeUrl(): Promise<string> {
  const verifier = createRandomString(64);
  const state = createRandomString(24);
  const challenge = await createCodeChallenge(verifier);

  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: getSpotifyClientId(),
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SPOTIFY_SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
  });

  return `${SPOTIFY_ACCOUNTS_URL}/authorize?${params.toString()}`;
}

async function requestToken(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new AuthError('Spotify rejected the sign-in request. Please try signing in again.');
  }

  return (await response.json()) as TokenResponse;
}

function toTokenSet(data: TokenResponse, previousRefreshToken?: string): TokenSet {
  const refreshToken = data.refresh_token ?? previousRefreshToken;
  if (!refreshToken) {
    throw new AuthError('Spotify did not return a session. Please try signing in again.');
  }
  return {
    accessToken: data.access_token,
    refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function exchangeAuthCode(code: string, returnedState: string | null): Promise<TokenSet> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  const expectedState = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);

  if (!verifier || !expectedState || returnedState !== expectedState) {
    throw new AuthError('Your sign-in session expired. Please try signing in again.');
  }

  const data = await requestToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: getSpotifyClientId(),
      code_verifier: verifier,
    }),
  );

  return toTokenSet(data);
}

export async function refreshSession(refreshToken: string): Promise<TokenSet> {
  const data = await requestToken(
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: getSpotifyClientId(),
    }),
  );

  return toTokenSet(data, refreshToken);
}
