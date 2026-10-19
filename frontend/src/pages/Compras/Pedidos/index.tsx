import { useMemo, useState } from "react";
import { Truck, Clock, CheckCircle2, XCircle, ChevronRight, Trash2 } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import { fetchPedidos, cancelarItemSolicitacao } from "../../../services/solicitacaoCompras";
import type { PedidoItem, PedidoStatus } from "../../../services/solicitacaoCompras";
import "./index.css";

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

const STATUS_LABEL: Record<PedidoStatus, string> = {
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const STATUS_FILTROS: Array<{ value: PedidoStatus | "TODOS"; label: string }> = [
  { value: "TODOS", label: "Todos" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
];

function fmtQtd(v: number, unidade: string): string {
  return `${v.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} ${UNIDADE_LABEL[unidade] ?? unidade}`;
}

function fmtData(v: string): string {
  return new Date(v).toLocaleDateString("pt-BR");
}

interface PedidoGrupo {
  solicitacaoId: number;
  dataSolicitacao: string;
  observacoes: string | null;
  solicitanteLogin: string;
  fornecedorNome: string;
  itens: PedidoItem[];
}

export function ComprasPedidosPage() {
  const toast = useToast();
  const { data: itens = [], loading, refetch } = useApiData(fetchPedidos);

  const [filtro, setFiltro] = useState<PedidoStatus | "TODOS">("TODOS");
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [cancelando, setCancelando] = useState<PedidoItem | null>(null);

  const contagem = useMemo(() => {
    const c: Record<PedidoStatus, number> = { EM_ANDAMENTO: 0, CONCLUIDO: 0, CANCELADO: 0 };
    for (const item of itens) c[item.status]++;
    return c;
  }, [itens]);

  const itensFiltrados = useMemo(
    () => (filtro === "TODOS" ? itens : itens.filter((i) => i.status === filtro)),
    [itens, filtro],
  );

  const grupos = useMemo<PedidoGrupo[]>(() => {
    const map = new Map<number, PedidoGrupo>();
    for (const item of itensFiltrados) {
      let grupo = map.get(item.solicitacao_id);
      if (!grupo) {
        grupo = {
          solicitacaoId: item.solicitacao_id,
          dataSolicitacao: item.data_solicitacao,
          observacoes: item.observacoes,
          solicitanteLogin: item.solicitante_login,
          fornecedorNome: item.fornecedor_nome,
          itens: [],
        };
        map.set(item.solicitacao_id, grupo);
      }
      grupo.itens.push(item);
    }
    return Array.from(map.values());
  }, [itensFiltrados]);

  function toggleGrupo(id: number) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function confirmarCancelamento() {
    if (!cancelando) return;
    try {
      await cancelarItemSolicitacao(cancelando.id);
      toast.success("Item de pedido cancelado.");
      setCancelando(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao cancelar item."));
    }
  }

  return (
    <AppLayout pageTitle="Pedidos de Compra">
      <div className="ped-page">
        <div className="ped-page__top">
          <div>
            <h1 className="ped-page__title">Pedidos de Compra</h1>
            <p className="ped-page__subtitle">
              Todo item já confirmado com um fornecedor. Fica "em andamento" até a nota fiscal de entrada
              vincular esse item (aí vira "concluído"), ou até ser cancelado — por exemplo quando o
              fornecedor não entrega.
            </p>
          </div>
        </div>

        <div className="ped-summary">
          <SummaryCard
            label="Em andamento"
            value={contagem.EM_ANDAMENTO}
            accent="var(--iniciado)"
            icon={<Clock size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Concluídos"
            value={contagem.CONCLUIDO}
            accent="#16a34a"
            icon={<CheckCircle2 size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Cancelados"
            value={contagem.CANCELADO}
            accent="var(--text-muted)"
            icon={<XCircle size={13} />}
            loading={loading}
          />
        </div>

        <div className="ped-filtros">
          {STATUS_FILTROS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`ped-filtro-chip${filtro === f.value ? " ped-filtro-chip--ativo" : ""}`}
              onClick={() => setFiltro(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!loading && grupos.length === 0 && (
          <p className="ped-vazio">Nenhum pedido encontrado pra este filtro.</p>
        )}

        <div className="ped-grupos">
          {grupos.map((grupo) => {
            const aberto = expandidos.has(grupo.solicitacaoId);
            return (
              <div key={grupo.solicitacaoId} className={`ped-grupo${aberto ? " ped-grupo--aberto" : ""}`}>
                <button type="button" className="ped-grupo-trigger" onClick={() => toggleGrupo(grupo.solicitacaoId)}>
                  <ChevronRight size={14} className="ped-grupo-chevron" />
                  <Truck size={13} className="ped-grupo-icon" />
                  <span className="ped-grupo-label">
                    Pedido #{grupo.solicitacaoId} — <strong>{grupo.fornecedorNome}</strong> —{" "}
                    {fmtData(grupo.dataSolicitacao)}, por {grupo.solicitanteLogin}
                    {grupo.observacoes && <span className="ped-grupo-obs"> · {grupo.observacoes}</span>}
                  </span>
                  <span className="ped-grupo-count">
                    {grupo.itens.length} {grupo.itens.length === 1 ? "item" : "itens"}
                  </span>
                </button>

                <div className="ped-grupo-wrap">
                  <table className="ped-grupo-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.itens.map((item) => (
                        <tr key={item.id}>
                          <td>{item.codigo_interno}</td>
                          <td>{item.material_descricao}</td>
                          <td>{fmtQtd(item.quantidade, item.unidade_base)}</td>
                          <td>
                            <span className={`ped-status-badge ped-status-badge--${item.status.toLowerCase()}`}>
                              {STATUS_LABEL[item.status]}
                            </span>
                          </td>
                          <td>
                            {item.status === "EM_ANDAMENTO" && (
                              <button
                                type="button"
                                className="ped-action-btn"
                                title="Cancelar item"
                                onClick={() => setCancelando(item)}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!cancelando}
        message={
          cancelando
            ? `Cancelar o item "${cancelando.codigo_interno}" (${fmtQtd(cancelando.quantidade, cancelando.unidade_base)}) deste pedido? Use quando o fornecedor não for entregar.`
            : ""
        }
        confirmLabel="Cancelar item"
        onConfirm={confirmarCancelamento}
        onCancel={() => setCancelando(null)}
      />
    </AppLayout>
  );
}
