import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SpotifyConfigState {
  clientId: string;
  setClientId: (clientId: string) => void;
}

export const useSpotifyConfigStore = create<SpotifyConfigState>()(
  persist(
    (set) => ({
      clientId: '',
      setClientId: (clientId) => set({ clientId }),
    }),
    { name: 'music-spotify-config' },
  ),
);
