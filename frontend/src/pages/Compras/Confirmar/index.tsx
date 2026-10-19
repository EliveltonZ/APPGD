import { useEffect, useMemo, useRef, useState } from "react";
import { ShoppingBag, ChevronRight, ListPlus, Pencil, Trash2, Plus, X, Send, Printer } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { Modal } from "../../../components/Modal";
import { Select } from "../../../components/Select";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage, getFieldErrors } from "../../../utils/errorMessage";
import { fetchFornecedores } from "../../../services/fornecedores";
import {
  fetchItensOrcamentoAbertos,
  atualizarQuantidadeOrcamento,
  cancelarItemSolicitacao,
  confirmarPedidoCompra,
} from "../../../services/solicitacaoCompras";
import type { ItemOrcamentoAberto } from "../../../services/solicitacaoCompras";
import { validateConfirmarPedido } from "../../../validation";
import "./index.css";

const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtQtd(v: number, unidade: string): string {
  return `${v.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} ${UNIDADE_LABEL[unidade] ?? unidade}`;
}

function fmtData(v: string): string {
  return new Date(v).toLocaleDateString("pt-BR");
}

interface SelecaoItem {
  itemId: number;
  codigoInterno: string;
  descricao: string;
  unidade: string;
  disponivel: number;
  quantidade: string;
}

interface OrcamentoGrupo {
  solicitacaoId: number;
  dataSolicitacao: string;
  observacoes: string | null;
  solicitanteLogin: string;
  itens: ItemOrcamentoAberto[];
}

export function ComprasConfirmarPage() {
  const toast = useToast();
  const { data: itens = [], loading, refetch } = useApiData(fetchItensOrcamentoAbertos);
  const { data: fornecedores = [] } = useApiData(fetchFornecedores);

  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [selecao, setSelecao] = useState<Map<number, SelecaoItem>>(new Map());
  const [fornecedorId, setFornecedorId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [observacoes, setObservacoes] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const [editando, setEditando] = useState<ItemOrcamentoAberto | null>(null);
  const [novaQtd, setNovaQtd] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [cancelando, setCancelando] = useState<ItemOrcamentoAberto | null>(null);

  const [printSrc, setPrintSrc] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // O relatório do orçamento carrega num iframe invisível e avisa quando
  // está pronto — abre direto o diálogo de impressão nativo (que já tem
  // preview), sem nunca abrir uma aba/página visível.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data !== "orcamento-impressao-ready" || !iframeRef.current) return;
      const win = iframeRef.current.contentWindow;
      if (!win) return;
      win.addEventListener("afterprint", () => setPrintSrc(null), { once: true });
      win.print();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function handleImprimirOrcamento(e: React.MouseEvent, solicitacaoId: number) {
    e.stopPropagation();
    setPrintSrc(`/impressao/orcamento?id=${solicitacaoId}`);
  }

  const fornecedorOptions = fornecedores
    .filter((f) => f.ativo)
    .map((f) => ({ value: f.id, label: f.nome }));

  const grupos = useMemo<OrcamentoGrupo[]>(() => {
    const map = new Map<number, OrcamentoGrupo>();
    for (const item of itens) {
      let grupo = map.get(item.solicitacao_id);
      if (!grupo) {
        grupo = {
          solicitacaoId: item.solicitacao_id,
          dataSolicitacao: item.data_solicitacao,
          observacoes: item.observacoes,
          solicitanteLogin: item.solicitante_login,
          itens: [],
        };
        map.set(item.solicitacao_id, grupo);
      }
      grupo.itens.push(item);
    }
    return Array.from(map.values());
  }, [itens]);

  function toggleGrupo(id: number) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function itemParaSelecao(item: ItemOrcamentoAberto): SelecaoItem {
    return {
      itemId: item.id,
      codigoInterno: item.codigo_interno,
      descricao: item.material_descricao,
      unidade: item.unidade_base,
      disponivel: item.quantidade,
      quantidade: String(item.quantidade),
    };
  }

  function adicionarASelecao(item: ItemOrcamentoAberto) {
    setSelecao((prev) => {
      if (prev.has(item.id)) return prev;
      const next = new Map(prev);
      next.set(item.id, itemParaSelecao(item));
      return next;
    });
  }

  // Monta o pedido em confirmação já com todos os itens deste orçamento —
  // geralmente o fornecedor não tem um item ou outro, então é mais fácil
  // tirar da seleção o que falta do que reconstruir a lista do zero.
  function adicionarGrupoInteiro(grupo: OrcamentoGrupo) {
    setSelecao((prev) => {
      const next = new Map(prev);
      for (const item of grupo.itens) {
        if (!next.has(item.id)) next.set(item.id, itemParaSelecao(item));
      }
      return next;
    });
  }

  function removerDaSelecao(itemId: number) {
    setSelecao((prev) => {
      const next = new Map(prev);
      next.delete(itemId);
      return next;
    });
  }

  function atualizarQtdSelecao(itemId: number, quantidade: string) {
    setSelecao((prev) => {
      const item = prev.get(itemId);
      if (!item) return prev;
      const next = new Map(prev);
      next.set(itemId, { ...item, quantidade });
      return next;
    });
  }

  const itensSelecionados = useMemo(() => Array.from(selecao.values()), [selecao]);

  function handleConfirmarClick() {
    const resultado = validateConfirmarPedido(fornecedorId, itensSelecionados);
    if (!resultado.valid) {
      setErrors(resultado.errors);
      if (resultado.errors.itens) toast.error(resultado.errors.itens);
      return;
    }
    setErrors({});

    for (const item of itensSelecionados) {
      const qtd = Number(item.quantidade.replace(",", "."));
      if (qtd > item.disponivel + 0.0005) {
        toast.error(`"${item.codigoInterno}": quantidade maior que a disponível (${fmtQtd(item.disponivel, item.unidade)}).`);
        return;
      }
    }
    setConfirmModalOpen(true);
  }

  async function confirmarPedido() {
    setConfirmModalOpen(false);
    setConfirmando(true);
    try {
      const resultado = await confirmarPedidoCompra({
        fornecedor_id: Number(fornecedorId),
        observacoes: observacoes.trim() || null,
        itens: itensSelecionados.map((i) => ({
          item_id: i.itemId,
          quantidade: Number(i.quantidade.replace(",", ".")),
        })),
      });
      toast.success(
        `Pedido #${resultado.id} confirmado com ${resultado.itens.length} ite${resultado.itens.length === 1 ? "m" : "ns"} pra ${resultado.itens[0]?.fornecedor_nome ?? "fornecedor"}.`,
      );
      setSelecao(new Map());
      setFornecedorId("");
      setObservacoes("");
      refetch();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      toast.error(getErrorMessage(err, "Erro ao confirmar pedido."));
    } finally {
      setConfirmando(false);
    }
  }

  function abrirEdicao(item: ItemOrcamentoAberto) {
    setEditando(item);
    setNovaQtd(String(item.quantidade));
  }

  async function salvarEdicao() {
    if (!editando) return;
    const qtd = Number(novaQtd.replace(",", "."));
    if (!qtd || qtd <= 0) {
      toast.error("Informe uma quantidade válida.");
      return;
    }
    setSalvandoEdicao(true);
    try {
      await atualizarQuantidadeOrcamento(editando.id, qtd);
      toast.success("Quantidade atualizada.");
      setEditando(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao atualizar quantidade."));
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function confirmarCancelamento() {
    if (!cancelando) return;
    try {
      await cancelarItemSolicitacao(cancelando.id);
      toast.success("Item cancelado.");
      removerDaSelecao(cancelando.id);
      setCancelando(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao cancelar item."));
    }
  }

  return (
    <AppLayout pageTitle="Confirmar Compras">
      <div className="conf-page">
        <div className="conf-page__top">
          <div>
            <h1 className="conf-page__title">Confirmar Compras</h1>
            <p className="conf-page__subtitle">
              Orçamentos ainda sem fornecedor confirmado. Adicione o orçamento inteiro ao pedido em
              confirmação e remova só o que o fornecedor não tiver — é mais rápido do que selecionar item a
              item. Ajuste a quantidade de quem for parcial, escolha o fornecedor e confirme: o restante de
              cada item continua em aberto pra outro fornecedor.
            </p>
          </div>
        </div>

        <div className="conf-summary">
          <SummaryCard
            label="Itens aguardando confirmação"
            value={itens.length}
            accent="var(--iniciado)"
            icon={<ShoppingBag size={13} />}
            loading={loading}
          />
        </div>

        {/* ── Pedido em confirmação ─────────────────────────────── */}
        <section className="conf-carrinho">
          <div className="conf-carrinho__header">
            <h2 className="conf-section__title">Pedido em confirmação</h2>
            <span className="conf-carrinho__count">
              {itensSelecionados.length} {itensSelecionados.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="conf-carrinho__form">
            <Select
              label="Fornecedor que confirmou *"
              options={fornecedorOptions}
              value={fornecedorId}
              onChange={(e) => {
                setFornecedorId(e.target.value);
                if (errors.fornecedorId) setErrors((prev) => ({ ...prev, fornecedorId: "" }));
              }}
              placeholder="Selecione..."
              error={errors.fornecedorId}
            />
            <Input
              label="Observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          {itensSelecionados.length === 0 ? (
            <p className="conf-vazio">
              Nenhum item selecionado ainda — clica no <ListPlus size={12} style={{ verticalAlign: "-2px" }} />{" "}
              de um orçamento abaixo pra trazer todos os itens dele pra aqui.
            </p>
          ) : (
            <div className="conf-carrinho__itens">
              {itensSelecionados.map((item) => (
                <div key={item.itemId} className="conf-carrinho__item">
                  <span className="conf-carrinho__item-label">
                    <strong>{item.codigoInterno}</strong> — {item.descricao}
                    <span className="conf-carrinho__item-disponivel">
                      {" "}
                      (disponível: {fmtQtd(item.disponivel, item.unidade)})
                    </span>
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="conf-carrinho__item-qtd"
                    value={item.quantidade}
                    onChange={(e) => atualizarQtdSelecao(item.itemId, e.target.value)}
                  />
                  <button
                    type="button"
                    className="conf-carrinho__item-remove"
                    onClick={() => removerDaSelecao(item.itemId)}
                    title="Remover da seleção — fornecedor não tem este item"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button variant="primary" loading={confirmando} onClick={handleConfirmarClick} style={{ marginTop: 10 }}>
            <Send size={14} />
            Confirmar Pedido
          </Button>
        </section>

        {/* ── Orçamentos em aberto, agrupados ───────────────────── */}
        <section className="conf-section">
          <h2 className="conf-section__title">Orçamentos em aberto</h2>
          {!loading && grupos.length === 0 && (
            <p className="conf-vazio">Nenhum orçamento aguardando confirmação de fornecedor.</p>
          )}
          <div className="conf-grupos">
            {grupos.map((grupo) => {
              const aberto = expandidos.has(grupo.solicitacaoId);
              return (
                <div key={grupo.solicitacaoId} className={`conf-grupo${aberto ? " conf-grupo--aberto" : ""}`}>
                  <div className="conf-grupo-header">
                    <button type="button" className="conf-grupo-trigger" onClick={() => toggleGrupo(grupo.solicitacaoId)}>
                      <ChevronRight size={14} className="conf-grupo-chevron" />
                      <span className="conf-grupo-label">
                        Orçamento #{grupo.solicitacaoId} — {fmtData(grupo.dataSolicitacao)}, por{" "}
                        {grupo.solicitanteLogin}
                        {grupo.observacoes && <span className="conf-grupo-obs"> · {grupo.observacoes}</span>}
                      </span>
                      <span className="conf-grupo-count">
                        {grupo.itens.length} {grupo.itens.length === 1 ? "item" : "itens"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="conf-grupo-print"
                      title="Imprimir orçamento pra enviar aos fornecedores"
                      onClick={(e) => handleImprimirOrcamento(e, grupo.solicitacaoId)}
                    >
                      <Printer size={14} />
                    </button>
                    <button
                      type="button"
                      className="conf-grupo-add"
                      title="Adicionar todos os itens deste orçamento ao pedido em confirmação"
                      onClick={() => adicionarGrupoInteiro(grupo)}
                    >
                      <ListPlus size={15} />
                    </button>
                  </div>

                  <div className="conf-grupo-wrap">
                    <table className="conf-grupo-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Descrição</th>
                          <th>Qtd. em orçamento</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupo.itens.map((item) => {
                          const jaSelecionado = selecao.has(item.id);
                          return (
                            <tr key={item.id}>
                              <td>{item.codigo_interno}</td>
                              <td>{item.material_descricao}</td>
                              <td>{fmtQtd(item.quantidade, item.unidade_base)}</td>
                              <td>
                                <div className="conf-actions">
                                  <button
                                    type="button"
                                    className={`conf-action-btn${jaSelecionado ? " conf-action-btn--ativo" : ""}`}
                                    title={jaSelecionado ? "Já está no pedido em confirmação" : "Adicionar este item"}
                                    disabled={jaSelecionado}
                                    onClick={() => adicionarASelecao(item)}
                                  >
                                    <Plus size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className="conf-action-btn"
                                    title="Editar quantidade"
                                    onClick={() => abrirEdicao(item)}
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className="conf-action-btn"
                                    title="Cancelar item"
                                    onClick={() => setCancelando(item)}
                                  >
                                    <Trash2 size={13} />
                                  </button>
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
        </section>
      </div>

      <Modal
        title="Editar quantidade"
        isOpen={!!editando}
        onClose={() => setEditando(null)}
        maxWidth={380}
        footer={
          <div className="cad-modal-footer">
            <div className="cad-modal-footer__right">
              <Button variant="ghost" size="sm" onClick={() => setEditando(null)} disabled={salvandoEdicao}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" loading={salvandoEdicao} onClick={salvarEdicao}>
                Salvar
              </Button>
            </div>
          </div>
        }
      >
        {editando && (
          <div className="cad-modal-body">
            <p className="conf-modal__info">
              <strong>{editando.codigo_interno}</strong> — {editando.material_descricao}
            </p>
            <div className="pfield">
              <label>Quantidade em orçamento</label>
              <input
                type="text"
                inputMode="decimal"
                className="conf-modal__qtd-input"
                value={novaQtd}
                onChange={(e) => setNovaQtd(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmModalOpen}
        message={`Confirmar pedido com ${itensSelecionados.length} ite${itensSelecionados.length === 1 ? "m" : "ns"} pra "${fornecedorOptions.find((f) => String(f.value) === fornecedorId)?.label ?? ""}"?`}
        confirmLabel="Confirmar"
        onConfirm={confirmarPedido}
        onCancel={() => setConfirmModalOpen(false)}
      />

      <ConfirmModal
        isOpen={!!cancelando}
        message={
          cancelando
            ? `Cancelar o item "${cancelando.codigo_interno}" (${fmtQtd(cancelando.quantidade, cancelando.unidade_base)}) deste orçamento?`
            : ""
        }
        confirmLabel="Cancelar item"
        onConfirm={confirmarCancelamento}
        onCancel={() => setCancelando(null)}
      />

      {printSrc && (
        <iframe
          ref={iframeRef}
          src={printSrc}
          title="impressao"
          style={{ position: "fixed", top: "-9999px", left: "-9999px", width: "210mm", height: "297mm", border: "none" }}
        />
      )}
    </AppLayout>
  );
}
