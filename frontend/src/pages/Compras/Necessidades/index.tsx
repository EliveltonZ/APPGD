import { useMemo, useState } from "react";
import { PackageX, TrendingDown, Wrench, ChevronRight, Flame, Plus, X, Send, Truck, Trash2 } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import { fetchListaCompras } from "../../../services/estoque";
import type { ListaComprasSemEstoqueItem } from "../../../services/estoque";
import { criarOrcamento } from "../../../services/solicitacaoCompras";
import {
  fetchSolicitacoesInternasPendentes,
  cancelarSolicitacaoInterna,
} from "../../../services/solicitacaoInterna";
import type { SolicitacaoInternaPendente } from "../../../services/solicitacaoInterna";
import { validateOrcamento } from "../../../validation";
import "./index.css";

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtQtd(v: number): string {
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

function fmtData(v: string): string {
  return new Date(v).toLocaleDateString("pt-BR");
}

interface CarrinhoItem {
  materialId: number;
  codigoInterno: string;
  descricao: string;
  quantidade: string;
}

interface SolicitacaoInternaGrupo {
  materialId: number;
  codigoInterno: string;
  descricao: string;
  unidadeBase: string;
  solicitacoes: SolicitacaoInternaPendente[];
}

export function ComprasNecessidadesPage() {
  const toast = useToast();
  const { data, loading } = useApiData(fetchListaCompras);
  const { data: solicitacoesInternas = [], loading: loadingInternas, refetch: refetchInternas } =
    useApiData(fetchSolicitacoesInternasPendentes);
  const semEstoque = data?.semEstoque ?? [];
  const abaixoMinimo = data?.abaixoMinimo ?? [];
  const urgentes = semEstoque.filter((item) => item.temUrgente).length;

  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [carrinho, setCarrinho] = useState<Map<number, CarrinhoItem>>(new Map());
  const [observacoes, setObservacoes] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [emitindo, setEmitindo] = useState(false);
  const [cancelandoInterna, setCancelandoInterna] = useState<SolicitacaoInternaPendente | null>(null);

  const gruposInternas = useMemo<SolicitacaoInternaGrupo[]>(() => {
    const map = new Map<number, SolicitacaoInternaGrupo>();
    for (const s of solicitacoesInternas) {
      let grupo = map.get(s.material_id);
      if (!grupo) {
        grupo = {
          materialId: s.material_id,
          codigoInterno: s.codigo_interno,
          descricao: s.material_descricao,
          unidadeBase: s.unidade_base,
          solicitacoes: [],
        };
        map.set(s.material_id, grupo);
      }
      grupo.solicitacoes.push(s);
    }
    return Array.from(map.values());
  }, [solicitacoesInternas]);

  function toggle(id: number) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function adicionarAoCarrinho(materialId: number, codigoInterno: string, descricao: string, quantidadeSugerida: number) {
    setCarrinho((prev) => {
      if (prev.has(materialId)) return prev;
      const next = new Map(prev);
      next.set(materialId, { materialId, codigoInterno, descricao, quantidade: String(quantidadeSugerida) });
      return next;
    });
  }

  function removerDoCarrinho(materialId: number) {
    setCarrinho((prev) => {
      const next = new Map(prev);
      next.delete(materialId);
      return next;
    });
  }

  function atualizarQuantidade(materialId: number, quantidade: string) {
    setCarrinho((prev) => {
      const item = prev.get(materialId);
      if (!item) return prev;
      const next = new Map(prev);
      next.set(materialId, { ...item, quantidade });
      return next;
    });
  }

  const itensCarrinho = useMemo(() => Array.from(carrinho.values()), [carrinho]);

  function handleEmitirClick() {
    const resultado = validateOrcamento(itensCarrinho);
    if (!resultado.valid) {
      toast.error(resultado.errors.itens);
      return;
    }
    setConfirmOpen(true);
  }

  async function confirmarEmissao() {
    setConfirmOpen(false);
    setEmitindo(true);
    try {
      const resultado = await criarOrcamento({
        observacoes: observacoes.trim() || null,
        itens: itensCarrinho.map((i) => ({
          material_id: i.materialId,
          quantidade: Number(i.quantidade.replace(",", ".")),
        })),
      });
      toast.success(
        `Orçamento #${resultado.id} disparado com ${resultado.totalItens} ite${resultado.totalItens === 1 ? "m" : "ns"}. Confirme a compra com o fornecedor em "Confirmar Compras".`,
      );
      setCarrinho(new Map());
      setObservacoes("");
      refetchInternas();
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao disparar orçamento."));
    } finally {
      setEmitindo(false);
    }
  }

  async function confirmarCancelamentoInterna() {
    if (!cancelandoInterna) return;
    try {
      await cancelarSolicitacaoInterna(cancelandoInterna.id);
      toast.success("Solicitação cancelada.");
      setCancelandoInterna(null);
      refetchInternas();
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao cancelar solicitação."));
    }
  }

  return (
    <AppLayout pageTitle="Necessidades de Compra">
      <div className="nec-page">
        <div className="nec-page__top">
          <div>
            <h1 className="nec-page__title">Necessidades de Compra</h1>
            <p className="nec-page__subtitle">
              Material pedido por algum projeto sem estoque em nenhuma localização, e material abaixo do
              mínimo configurado. Monte a lista de itens abaixo e dispare o orçamento — sem precisar
              identificar o fornecedor agora. Depois, em "Confirmar Compras", você decide com quem comprar
              cada item conforme a resposta de cada fornecedor.
            </p>
          </div>
        </div>

        <div className="nec-summary">
          <SummaryCard
            label="Sem estoque, bloqueando pedido"
            value={semEstoque.length}
            accent="var(--accent2, #be1e1e)"
            icon={<PackageX size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Urgente, sem estoque"
            value={urgentes}
            accent="#f97316"
            icon={<Flame size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Abaixo do mínimo"
            value={abaixoMinimo.length}
            accent="var(--iniciado)"
            icon={<TrendingDown size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Solicitações internas"
            value={gruposInternas.reduce((acc, g) => acc + g.solicitacoes.length, 0)}
            accent="#7c3aed"
            icon={<Wrench size={13} />}
            loading={loadingInternas}
          />
        </div>

        {/* ── Pedido em montagem ───────────────────────────────── */}
        <section className="nec-carrinho">
          <div className="nec-carrinho__header">
            <h2 className="nec-section__title">Orçamento em montagem</h2>
            <span className="nec-carrinho__count">
              {itensCarrinho.length} {itensCarrinho.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="nec-carrinho__obs">
            <Input
              label="Observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          {itensCarrinho.length === 0 ? (
            <p className="nec-vazio">
              Nenhum item adicionado ainda — clica no <Plus size={12} style={{ verticalAlign: "-2px" }} /> de um
              material nas listas abaixo pra adicionar aqui.
            </p>
          ) : (
            <div className="nec-carrinho__itens">
              {itensCarrinho.map((item) => (
                <div key={item.materialId} className="nec-carrinho__item">
                  <span className="nec-carrinho__item-label">
                    <strong>{item.codigoInterno}</strong> — {item.descricao}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="nec-carrinho__item-qtd"
                    value={item.quantidade}
                    onChange={(e) => atualizarQuantidade(item.materialId, e.target.value)}
                  />
                  <button
                    type="button"
                    className="nec-carrinho__item-remove"
                    onClick={() => removerDoCarrinho(item.materialId)}
                    title="Remover do pedido"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button variant="primary" loading={emitindo} onClick={handleEmitirClick} style={{ marginTop: 10 }}>
            <Send size={14} />
            Disparar Orçamento
          </Button>
        </section>

        {/* ── Sem estoque, bloqueando pedido ───────────────────── */}
        <section className="nec-section">
          <h2 className="nec-section__title">Sem estoque em nenhuma localização</h2>
          {!loading && semEstoque.length === 0 && (
            <p className="nec-vazio">Nenhum material pedido está sem estoque no momento.</p>
          )}
          <div className="nec-grupos">
            {semEstoque.map((item: ListaComprasSemEstoqueItem) => {
              const aberto = expandidos.has(item.id);
              const qtdSugerida = item.pedidos.reduce((acc, p) => acc + p.quantidade, 0);
              const noCarrinho = carrinho.has(item.id);
              return (
                <div key={item.id} className={`nec-grupo${aberto ? " nec-grupo--aberto" : ""}`}>
                  <div className="nec-grupo-header">
                    <button type="button" className="nec-grupo-trigger" onClick={() => toggle(item.id)}>
                      <ChevronRight size={14} className="nec-grupo-chevron" />
                      {item.temUrgente && (
                        <span className="nec-grupo-urgente" title="Tem pedido urgente">
                          <Flame size={13} />
                        </span>
                      )}
                      <span className="nec-grupo-label">
                        <strong>{item.codigoInterno}</strong> — {item.descricao}
                      </span>
                      {item.comprado > 0 && (
                        <span className="nec-grupo-comprado" title="Já tem pedido confirmado com fornecedor, chegando pra fábrica">
                          <Truck size={11} /> {fmtQtd(item.comprado)} {UNIDADE_LABEL[item.unidadeBase] ?? item.unidadeBase} a caminho
                        </span>
                      )}
                      <span className="nec-grupo-count">
                        {item.pedidos.length} {item.pedidos.length === 1 ? "pedido" : "pedidos"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`nec-grupo-add${noCarrinho ? " nec-grupo-add--ativo" : ""}`}
                      title={noCarrinho ? "Já está no pedido em montagem" : "Adicionar ao pedido"}
                      disabled={noCarrinho}
                      onClick={() => adicionarAoCarrinho(item.id, item.codigoInterno, item.descricao, qtdSugerida)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="nec-grupo-wrap">
                    <table className="nec-grupo-table">
                      <thead>
                        <tr>
                          <th>Pedido</th>
                          <th>Contrato</th>
                          <th>Ambiente</th>
                          <th>Cliente</th>
                          <th>Qtd</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.pedidos.map((p) => (
                          <tr key={p.ordemdecompra} className={p.urgente ? "nec-grupo-table__row--urgente" : undefined}>
                            <td>{p.ordemdecompra}</td>
                            <td>{p.contrato}</td>
                            <td>{p.ambiente}</td>
                            <td>{p.cliente ?? "—"}</td>
                            <td>{fmtQtd(p.quantidade)} {UNIDADE_LABEL[p.unidade] ?? p.unidade}</td>
                            <td>
                              {p.urgente && (
                                <span className="nec-grupo-table__urgente-badge">
                                  <Flame size={11} /> Urgente
                                </span>
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
        </section>

        {/* ── Abaixo do mínimo ─────────────────────────────────── */}
        <section className="nec-section">
          <h2 className="nec-section__title">Abaixo do estoque mínimo</h2>
          {!loading && abaixoMinimo.length === 0 && (
            <p className="nec-vazio">Nenhum material está abaixo do mínimo configurado.</p>
          )}
          {abaixoMinimo.length > 0 && (
            <table className="nec-tabela">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descrição</th>
                  <th>Saldo</th>
                  <th>Reservado</th>
                  <th>Comprado</th>
                  <th>Mínimo</th>
                  <th>Falta</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {abaixoMinimo.map((m) => {
                  const falta = Math.max(0, m.estoqueMinimoUn - m.saldoBloqueio);
                  const noCarrinho = carrinho.has(m.id);
                  return (
                    <tr key={m.id} className={m.temPedidoUrgente ? "nec-tabela__row--urgente" : undefined}>
                      <td>{m.codigoInterno}</td>
                      <td>{m.descricao}</td>
                      <td>{fmtQtd(m.saldoBloqueio)} un</td>
                      <td className={m.reservado > 0 ? "nec-tabela__reservado" : undefined}>
                        {m.reservado > 0 ? `${fmtQtd(m.reservado)} un` : "—"}
                      </td>
                      <td className={m.comprado > 0 ? "nec-tabela__comprado" : undefined}>
                        {m.comprado > 0 ? `${fmtQtd(m.comprado)} un` : "—"}
                      </td>
                      <td>{fmtQtd(m.estoqueMinimoUn)} un</td>
                      <td className="nec-tabela__falta">{fmtQtd(falta)} un</td>
                      <td>
                        {m.temPedidoUrgente && (
                          <span className="nec-grupo-table__urgente-badge">
                            <Flame size={11} /> Urgente
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`nec-grupo-add${noCarrinho ? " nec-grupo-add--ativo" : ""}`}
                          title={noCarrinho ? "Já está no pedido em montagem" : "Adicionar ao pedido"}
                          disabled={noCarrinho || falta <= 0}
                          onClick={() => adicionarAoCarrinho(m.id, m.codigoInterno, m.descricao, falta)}
                        >
                          <Plus size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* ── Solicitações internas (produção) ──────────────────── */}
        <section className="nec-section">
          <h2 className="nec-section__title">Solicitações internas da produção</h2>
          {!loadingInternas && gruposInternas.length === 0 && (
            <p className="nec-vazio">Nenhuma solicitação interna pendente no momento.</p>
          )}
          <div className="nec-grupos">
            {gruposInternas.map((grupo) => {
              const aberto = expandidos.has(-grupo.materialId);
              const qtdSugerida = grupo.solicitacoes.reduce((acc, s) => acc + s.quantidade, 0);
              const noCarrinho = carrinho.has(grupo.materialId);
              return (
                <div key={grupo.materialId} className={`nec-grupo${aberto ? " nec-grupo--aberto" : ""}`}>
                  <div className="nec-grupo-header">
                    <button type="button" className="nec-grupo-trigger" onClick={() => toggle(-grupo.materialId)}>
                      <ChevronRight size={14} className="nec-grupo-chevron" />
                      <span className="nec-grupo-label">
                        <strong>{grupo.codigoInterno}</strong> — {grupo.descricao}
                      </span>
                      <span className="nec-grupo-count">
                        {grupo.solicitacoes.length} {grupo.solicitacoes.length === 1 ? "solicitação" : "solicitações"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`nec-grupo-add${noCarrinho ? " nec-grupo-add--ativo" : ""}`}
                      title={noCarrinho ? "Já está no pedido em montagem" : "Adicionar ao pedido"}
                      disabled={noCarrinho}
                      onClick={() => adicionarAoCarrinho(grupo.materialId, grupo.codigoInterno, grupo.descricao, qtdSugerida)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="nec-grupo-wrap">
                    <table className="nec-grupo-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Responsável</th>
                          <th>Data</th>
                          <th>Qtd</th>
                          <th>Observação</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupo.solicitacoes.map((s) => (
                          <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.solicitante_login}</td>
                            <td>{fmtData(s.data_solicitacao)}</td>
                            <td>{fmtQtd(s.quantidade)} {UNIDADE_LABEL[s.unidade_base] ?? s.unidade_base}</td>
                            <td>{s.observacao ?? "—"}</td>
                            <td>
                              <button
                                type="button"
                                className="nec-grupo-add"
                                title="Cancelar esta solicitação"
                                onClick={() => setCancelandoInterna(s)}
                              >
                                <Trash2 size={13} />
                              </button>
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
        </section>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        message={`Disparar orçamento com ${itensCarrinho.length} ite${itensCarrinho.length === 1 ? "m" : "ns"}? Depois você confirma a compra, item a item, com o fornecedor que tiver.`}
        confirmLabel="Disparar"
        onConfirm={confirmarEmissao}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmModal
        isOpen={!!cancelandoInterna}
        message={
          cancelandoInterna
            ? `Cancelar a solicitação de "${cancelandoInterna.codigo_interno}" (${fmtQtd(cancelandoInterna.quantidade)} ${UNIDADE_LABEL[cancelandoInterna.unidade_base] ?? cancelandoInterna.unidade_base}), feita por ${cancelandoInterna.solicitante_login}?`
            : ""
        }
        confirmLabel="Cancelar"
        onConfirm={confirmarCancelamentoInterna}
        onCancel={() => setCancelandoInterna(null)}
      />
    </AppLayout>
  );
}
