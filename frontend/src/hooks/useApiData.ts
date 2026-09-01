// ── Hook genérico para busca de dados assíncrona ─────────────────────────────
// Encapsula o padrão fetch + loading + error + cleanup.
// Uso:
//   const { data, loading, error, refetch } = useApiData(fetchAssistencias);
//
// - Executa `fetchFn` uma vez na montagem do componente
// - `refetch()` pode ser chamado manualmente para recarregar
// - Um `callId` crescente garante que só a resposta da chamada mais recente
//   (montagem ou refetch) atualiza o estado — uma resposta antiga que chega
//   depois de uma mais nova (ou depois de desmontar) é ignorada
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
  const callId = useRef(0);
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function execute() {
    const id = ++callId.current;
    setLoading(true);
    setError(null);
    ref.current()
      .then(d  => { if (id === callId.current) { setData(d); setError(null); } })
      .catch(e => { if (id === callId.current) setError(e instanceof Error ? e.message : 'Erro ao carregar dados'); })
      .finally(() => { if (id === callId.current) setLoading(false); });
  }

  // Executado na montagem. Incrementar callId no cleanup invalida qualquer
  // fetch ainda em andamento (equivalente ao antigo `alive = false`).
  useEffect(() => {
    execute();
    return () => { callId.current++; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, refetch: execute };
}