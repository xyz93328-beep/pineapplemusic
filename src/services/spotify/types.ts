export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifyArtistRef {
  id: string;
  name: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  images: SpotifyImage[];
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  owner: { display_name: string | null };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  artists: SpotifyArtistRef[];
  release_date: string;
  total_tracks: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  artists: SpotifyArtistRef[];
  album: { id: string; name: string; images: SpotifyImage[] };
}

export interface SpotifyPaging<T> {
  items: T[];
}

export interface SpotifySearchResponse {
  tracks?: SpotifyPaging<SpotifyTrack | null>;
  albums?: SpotifyPaging<SpotifyAlbum | null>;
  artists?: SpotifyPaging<SpotifyArtist | null>;
  playlists?: SpotifyPaging<SpotifyPlaylist | null>;
}

export interface SearchResults {
  tracks: SpotifyTrack[];
  albums: SpotifyAlbum[];
  artists: SpotifyArtist[];
  playlists: SpotifyPlaylist[];
}
