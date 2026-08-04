import { useState, useCallback, useEffect, useRef } from "react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import {
  ProductionHeader,
  type ProductionHeaderHandle,
} from "../../../features/apontamento/ProductionHeader";
import { ProjectSummaryCard } from "../../../features/apontamento/ProjectSummaryCard";
import { ProductionTimeline } from "../../../features/apontamento/ProductionTimeline";
import { parseBarcode } from "../../../features/apontamento/barcodeParser";
import {
  fetchProjectByPedido,
  saveApontamento,
  fetchApontamentoOperators,
} from "../../../features/apontamento/service";
import type {
  ApontamentoProject,
  StageId,
  StageAction,
  Stage,
  Operator,
} from "../../../features/apontamento/types";
import "./index.css";

type ScanFeedback = { msg: string; ok: boolean } | null;

export function ApontamentoPage() {
  const [project, setProject] = useState<ApontamentoProject | null>(null);
  const [results, setResults] = useState<ApontamentoProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [dirty, setDirty] = useState(false);
  const [dirtyStageIds, setDirtyStageIds] = useState<Set<StageId>>(new Set());
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<ScanFeedback>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<ProductionHeaderHandle>(null);

  useEffect(() => {
    fetchApontamentoOperators()
      .then(setOperators)
      .catch(() => {});
  }, []);

  function message(msg: string, ok: boolean) {
    setFeedback({ msg, ok });
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3500);
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
      const rows = await fetchProjectByPedido(pedido);
      if (!rows) {
        setNotFound(true);
        message(`Pedido ${pedido} não encontrado`, false);
      } else if (rows.length === 1) {
        setProject(rows[0]);
        message(
          `Pedido ${rows[0].pedido} carregado — ${rows[0].cliente}`,
          true,
        );
        setTimeout(() => headerRef.current?.focusStage(), 50);
      } else {
        setResults(rows);
        message(
          `${rows.length} registros encontrados para o pedido ${pedido} — selecione um`,
          true,
        );
      }
    } catch {
      message("Erro ao buscar pedido — verifique a conexão", false);
    } finally {
      setLoading(false);
    }
  }, []);

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
        message(
          `Pedido divergente: lido ${result.pedido}, carregado ${project.pedido}`,
          false,
        );
        return;
      }

      const { stageId, action } = result;
      const stage = project.etapas[stageId];

      // Validações de transição de estado
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
          message(`${stage.label} está pausada — use o botão Retomar`, false);
          return;
        }
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
        } else {
          updated.status = "finalizado";
          updated.fim = now;
          updated.pausa = false;
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
    [project, operators, markStageDirty],
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
        } else if (action === "retomar") {
          updated.status = "em_andamento";
          updated.pausa = false;
        }
        return { ...prev, etapas: { ...prev.etapas, [id]: updated } };
      });
      markStageDirty(id);
    },
    [markStageDirty],
  );

  const handleSave = useCallback(async () => {
    if (!project || saving) return;
    setSaving(true);
    try {
      await saveApontamento(project);
      setDirty(false);
      setDirtyStageIds(new Set());
      message("Apontamentos salvos com sucesso", true);
    } catch {
      message("Erro ao salvar — tente novamente", false);
    } finally {
      setSaving(false);
    }
  }, [project, saving]);

  return (
    <AppLayout pageTitle="Apontamento">
      <div className="apt-page">
        <ProductionHeader
          ref={headerRef}
          onPedido={handlePedido}
          onStage={handleStage}
          hasPedido={!!project}
          loading={loading}
          dirty={dirty}
          saving={saving}
          onSave={handleSave}
          onClear={handleClear}
          operators={operators}
        />

        {feedback && (
          <div
            className={`apt-feedback apt-feedback--${feedback.ok ? "ok" : "err"}`}
          >
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
                    setTimeout(() => headerRef.current?.focusStage(), 50);
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
                <p className="apt-empty__hint">
                  Verifique o número e tente novamente.
                </p>
              </>
            ) : (
              <>
                <div className="apt-empty__icon">🔍</div>
                <p className="apt-empty__msg">
                  Escaneie ou digite o número do pedido
                </p>
                <p className="apt-empty__hint">
                  Exemplo: <strong>004637</strong> para buscar o pedido 4637
                  &nbsp;·&nbsp; Após carregar, escaneie os códigos de etapa
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
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
