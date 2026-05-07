import { useMemo, useState } from 'react';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { FinanceiroSummary } from '../../../features/financeiro/FinanceiroSummary';
import { FinanceiroTable } from '../../../features/financeiro/FinanceiroTable';
import { useApiData } from '../../../hooks/useApiData';
import { fetchProjectValues } from '../../../services/financeiro';
import { calcSummary } from '../../../utils/financeiroUtils';
import './index.css';

export function FinanceiroValoresPage() {
  const { data: projects = [], loading } = useApiData(fetchProjectValues);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]   = useState('');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (dateFrom && p.data < dateFrom) return false;
      if (dateTo   && p.data > dateTo)   return false;
      return true;
    });
  }, [projects, dateFrom, dateTo]);

  const summary = useMemo(() => calcSummary(filtered), [filtered]);

  return (
    <AppLayout pageTitle="Financeiro — Valores">
      <div className="fin-page">
        <header className="fin-page__header">
          <div>
            <h1 className="fin-page__title">Valores</h1>
            {!loading && (
              <p className="fin-page__subtitle">
                {summary.count} projeto{summary.count !== 1 ? 's' : ''}
                {(dateFrom || dateTo) && ` · ${projects.length} no total`}
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
                />
              </label>
              <label className="fin-period-filter__field">
                <span>Até</span>
                <input
                  type="date"
                  className="fin-period-filter__input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </label>
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  className="fin-period-filter__clear"
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </header>

        <FinanceiroSummary summary={summary} loading={loading} />
        <FinanceiroTable data={filtered} loading={loading} />
      </div>
    </AppLayout>
  );
}