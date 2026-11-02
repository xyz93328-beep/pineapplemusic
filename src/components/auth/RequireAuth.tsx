import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isConfigured } from '@/store/apiKeyStore';

/**
 * Guards the app shell. When VITE_YT_API_KEY is set in the environment
 * (the normal public deployment case), isConfigured() is always true and
 * this component is effectively transparent — users never see a login screen.
 *
 * If no env key is present (local dev without .env), users are sent to /login
 * where they can paste their own key once.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isConfigured()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
