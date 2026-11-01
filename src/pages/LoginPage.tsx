import { useState, type FormEvent } from 'react';
import { LogIn, Music } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  getRedirectUri,
  getSpotifyClientId,
  isValidSpotifyClientId,
} from '@/config/spotify';
import { createAuthorizeUrl, AuthError } from '@/services/spotify/auth';
import { describeError } from '@/services/spotify/client';
import { useAuthStore } from '@/store/authStore';
import { useSpotifyConfigStore } from '@/store/spotifyConfigStore';

interface LoginLocationState {
  error?: string;
}

export function LoginPage() {
  const session = useAuthStore((s) => s.session);
  const savedClientId = useSpotifyConfigStore((s) => s.clientId);
  const setClientId = useSpotifyConfigStore((s) => s.setClientId);
  const location = useLocation();
  const [pending, setPending] = useState(false);
  const [draftClientId, setDraftClientId] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    (location.state as LoginLocationState | null)?.error ?? null,
  );

  if (session) return <Navigate to="/" replace />;

  const notConfigured = getSpotifyClientId() === '';

  async function handleSignIn() {
    setPending(true);
    setError(null);
    try {
      const url = await createAuthorizeUrl();
      window.location.assign(url);
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : describeError(caught));
      setPending(false);
    }
  }

  function handleSaveClientId(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate = draftClientId.trim();
    if (!isValidSpotifyClientId(candidate)) {
      setSetupError('A Spotify Client ID is 32 letters and numbers. Copy it again from your dashboard.');
      return;
    }
    setSetupError(null);
    setError(null);
    setClientId(candidate);
    setDraftClientId('');
  }

  function handleForgetClientId() {
    setClientId('');
    setError(null);
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-accent text-white shadow-[0_8px_32px_rgba(250,36,60,0.35)]">
          <Music size={32} strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="mt-6 text-large-title font-bold text-label">Music</h1>
        <p className="mt-2 text-body text-label-secondary">
          {notConfigured
            ? 'Connect your Spotify developer app to start listening.'
            : 'Sign in with your Spotify account to start listening.'}
        </p>

        {notConfigured ? (
          <form onSubmit={handleSaveClientId} className="mt-8 w-full text-left">
            <label htmlFor="spotify-client-id" className="text-caption font-semibold text-label-secondary">
              Spotify Client ID
            </label>
            <input
              id="spotify-client-id"
              type="text"
              value={draftClientId}
              onChange={(event) => setDraftClientId(event.target.value)}
              placeholder="e.g. 1d67ff1e06ee4267ba10f1c3a4f22bcb"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={setupError ? true : undefined}
              aria-describedby="spotify-client-id-help"
              className="mt-2 h-12 w-full rounded-tile border border-separator bg-surface-elevated px-4 text-body text-label placeholder:text-label-secondary focus:border-accent focus:outline-none"
            />
            <p id="spotify-client-id-help" className="mt-2 text-caption text-label-secondary">
              Create an app in the Spotify Developer Dashboard, add{' '}
              <span className="select-all font-semibold text-label">{getRedirectUri()}</span> as a
              Redirect URI, then paste the Client ID here. You do not need the Client Secret.
            </p>
            {setupError && (
              <p role="alert" className="mt-3 text-caption text-error">
                {setupError}
              </p>
            )}
            <button
              type="submit"
              disabled={draftClientId.trim() === ''}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-pill bg-accent text-body font-bold text-white transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-accent-hover active:scale-[0.96] active:bg-accent-pressed disabled:pointer-events-none disabled:opacity-60"
            >
              Save and continue
            </button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={handleSignIn}
              disabled={pending}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-accent text-body font-bold text-white transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-accent-hover active:scale-[0.96] active:bg-accent-pressed disabled:pointer-events-none disabled:opacity-60"
            >
              <LogIn size={18} strokeWidth={2.25} aria-hidden />
              {pending ? 'Opening Spotify...' : 'Continue with Spotify'}
            </button>
            <button
              type="button"
              onClick={handleForgetClientId}
              disabled={pending || savedClientId === ''}
              className="mt-3 text-caption font-semibold text-label-secondary underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-60"
            >
              Use a different Spotify app
            </button>
          </>
        )}

        {error && (
          <p role="alert" className="mt-4 text-body text-error">
            {error}
          </p>
        )}

        <p className="mt-6 text-caption text-label-secondary">
          Playback requires a Spotify Premium account.
        </p>
      </div>
    </main>
  );
}
