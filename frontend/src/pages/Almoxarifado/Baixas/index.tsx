import { useEffect, useMemo, useRef, useState } from "react";
import { PackageCheck, Undo2, Boxes, FolderOpen, ChevronRight, Printer } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { SummaryCard } from "../../../components/SummaryCard";
import { BaixaModal } from "../../../features/pending/PendingControlModal/sections/BaixaModal";
import { useApiData } from "../../../hooks/useApiData";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorMessage";
import {
  fetchProntoParaBaixa,
  liberarReserva as apiLiberarReserva,
  darBaixa as apiDarBaixa,
} from "../../../services/estoque";
import type { EstoquePendenteItem, BaixaSplit } from "../../../services/estoque";
import { PEND_STATUS_LABELS } from "../../../data/pendingConfig";
import "./index.css";

const TIPO_LABEL: Record<string, string> = { CHAPA: "Chapa", FITA: "Fita", FERRAGEM: "Ferragem" };
const UNIDADE_LABEL: Record<string, string> = { M2: "m²", M: "m", UN: "un" };

function fmtQtd(item: EstoquePendenteItem): string {
  const base = `${item.quantidade.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ${UNIDADE_LABEL[item.unidade] ?? item.unidade}`;
  // Ferragem (un) e fita (m, estoque controlado em metro) já são a própria
  // quantidade a reservar/baixar — só chapa (m²) precisa da conversão pra
  // "quantas chapas inteiras", por isso só ela mostra o "· X un" extra.
  if (item.unidade !== "M2") return base;
  const un = item.qtdUnConfirmada != null ? `${item.qtdUnConfirmada} un` : "— un";
  return `${base} · ${un}`;
}

interface ProjetoGrupo {
  ordemdecompra: number;
  contrato: string;
  ambiente: string;
  cliente: string | null;
  itens: EstoquePendenteItem[];
}

function agruparPorProjeto(itens: EstoquePendenteItem[]): ProjetoGrupo[] {
  const mapa = new Map<number, ProjetoGrupo>();
  for (const item of itens) {
    let grupo = mapa.get(item.ordemdecompra);
    if (!grupo) {
      grupo = {
        ordemdecompra: item.ordemdecompra,
        contrato: item.contrato,
        ambiente: item.ambiente,
        cliente: item.cliente,
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

export function AlmoxarifadoBaixasPage() {
  const toast = useToast();
  const { data: itens = [], loading, refetch } = useApiData(fetchProntoParaBaixa);

  const [baixaItem, setBaixaItem] = useState<EstoquePendenteItem | null>(null);
  const [acting, setActing] = useState(false);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [printSrc, setPrintSrc] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const grupos = useMemo(() => agruparPorProjeto(itens), [itens]);

  // A lista de separação carrega num iframe invisível e avisa quando está
  // pronta ("lista-separacao-ready") — abre direto o diálogo de impressão
  // nativo (que já tem preview) sem nunca abrir uma aba/página visível.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data !== "lista-separacao-ready" || !iframeRef.current) return;
      const win = iframeRef.current.contentWindow;
      if (!win) return;
      win.addEventListener("afterprint", () => setPrintSrc(null), { once: true });
      win.print();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function toggleGrupo(ordemdecompra: number) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(ordemdecompra)) next.delete(ordemdecompra);
      else next.add(ordemdecompra);
      return next;
    });
  }

  function handleImprimir(e: React.MouseEvent, ordemdecompra: number) {
    e.stopPropagation();
    setPrintSrc(`/impressao/lista-separacao?ordemdecompra=${ordemdecompra}`);
  }

  async function handleLiberar(item: EstoquePendenteItem) {
    try {
      await apiLiberarReserva(item.id);
      await refetch();
      toast.success("Reserva liberada.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao liberar reserva."));
    }
  }

  async function handleBaixaConfirm(splits: BaixaSplit[]) {
    if (!baixaItem) return;
    setActing(true);
    try {
      await apiDarBaixa(baixaItem.id, splits);
      await refetch();
      toast.success("Baixa registrada.");
      setBaixaItem(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Erro ao dar baixa."));
    } finally {
      setActing(false);
    }
  }

  return (
    <AppLayout pageTitle="Baixas">
      <div className="baix-page">
        <div className="baix-page__top">
          <div>
            <h1 className="baix-page__title">Baixas</h1>
            <p className="baix-page__subtitle">
              Fila de baixa do almoxarifado, agrupada por projeto — tudo que já está reservado, ou
              pendente de material sem controle de estoque mínimo (que não precisa de reserva prévia).
            </p>
          </div>
        </div>

        <div className="baix-summary">
          <SummaryCard
            label="Projetos"
            value={grupos.length}
            accent="var(--text-h)"
            icon={<FolderOpen size={13} />}
            loading={loading}
          />
          <SummaryCard
            label="Itens prontos para baixa"
            value={itens.length}
            accent="var(--iniciado)"
            icon={<Boxes size={13} />}
            loading={loading}
          />
        </div>

        {!loading && grupos.length === 0 && (
          <p className="baix-vazio">Nenhum item pronto para baixa no momento.</p>
        )}

        <div className="baix-grupos">
          {grupos.map((grupo) => {
            const aberto = expandidos.has(grupo.ordemdecompra);
            return (
              <div key={grupo.ordemdecompra} className={`baix-grupo${aberto ? " baix-grupo--aberto" : ""}`}>
                <div className="baix-grupo-header">
                  <button
                    type="button"
                    className="baix-grupo-trigger"
                    onClick={() => toggleGrupo(grupo.ordemdecompra)}
                  >
                    <ChevronRight size={14} className="baix-grupo-chevron" />
                    <span className="baix-grupo-label">
                      <strong>{grupo.ordemdecompra}</strong> — Contrato {grupo.contrato} · {grupo.ambiente}
                      {grupo.cliente ? ` (${grupo.cliente})` : ""}
                    </span>
                    <span className="baix-grupo-count">
                      {grupo.itens.length} {grupo.itens.length === 1 ? "item" : "itens"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="baix-grupo-print"
                    title="Imprimir lista de separação"
                    onClick={(e) => handleImprimir(e, grupo.ordemdecompra)}
                  >
                    <Printer size={13} />
                  </button>
                </div>

                <div className="baix-grupo-wrap">
                  <table className="baix-grupo-table">
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
                      {grupo.itens.map((item) => (
                        <tr key={item.id}>
                          <td>{item.codigoInterno}</td>
                          <td>{item.descricao}</td>
                          <td>{item.detalhes || "—"}</td>
                          <td className="baix-grupo-table__center">{TIPO_LABEL[item.tipo] ?? item.tipo}</td>
                          <td className="baix-grupo-table__center">{fmtQtd(item)}</td>
                          <td>
                            <span className={`baix-badge baix-badge--${item.status.toLowerCase()}`}>
                              {PEND_STATUS_LABELS[item.status] ?? item.status}
                            </span>
                          </td>
                          <td className="baix-grupo-table__center">
                            <div className="baix-actions">
                              <button
                                type="button"
                                className="baix-action-btn"
                                title="Dar baixa"
                                onClick={() => setBaixaItem(item)}
                              >
                                <PackageCheck size={13} />
                              </button>
                              {item.status === "RESERVADO" && (
                                <button
                                  type="button"
                                  className="baix-action-btn"
                                  title="Liberar reserva"
                                  onClick={() => handleLiberar(item)}
                                >
                                  <Undo2 size={13} />
                                </button>
                              )}
                            </div>
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

      <BaixaModal
        item={baixaItem}
        saving={acting}
        onClose={() => setBaixaItem(null)}
        onConfirm={handleBaixaConfirm}
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
