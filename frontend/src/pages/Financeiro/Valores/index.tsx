import { useState, useMemo, useCallback } from 'react';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { FinanceiroSummary } from '../../../features/financeiro/FinanceiroSummary';
import { FinanceiroTable } from '../../../features/financeiro/FinanceiroTable';
import { useParamData } from '../../../hooks/useParamData';
import { fetchProjectValues } from '../../../services/financeiro';
import { calcSummary } from '../../../utils/financeiroUtils';
import { localDateStr } from '../../../utils/dateUtils';
import type { ProjectValue } from '../../../types/financeiro';
import './index.css';

const STORAGE_KEY = 'fin-valores-period';

function defaultDates(): { from: string; to: string } {
  const today = new Date();
  const from  = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    from: localDateStr(from),
    to:   localDateStr(today),
  };
}

function loadSavedPeriod(): { from: string; to: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const [from, to] = saved.split('|');
      if (from && to) return { from, to };
    }
  } catch { /* ignorar */ }
  return defaultDates();
}

export function FinanceiroValoresPage() {
  const initial = loadSavedPeriod();
  const [dateFrom, setDateFrom] = useState(initial.from);
  const [dateTo,   setDateTo]   = useState(initial.to);
  const [activePeriod, setActivePeriod] = useState(`${initial.from}|${initial.to}`);

  const fetchPeriod = useCallback(
    (key: string): Promise<ProjectValue[]> => {
      const [from, to] = key.split('|');
      return fetchProjectValues(from, to);
    },
    [],
  );

  const { data: projects = [], loading } = useParamData(fetchPeriod, activePeriod);

  function handleSearch() {
    const key = `${dateFrom}|${dateTo}`;
    if (key === activePeriod) return;
    try { localStorage.setItem(STORAGE_KEY, key); } catch { /* ignorar */ }
    setActivePeriod(key);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  const summary = useMemo(() => calcSummary(projects), [projects]);

  return (
    <AppLayout pageTitle="Financeiro — Valores">
      <div className="fin-page">
        <header className="fin-page__header">
          <div>
            <h1 className="fin-page__title">Valores</h1>
            {!loading && (
              <p className="fin-page__subtitle">
                {summary.count} projeto{summary.count !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="fin-period-filter">
            <span className="fin-period-filter__label">Período</span>
            <div className="fin-period-filter__fields">
              <label className="fin-period-filter__field">
                <span>De</span>
                <input
                  type="date"
                  className="fin-period-filter__input"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </label>
              <label className="fin-period-filter__field">
                <span>Até</span>
                <input
                  type="date"
                  className="fin-period-filter__input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </label>
              <button
                type="button"
                className="fin-period-filter__search"
                onClick={handleSearch}
                disabled={loading || !dateFrom || !dateTo}
              >
                Buscar
              </button>
            </div>
          </div>
        </header>

        <FinanceiroSummary summary={summary} loading={loading} />
        <FinanceiroTable data={projects} loading={loading} />
      </div>
    </AppLayout>
  );
}
