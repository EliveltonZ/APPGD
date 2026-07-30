import { useState, useEffect, useRef } from 'react';

export interface ParamDataResult<T> {
  data:    T | undefined;
  loading: boolean;
  error:   string | null;
  reload:  () => void;
}

/**
 * Fetch automático disparado quando `param` muda.
 * param = null suspende o fetch (útil enquanto o valor inicial ainda está carregando).
 *
 * Uso:
 *   const { data = [], loading } = useParamData(fetchAssistencias, filterDate);
 *
 * Para múltiplos parâmetros, serialize em string:
 *   const key = `${from}|${to}`;
 *   const { data } = useParamData(key => fetchValues(...key.split('|')), key);
 */
export function useParamData<T>(
  fetchFn: (param: string) => Promise<T>,
  param: string | null,
): ParamDataResult<T> {
  const ref = useRef(fetchFn);
  const [data,    setData]    = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    if (param === null) return;
    let alive = true;
    setLoading(true);
    setError(null);
    ref.current(param)
      .then(d => { if (alive) { setData(d); setError(null); } })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : 'Erro ao carregar'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [param, tick]);

  return { data, loading, error, reload: () => setTick(t => t + 1) };
}
