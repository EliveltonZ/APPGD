import { useState, useCallback, useEffect, useRef } from "react";
import { ProjectSummaryCard } from "../../../features/apontamento/ProjectSummaryCard";
import { ProductionTimeline } from "../../../features/apontamento/ProductionTimeline";
import { parseBarcode } from "../../../features/apontamento/barcodeParser";
import {
  fetchProjectByPedidoPublico,
  saveApontamentoPublico,
  buscarOperadorPorCracha,
  fetchApontamentoOperatorsPublico,
} from "../../../features/apontamento/servicePublico";
import type {
  ApontamentoProject,
  StageId,
  StageAction,
  Stage,
  Operator,
} from "../../../features/apontamento/types";
import {
  getKioskPin,
  setKioskPin,
  testarKioskPin,
  KioskAuthError,
} from "../../../services/kioskApi";
import { KioskHeader } from "./KioskHeader";
import "../../Fabrica/Apontamento/index.css";
import "./index.css";

type ScanFeedback = { msg: string; ok: boolean } | null;

// Crachá = hash hex de 32 caracteres (gerado em Cadastro de Usuários) —
// comprimento fixo e distinto dos códigos de pedido (4-6 dígitos) e de
// etapa (9 dígitos), então dá pra diferenciar só pelo tamanho, sem
// ambiguidade com parseBarcode.
const CRACHA_LENGTH = 32;

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit() {
    const trimmed = pin.trim();
    if (!trimmed) return;
    setChecking(true);
    setError(null);
    const ok = await testarKioskPin(trimmed);
    setChecking(false);
    if (!ok) {
      setError("PIN inválido.");
      return;
    }
    setKioskPin(trimmed);
    onUnlock();
  }

  return (
    <div className="kiosk-pin-gate">
      <div className="kiosk-pin-gate__card">
        <h1 className="kiosk-pin-gate__title">Terminal de Apontamento</h1>
        <p className="kiosk-pin-gate__hint">
          Digite o PIN do terminal, fornecido por quem administra os acessos.
        </p>
        <input
          className="kiosk-pin-gate__input"
          type="text"
          inputMode="numeric"
          placeholder="PIN"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        {error && <p className="kiosk-pin-gate__error">{error}</p>}
        <button
          type="button"
          className="kiosk-pin-gate__btn"
          onClick={handleSubmit}
          disabled={checking || !pin.trim()}
        >
          {checking ? "Verificando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

export function ApontamentoPublicoPage() {
  const [unlocked, setUnlocked] = useState(() => !!getKioskPin());

  const [project, setProject] = useState<ApontamentoProject | null>(null);
  const [results, setResults] = useState<ApontamentoProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [operadorAtual, setOperadorAtual] = useState<Operator | null>(null);
  const [dirty, setDirty] = useState(false);
  const [dirtyStageIds, setDirtyStageIds] = useState<Set<StageId>>(new Set());
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<ScanFeedback>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!unlocked) return;
    fetchApontamentoOperatorsPublico()
      .then(setOperators)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  function message(msg: string, ok: boolean) {
    setFeedback({ msg, ok });
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3500);
  }

  // Se o PIN for invalidado no meio da sessão (admin gerou um novo),
  // qualquer chamada passa a lançar KioskAuthError — volta pro portão.
  function handleAuthError(err: unknown): boolean {
    if (err instanceof KioskAuthError) {
      setUnlocked(false);
      message("PIN do terminal expirou — digite o novo PIN.", false);
      return true;
    }
    return false;
  }

  const markStageDirty = useCallback((id: StageId) => {
    setDirtyStageIds((prev) => new Set(prev).add(id));
    setDirty(true);
  }, []);

  const handleClear = useCallback(() => {
    setProject(null);
    setResults([]);
    setNotFound(false);
    setDirty(false);
    setDirtyStageIds(new Set());
  }, []);

  const handleSearch = useCallback(async (pedido: string) => {
    setLoading(true);
    setNotFound(false);
    setResults([]);
    setProject(null);
    setDirty(false);

    try {
      const rows = await fetchProjectByPedidoPublico(pedido);
      if (!rows) {
        setNotFound(true);
        message(`Pedido ${pedido} não encontrado`, false);
      } else if (rows.length === 1) {
        setProject(rows[0]);
        message(`Pedido ${rows[0].pedido} carregado — ${rows[0].cliente}`, true);
      } else {
        setResults(rows);
        message(
          `${rows.length} registros encontrados para o pedido ${pedido} — selecione um`,
          true,
        );
      }
    } catch (err) {
      if (!handleAuthError(err)) message("Erro ao buscar pedido — verifique a conexão", false);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleBadgeScan(hash: string) {
    try {
      const op = await buscarOperadorPorCracha(hash);
      if (!op) {
        message("Crachá não reconhecido", false);
        return;
      }
      const operador: Operator = { id: String(op.id), nome: op.nome };
      setOperadorAtual(operador);

      // Se alguma etapa já foi iniciada/pausada/finalizada nesta sessão
      // sem operador (bipada antes de ler o crachá), aplica retroativamente
      // nela agora — senão ficaria presa sem operador mesmo depois do scan.
      let aplicadoEm: string[] = [];
      setProject((prev) => {
        if (!prev) return prev;
        const pendentes = [...dirtyStageIds]
          .map((id) => prev.etapas[id])
          .filter((stage) => !stage.responsavelId);
        if (pendentes.length === 0) return prev;
        aplicadoEm = pendentes.map((s) => s.label);
        const etapas = { ...prev.etapas };
        for (const stage of pendentes) {
          etapas[stage.id] = {
            ...stage,
            responsavelId: operador.id,
            responsavelNome: operador.nome,
          };
        }
        return { ...prev, etapas };
      });

      message(
        aplicadoEm.length > 0
          ? `Operador ${op.nome} aplicado em: ${aplicadoEm.join(", ")}`
          : `Operador identificado: ${op.nome}`,
        true,
      );
    } catch (err) {
      if (!handleAuthError(err)) message("Erro ao ler crachá", false);
    }
  }

  const handlePedido = useCallback(
    (raw: string) => {
      const result = parseBarcode(raw);
      const pedido =
        result?.type === "pedido"
          ? String(result.pedido)
          : /^\d+$/.test(raw.trim())
            ? raw.trim()
            : null;

      if (!pedido) {
        message(`Código de pedido inválido: ${raw}`, false);
        return;
      }
      handleSearch(pedido);
    },
    [handleSearch],
  );

  const handleStage = useCallback(
    (raw: string) => {
      const result = parseBarcode(raw);

      if (!result || result.type !== "stage") {
        message(`Código de etapa inválido: ${raw}`, false);
        return;
      }

      if (!project) {
        message("Nenhum pedido carregado", false);
        return;
      }

      if (result.pedido !== project.pedido) {
        message(`Pedido divergente: lido ${result.pedido}, carregado ${project.pedido}`, false);
        return;
      }

      const { stageId, action } = result;
      const stage = project.etapas[stageId];

      if (action === "iniciar") {
        if (stage.status === "finalizado") {
          message(`${stage.label} já foi concluída`, false);
          return;
        }
        if (stage.status === "em_andamento") {
          message(`${stage.label} já está em andamento`, false);
          return;
        }
        if (stage.status === "pausado") {
          message(`${stage.label} está pausada — escaneie o código de finalizar`, false);
          return;
        }
        // Não bloqueia mais aqui por falta de operador — dá pra iniciar
        // sem ter escaneado o crachá ainda. A exigência passa a valer na
        // hora de salvar (ver handleSave): toda etapa alterada nesta
        // sessão precisa estar com operador definido pra poder gravar.
      }

      if (action === "finalizar") {
        if (stage.status === "nao_iniciado") {
          message(`${stage.label} ainda não foi iniciada`, false);
          return;
        }
        if (stage.status === "finalizado") {
          message(`${stage.label} já foi concluída`, false);
          return;
        }
      }

      const now = new Date().toISOString();

      setProject((prev) => {
        if (!prev) return prev;
        const updated: Stage = { ...prev.etapas[stageId] };

        if (action === "iniciar") {
          updated.status = "em_andamento";
          updated.inicio = updated.inicio ?? now;
          updated.pausa = false;
          if (operadorAtual) {
            updated.responsavelId = operadorAtual.id;
            updated.responsavelNome = operadorAtual.nome;
          }
        } else {
          // Finalizar não mexe em `pausa` — se a etapa foi pausada em algum
          // momento, continua marcada mesmo depois de concluída.
          updated.status = "finalizado";
          updated.fim = now;
        }

        return { ...prev, etapas: { ...prev.etapas, [stageId]: updated } };
      });

      markStageDirty(stageId);

      const actionLabel = action === "iniciar" ? "iniciado" : "finalizado";
      const timeStr = new Date(now).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      message(`${stage.label} — ${actionLabel} às ${timeStr}`, true);
    },
    [project, operadorAtual, markStageDirty],
  );

  const handleOperatorChange = useCallback(
    (id: StageId, operatorId: string, operatorNome: string) => {
      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          etapas: {
            ...prev.etapas,
            [id]: {
              ...prev.etapas[id],
              responsavelId: operatorId || null,
              responsavelNome: operatorNome || null,
            },
          },
        };
      });
      markStageDirty(id);
    },
    [markStageDirty],
  );

  const handleStageAction = useCallback(
    (id: StageId, action: StageAction) => {
      setProject((prev) => {
        if (!prev) return prev;
        const updated: Stage = { ...prev.etapas[id] };
        if (action === "pausar") {
          updated.status = "pausado";
          updated.pausa = true;
        }
        return { ...prev, etapas: { ...prev.etapas, [id]: updated } };
      });
      markStageDirty(id);
    },
    [markStageDirty],
  );

  const handleSave = useCallback(async () => {
    if (!project || saving) return;

    // Toda etapa alterada nesta sessão (bipada ou editada manualmente)
    // precisa ter operador definido antes de gravar.
    const semOperador = [...dirtyStageIds]
      .map((id) => project.etapas[id])
      .filter((stage) => !stage.responsavelId);
    if (semOperador.length > 0) {
      const labels = semOperador.map((s) => s.label).join(", ");
      message(`Escaneie o crachá do operador — sem operador em: ${labels}`, false);
      return;
    }

    setSaving(true);
    try {
      await saveApontamentoPublico(project);
      setDirty(false);
      setDirtyStageIds(new Set());
      message("Apontamentos salvos com sucesso", true);
    } catch (err) {
      if (!handleAuthError(err)) message("Erro ao salvar — tente novamente", false);
    } finally {
      setSaving(false);
    }
  }, [project, saving, dirtyStageIds]);

  // Único listener global — ativo o tempo todo (não depende de já ter um
  // pedido carregado, senão escanear o crachá primeiro não funcionava).
  // Diferencia crachá (32 caracteres) de pedido (4-6 dígitos) e etapa (9
  // dígitos) só pelo formato lido via parseBarcode, evitando dois
  // listeners brigando pelo mesmo scan. Não tem campo próprio — funciona
  // em qualquer lugar da tela, contanto que o foco não esteja dentro de
  // um campo de texto (aí a leitura cai no campo, não no listener).
  useEffect(() => {
    if (!unlocked) return;
    let buffer = "";
    let lastTime = 0;

    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const now = Date.now();
      if (now - lastTime > 150) buffer = "";
      lastTime = now;

      if (e.key === "Enter") {
        const code = buffer.trim();
        buffer = "";
        if (!code) return;

        if (code.length === CRACHA_LENGTH) {
          handleBadgeScan(code);
          return;
        }

        const result = parseBarcode(code);
        if (result?.type === "pedido") {
          handleSearch(String(result.pedido));
        } else if (result?.type === "stage") {
          handleStage(code);
        } else {
          message(`Código inválido: ${code}`, false);
        }
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, handleSearch, handleStage]);

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="apt-page kiosk-page">
      <KioskHeader
        onPedido={handlePedido}
        onStage={handleStage}
        onBadge={handleBadgeScan}
        hasPedido={!!project}
        loading={loading}
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onClear={handleClear}
        operadorAtual={operadorAtual}
      />

      {feedback && (
        <div className={`apt-feedback apt-feedback--${feedback.ok ? "ok" : "err"}`}>
          {feedback.ok ? "✓" : "⚠"} {feedback.msg}
        </div>
      )}

      {results.length > 0 && !project && (
        <div className="apt-multi">
          <p className="apt-multi__hint">
            Pedido encontrado em {results.length} ordens — selecione:
          </p>
          <div className="apt-multi__list">
            {results.map((r) => (
              <button
                key={r.ordemdecompra}
                className="apt-multi__item"
                onClick={() => {
                  setProject(r);
                  setResults([]);
                }}
              >
                <span className="apt-multi__oc">OC {r.ordemdecompra}</span>
                <span className="apt-multi__info">
                  {r.ambiente} · {r.cliente}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!project && !loading && results.length === 0 && (
        <div className="apt-empty">
          {notFound ? (
            <>
              <div className="apt-empty__icon">⚠️</div>
              <p className="apt-empty__msg">Pedido não encontrado.</p>
              <p className="apt-empty__hint">Verifique o número e tente novamente.</p>
            </>
          ) : (
            <>
              <div className="apt-empty__icon">🔍</div>
              <p className="apt-empty__msg">Escaneie o crachá e o pedido</p>
              <p className="apt-empty__hint">
                Pode escanear em qualquer lugar da tela, sem clicar em campo
                nenhum — primeiro o crachá, depois o pedido e os códigos de
                etapa.
              </p>
            </>
          )}
        </div>
      )}

      {project && (
        <div className="apt-workspace">
          <ProjectSummaryCard project={project} />
          <ProductionTimeline
            project={project}
            operators={operators}
            dirtyStageIds={dirtyStageIds}
            onStageAction={handleStageAction}
            onOperatorChange={handleOperatorChange}
            operatorEditable={false}
          />
        </div>
      )}
    </div>
  );
}
