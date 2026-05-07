import { DollarSign, Tag, Package, TrendingUp, Percent } from 'lucide-react';
import { SummaryCard } from '../../../components/SummaryCard';
import type { FinancialSummary } from '../../../types/financeiro';
import { getMarginStatus, formatBRL, formatPct } from '../../../utils/financeiroUtils';
import './index.css';

interface SummaryProps {
  summary: FinancialSummary;
  loading?: boolean;
}

const MARGIN_ACCENT: Record<string, string> = {
  healthy:  '#16a34a',
  medium:   '#ca8a04',
  low:      '#ea580c',
  negative: '#dc2626',
};

export function FinanceiroSummary({ summary, loading }: SummaryProps) {
  const margemStatus = getMarginStatus(summary.margemMedia);
  const lucroBrutoPositive = summary.totalLucroBruto >= 0;

  return (
    <div className="fin-summary">
      <SummaryCard
        label="Valor Bruto Total"
        value={formatBRL(summary.totalBruto)}
        accent="var(--accent)"
        icon={<DollarSign size={13} />}
        secondary={`${summary.count} projeto${summary.count !== 1 ? 's' : ''}`}
        loading={loading}
      />
      <SummaryCard
        label="Valor Negociado Total"
        value={formatBRL(summary.totalNegociado)}
        accent="#0891b2"
        icon={<Tag size={13} />}
        secondary={
          !loading && summary.totalBruto > 0
            ? `Desc. médio: ${formatPct(((summary.totalBruto - summary.totalNegociado) / summary.totalBruto) * 100)}`
            : undefined
        }
        loading={loading}
      />
      <SummaryCard
        label="Custo de Material Total"
        value={formatBRL(summary.totalMaterial)}
        accent="#d97706"
        icon={<Package size={13} />}
        secondary={
          !loading && summary.totalNegociado > 0
            ? `${formatPct((summary.totalMaterial / summary.totalNegociado) * 100)} do negociado`
            : undefined
        }
        loading={loading}
      />
      <SummaryCard
        label="Lucro Bruto Total"
        value={formatBRL(summary.totalLucroBruto)}
        accent={lucroBrutoPositive ? '#16a34a' : '#dc2626'}
        icon={<TrendingUp size={13} />}
        loading={loading}
      />
      <SummaryCard
        label="Margem Média"
        value={formatPct(summary.margemMedia)}
        accent={MARGIN_ACCENT[margemStatus]}
        icon={<Percent size={13} />}
        loading={loading}
      />
    </div>
  );
}