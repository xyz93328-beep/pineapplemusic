import { useRef, useEffect, useState, type ReactNode } from 'react';
import { LoaderCircle, TriangleAlert } from 'lucide-react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { describeError } from '@/services/spotify/client';
import { exchangeAuthCode } from '@/services/spotify/auth';
import { useAuthStore } from '@/store/authStore';

const ACCESS_DENIED_MESSAGE =
  'Spotify did not grant access. If this app is in development mode, ask the app owner to add your account.';

export function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = useAuthStore((s) => s.session);
  const setSession = useAuthStore((s) => s.setSession);
  const [failure, setFailure] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const oauthError = searchParams.get('error');
    if (oauthError) {
      navigate('/login', { replace: true, state: { error: ACCESS_DENIED_MESSAGE } });
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    exchangeAuthCode(code, searchParams.get('state'))
      .then((tokens) => {
        setSession(tokens);
        navigate('/', { replace: true });
      })
      .catch((error: unknown) => setFailure(describeError(error)));
  }, [navigate, searchParams, setSession]);

  if (session) return <Navigate to="/" replace />;

  if (failure) {
    return (
      <CallbackShell>
        <TriangleAlert size={32} className="text-error" aria-hidden />
        <p className="text-section font-bold text-label">Sign-in failed</p>
        <p className="max-w-sm text-body text-label-secondary">{failure}</p>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="mt-2 flex h-11 items-center rounded-pill bg-accent px-6 text-body font-bold text-white transition-[background-color,transform] duration-200 ease-out hover:bg-accent-hover active:scale-[0.96]"
        >
          Back to sign in
        </button>
      </CallbackShell>
    );
  }

  return (
    <CallbackShell>
      <LoaderCircle size={32} className="animate-spin text-accent" aria-hidden />
      <p className="text-body text-label-secondary">Signing you in...</p>
    </CallbackShell>
  );
}

function CallbackShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
      {children}
    </main>
  );
}
