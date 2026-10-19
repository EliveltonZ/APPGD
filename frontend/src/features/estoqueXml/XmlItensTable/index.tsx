import { Link2, Trash2 } from "lucide-react";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import { SearchSelect } from "../../../components/SearchSelect";
import type { SearchSelectOption } from "../../../components/SearchSelect";
import type { ItemXml } from "../../../services/estoqueXml";
import "./index.css";

export interface XmlRow extends ItemXml {
  id: string;
  // Material já casado quando a linha chegou (vínculo salvo, ou código
  // interno batendo). Linha que já chega casada não precisa reexibir o
  // seletor — é o mesmo item; só quem chega sem nada pede vínculo.
  materialIdOriginal: number | null;
}

// material/cor/espessura do XML são herdados do nó pai na árvore do Promob
// (pensado pra descrever a chapa configurada do móvel) — faz sentido só pra
// CHAPA. Pra ferragem/fita o pai costuma ser o mesmo móvel, então os valores
// vazam sem descrever a peça em si (ex.: uma bucha "herdando" material/cor
// da chapa do armário ao lado).
export function detalhesDe(row: XmlRow): string {
  if (row.tipo !== "CHAPA") return "—";
  const partes = [row.material, row.cor, row.espessura].filter(Boolean);
  return partes.length ? partes.join(" · ") : "—";
}

const TIPO_LABEL: Record<string, string> = {
  CHAPA: "Chapa",
  FITA: "Fita",
  FERRAGEM: "Ferragem",
};
const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

// Largura da coluna de material baseada na maior descrição possível entre
// as opções — sem isso, descrição de material comprida (tem material com
// mais de 80 caracteres no cadastro) fica cortada na caixa de busca.
// ~7.2px por caractere (fonte do campo) + espaço do X de limpar/seta/padding.
function larguraColunaMaterial(options: SearchSelectOption[]): number {
  const maiorLabel = options.reduce((max, o) => Math.max(max, o.label.length), 0);
  return Math.max(280, Math.round(maiorLabel * 7.2) + 70);
}

interface Props {
  rows: XmlRow[];
  materiaisOptions: SearchSelectOption[];
  loading?: boolean;
  storageKey: string;
  onTrocarMaterial: (id: string, materialId: number | null) => void;
  onVincular: (row: XmlRow) => void;
  onExcluir: (id: string) => void;
}

export function XmlItensTable({
  rows,
  materiaisOptions,
  loading,
  storageKey,
  onTrocarMaterial,
  onVincular,
  onExcluir,
}: Props) {
  const larguraMaterial = larguraColunaMaterial(materiaisOptions);
  const columns: TableColumn<XmlRow>[] = [
    {
      key: "referencia",
      label: "Referência Promob",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 160,
    },
    {
      key: "descricao",
      label: "Descrição",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 220,
    },
    {
      key: "material",
      label: "Detalhes",
      type: "text",
      filterable: true,
      minWidth: 180,
      render: (_v, row) => detalhesDe(row),
    },
    {
      key: "quantidade",
      label: "Quantidade",
      type: "number",
      sortable: true,
      minWidth: 120,
      align: "right",
      render: (v, row) =>
        `${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ${UNIDADE_LABEL[row.unidade] ?? row.unidade}`,
    },
    {
      key: "tipo",
      label: "Tipo",
      type: "text",
      sortable: true,
      filterable: true,
      minWidth: 90,
      render: (v) => TIPO_LABEL[v as string] ?? String(v),
    },
    {
      key: "materialId",
      label: "Material do cadastro",
      minWidth: larguraMaterial,
      render: (_v, row) => {
        if (row.materialIdOriginal != null) {
          // Já chegou casada (vínculo salvo ou código interno batendo) — é
          // o mesmo item, reexibir o seletor aqui não acrescenta nada.
          return <span style={{ color: "var(--text)" }}>—</span>;
        }
        return (
          <div className="xml-itens-table__material-cell">
            <SearchSelect
              options={materiaisOptions}
              value={row.materialId}
              onChange={(materialId) => onTrocarMaterial(row.id, materialId)}
              placeholder="Buscar material (nome ou código)..."
            />
            {row.materialId != null && (
              <button
                type="button"
                title="Vincular permanentemente essa referência a este material"
                className="btn-icon"
                onClick={() => onVincular(row)}
              >
                <Link2 size={14} />
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "id",
      label: "",
      minWidth: 50,
      render: (_v, row) => (
        <button
          type="button"
          title="Excluir da leitura"
          className="btn-icon"
          onClick={() => onExcluir(row.id)}
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <DataTable<XmlRow>
      columns={columns}
      data={rows}
      rowKey="id"
      loading={loading}
      storageKey={storageKey}
      showIndex
      emptyMessage="Escolha um arquivo XML do Promob para começar."
      rowClassName={(row) => (row.materialId == null ? "row-em-evidencia" : "")}
    />
  );
}
