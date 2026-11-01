import { SPOTIFY_API_URL } from '@/config/spotify';
import { AuthError, refreshSession, type TokenSet } from '@/services/spotify/auth';
import { useAuthStore } from '@/store/authStore';

const EXPIRY_MARGIN_MS = 60_000;

export class SpotifyApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'SpotifyApiError';
    this.status = status;
  }
}

function refreshAccessToken(refreshToken: string): Promise<string> {
  const { refreshing, setRefreshing, setSession } = useAuthStore.getState();
  if (refreshing) return refreshing;

  const attempt = refreshSession(refreshToken)
    .then((next: TokenSet) => {
      setSession(next);
      return next.accessToken;
    })
    .catch((error: unknown) => {
      if (error instanceof AuthError) setSession(null);
      throw error;
    })
    .finally(() => setRefreshing(null));

  setRefreshing(attempt);
  return attempt;
}

export async function getAccessToken(forceRefresh = false): Promise<string> {
  const session = useAuthStore.getState().session;
  if (!session) throw new AuthError('You are signed out. Please sign in again.');

  if (!forceRefresh && session.expiresAt - Date.now() > EXPIRY_MARGIN_MS) {
    return session.accessToken;
  }
  return refreshAccessToken(session.refreshToken);
}

interface RequestOptions {
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

function send(path: string, options: RequestOptions, token: string): Promise<Response> {
  const hasBody = options.body !== undefined;
  return fetch(`${SPOTIFY_API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: unknown } };
    if (typeof body.error?.message === 'string') return body.error.message;
  } catch {
    // Non-JSON error bodies fall through to the status text below.
  }
  return response.statusText || `Request failed with status ${response.status}`;
}

export async function spotifyRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await send(path, options, await getAccessToken());
  if (response.status === 401) {
    response = await send(path, options, await getAccessToken(true));
  }

  if (!response.ok) {
    throw new SpotifyApiError(response.status, await readErrorMessage(response));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function describeError(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof SpotifyApiError) {
    if (error.status === 403) return 'Spotify did not allow this for your account.';
    if (error.status === 429) return 'Too many requests. Please try again in a moment.';
    if (error.status >= 500) return 'Spotify is having trouble right now. Please try again later.';
    return error.message;
  }
  if (error instanceof TypeError) return 'Network error. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}
