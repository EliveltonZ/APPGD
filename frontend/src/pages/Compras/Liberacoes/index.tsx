import { useMemo, useState } from "react";
import { Hash, Unlock, Undo2, Boxes, FolderOpen, ChevronRight, Layers } from "lucide-react";
import { Button } from "../../../components/Button";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { DefinirQuantidadeModal } from "../../../features/pending/PendingControlModal/sections/DefinirQuantidadeModal";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import {
  fetchPendentesLiberados,
  definirQuantidade as apiDefinirQuantidade,
  liberar as apiLiberar,
  liberarPedido as apiLiberarPedido,
  liberarLote as apiLiberarLote,
  cancelarLiberacao as apiCancelarLiberacao,
} from "../../../services/estoque";
import type { PendenteLiberadoItem } from "../../../services/estoque";
import type { PendingItem } from "../../../types/pending";
import { PEND_STATUS_LABELS } from "../../../data/pendingConfig";
import "./index.css";

const TIPO_LABEL: Record<string, string> = { CHAPA: "Chapa", FITA: "Fita", FERRAGEM: "Ferragem" };
const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtQtd(item: PendenteLiberadoItem): string {
  const base = `${item.quantidade.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ${UNIDADE_LABEL[item.unidade] ?? item.unidade}`;
  if (item.unidade !== "M2") return base;
  const un = item.qtdUnConfirmada != null ? `${item.qtdUnConfirmada} un` : "— un";
  return `${base} · ${un}`;
}

interface ProjetoGrupo {
  ordemdecompra: number;
  contrato: string;
  ambiente: string;
  cliente: string | null;
  lote: number | null;
  itens: PendenteLiberadoItem[];
}

function agruparPorProjeto(itens: PendenteLiberadoItem[]): ProjetoGrupo[] {
  const mapa = new Map<number, ProjetoGrupo>();
  for (const item of itens) {
    let grupo = mapa.get(item.ordemdecompra);
    if (!grupo) {
      grupo = {
        ordemdecompra: item.ordemdecompra,
        contrato: item.contrato,
        ambiente: item.ambiente,
        cliente: item.cliente,
        lote: item.lote,
        itens: [],
      };
      mapa.set(item.ordemdecompra, grupo);
    }
    grupo.itens.push(item);
  }
  return Array.from(mapa.values()).sort(
    (a, b) => a.contrato.localeCompare(b.contrato) || a.ambiente.localeCompare(b.ambiente),
  );
}

export function ComprasLiberacoesPage() {
  const toast = useToast();
  const { data: itens = [], loading, refetch } = useApiData(fetchPendentesLiberados);

  const [qtdModalItem, setQtdModalItem] = useState<PendingItem | null>(null);
  const [acting, setActing] = useState(false);
  const [loteLoading, setLoteLoading] = useState<number | null>(null);
  const [pedidoLoading, setPedidoLoading] = useState<number | null>(null);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

  const grupos = useMemo(() => agruparPorProjeto(itens), [itens]);
  const totalLiberado = itens.filter((i) => i.status === "LIBERADO").length;

  function toggleGrupo(ordemdecompra: number) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(ordemdecompra)) next.delete(ordemdecompra);
      else next.add(ordemdecompra);
      return next;
    });
  }

  async function handleDefinirQuantidadeConfirm(qtdUnConfirmada: number) {
    if (!qtdModalItem) return;
    setActing(true);
    try {
      await apiDefinirQuantidade(qtdModalItem.id, qtdUnConfirmada);
      await refetch();
      toast.success("Quantidade definida.");
      setQtdModalItem(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao definir quantidade."));
    } finally {
      setActing(false);
    }
  }

  async function handleLiberar(item: PendenteLiberadoItem) {
    try {
      await apiLiberar(item.id);
      await refetch();
      toast.success("Item liberado.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao liberar."));
    }
  }

  async function handleCancelarLiberacao(item: PendenteLiberadoItem) {
    try {
      await apiCancelarLiberacao(item.id);
      await refetch();
      toast.success("Liberação cancelada.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao cancelar liberação."));
    }
  }

  async function handleLiberarPedido(e: React.MouseEvent, ordemdecompra: number) {
    e.stopPropagation();
    setPedidoLoading(ordemdecompra);
    try {
      const resumo = await apiLiberarPedido(ordemdecompra);
      await refetch();
      if (resumo.totalItens === 0) {
        toast.error("Nenhum item pronto pra liberar nesse pedido (chapa/fita ainda sem quantidade definida).");
        return;
      }
      toast.success(`${resumo.resultados.filter((r) => r.ok).length} item(ns) liberado(s).`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao liberar o pedido."));
    } finally {
      setPedidoLoading(null);
    }
  }

  async function handleLiberarLote(e: React.MouseEvent, lote: number) {
    e.stopPropagation();
    setLoteLoading(lote);
    try {
      const resumo = await apiLiberarLote(lote);
      await refetch();
      if (resumo.totalItens === 0) {
        toast.error(`Nenhum item pronto pra liberar no lote ${lote}.`);
        return;
      }
      toast.success(`Lote ${lote}: ${resumo.resultados.filter((r) => r.ok).length} item(ns) liberado(s).`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao liberar o lote."));
    } finally {
      setLoteLoading(null);
    }
  }

  return (
    <AppLayout pageTitle="Liberações">
      <div className="lib-page">
        <div className="lib-page__top">
          <div>
            <h1 className="lib-page__title">Liberações</h1>
            <p className="lib-page__subtitle">
              Todo pedido em aberto com material ainda pendente ou já liberado — libera aqui, sem
              depender da fila de baixa do almoxarifado.
            </p>
          </div>
        </div>

        <div className="lib-summary">
          <SummaryCard
            label="Projetos"
            value={grupos.length}
            accent="var(--text-h)"
            icon={<FolderOpen size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Itens liberados"
            value={totalLiberado}
            accent="var(--iniciado)"
            icon={<Boxes size={13} />}
            loading={loading}
          />
        </div>

        {!loading && grupos.length === 0 && (
          <p className="lib-vazio">Nenhum pedido em aberto com item pendente ou liberado.</p>
        )}

        <div className="lib-grupos">
          {grupos.map((grupo) => {
            const aberto = expandidos.has(grupo.ordemdecompra);
            return (
              <div key={grupo.ordemdecompra} className={`lib-grupo${aberto ? " lib-grupo--aberto" : ""}`}>
                <div className="lib-grupo-header">
                  <button
                    type="button"
                    className="lib-grupo-trigger"
                    onClick={() => toggleGrupo(grupo.ordemdecompra)}
                  >
                    <ChevronRight size={14} className="lib-grupo-chevron" />
                    <span className="lib-grupo-label">
                      <strong>{grupo.ordemdecompra}</strong> — Contrato {grupo.contrato} · {grupo.ambiente}
                      {grupo.cliente ? ` (${grupo.cliente})` : ""}
                    </span>
                    <span className="lib-grupo-count">
                      {grupo.itens.length} {grupo.itens.length === 1 ? "item" : "itens"}
                    </span>
                  </button>
                  <div className="lib-grupo-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={pedidoLoading === grupo.ordemdecompra}
                      onClick={(e) => handleLiberarPedido(e, grupo.ordemdecompra)}
                    >
                      <Unlock size={13} />
                      Liberar pedido
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={!!grupo.lote && loteLoading === grupo.lote}
                      disabled={!grupo.lote}
                      title={!grupo.lote ? "Este pedido não tem lote definido" : undefined}
                      onClick={(e) => grupo.lote && handleLiberarLote(e, grupo.lote)}
                    >
                      <Layers size={13} />
                      Liberar lote{grupo.lote ? ` (${grupo.lote})` : ""}
                    </Button>
                  </div>
                </div>

                <div className="lib-grupo-wrap">
                  <table className="lib-grupo-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Descrição</th>
                        <th>Detalhes</th>
                        <th>Tipo</th>
                        <th>Qtd</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.itens.map((item) => {
                        const precisaQtd = item.unidade === "M2" && item.qtdUnConfirmada == null;
                        return (
                          <tr key={item.id}>
                            <td>{item.codigoInterno}</td>
                            <td>{item.descricao}</td>
                            <td>{item.detalhes || "—"}</td>
                            <td className="lib-grupo-table__center">{TIPO_LABEL[item.tipo] ?? item.tipo}</td>
                            <td className="lib-grupo-table__center">{fmtQtd(item)}</td>
                            <td>
                              <span className={`lib-badge lib-badge--${item.status.toLowerCase()}`}>
                                {PEND_STATUS_LABELS[item.status] ?? item.status}
                              </span>
                            </td>
                            <td className="lib-grupo-table__center">
                              <div className="lib-actions">
                                {item.status === "PENDENTE" && precisaQtd && (
                                  <button
                                    type="button"
                                    className="lib-action-btn"
                                    title="Definir quantidade em UN antes de liberar"
                                    onClick={() => setQtdModalItem(item)}
                                  >
                                    <Hash size={13} />
                                  </button>
                                )}
                                {item.status === "PENDENTE" && !precisaQtd && (
                                  <button
                                    type="button"
                                    className="lib-action-btn"
                                    title="Liberar"
                                    onClick={() => handleLiberar(item)}
                                  >
                                    <Unlock size={13} />
                                  </button>
                                )}
                                {item.status === "LIBERADO" && (
                                  <button
                                    type="button"
                                    className="lib-action-btn"
                                    title="Cancelar liberação"
                                    onClick={() => handleCancelarLiberacao(item)}
                                  >
                                    <Undo2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DefinirQuantidadeModal
        item={qtdModalItem}
        saving={acting}
        onClose={() => setQtdModalItem(null)}
        onConfirm={handleDefinirQuantidadeConfirm}
      />
    </AppLayout>
  );
}
