export interface BrowseCategory {
  name: string;
  color: string;
  query: string; // search query to use when tile is tapped
}

export const BROWSE_CATEGORIES: BrowseCategory[] = [
  { name: 'Hip-Hop', color: '#8B5CF6', query: 'hip hop music 2024' },
  { name: 'Pop', color: '#EC4899', query: 'pop hits 2024' },
  { name: 'R&B', color: '#F59E0B', query: 'rnb music 2024' },
  { name: 'Rock', color: '#EF4444', query: 'rock music hits' },
  { name: 'Electronic', color: '#06B6D4', query: 'electronic dance music' },
  { name: 'Jazz', color: '#10B981', query: 'jazz music' },
  { name: 'Classical', color: '#6366F1', query: 'classical music' },
  { name: 'Latin', color: '#F97316', query: 'latin music hits 2024' },
  { name: 'Afrobeats', color: '#84CC16', query: 'afrobeats 2024' },
  { name: 'K-Pop', color: '#F472B6', query: 'kpop hits 2024' },
  { name: 'Reggae', color: '#22C55E', query: 'reggae music' },
  { name: 'Country', color: '#D97706', query: 'country music hits' },
  { name: 'Metal', color: '#64748B', query: 'metal music' },
  { name: 'Soul', color: '#DC2626', query: 'soul music classics' },
  { name: 'Funk', color: '#7C3AED', query: 'funk music' },
  { name: 'Blues', color: '#1D4ED8', query: 'blues music' },
];
