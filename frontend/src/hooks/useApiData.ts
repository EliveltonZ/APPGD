// ── Hook genérico para busca de dados assíncrona ─────────────────────────────
// Encapsula o padrão fetch + loading + error + cleanup.
// Uso:
//   const { data, loading, error, refetch } = useApiData(fetchAssistencias);
//
// - Executa `fetchFn` uma vez na montagem do componente
// - `refetch()` pode ser chamado manualmente para recarregar
// - O flag `alive` evita atualizar o estado após o componente ser desmontado
// - A `ref` interna garante que trocar a referência de `fetchFn` não cause re-execução

import { useState, useEffect, useRef } from 'react';

export interface ApiDataResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiData<T>(fetchFn: () => Promise<T>): ApiDataResult<T> {
  // Guarda a função atual sem causar re-render quando ela muda de referência
  const ref = useRef(fetchFn);
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Executado pelo refetch() manual (sem cleanup de desmontagem necessário aqui)
  function run() {
    setLoading(true);
    setError(null);
    ref.current()
      .then(d  => { setData(d); setError(null); })
      .catch(e => setError(e instanceof Error ? e.message : 'Erro ao carregar dados'))
      .finally(() => setLoading(false));
  }

  // Executado na montagem. O cleanup `alive = false` evita setState em componente desmontado.
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