import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchMaquinas,
  fetchTipos,
  fetchPedidoInfo,
  fetchParadaAberta,
  iniciarParada,
  finalizarParada,
  fetchTodasParadas,
  editarParada,
  fetchHistorico,
  type Maquina,
  type TipoReq,
  type PedidoInfo,
  type ParadaAberta,
  type ParadaRow,
  type HistoricoRow,
  type EditarParadaPayload,
} from "../../../services/paradas";
import "./Paradas.css";

function fmtDt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function toInputDt(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

function duracao(inicio: string | null, fim: string | null) {
  if (!inicio) return "—";
  const end = fim ? new Date(fim) : new Date();
  const min = Math.round((end.getTime() - new Date(inicio).getTime()) / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60),
    m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const CAMPO_LABEL: Record<string, string> = {
  pedido: "Pedido",
  data_inicio: "Início",
  data_fim: "Fim",
  id_maquina: "Máquina",
};

type PendingAction = "iniciar" | "finalizar" | null;

export function ParadasPage() {
  const { user } = useAuth();
  const { success: toastOk, error: toastErr } = useToast();

  const isOperador = user?.permissions.paradas_maquina ?? false;
  const isAdmin = user?.permissions.paradas_admin ?? false;

  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [tipos, setTipos] = useState<TipoReq[]>([]);
  const [paradas, setParadas] = useState<ParadaRow[]>([]);

  // ── Form (operador) ──────────────────────────────────────────────────────
  const [tipoId, setTipoId] = useState("");
  const [pedidoInput, setPedidoInput] = useState("");
  const [pedidoInfo, setPedidoInfo] = useState<PedidoInfo | null>(null);
  const [pedidoErr, setPedidoErr] = useState("");
  const [maquinaId, setMaquinaId] = useState("");
  const [paradaAberta, setParadaAberta] = useState<ParadaAberta | null>(null);
  const [maquinaBloqueada, setMaquinaBloqueada] = useState("");

  const [saving, setSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  // ── Filtros da tabela ────────────────────────────────────────────────────
  const [filtroMaquina, setFiltroMaquina] = useState("");
  const [filtroDe, setFiltroDe] = useState("");
  const [filtroAte, setFiltroAte] = useState("");

  // ── Modal edição (admin) ─────────────────────────────────────────────────
  const [editando, setEditando] = useState<ParadaRow | null>(null);
  const [editForm, setEditForm] = useState<EditarParadaPayload>({});
  const [editSaving, setEditSaving] = useState(false);

  // ── Modal histórico (admin) ──────────────────────────────────────────────
  const [historico, setHistorico] = useState<HistoricoRow[]>([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [histParada, setHistParada] = useState<ParadaRow | null>(null);

  // ── Carga inicial ────────────────────────────────────────────────────────
  const carregarBase = useCallback(async () => {
    const promises: [Promise<Maquina[]>, Promise<TipoReq[]>] = [
      fetchMaquinas(),
      fetchTipos(),
    ];
    const [m, t] = await Promise.all(promises);
    setMaquinas(m);
    setTipos(t);
  }, []);

  const carregarParadas = useCallback(async () => {
    const rows = await fetchTodasParadas({
      id_maquina: filtroMaquina ? Number(filtroMaquina) : undefined,
      data_inicio_de: filtroDe ? `${filtroDe}T00:00:00` : undefined,
      data_inicio_ate: filtroAte ? `${filtroAte}T23:59:59` : undefined,
    });
    setParadas(rows);
  }, [filtroMaquina, filtroDe, filtroAte]);

  useEffect(() => {
    carregarBase().catch(() => toastErr("Erro ao carregar máquinas e tipos."));
  }, [carregarBase]);
  useEffect(() => {
    carregarParadas().catch(() => toastErr("Erro ao carregar paradas."));
  }, [carregarParadas]);

  // ── Handlers do form ─────────────────────────────────────────────────────
  async function handlePedidoBlur() {
    setPedidoInfo(null);
    setPedidoErr("");
    const num = pedidoInput.trim();
    if (!tipoId || !num) return;
    if (isNaN(Number(num))) {
      setPedidoErr("Pedido inválido");
      return;
    }
    const info = await fetchPedidoInfo(Number(tipoId), Number(num));
    if (info) setPedidoInfo(info);
    else setPedidoErr("Pedido não encontrado");
  }

  async function handleMaquinaChange(id: string) {
    if (maquinaBloqueada) return;
    setMaquinaId(id);
    setParadaAberta(null);
    if (!id) return;
    setParadaAberta(await fetchParadaAberta(Number(id)));
  }

  function handleTipoChange(id: string) {
    if (maquinaBloqueada) return;
    setTipoId(id);
    setPedidoInput("");
    setPedidoInfo(null);
    setPedidoErr("");
  }

  const formBloqueado = maquinaBloqueada !== "";
  const formValido =
    tipoId !== "" &&
    pedidoInput.trim() !== "" &&
    pedidoInfo !== null &&
    maquinaId !== "";
  const podeIniciar = formValido && !paradaAberta && !formBloqueado;
  const podeFinalizar =
    maquinaId !== "" &&
    paradaAberta !== null &&
    (maquinaBloqueada === "" || maquinaId === maquinaBloqueada);

  // ── Execuções ────────────────────────────────────────────────────────────
  async function confirmarIniciar() {
    setPendingAction(null);
    setSaving(true);
    try {
      await iniciarParada({
        pedido: Number(pedidoInput),
        id_maquina: Number(maquinaId),
        id_tipo: Number(tipoId),
      });
      toastOk("Parada iniciada com sucesso!");
      setMaquinaBloqueada(maquinaId);
    } catch (e: unknown) {
      toastErr((e as Error).message ?? "Erro ao iniciar parada");
      setSaving(false);
      return;
    }
    // Refreshes silenciosos — não afetam o feedback da operação
    fetchParadaAberta(Number(maquinaId))
      .then(setParadaAberta)
      .catch(() => {});
    carregarParadas().catch(() => {});
    setSaving(false);
  }

  async function confirmarFinalizar() {
    if (maquinaBloqueada && maquinaId !== maquinaBloqueada) {
      toastErr("Finalize a parada da máquina que você iniciou nesta sessão");
      setPendingAction(null);
      return;
    }
    setPendingAction(null);
    setSaving(true);
    try {
      await finalizarParada(Number(maquinaId));
      toastOk("Parada finalizada com sucesso!");
      setMaquinaBloqueada("");
      setParadaAberta(null);
      setTipoId("");
      setPedidoInput("");
      setPedidoInfo(null);
      setMaquinaId("");
    } catch (e: unknown) {
      toastErr((e as Error).message ?? "Erro ao finalizar parada");
      setSaving(false);
      return;
    }
    carregarParadas().catch(() => {});
    setSaving(false);
  }

  function handleConfirmar() {
    if (pendingAction === "iniciar") confirmarIniciar();
    if (pendingAction === "finalizar") confirmarFinalizar();
  }

  // ── Admin: edição ────────────────────────────────────────────────────────
  function abrirEdicao(p: ParadaRow) {
    setEditando(p);
    setEditForm({
      pedido: p.pedido,
      data_inicio: p.data_inicio ?? undefined,
      data_fim: p.data_fim ?? undefined,
      id_maquina: p.id_maquina,
    });
  }

  async function salvarEdicao() {
    if (!editando) return;
    setEditSaving(true);
    try {
      await editarParada(editando.id, editForm);
      toastOk("Parada atualizada");
      setEditando(null);
      await carregarParadas();
    } catch (e: unknown) {
      toastErr((e as Error).message ?? "Erro ao salvar");
    } finally {
      setEditSaving(false);
    }
  }

  async function abrirHistorico(p: ParadaRow) {
    setHistParada(p);
    setHistorico(await fetchHistorico(p.id));
    setShowHistorico(true);
  }

  // ── Labels ───────────────────────────────────────────────────────────────
  const nomeMaquina =
    maquinas.find((m) => String(m.id) === maquinaId)?.nome ?? "";
  const nomeMaqBloqueada =
    maquinas.find((m) => String(m.id) === maquinaBloqueada)?.nome ?? "";
  const nomeTipo = tipos.find((t) => String(t.id) === tipoId)?.descricao ?? "";

  return (
    <AppLayout pageTitle="Paradas de Máquina">
      <div className="paradas-layout">
        {/* ── Aviso de bloqueio ───────────────────────────────────── */}
        {formBloqueado && (
          <div className="paradas-aviso">
            <span className="paradas-aviso__icon">⚠</span>
            Parada ativa em <strong>{nomeMaqBloqueada}</strong> — finalize antes
            de iniciar outra.
          </div>
        )}

        {/* ── Formulário (operadores) ─────────────────────────────── */}
        {isOperador && (
          <div className="paradas-card">
            <h2 className="paradas-card__title">Registrar Parada</h2>
            <div className="paradas-form">
              <div className="paradas-field">
                <label>Tipo de Requisição *</label>
                <select
                  value={tipoId}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  disabled={formBloqueado}
                >
                  <option value="">Selecione...</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.descricao}
                    </option>
                  ))}
                </select>
              </div>
              <div className="paradas-field">
                <label>Pedido *</label>
                <input
                  type="text"
                  value={pedidoInput}
                  placeholder="Nº do pedido"
                  disabled={!tipoId || formBloqueado}
                  className={formBloqueado ? "paradas-field__readonly" : ""}
                  onChange={(e) => {
                    if (!formBloqueado) {
                      setPedidoInput(e.target.value);
                      setPedidoInfo(null);
                      setPedidoErr("");
                    }
                  }}
                  onBlur={handlePedidoBlur}
                />
                {pedidoErr && (
                  <span className="paradas-field__error">{pedidoErr}</span>
                )}
              </div>
              <div className="paradas-field">
                <label>Máquina *</label>
                <select
                  value={maquinaId}
                  onChange={(e) => handleMaquinaChange(e.target.value)}
                  disabled={formBloqueado}
                  className={formBloqueado ? "paradas-field__readonly" : ""}
                >
                  <option value="">Selecione...</option>
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="paradas-fields-row">
                <div className="paradas-field">
                  <label>Cliente</label>
                  <input
                    type="text"
                    value={pedidoInfo?.cliente ?? ""}
                    readOnly
                    className="paradas-field__readonly"
                  />
                </div>
                <div className="paradas-field">
                  <label>Ambiente</label>
                  <input
                    type="text"
                    value={pedidoInfo?.ambiente ?? ""}
                    readOnly
                    className="paradas-field__readonly"
                  />
                </div>
              </div>
              {maquinaId && (
                <div
                  className={`paradas-status ${paradaAberta ? "paradas-status--em-parada" : "paradas-status--disponivel"}`}
                >
                  {paradaAberta
                    ? `⚠ Em parada desde ${fmtDt(paradaAberta.data_inicio)} — Pedido ${paradaAberta.pedido} (${paradaAberta.tipo})`
                    : "✓ Máquina disponível"}
                </div>
              )}
            </div>
            <div className="paradas-actions">
              <button
                className="paradas-btn paradas-btn--iniciar"
                onClick={() => setPendingAction("iniciar")}
                disabled={!podeIniciar || saving}
              >
                Iniciar Parada
              </button>
              <button
                className="paradas-btn paradas-btn--finalizar"
                onClick={() => setPendingAction("finalizar")}
                disabled={!podeFinalizar || saving}
              >
                {saving ? "Salvando..." : "Finalizar Parada"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tabela de paradas ───────────────────────────────────── */}
        <div className="paradas-card">
          <div className="paradas-table-header">
            <h2 className="paradas-card__title" style={{ margin: 0 }}>
              Histórico de Paradas
            </h2>
            <div className="paradas-filtros-inline">
              <div className="paradas-field paradas-field--sm maq">
                <label>Máquina</label>
                <select
                  value={filtroMaquina}
                  onChange={(e) => setFiltroMaquina(e.target.value)}
                >
                  <option value="">Todas</option>
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="paradas-field paradas-field--sm">
                <label>De</label>
                <input
                  type="date"
                  value={filtroDe}
                  onChange={(e) => setFiltroDe(e.target.value)}
                />
              </div>
              <div className="paradas-field paradas-field--sm">
                <label>Até</label>
                <input
                  type="date"
                  value={filtroAte}
                  onChange={(e) => setFiltroAte(e.target.value)}
                />
              </div>
            </div>
          </div>

          {paradas.length === 0 ? (
            <p className="paradas-empty">Nenhuma parada encontrada.</p>
          ) : (
            <div className="paradas-table-wrap">
              <table className="paradas-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo</th>
                    <th>Pedido</th>
                    <th>Máquina</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Duração</th>
                    {isAdmin && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {paradas.map((p) => (
                    <tr
                      key={p.id}
                      className={
                        !p.data_fim ? "paradas-table__row--aberta" : ""
                      }
                    >
                      <td>{p.id}</td>
                      <td>{p.tipo}</td>
                      <td>{p.pedido}</td>
                      <td>{p.maquina}</td>
                      <td>{fmtDt(p.data_inicio)}</td>
                      <td>
                        {p.data_fim ? (
                          fmtDt(p.data_fim)
                        ) : (
                          <span className="paradas-badge--aberta">
                            Em aberto
                          </span>
                        )}
                      </td>
                      <td>{duracao(p.data_inicio, p.data_fim)}</td>
                      {isAdmin && (
                        <td className="paradas-table__actions">
                          <button onClick={() => abrirEdicao(p)}>Editar</button>
                          <button onClick={() => abrirHistorico(p)}>
                            Histórico
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal confirmação (iniciar/finalizar) ──────────────────── */}
      {pendingAction && (
        <div
          className="paradas-modal-overlay"
          onClick={() => setPendingAction(null)}
        >
          <div
            className="paradas-modal paradas-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            {pendingAction === "iniciar" ? (
              <>
                <div className="paradas-confirm__icon paradas-confirm__icon--iniciar">
                  ▶
                </div>
                <h3 className="paradas-confirm__title">
                  Confirmar Início de Parada
                </h3>
                <div className="paradas-confirm__details">
                  <div className="paradas-confirm__row">
                    <span>Máquina</span>
                    <strong>{nomeMaquina}</strong>
                  </div>
                  <div className="paradas-confirm__row">
                    <span>Tipo</span>
                    <strong>{nomeTipo}</strong>
                  </div>
                  <div className="paradas-confirm__row">
                    <span>Pedido</span>
                    <strong>{pedidoInput}</strong>
                  </div>
                  {pedidoInfo?.cliente && (
                    <div className="paradas-confirm__row">
                      <span>Cliente</span>
                      <strong>{pedidoInfo.cliente}</strong>
                    </div>
                  )}
                  {pedidoInfo?.ambiente && (
                    <div className="paradas-confirm__row">
                      <span>Ambiente</span>
                      <strong>{pedidoInfo.ambiente}</strong>
                    </div>
                  )}
                </div>
                <p className="paradas-confirm__msg">
                  Deseja registrar o início desta parada?
                </p>
              </>
            ) : (
              <>
                <div className="paradas-confirm__icon paradas-confirm__icon--finalizar">
                  ■
                </div>
                <h3 className="paradas-confirm__title">
                  Confirmar Fim de Parada
                </h3>
                <div className="paradas-confirm__details">
                  <div className="paradas-confirm__row">
                    <span>Máquina</span>
                    <strong>{nomeMaquina}</strong>
                  </div>
                  {paradaAberta && (
                    <>
                      <div className="paradas-confirm__row">
                        <span>Pedido</span>
                        <strong>{paradaAberta.pedido}</strong>
                      </div>
                      <div className="paradas-confirm__row">
                        <span>Desde</span>
                        <strong>{fmtDt(paradaAberta.data_inicio)}</strong>
                      </div>
                    </>
                  )}
                </div>
                <p className="paradas-confirm__msg">
                  Deseja registrar o fim desta parada?
                </p>
              </>
            )}
            <div className="paradas-actions paradas-confirm__actions">
              <button
                className={`paradas-btn ${pendingAction === "iniciar" ? "paradas-btn--iniciar" : "paradas-btn--finalizar"}`}
                onClick={handleConfirmar}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Confirmar"}
              </button>
              <button
                className="paradas-btn"
                onClick={() => setPendingAction(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal edição (admin) ────────────────────────────────────── */}
      {editando && (
        <div
          className="paradas-modal-overlay"
          onClick={() => setEditando(null)}
        >
          <div className="paradas-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Parada #{editando.id}</h3>
            <div className="paradas-form">
              <div className="paradas-field">
                <label>Pedido</label>
                <input
                  type="number"
                  value={editForm.pedido ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      pedido: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="paradas-field">
                <label>Máquina</label>
                <select
                  value={editForm.id_maquina ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      id_maquina: Number(e.target.value),
                    }))
                  }
                >
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="paradas-field">
                <label>Data/Hora Início</label>
                <input
                  type="datetime-local"
                  value={toInputDt(editForm.data_inicio)}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      data_inicio: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    }))
                  }
                />
              </div>
              <div className="paradas-field">
                <label>Data/Hora Fim</label>
                <input
                  type="datetime-local"
                  value={toInputDt(editForm.data_fim)}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      data_fim: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    }))
                  }
                />
              </div>
            </div>
            <div className="paradas-actions">
              <button
                className="paradas-btn paradas-btn--finalizar"
                onClick={salvarEdicao}
                disabled={editSaving}
              >
                {editSaving ? "Salvando..." : "Salvar"}
              </button>
              <button className="paradas-btn" onClick={() => setEditando(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal histórico (admin) ─────────────────────────────────── */}
      {showHistorico && (
        <div
          className="paradas-modal-overlay"
          onClick={() => setShowHistorico(false)}
        >
          <div
            className="paradas-modal paradas-modal--large"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Histórico — Parada #{histParada?.id}</h3>
            {historico.length === 0 ? (
              <p className="paradas-empty">Nenhuma alteração registrada.</p>
            ) : (
              <div className="paradas-table-wrap">
                <table className="paradas-table">
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>Anterior</th>
                      <th>Novo</th>
                      <th>Alterado por</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((h) => (
                      <tr key={h.id}>
                        <td>{CAMPO_LABEL[h.campo] ?? h.campo}</td>
                        <td>{h.valor_anterior ?? "—"}</td>
                        <td>{h.valor_novo ?? "—"}</td>
                        <td>{h.alterado_por_nome ?? "—"}</td>
                        <td>{fmtDt(h.alterado_em)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="paradas-actions">
              <button
                className="paradas-btn"
                onClick={() => setShowHistorico(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
