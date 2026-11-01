import { useCallback, useEffect, useState } from 'react';
import { describeError } from '@/services/spotify/client';

type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: unknown[]) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error', message: describeError(error) });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { state, retry };
}
