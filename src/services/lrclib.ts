export interface LrcLine {
  time: number; // seconds
  text: string;
}

export interface LyricsResult {
  synced: LrcLine[] | null;
  plain: string | null;
}

const BASE = 'https://lrclib.net/api';

// ── Title cleaning ────────────────────────────────────────────────────────────
// YouTube titles are noisy: "Artist - Song (Official Video) [4K] ft. Someone"
// We strip common suffixes/qualifiers so LRCLIB can match the actual song.

const NOISE_PARENS = /\s*[\(\[【][^\)\]】]*[\)\]】]/g;
const NOISE_SUFFIXES =
  /\s*(official\s*(music\s*)?video|official\s*audio|lyrics?\s*(video)?|visualizer|live(\s+at\s+.+)?|acoustic|cover|remix|remaster(ed)?|full\s*(album|version)|hd|hq|4k|8k|360°?|ft\..*|feat\..*|prod\..*|dir\..*|explicit|clean|radio\s*edit)\s*$/gi;

function cleanTitle(raw: string): string {
  return raw
    .replace(NOISE_PARENS, '')
    .replace(NOISE_SUFFIXES, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// If title is "Artist - Song", split it; otherwise return as-is.
function splitArtistTitle(title: string): { artist: string; track: string } | null {
  const sep = /\s+[-–—]\s+/;
  const parts = title.split(sep);
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      track: parts.slice(1).join(' - ').trim(),
    };
  }
  return null;
}

// ── LRC parser ────────────────────────────────────────────────────────────────

function parseLrc(lrc: string): LrcLine[] {
  const lines: LrcLine[] = [];
  const lineRe = /^\[(\d{1,2}):(\d{2})\.(\d{2,3})\](.*)$/;
  for (const raw of lrc.split('\n')) {
    const m = lineRe.exec(raw.trim());
    if (!m) continue;
    const minutes = parseInt(m[1], 10);
    const seconds = parseInt(m[2], 10);
    const frac = m[3].length === 2 ? parseInt(m[3], 10) * 10 : parseInt(m[3], 10);
    const time = minutes * 60 + seconds + frac / 1000;
    lines.push({ time, text: m[4].trim() });
  }
  return lines.filter((l) => l.text.length > 0);
}

// ── Main fetch (tries multiple query strategies) ──────────────────────────────

async function tryFetch(
  track: string,
  artist: string,
  duration: number,
  signal?: AbortSignal,
): Promise<{ syncedLyrics?: string | null; plainLyrics?: string | null } | null> {
  const params = new URLSearchParams({
    track_name: track,
    artist_name: artist,
    duration: String(Math.round(duration)),
  });

  try {
    const res = await fetch(`${BASE}/get?${params.toString()}`, { signal });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function searchFetch(
  query: string,
  signal?: AbortSignal,
): Promise<{ syncedLyrics?: string | null; plainLyrics?: string | null } | null> {
  try {
    const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`, { signal });
    if (!res.ok) return null;
    const results = await res.json() as Array<{ syncedLyrics?: string | null; plainLyrics?: string | null }>;
    if (!Array.isArray(results) || results.length === 0) return null;
    // Prefer first result with synced lyrics, else first with any lyrics
    const synced = results.find((r) => r.syncedLyrics);
    const plain = results.find((r) => r.plainLyrics);
    return synced ?? plain ?? null;
  } catch {
    return null;
  }
}

export async function fetchLyrics(
  rawTitle: string,
  rawArtist: string,
  durationSecs: number,
  signal?: AbortSignal,
): Promise<LyricsResult> {
  const none: LyricsResult = { synced: null, plain: null };

  const cleanedTitle = cleanTitle(rawTitle);
  const split = splitArtistTitle(cleanedTitle);

  // Build a list of (track, artist) attempts in priority order
  const attempts: Array<{ track: string; artist: string }> = [];

  if (split) {
    // "Artist - Song" format in the video title
    attempts.push({ track: split.track, artist: split.artist });
    attempts.push({ track: split.track, artist: rawArtist });
  }

  // Use cleaned title + provided artist name
  attempts.push({ track: cleanedTitle, artist: rawArtist });

  // Use raw title + artist as last direct attempt
  if (cleanedTitle !== rawTitle) {
    attempts.push({ track: rawTitle, artist: rawArtist });
  }

  // Try each combination with the /get endpoint
  for (const { track, artist } of attempts) {
    if (!track) continue;
    const data = await tryFetch(track, artist, durationSecs, signal);
    if (data) {
      return {
        synced: data.syncedLyrics ? parseLrc(data.syncedLyrics) : null,
        plain: data.plainLyrics ?? null,
      };
    }
  }

  // Final fallback: full-text search with the cleaned title
  const searchQuery = split
    ? `${split.artist} ${split.track}`
    : `${rawArtist} ${cleanedTitle}`;
  const searchData = await searchFetch(searchQuery, signal);
  if (searchData) {
    return {
      synced: searchData.syncedLyrics ? parseLrc(searchData.syncedLyrics) : null,
      plain: searchData.plainLyrics ?? null,
    };
  }

  return none;
}
