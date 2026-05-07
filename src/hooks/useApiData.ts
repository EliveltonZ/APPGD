import { useState, useEffect, useRef } from 'react';

export interface ApiDataResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiData<T>(fetchFn: () => Promise<T>): ApiDataResult<T> {
  const ref = useRef(fetchFn);
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function run() {
    setLoading(true);
    setError(null);
    ref.current()
      .then(d  => { setData(d); setError(null); })
      .catch(e => setError(e instanceof Error ? e.message : 'Erro ao carregar dados'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    let alive = true;
    setLoading(true);
    ref.current()
      .then(d  => { if (alive) { setData(d); setError(null); } })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : 'Erro ao carregar dados'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return { data, loading, error, refetch: run };
}