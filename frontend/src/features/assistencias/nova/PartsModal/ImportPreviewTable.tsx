import { Trash2 } from "lucide-react";
import { dimensaoTexto } from "../../../../utils/xmlListingAnalise";
import type { ItemAnaliseComCor } from "../../../../utils/xmlListingAnalise";
import "../SelectedPartsTable/index.css";

interface ImportPreviewTableProps {
  itens: ItemAnaliseComCor[];
  onRemove: (index: number) => void;
}

// Pré-visualização do que o XML trouxe (já filtrado por Montagem/Fábrica e
// agrupado) — o usuário remove daqui o que não quer antes de confirmar;
// nada entra na lista de peças de verdade até o clique em "Confirmar".
export function ImportPreviewTable({ itens, onRemove }: ImportPreviewTableProps) {
  if (!itens.length) {
    return <p className="as-empty">Nenhum item no XML pra essa família (Montagem/Fábrica).</p>;
  }

  return (
    <div className="as-parts-table-wrap">
      <table className="as-parts-table">
        <thead>
          <tr>
            <th style={{ width: 48 }}>Qtd</th>
            <th style={{ minWidth: 220 }}>Descrição</th>
            <th style={{ minWidth: 110 }}>Dimensões</th>
            <th style={{ minWidth: 120 }}>Cor</th>
            <th style={{ minWidth: 90 }}>Família</th>
            <th style={{ width: 44 }}></th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, i) => (
            <tr key={i}>
              <td className="as-parts-table__num">{item.quantidade ?? "—"}</td>
              <td className="as-parts-table__peca">{item.descricao || "—"}</td>
              <td>{dimensaoTexto(item) || "—"}</td>
              <td>{item.cor || "—"}</td>
              <td>{item.familia || "—"}</td>
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
