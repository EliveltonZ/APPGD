import { useState } from "react";
import { Boxes, MapPin } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { DataTable } from "../../../components/DataTable";
import type { TableColumn } from "../../../components/DataTable";
import { Modal } from "../../../components/Modal";
import { useApiData } from "../../../hooks/useApiData";
import { fetchSaldoPorMaterial, fetchSaldoPorLocalizacoes } from "../../../services/estoque";
import type { SaldoMaterial, SaldoLocalizacaoItem } from "../../../services/estoque";
import { getErrorMessage } from "../../../utils/errorMessage";
import "./index.css";

// `unidadeBase` é a unidade de CÁLCULO DO PROJETO (m²/m/un no XML) — não a
// unidade de controle de estoque. Chapa e fita são controladas em UN
// (chapa inteira, rolo inteiro) igual a ferragem; só o consumo do projeto é
// calculado em m²/m. Por isso os saldos abaixo são sempre "un", e esta
// coluna serve só pra identificar o tipo do material.
const TIPO_LABEL: Record<string, string> = { M2: "Chapa", M: "Fita", UN: "Ferragem" };

function fmtQtd(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function abaixoDoMinimo(row: SaldoMaterial): boolean {
  return row.estoqueMinimoUn != null && row.estoqueMinimoUn > 0 && row.saldoBloqueio <= row.estoqueMinimoUn;
}

export function AlmoxarifadoEstoquePage() {
  const { data: materiais = [], loading } = useApiData(fetchSaldoPorMaterial);

  const [detalhe, setDetalhe] = useState<SaldoMaterial | null>(null);
  const [localizacoes, setLocalizacoes] = useState<SaldoLocalizacaoItem[]>([]);
  const [loadingLocalizacoes, setLoadingLocalizacoes] = useState(false);
  const [erroLocalizacoes, setErroLocalizacoes] = useState<string | null>(null);
  const [somenteAbaixoMinimo, setSomenteAbaixoMinimo] = useState(false);

  const comEstoque = materiais.filter((m) => m.fisico > 0).length;
  const abaixoMinimo = materiais.filter(abaixoDoMinimo).length;
  const materiaisExibidos = somenteAbaixoMinimo ? materiais.filter(abaixoDoMinimo) : materiais;

  async function abrirDetalhe(material: SaldoMaterial) {
    setDetalhe(material);
    setLocalizacoes([]);
    setErroLocalizacoes(null);
    setLoadingLocalizacoes(true);
    try {
      setLocalizacoes(await fetchSaldoPorLocalizacoes(material.id));
    } catch (err) {
      setErroLocalizacoes(getErrorMessage(err, "Erro ao carregar localizações."));
    } finally {
      setLoadingLocalizacoes(false);
    }
  }

  const columns: TableColumn<SaldoMaterial>[] = [
    { key: "codigoInterno", label: "Código", type: "text", sortable: true, filterable: true, minWidth: 90 },
    { key: "descricao", label: "Descrição", type: "text", sortable: true, filterable: true, minWidth: 240 },
    {
      key: "unidadeBase",
      label: "Tipo",
      type: "text",
      align: "center",
      minWidth: 80,
      render: (v) => TIPO_LABEL[String(v)] ?? String(v),
    },
    {
      key: "fisico",
      label: "Físico (un)",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 110,
      render: (v) => fmtQtd(Number(v)),
    },
    {
      key: "reservado",
      label: "Reservado (un)",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 120,
      render: (v) => fmtQtd(Number(v)),
    },
    {
      key: "disponivel",
      label: "Disponível (un)",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 120,
      render: (v) => fmtQtd(Number(v)),
    },
    {
      key: "comprado",
      label: "Comprado (un)",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 120,
      render: (v) => fmtQtd(Number(v)),
    },
    {
      key: "saldoBloqueio",
      label: "Saldo (un)",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 110,
      render: (v, row) => (
        <span className={abaixoDoMinimo(row) ? "estq-saldo--baixo" : undefined}>
          {fmtQtd(Number(v))}
        </span>
      ),
    },
    {
      key: "estoqueMinimoUn",
      label: "Mínimo (un)",
      type: "number",
      sortable: true,
      align: "right",
      minWidth: 100,
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
              que falta dar baixa. Controle sempre em unidade inteira (chapa
              e fita incluídas) — m²/m é só o cálculo de consumo do projeto.
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
          <button
            type="button"
            className={`estq-summary__filtro${somenteAbaixoMinimo ? " estq-summary__filtro--ativo" : ""}`}
            onClick={() => setSomenteAbaixoMinimo((v) => !v)}
            title={somenteAbaixoMinimo ? "Clique pra ver todos os materiais" : "Clique pra ver só os abaixo do mínimo"}
          >
            <SummaryCard
              label="Abaixo do mínimo"
              value={abaixoMinimo}
              accent="var(--accent2, #be1e1e)"
              icon={<Boxes size={13} />}
              loading={loading}
            />
          </button>
        </div>

        {somenteAbaixoMinimo && (
          <p className="estq-page__subtitle">
            Mostrando só os {materiaisExibidos.length} material(is) abaixo do mínimo configurado.{" "}
            <button type="button" className="estq-link" onClick={() => setSomenteAbaixoMinimo(false)}>
              Ver todos
            </button>
          </p>
        )}

        <DataTable
          columns={columns}
          data={materiaisExibidos}
          rowKey="id"
          loading={loading}
          storageKey="almoxarifado-estoque-saldo"
          emptyMessage={somenteAbaixoMinimo ? "Nenhum material abaixo do mínimo." : "Nenhum material ativo cadastrado."}
          onRowClick={abrirDetalhe}
        />
      </div>

      <Modal
        title="Onde está o material"
        isOpen={!!detalhe}
        onClose={() => setDetalhe(null)}
      >
        {detalhe && (
          <div className="estq-detalhe">
            <p className="estq-detalhe__material">
              <strong>{detalhe.codigoInterno}</strong> — {detalhe.descricao}
            </p>

            {loadingLocalizacoes && <p className="estq-detalhe__msg">Carregando...</p>}
            {erroLocalizacoes && <p className="estq-detalhe__msg estq-detalhe__msg--erro">{erroLocalizacoes}</p>}

            {!loadingLocalizacoes && !erroLocalizacoes && (
              localizacoes.length === 0 ? (
                <p className="estq-detalhe__msg">
                  Sem saldo físico em nenhuma localização — tem {fmtQtd(detalhe.fisico)} un no total, mas não bate
                  localização nenhuma (pode ter sido lançado direto sem endereçamento).
                </p>
              ) : (
                <>
                  <p className="estq-detalhe__msg">
                    Em {localizacoes.length} {localizacoes.length === 1 ? "localização" : "localizações"}:
                  </p>
                  <ul className="estq-detalhe__lista">
                    {localizacoes.map((l) => (
                      <li key={l.localizacao_id} className="estq-detalhe__item">
                        <span className="estq-detalhe__item__local">
                          <MapPin size={13} />
                          <strong>{l.codigo}</strong>
                          {l.descricao && <span className="estq-detalhe__item__desc">— {l.descricao}</span>}
                        </span>
                        <span className="estq-detalhe__item__saldo">{fmtQtd(l.saldo)} un</span>
                      </li>
                    ))}
                  </ul>
                </>
              )
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
