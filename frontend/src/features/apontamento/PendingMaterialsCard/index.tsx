import { Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { fmtDate } from '../../../utils/dateUtils';
import { localDateStr } from '../../../utils/dateUtils';
import type { PendingMaterial } from '../types';
import './index.css';

type MaterialStatus = 'recebido' | 'pendente' | 'atrasado';

function materialStatus(m: PendingMaterial): MaterialStatus {
  if (m.recebido) return 'recebido';
  if (m.previsao && m.previsao < localDateStr()) return 'atrasado';
  return 'pendente';
}

const STATUS_CONFIG = {
  recebido: { label: 'Recebido', icon: CheckCircle2, cls: 'recebido' },
  pendente: { label: 'Pendente', icon: Clock,        cls: 'pendente' },
  atrasado: { label: 'Atrasado', icon: AlertCircle,  cls: 'atrasado' },
} as const;

interface Props {
  materiais: PendingMaterial[];
}

export function PendingMaterialsCard({ materiais }: Props) {
  const counts = {
    recebido: materiais.filter(m => materialStatus(m) === 'recebido').length,
    pendente: materiais.filter(m => materialStatus(m) === 'pendente').length,
    atrasado: materiais.filter(m => materialStatus(m) === 'atrasado').length,
  };

  return (
    <div className="apt-mat">
      <div className="apt-mat__header">
        <div className="apt-mat__title-wrap">
          <Package size={15} />
          <h3 className="apt-mat__title">Materiais</h3>
        </div>
        <div className="apt-mat__counts">
          {counts.recebido > 0 && (
            <span className="apt-mat__count apt-mat__count--recebido">{counts.recebido} recebido{counts.recebido !== 1 ? 's' : ''}</span>
          )}
          {counts.pendente > 0 && (
            <span className="apt-mat__count apt-mat__count--pendente">{counts.pendente} pendente{counts.pendente !== 1 ? 's' : ''}</span>
          )}
          {counts.atrasado > 0 && (
            <span className="apt-mat__count apt-mat__count--atrasado">{counts.atrasado} atrasado{counts.atrasado !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <div className="apt-mat__scroll">
        <table className="apt-mat__table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th className="apt-mat__th--num">Qtd</th>
              <th className="apt-mat__th--apt">Previsão</th>
              <th className="apt-mat__th--apt">Recebido</th>
              <th className="apt-mat__th--apt">Status</th>
            </tr>
          </thead>
          <tbody>
            {materiais.map(m => {
              const st = materialStatus(m);
              const { label, icon: Icon, cls } = STATUS_CONFIG[st];
              return (
                <tr key={m.id} className={`apt-mat__tr apt-mat__tr--${cls}`}>
                  <td>
                    <div className="apt-mat__desc">
                      <span className="apt-mat__cat">{m.categoria}</span>
                      {m.descricao}
                    </div>
                  </td>
                  <td className="apt-mat__td--num">
                    {m.qtd} <span className="apt-mat__medida">{m.medida}</span>
                  </td>
                  <td className="apt-mat__td--apt">{fmtDate(m.previsao) || '—'}</td>
                  <td className="apt-mat__td--apt">{fmtDate(m.recebido) || '—'}</td>
                  <td className="apt-mat__td--apt">
                    <span className={`apt-mat__badge apt-mat__badge--${cls}`}>
                      <Icon size={12} />
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
