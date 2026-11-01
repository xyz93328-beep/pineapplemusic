import { useSpotifyConfigStore } from '@/store/spotifyConfigStore';

export const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com';
export const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
];

const CLIENT_ID_PATTERN = /^[a-f0-9]{32}$/i;

export function isValidSpotifyClientId(value: string): boolean {
  return CLIENT_ID_PATTERN.test(value);
}

export function getSpotifyClientId(): string {
  return (
    useSpotifyConfigStore.getState().clientId || import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
  );
}

export function getRedirectUri(): string {
  return `${window.location.origin}/callback`;
}
