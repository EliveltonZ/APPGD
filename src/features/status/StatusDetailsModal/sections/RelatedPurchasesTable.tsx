import { CheckCircle2, Clock } from 'lucide-react'
import type { StatusRelatedPurchase } from '../../../../types/status'

function fmtDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

interface RelatedPurchasesTableProps {
  compras: StatusRelatedPurchase[]
}

export function RelatedPurchasesTable({ compras }: RelatedPurchasesTableProps) {
  if (compras.length === 0) {
    return <p className="plan-modal__empty">Nenhuma compra cadastrada.</p>
  }

  return (
    <div className="plan-modal__purchases-wrap">
      <table className="plan-modal__purchases-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Medida</th>
            <th>Qtd</th>
            <th>Compra</th>
            <th>Previsão</th>
            <th>Recebido</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((c) => (
            <tr key={c.id}>
              <td>{c.descricao}</td>
              <td>{c.medida}</td>
              <td>{c.qtd}</td>
              <td>{fmtDate(c.compra)}</td>
              <td>{fmtDate(c.previsao)}</td>
              <td>
                {c.recebido ? (
                  <span className="plan-modal__recebido plan-modal__recebido--ok">
                    <CheckCircle2 size={11} style={{ marginRight: 3 }} />
                    Recebido
                  </span>
                ) : (
                  <span className="plan-modal__recebido plan-modal__recebido--pending">
                    <Clock size={11} style={{ marginRight: 3 }} />
                    Pendente
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
