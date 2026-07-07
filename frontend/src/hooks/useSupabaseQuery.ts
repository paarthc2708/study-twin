import { useCallback, useEffect, useState } from 'react';

interface UseSupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

// Generic async-data hook for pages that load their data via a Supabase
// query (or a Promise.all of several). Pass a stable `queryFn` (e.g. from
// useCallback) and a deps array that should trigger a refetch when changed.
export function useSupabaseQuery<T>(queryFn: () => Promise<T>, deps: unknown[]): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((prev) => prev + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    queryFn()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refetchToken]);

  return { data, loading, error, refetch };
}
