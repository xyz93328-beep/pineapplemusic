import { spotifyRequest } from '@/services/spotify/client';
import type {
  SearchResults,
  SpotifyPaging,
  SpotifyPlaylist,
  SpotifySearchResponse,
  SpotifyUser,
} from '@/services/spotify/types';

function compact<T>(paging: SpotifyPaging<T | null> | undefined): T[] {
  return paging ? paging.items.filter((item): item is T => item !== null) : [];
}

export function fetchCurrentUser(signal?: AbortSignal): Promise<SpotifyUser> {
  return spotifyRequest<SpotifyUser>('/me', { signal });
}

export async function fetchUserPlaylists(signal?: AbortSignal): Promise<SpotifyPlaylist[]> {
  const page = await spotifyRequest<SpotifyPaging<SpotifyPlaylist | null>>('/me/playlists?limit=50', {
    signal,
  });
  return compact(page);
}

export async function searchCatalog(query: string, signal?: AbortSignal): Promise<SearchResults> {
  const params = new URLSearchParams({
    q: query,
    type: 'track,album,artist,playlist',
    limit: '10',
  });
  const data = await spotifyRequest<SpotifySearchResponse>(`/search?${params.toString()}`, { signal });
  return {
    tracks: compact(data.tracks),
    albums: compact(data.albums),
    artists: compact(data.artists),
    playlists: compact(data.playlists),
  };
}
