import { ytRequest, parseDuration, formatDurationMs, bestThumb } from './client';
import type {
  Track, Artist, Playlist, SearchResults,
  YTSearchResponse, YTVideoListResponse, YTChannelListResponse,
  YTPlaylistListResponse, YTPlaylistItemListResponse, YTPlaylistItem,
  YTVideoItem, YTChannelItem,
} from './types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function videoToTrack(v: YTVideoItem): Track {
  const ms = parseDuration(v.contentDetails?.duration ?? '');
  return {
    id: v.id,
    videoId: v.id,
    title: v.snippet.title,
    artist: v.snippet.channelTitle,
    artistId: v.snippet.channelId,
    thumbnailUrl: bestThumb(v.snippet.thumbnails),
    durationMs: ms,
    durationLabel: formatDurationMs(ms),
    explicit: false,
  };
}

function channelToArtist(c: YTChannelItem): Artist {
  return {
    id: c.id,
    name: c.snippet.title,
    thumbnailUrl: bestThumb(c.snippet.thumbnails),
    subscriberCount: c.statistics?.subscriberCount,
  };
}

// ── Search ───────────────────────────────────────────────────────────────────

export async function searchYouTube(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResults> {
  // Run video + channel searches in parallel
  const [videoRes, channelRes, playlistRes] = await Promise.all([
    ytRequest<YTSearchResponse>('search', {
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: '10',
    }, signal),
    ytRequest<YTSearchResponse>('search', {
      part: 'snippet',
      q: query,
      type: 'channel',
      maxResults: '5',
    }, signal),
    ytRequest<YTSearchResponse>('search', {
      part: 'snippet',
      q: query,
      type: 'playlist',
      maxResults: '5',
    }, signal),
  ]);

  // Hydrate videos with duration via videos.list
  const videoIds = videoRes.items
    .map((i) => i.id.videoId)
    .filter(Boolean)
    .join(',');

  let tracks: Track[] = [];
  if (videoIds) {
    const details = await ytRequest<YTVideoListResponse>('videos', {
      part: 'snippet,contentDetails',
      id: videoIds,
    }, signal);
    tracks = details.items.map(videoToTrack);
  }

  const artists: Artist[] = channelRes.items
    .filter((i) => i.id.channelId)
    .map((i) => ({
      id: i.id.channelId!,
      name: i.snippet.title,
      thumbnailUrl: bestThumb(i.snippet.thumbnails),
    }));

  const playlists: Playlist[] = playlistRes.items
    .filter((i) => i.id.playlistId)
    .map((i) => ({
      id: i.id.playlistId!,
      title: i.snippet.title,
      description: i.snippet.description,
      channelTitle: i.snippet.channelTitle,
      channelId: i.snippet.channelId,
      thumbnailUrl: bestThumb(i.snippet.thumbnails),
      trackCount: 0,
    }));

  return { tracks, artists, playlists };
}

// ── Video (single track) ─────────────────────────────────────────────────────

export async function fetchVideo(videoId: string, signal?: AbortSignal): Promise<Track> {
  const res = await ytRequest<YTVideoListResponse>('videos', {
    part: 'snippet,contentDetails',
    id: videoId,
  }, signal);
  if (!res.items[0]) throw new Error('Video not found');
  return videoToTrack(res.items[0]);
}

export async function fetchVideos(videoIds: string[], signal?: AbortSignal): Promise<Track[]> {
  if (videoIds.length === 0) return [];
  const res = await ytRequest<YTVideoListResponse>('videos', {
    part: 'snippet,contentDetails',
    id: videoIds.join(','),
    maxResults: '50',
  }, signal);
  return res.items.map(videoToTrack);
}

// ── Channel (artist) ─────────────────────────────────────────────────────────

export async function fetchChannel(channelId: string, signal?: AbortSignal): Promise<Artist> {
  const res = await ytRequest<YTChannelListResponse>('channels', {
    part: 'snippet,statistics',
    id: channelId,
  }, signal);
  if (!res.items[0]) throw new Error('Channel not found');
  return channelToArtist(res.items[0]);
}

export async function fetchChannelVideos(
  channelId: string,
  signal?: AbortSignal,
): Promise<Track[]> {
  const searchRes = await ytRequest<YTSearchResponse>('search', {
    part: 'snippet',
    channelId,
    type: 'video',
    order: 'viewCount',
    maxResults: '20',
  }, signal);

  const videoIds = searchRes.items
    .map((i) => i.id.videoId)
    .filter(Boolean)
    .join(',');

  if (!videoIds) return [];

  const details = await ytRequest<YTVideoListResponse>('videos', {
    part: 'snippet,contentDetails',
    id: videoIds,
  }, signal);
  return details.items.map(videoToTrack);
}

export async function fetchChannelPlaylists(
  channelId: string,
  signal?: AbortSignal,
): Promise<Playlist[]> {
  const res = await ytRequest<YTPlaylistListResponse>('playlists', {
    part: 'snippet,contentDetails',
    channelId,
    maxResults: '20',
  }, signal);
  return res.items.map(playlistItemToPlaylist);
}

// ── Playlist ─────────────────────────────────────────────────────────────────

function playlistItemToPlaylist(p: YTPlaylistItem): Playlist {
  return {
    id: p.id,
    title: p.snippet.title,
    description: p.snippet.description,
    channelTitle: p.snippet.channelTitle,
    channelId: p.snippet.channelId,
    thumbnailUrl: bestThumb(p.snippet.thumbnails),
    trackCount: p.contentDetails?.itemCount ?? 0,
  };
}

export async function fetchPlaylist(
  playlistId: string,
  signal?: AbortSignal,
): Promise<Playlist> {
  const res = await ytRequest<YTPlaylistListResponse>('playlists', {
    part: 'snippet,contentDetails',
    id: playlistId,
  }, signal);
  if (!res.items[0]) throw new Error('Playlist not found');
  return playlistItemToPlaylist(res.items[0]);
}

export async function fetchPlaylistTracks(
  playlistId: string,
  signal?: AbortSignal,
): Promise<Track[]> {
  // Fetch up to 50 playlist items
  const itemsRes = await ytRequest<YTPlaylistItemListResponse>('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: '50',
  }, signal);

  const videoIds = itemsRes.items
    .map((i) => i.snippet.resourceId.videoId)
    .filter(Boolean)
    .join(',');

  if (!videoIds) return [];

  // Hydrate with full video details (duration etc.)
  const details = await ytRequest<YTVideoListResponse>('videos', {
    part: 'snippet,contentDetails',
    id: videoIds,
  }, signal);

  // Preserve playlist order
  const byId: Record<string, Track> = {};
  for (const v of details.items) byId[v.id] = videoToTrack(v);

  return itemsRes.items
    .map((i) => byId[i.snippet.resourceId.videoId])
    .filter(Boolean);
}

// ── Browse / trending music ───────────────────────────────────────────────────

export async function fetchTrendingMusic(signal?: AbortSignal): Promise<Track[]> {
  const res = await ytRequest<YTVideoListResponse>('videos', {
    part: 'snippet,contentDetails',
    chart: 'mostPopular',
    videoCategoryId: '10', // Music
    maxResults: '20',
    regionCode: 'US',
  }, signal);
  return res.items.map(videoToTrack);
}
