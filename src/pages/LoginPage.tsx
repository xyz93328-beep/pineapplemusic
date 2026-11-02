import { useState, type FormEvent } from 'react';
import { Music, Key, ExternalLink } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useApiKeyStore, isConfigured } from '@/store/apiKeyStore';

export function LoginPage() {
  const { apiKey, setApiKey } = useApiKeyStore();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isConfigured()) return <Navigate to="/" replace />;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const key = draft.trim();
    if (key.length < 10) {
      setError('That doesn\'t look like a valid API key. Copy it from Google Cloud Console.');
      return;
    }
    setError(null);
    setApiKey(key);
  }

  function handleClear() {
    setApiKey('');
    setDraft('');
    setError(null);
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-6 py-12">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        {/* Logo */}
        <span className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-accent text-white shadow-[0_8px_32px_rgba(250,36,60,0.35)]">
          <Music size={32} strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="mt-6 text-large-title font-bold text-label">Music</h1>
        <p className="mt-2 text-body text-label-secondary">
          Free music powered by YouTube. No account required — just a free API key.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 w-full text-left">
          <label htmlFor="yt-api-key" className="text-caption font-semibold text-label-secondary">
            YouTube Data API v3 Key
          </label>
          <div className="relative mt-2">
            <Key size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-label-secondary" aria-hidden />
            <input
              id="yt-api-key"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="AIza..."
              autoComplete="off"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              aria-describedby="key-help"
              className="h-12 w-full rounded-tile border border-separator bg-surface-elevated pl-10 pr-4 text-body text-label placeholder:text-label-secondary focus:border-accent focus:outline-none"
            />
          </div>

          <p id="key-help" className="mt-2 text-caption text-label-secondary">
            Get a free key in 2 minutes:{' '}
            <a
              href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-accent underline-offset-2 hover:underline"
            >
              Google Cloud Console <ExternalLink size={11} aria-hidden />
            </a>
            . Enable "YouTube Data API v3", create credentials → API key, paste it here.
          </p>

          {error && (
            <p role="alert" className="mt-3 text-caption text-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={draft.trim().length === 0}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-pill bg-accent text-body font-bold text-white transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-accent-hover active:scale-[0.96] active:bg-accent-pressed disabled:pointer-events-none disabled:opacity-60"
          >
            Start Listening
          </button>
        </form>

        {/* Env-var already set — show a bypass */}
        {import.meta.env.VITE_YT_API_KEY && (
          <p className="mt-4 text-caption text-label-secondary">
            Key detected from environment.{' '}
            <button onClick={() => { useApiKeyStore.getState().setApiKey(import.meta.env.VITE_YT_API_KEY); }}
              className="font-semibold text-accent underline-offset-2 hover:underline">
              Use it
            </button>
          </p>
        )}

        <p className="mt-6 text-caption text-label-secondary">
          Your key is stored locally and never sent anywhere except YouTube's API.
        </p>
      </div>
    </main>
  );
}
