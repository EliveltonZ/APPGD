import { Trash2 } from "lucide-react";
import { dimensaoTexto } from "../../../../utils/xmlListingAnalise";
import type { PreviewPart } from "./index";
import "../SelectedPartsTable/index.css";
import "./ImportPreviewTable.css";

interface SelectOption {
  value: string;
  label: string;
}

interface ImportPreviewTableProps {
  partes: PreviewPart[];
  falhaOptions: SelectOption[];
  ocorrenciaOptions: SelectOption[];
  onRemove: (index: number) => void;
  onChangeFalha: (index: number, value: string) => void;
  onChangeTipo: (index: number, value: string) => void;
}

// Pré-visualização do que o XML trouxe (já filtrado por Montagem/Fábrica/
// Acessórios e agrupado) — o usuário remove daqui o que não quer, e escolhe
// Falha/Ocorrência peça a peça (o XML não carrega essas duas) antes de
// confirmar. Nada entra na lista de peças de verdade até esse clique.
export function ImportPreviewTable({
  partes, falhaOptions, ocorrenciaOptions, onRemove, onChangeFalha, onChangeTipo,
}: ImportPreviewTableProps) {
  if (!partes.length) {
    return <p className="as-empty">Nenhum item no XML pra essas famílias (Montagem/Fábrica/Acessórios).</p>;
  }

  return (
    <div className="as-parts-table-wrap">
      <table className="as-parts-table">
        <thead>
          <tr>
            <th style={{ width: 48 }}>Qtd</th>
            <th style={{ minWidth: 200 }}>Descrição</th>
            <th style={{ minWidth: 100 }}>Dimensões</th>
            <th style={{ minWidth: 110 }}>Cor</th>
            <th style={{ minWidth: 160 }}>Falha *</th>
            <th style={{ minWidth: 140 }}>Ocorrência *</th>
            <th style={{ width: 44 }}></th>
          </tr>
        </thead>
        <tbody>
          {partes.map(({ item, falha, tipo }, i) => (
            <tr key={i} className={!falha || !tipo ? "ipt-row--pendente" : ""}>
              <td className="as-parts-table__num">{item.quantidade ?? "—"}</td>
              <td className="as-parts-table__peca">{item.descricao || "—"}</td>
              <td>{dimensaoTexto(item) || "—"}</td>
              <td>{item.cor || "—"}</td>
              <td>
                <select
                  className={`ipt-select${!falha ? " ipt-select--empty" : ""}`}
                  value={falha}
                  onChange={(e) => onChangeFalha(i, e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  {falhaOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  className={`ipt-select${!tipo ? " ipt-select--empty" : ""}`}
                  value={tipo}
                  onChange={(e) => onChangeTipo(i, e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  {ocorrenciaOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  className="as-table-remove"
                  onClick={() => onRemove(i)}
                  title="Remover da importação"
                  type="button"
                >
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
