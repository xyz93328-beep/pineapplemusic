import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ApiKeyState {
  apiKey: string;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set) => ({
      apiKey: '',
      setApiKey: (apiKey) => set({ apiKey }),
      clearApiKey: () => set({ apiKey: '' }),
    }),
    { name: 'music-yt-config' },
  ),
);

/**
 * Returns the active API key.
 * Priority: env var (baked at build time) > user-persisted key in localStorage.
 * For a public deployment, just set VITE_YT_API_KEY in your .env / hosting dashboard.
 */
export function getApiKey(): string {
  return import.meta.env.VITE_YT_API_KEY || useApiKeyStore.getState().apiKey || '';
}

export function isConfigured(): boolean {
  return getApiKey().length > 0;
}
