import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { Artwork, firstImageUrl } from '@/components/common/Artwork';
import { MediaCard } from '@/components/media/MediaCard';
import { formatDuration } from '@/lib/format';
import type { SearchResults, SpotifyArtistRef, SpotifyTrack } from '@/services/spotify/types';

interface SearchResultsViewProps {
  query: string;
  results: SearchResults;
}

interface TopResult {
  kind: string;
  title: string;
  subtitle: string;
  artwork: string | undefined;
  shape: 'square' | 'circle';
  to?: string;
}

function joinArtists(artists: SpotifyArtistRef[]): string {
  return artists.map((artist) => artist.name).join(', ');
}

function pickTopResult(query: string, results: SearchResults): TopResult | null {
  const exactArtist = results.artists.find(
    (artist) => artist.name.toLowerCase() === query.toLowerCase(),
  );
  if (exactArtist) {
    return {
      kind: 'Artist',
      title: exactArtist.name,
      subtitle: 'Artist',
      artwork: firstImageUrl(exactArtist.images),
      shape: 'circle',
    };
  }

  const track = results.tracks[0];
  if (track) {
    return {
      kind: 'Song',
      title: track.name,
      subtitle: joinArtists(track.artists),
      artwork: firstImageUrl(track.album.images),
      shape: 'square',
    };
  }

  const album = results.albums[0];
  if (album) {
    return {
      kind: 'Album',
      title: album.name,
      subtitle: joinArtists(album.artists),
      artwork: firstImageUrl(album.images),
      shape: 'square',
      to: `/albums/${album.id}`,
    };
  }

  const playlist = results.playlists[0];
  if (playlist) {
    return {
      kind: 'Playlist',
      title: playlist.name,
      subtitle: playlist.owner.display_name ?? 'Playlist',
      artwork: firstImageUrl(playlist.images),
      shape: 'square',
      to: `/playlists/${playlist.id}`,
    };
  }

  return null;
}

function TrackRow({ track }: { track: SpotifyTrack }) {
  return (
    <li className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition-colors duration-200 ease-out hover:bg-label/[0.05]">
      <Artwork src={firstImageUrl(track.album.images)} alt={track.album.name} className="h-10 w-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-2 text-track font-medium text-label">
          <span className="truncate">{track.name}</span>
          {track.explicit && (
            <span
              aria-label="Explicit"
              className="inline-flex h-4 shrink-0 items-center rounded-[3px] bg-label/[0.15] px-1 text-[10px] font-bold text-label-secondary"
            >
              E
            </span>
          )}
        </p>
        <p className="truncate text-caption text-label-secondary">{joinArtists(track.artists)}</p>
      </div>
      <span className="shrink-0 text-track tabular-nums text-label-secondary">
        {formatDuration(track.duration_ms)}
      </span>
    </li>
  );
}

function SectionHeading({ children }: { children: string }) {
  return <h2 className="mb-4 text-section font-bold text-label">{children}</h2>;
}

function TopResultCard({ result }: { result: TopResult }) {
  return (
    <div className="flex items-center gap-6 rounded-panel bg-surface-elevated p-6">
      <Artwork
        src={result.artwork}
        alt={result.title}
        shape={result.shape}
        className="h-28 w-28 shrink-0 md:h-36 md:w-36"
      />
      <div className="min-w-0">
        <p className="text-caption font-medium text-label-secondary">{result.kind}</p>
        <p className="mt-1 truncate text-title font-bold text-label">{result.title}</p>
        <p className="mt-1 truncate text-body text-label-secondary">{result.subtitle}</p>
        {result.to && (
          <Link
            to={result.to}
            className="mt-4 inline-flex h-9 items-center rounded-pill bg-accent px-5 text-body font-bold text-white transition-[background-color,transform] duration-200 ease-out hover:bg-accent-hover active:scale-[0.96]"
          >
            Open
          </Link>
        )}
      </div>
    </div>
  );
}

export function SearchResultsView({ query, results }: SearchResultsViewProps) {
  const topResult = pickTopResult(query, results);
  const total =
    results.tracks.length + results.albums.length + results.artists.length + results.playlists.length;

  if (total === 0) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-16 text-center">
        <Music size={32} className="text-label-secondary" aria-hidden />
        <p className="text-section font-bold text-label">No results for &ldquo;{query}&rdquo;</p>
        <p className="text-body text-label-secondary">Try a different song, artist, album, or playlist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {topResult && <TopResultCard result={topResult} />}

      {results.tracks.length > 0 && (
        <section>
          <SectionHeading>Songs</SectionHeading>
          <ol className="flex flex-col gap-1">
            {results.tracks.map((track) => (
              <TrackRow key={track.id} track={track} />
            ))}
          </ol>
        </section>
      )}

      {results.albums.length > 0 && (
        <section>
          <SectionHeading>Albums</SectionHeading>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {results.albums.map((album) => (
              <MediaCard
                key={album.id}
                to={`/albums/${album.id}`}
                artwork={firstImageUrl(album.images)}
                title={album.name}
                subtitle={`${album.release_date.slice(0, 4)} - ${joinArtists(album.artists)}`}
              />
            ))}
          </div>
        </section>
      )}

      {results.artists.length > 0 && (
        <section>
          <SectionHeading>Artists</SectionHeading>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {results.artists.map((artist) => (
              <MediaCard
                key={artist.id}
                artwork={firstImageUrl(artist.images)}
                title={artist.name}
                subtitle="Artist"
                shape="circle"
              />
            ))}
          </div>
        </section>
      )}

      {results.playlists.length > 0 && (
        <section>
          <SectionHeading>Playlists</SectionHeading>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {results.playlists.map((playlist) => (
              <MediaCard
                key={playlist.id}
                to={`/playlists/${playlist.id}`}
                artwork={firstImageUrl(playlist.images)}
                title={playlist.name}
                subtitle={playlist.owner.display_name ?? 'Playlist'}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
