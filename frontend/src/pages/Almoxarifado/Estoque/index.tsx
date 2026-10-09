import { Boxes } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import { useApiData } from "../../../hooks/useApiData";
import { fetchSaldoPorMaterial } from "../../../services/estoque";
import type { SaldoMaterial } from "../../../services/estoque";
import "./index.css";

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtQtd(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function abaixoDoMinimo(row: SaldoMaterial): boolean {
  return row.estoqueMinimoUn != null && row.estoqueMinimoUn > 0 && row.saldoBloqueio <= row.estoqueMinimoUn;
}

export function AlmoxarifadoEstoquePage() {
  const { data: materiais = [], loading } = useApiData(fetchSaldoPorMaterial);

  const comEstoque = materiais.filter((m) => m.fisico > 0).length;
  const abaixoMinimo = materiais.filter(abaixoDoMinimo).length;

  const columns: TableColumn<SaldoMaterial>[] = [
    { key: "codigoInterno", label: "Código", type: "text", sortable: true, filterable: true, minWidth: 90 },
    { key: "descricao", label: "Descrição", type: "text", sortable: true, filterable: true, minWidth: 240 },
    {
      key: "unidadeBase",
      label: "Un.",
      type: "text",
      align: "center",
      minWidth: 60,
      render: (v) => UNIDADE_LABEL[String(v)] ?? String(v),
    },
    {
      key: "fisico",
      label: "Físico",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 100,
      render: (v) => fmtQtd(Number(v)),
    },
    {
      key: "reservado",
      label: "Reservado",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 100,
      render: (v) => fmtQtd(Number(v)),
    },
    {
      key: "disponivel",
      label: "Disponível",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 100,
      render: (v) => fmtQtd(Number(v)),
    },
    {
      key: "comprado",
      label: "Comprado",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 100,
      render: (v) => fmtQtd(Number(v)),
    },
    {
      key: "saldoBloqueio",
      label: "Saldo",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 100,
      render: (v, row) => (
        <span className={abaixoDoMinimo(row) ? "estq-saldo--baixo" : undefined}>
          {fmtQtd(Number(v))}
        </span>
      ),
    },
    {
      key: "estoqueMinimoUn",
      label: "Mínimo",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 90,
      render: (v) => (v != null ? fmtQtd(Number(v)) : "—"),
    },
  ];

  return (
    <AppLayout pageTitle="Estoque">
      <div className="estq-page">
        <div className="estq-page__top">
          <div>
            <h1 className="estq-page__title">Estoque</h1>
            <p className="estq-page__subtitle">
              Saldo real por material — o que você efetivamente tem, não o
              que falta dar baixa.
            </p>
          </div>
        </div>

        <div className="estq-summary">
          <SummaryCard
            label="Materiais cadastrados"
            value={materiais.length}
            accent="var(--text-h)"
            icon={<Boxes size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Com saldo físico"
            value={comEstoque}
            accent="var(--iniciado)"
            icon={<Boxes size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Abaixo do mínimo"
            value={abaixoMinimo}
            accent="var(--accent2, #be1e1e)"
            icon={<Boxes size={13} />}
            loading={loading}
          />
        </div>

        <DataTable
          columns={columns}
          data={materiais}
          rowKey="id"
          loading={loading}
          storageKey="almoxarifado-estoque-saldo"
          emptyMessage="Nenhum material ativo cadastrado."
        />
      </div>
    </AppLayout>
  );
}
