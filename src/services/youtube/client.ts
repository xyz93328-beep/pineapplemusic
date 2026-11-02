import { useApiKeyStore } from '@/store/apiKeyStore';

const BASE = 'https://www.googleapis.com/youtube/v3';

export class YouTubeApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'YouTubeApiError';
    this.status = status;
  }
}

function getKey(): string {
  const key = useApiKeyStore.getState().apiKey || import.meta.env.VITE_YT_API_KEY || '';
  if (!key) throw new YouTubeApiError(401, 'No YouTube API key configured.');
  return key;
}

export async function ytRequest<T>(
  endpoint: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const key = getKey();
  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set('key', key);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { signal });

  if (!res.ok) {
    let message = `YouTube API error ${res.status}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch { /* ignore */ }
    throw new YouTubeApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

/** Parse ISO 8601 duration (PT3M45S) → milliseconds */
export function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] ?? '0', 10);
  const min = parseInt(m[2] ?? '0', 10);
  const s = parseInt(m[3] ?? '0', 10);
  return (h * 3600 + min * 60 + s) * 1000;
}

/** ms → "m:ss" or "h:mm:ss" */
export function formatDurationMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Best thumbnail ≥ target width, or just the largest available */
export function bestThumb(
  thumbs: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
    standard?: { url: string };
    maxres?: { url: string };
  },
): string {
  return (
    thumbs.maxres?.url ??
    thumbs.standard?.url ??
    thumbs.high?.url ??
    thumbs.medium?.url ??
    thumbs.default?.url ??
    ''
  );
}

export function describeError(err: unknown): string {
  if (err instanceof YouTubeApiError) {
    if (err.status === 400) return 'Invalid API request. Check your API key.';
    if (err.status === 403) return 'YouTube API quota exceeded or key is invalid.';
    if (err.status === 404) return 'Not found.';
    return err.message;
  }
  if (err instanceof TypeError) return 'Network error. Check your connection.';
  return 'Something went wrong. Please try again.';
}
