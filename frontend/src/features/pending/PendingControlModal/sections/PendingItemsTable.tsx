import { Hash, Unlock, PackageCheck, Trash2, Undo2 } from "lucide-react";
import { PEND_STATUS_LABELS } from "../../../../data/pendingConfig";
import type { PendingItem } from "../../../../types/pending";

interface Props {
  items: PendingItem[];
  onDefinirQuantidade: (item: PendingItem) => void;
  onLiberar: (item: PendingItem) => void;
  onCancelarLiberacao: (item: PendingItem) => void;
  onBaixa: (item: PendingItem) => void;
  onDelete: (id: number) => void;
}

const TIPO_LABEL: Record<string, string> = { CHAPA: "Chapa", FITA: "Fita", FERRAGEM: "Ferragem" };
const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };
const ORIGEM_LABEL: Record<string, string> = { XML: "XML", MANUAL: "Manual" };

function fmtQtd(item: PendingItem): string {
  const base = `${item.quantidade.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ${UNIDADE_LABEL[item.unidade] ?? item.unidade}`;
  // Ferragem (un) e fita (m, estoque controlado em metro) já são a própria
  // quantidade a liberar — só chapa (m²) precisa da conversão pra "quantas
  // chapas inteiras", por isso só ela mostra o "· X un" extra.
  if (item.unidade !== "M2") return base;
  const un = item.qtdUnConfirmada != null ? `${item.qtdUnConfirmada} un` : "— un";
  return `${base} · ${un}`;
}

export function PendingItemsTable({
  items,
  onDefinirQuantidade,
  onLiberar,
  onCancelarLiberacao,
  onBaixa,
  onDelete,
}: Props) {
  return (
    <div className="pend-items-table-wrapper">
      <table className="pend-items-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Detalhes</th>
            <th className="pend-th--center">Tipo</th>
            <th className="pend-th--center">Qtd</th>
            <th className="pend-th--center">Origem</th>
            <th>Status</th>
            <th className="pend-th--actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={8} className="pend-items-table__empty">
                Nenhum item lançado.
              </td>
            </tr>
          )}
          {items.map((item) => {
            const precisaQtd = item.unidade === "M2" && item.qtdUnConfirmada == null;
            const podeExcluir = item.origem === "MANUAL" && item.status === "PENDENTE";
            return (
              <tr key={item.id} className="pend-items-row">
                <td className="pend-td--nowrap">{item.codigoInterno || "—"}</td>
                <td className="pend-td--desc">{item.descricao || "—"}</td>
                <td className="pend-td--nowrap">{item.detalhes || "—"}</td>
                <td className="pend-td--center">{TIPO_LABEL[item.tipo] ?? item.tipo}</td>
                <td className="pend-td--center">{fmtQtd(item)}</td>
                <td className="pend-td--center">{ORIGEM_LABEL[item.origem] ?? item.origem}</td>
                <td>
                  <span className={`pend-badge pend-badge--${item.status.toLowerCase()}`}>
                    {PEND_STATUS_LABELS[item.status]}
                  </span>
                </td>
                <td className="pend-td--actions">
                  {item.status === "PENDENTE" && precisaQtd && (
                    <button
                      type="button"
                      className="pend-action-btn"
                      title="Definir quantidade em UN antes de liberar"
                      onClick={() => onDefinirQuantidade(item)}
                    >
                      <Hash size={13} />
                    </button>
                  )}
                  {item.status === "PENDENTE" && !precisaQtd && (
                    <button
                      type="button"
                      className="pend-action-btn"
                      title="Liberar"
                      onClick={() => onLiberar(item)}
                    >
                      <Unlock size={13} />
                    </button>
                  )}
                  {item.status === "LIBERADO" && (
                    <>
                      <button
                        type="button"
                        className="pend-action-btn"
                        title="Dar baixa"
                        onClick={() => onBaixa(item)}
                      >
                        <PackageCheck size={13} />
                      </button>
                      <button
                        type="button"
                        className="pend-action-btn"
                        title="Cancelar liberação"
                        onClick={() => onCancelarLiberacao(item)}
                      >
                        <Undo2 size={13} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="pend-action-btn pend-action-btn--delete"
                    onClick={() => onDelete(item.id)}
                    title={
                      item.origem === "XML"
                        ? "Item veio do XML — não pode ser excluído por aqui"
                        : item.status !== "PENDENTE"
                          ? "Só é possível excluir item pendente"
                          : "Excluir"
                    }
                    disabled={!podeExcluir}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
