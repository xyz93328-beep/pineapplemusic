// ── Core shared types ────────────────────────────────────────────────────────

export interface YTThumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface YTThumbnailSet {
  default?: YTThumbnail;
  medium?: YTThumbnail;
  high?: YTThumbnail;
  standard?: YTThumbnail;
  maxres?: YTThumbnail;
}

// ── Search ───────────────────────────────────────────────────────────────────

export type YTSearchKind = 'youtube#video' | 'youtube#channel' | 'youtube#playlist';

export interface YTSearchItem {
  kind: 'youtube#searchResult';
  id: {
    kind: YTSearchKind;
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    title: string;
    description: string;
    thumbnails: YTThumbnailSet;
  };
}

export interface YTSearchResponse {
  items: YTSearchItem[];
  nextPageToken?: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
}

// ── Video (track) ────────────────────────────────────────────────────────────

export interface YTVideoItem {
  kind: 'youtube#video';
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    title: string;
    description: string;
    thumbnails: YTThumbnailSet;
    tags?: string[];
    categoryId?: string;
  };
  contentDetails: {
    duration: string; // ISO 8601 e.g. PT3M45S
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
  };
}

export interface YTVideoListResponse {
  items: YTVideoItem[];
}

// ── Channel (artist) ─────────────────────────────────────────────────────────

export interface YTChannelItem {
  kind: 'youtube#channel';
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: YTThumbnailSet;
    country?: string;
  };
  statistics?: {
    subscriberCount?: string;
    videoCount?: string;
  };
}

export interface YTChannelListResponse {
  items: YTChannelItem[];
}

// ── Playlist ─────────────────────────────────────────────────────────────────

export interface YTPlaylistItem {
  kind: 'youtube#playlist';
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    title: string;
    description: string;
    thumbnails: YTThumbnailSet;
  };
  contentDetails?: {
    itemCount: number;
  };
}

export interface YTPlaylistListResponse {
  items: YTPlaylistItem[];
  nextPageToken?: string;
}

export interface YTPlaylistVideoItem {
  kind: 'youtube#playlistItem';
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    title: string;
    description: string;
    thumbnails: YTThumbnailSet;
    resourceId: {
      kind: string;
      videoId: string;
    };
    position: number;
    videoOwnerChannelTitle?: string;
    videoOwnerChannelId?: string;
  };
  contentDetails?: {
    videoId: string;
    videoPublishedAt?: string;
  };
}

export interface YTPlaylistItemListResponse {
  items: YTPlaylistVideoItem[];
  nextPageToken?: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
}

// ── Normalised app types (what the UI actually uses) ─────────────────────────

export interface Track {
  id: string;          // YouTube videoId
  videoId: string;
  title: string;
  artist: string;      // channelTitle
  artistId: string;    // channelId
  thumbnailUrl: string;
  durationMs: number;
  durationLabel: string; // e.g. "3:45"
  explicit: false;     // YT doesn't expose this, always false
}

export interface Album {
  id: string;          // playlistId of a "topic" channel album, or channelId
  title: string;
  artist: string;
  artistId: string;
  year: string;
  thumbnailUrl: string;
  trackCount: number;
}

export interface Artist {
  id: string;          // channelId
  name: string;
  thumbnailUrl: string;
  subscriberCount?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnailUrl: string;
  trackCount: number;
}

export interface SearchResults {
  tracks: Track[];
  artists: Artist[];
  playlists: Playlist[];
}
