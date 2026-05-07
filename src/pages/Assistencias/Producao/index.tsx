import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { AssistanceProductionFilters } from '../../../features/assistencias/producao/AssistanceProductionFilters';
import { AssistanceProductionSummaryCards } from '../../../features/assistencias/producao/AssistanceProductionSummaryCards';
import { AssistanceProductionTable } from '../../../features/assistencias/producao/AssistanceProductionTable';
import { AssistanceProductionModal } from '../../../features/assistencias/producao/AssistanceProductionModal';
import { useApiData } from '../../../hooks/useApiData';
import { fetchAssistencias } from '../../../services/assistenciaProducao';
import type {
  AssistanceProduction,
  AssistanceFilters,
  AssistanceSummary,
} from '../../../types/assistenciaProducao';
import './index.css';

const DEFAULT_FILTERS: AssistanceFilters = {
  search: '',
  prazoDias: '',
  status: 'all',
  urgente: 'all',
};

function applyFilters(data: AssistanceProduction[], f: AssistanceFilters): AssistanceProduction[] {
  return data.filter((row) => {
    if (f.search) {
      const q = f.search.toLowerCase();
      const hit =
        row.numSolicitacao.toLowerCase().includes(q) ||
        row.numContrato.toLowerCase().includes(q) ||
        row.corte.toLowerCase().includes(q) ||
        row.cliente.toLowerCase().includes(q) ||
        row.ambiente.toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (f.prazoDias !== '' && row.prazoDias <= Number(f.prazoDias)) return false;
    if (f.status !== 'all' && row.status !== f.status) return false;
    if (f.urgente === 'sim' && !row.urgente) return false;
    if (f.urgente === 'nao' && row.urgente) return false;
    return true;
  });
}

function calcSummary(data: AssistanceProduction[]): AssistanceSummary {
  return {
    total:       data.length,
    emAberto:    data.filter((r) => r.status === 'em_aberto').length,
    iniciadas:   data.filter((r) => r.status === 'iniciado').length,
    prontas:     data.filter((r) => r.status === 'pronto').length,
    semMaterial: data.filter((r) => r.status === 'sem_material').length,
    entregues:   data.filter((r) => r.status === 'entregue').length,
  };
}

export function AssistenciasProducaoPage() {
  const { data: fetched, loading } = useApiData(fetchAssistencias);
  const [data, setData] = useState<AssistanceProduction[]>([]);
  const [filters, setFilters] = useState<AssistanceFilters>(DEFAULT_FILTERS);
  const [editing, setEditing] = useState<AssistanceProduction | null>(null);

  useEffect(() => {
    if (fetched) setData(fetched);
  }, [fetched]);

  const filtered = useMemo(() => applyFilters(data, filters), [data, filters]);
  const summary  = useMemo(() => calcSummary(data), [data]);

  function handleRowClick(row: AssistanceProduction) { setEditing({ ...row }); }
  function handleClose() { setEditing(null); }

  function handleChange<K extends keyof AssistanceProduction>(key: K, value: AssistanceProduction[K]) {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : null));
  }

  function handleSave() {
    if (!editing) return;
    setData((prev) => prev.map((r) => (r.id === editing.id ? editing : r)));
    setEditing(null);
  }

  const count = filtered.length;
  const total  = data.length;

  return (
    <AppLayout pageTitle="Assistências — Produção">
      <div className="acp-page">
        <header className="acp-page__header">
          <div>
            <h1 className="acp-page__title">Controle de Assistências — Produção</h1>
            {!loading && (
              <p className="acp-page__subtitle">
                {count} assistência{count !== 1 ? 's' : ''} exibida{count !== 1 ? 's' : ''}
                {total !== count && ` de ${total}`}
              </p>
            )}
          </div>
        </header>

        <AssistanceProductionSummaryCards summary={summary} loading={loading} />
        <AssistanceProductionFilters filters={filters} onChange={setFilters} />
        <AssistanceProductionTable data={filtered} loading={loading} onRowClick={handleRowClick} />
      </div>

      {editing && (
        <AssistanceProductionModal
          isOpen
          onClose={handleClose}
          data={editing}
          onChange={handleChange}
          onSave={handleSave}
        />
      )}
    </AppLayout>
  );
}