import { useState, useEffect } from "react";
import { Pause, Play, CheckCircle2, User, Clock } from "lucide-react";
import { fmtDateTimeLocal } from "../../../utils/dateUtils";
import { calcWorkMinutes, fmtWorkDuration } from "../../../utils/workTime";
import type { Stage, StageStatus, StageAction, Operator } from "../types";
import "./index.css";

const STATUS_LABELS: Record<StageStatus, string> = {
  nao_iniciado: "Aguardando",
  em_andamento: "Em Andamento",
  pausado: "Pausado",
  finalizado: "Concluído",
};

interface Props {
  stage: Stage;
  operators: Operator[];
  isDirty: boolean;
  onAction: (action: StageAction) => void;
  onOperatorChange: (id: string, nome: string) => void;
}

const FLASH_CLASS: Partial<Record<StageStatus, string>> = {
  em_andamento: "apt-stage--flash-iniciado",
  pausado: "apt-stage--flash-atrasado",
  finalizado: "apt-stage--flash-pronto",
};

export function TimelineStageCard({
  stage,
  operators,
  isDirty,
  onAction,
  onOperatorChange,
}: Props) {
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    if (stage.status !== "em_andamento") return;
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [stage.status]);

  const isDone = stage.status === "finalizado";
  const canPause = stage.status === "em_andamento";
  const canResume = stage.status === "pausado";
  const isActive = canPause || canResume;
  const flashCls = isDirty ? (FLASH_CLASS[stage.status] ?? "") : "";

  // Fim efetivo: usa stage.fim se concluída, caso contrário usa nowMs
  // (para pausado: captura o instante em que a pausa ocorreu — sem ticking)
  const endForCalc =
    stage.fim ?? (stage.inicio ? new Date(nowMs).toISOString() : null);
  const elapsedStr = fmtWorkDuration(calcWorkMinutes(stage.inicio, endForCalc));
  const isStoped = stage.pausa;
  console.log(isStoped);

  return (
    <div
      className={`apt-stage apt-stage--${stage.status}${flashCls ? ` ${flashCls}` : ""}`}
    >
      <div className="apt-stage__header">
        <div className="apt-stage__meta">
          <span className="apt-stage__order">{stage.order}</span>
          <span className="apt-stage__name">{stage.label}</span>
        </div>
        <span className={`apt-stage__badge apt-stage__badge--${stage.status}`}>
          {STATUS_LABELS[stage.status]}
        </span>
      </div>

      <div className="apt-stage__body">
        <div className="apt-stage__info-row apt-stage__info-row--operator">
          <User size={13} />
          {isActive ? (
            <select
              className="apt-stage__operator-sel"
              value={stage.responsavelId ?? ""}
              onChange={(e) => {
                const op = operators.find((o) => o.id === e.target.value);
                onOperatorChange(e.target.value, op?.nome ?? "");
              }}
            >
              <option value="">Selecionar operador…</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.nome}
                </option>
              ))}
            </select>
          ) : (
            <span
              className={
                !stage.responsavelNome ? "apt-stage__info-row--empty" : ""
              }
            >
              {stage.responsavelNome ?? "—"}
            </span>
          )}
        </div>

        <div
          className={`apt-stage__info-row${!stage.inicio ? " apt-stage__info-row--empty" : ""}`}
        >
          <Clock size={13} />
          <span>
            <span className="apt-stage__time-lbl">Início </span>
            {stage.inicio ? fmtDateTimeLocal(stage.inicio) : "—"}
          </span>
        </div>

        <div
          className={`apt-stage__info-row${!stage.fim ? " apt-stage__info-row--empty" : ""}`}
        >
          <Clock size={13} />
          <span>
            <span className="apt-stage__time-lbl">Fim </span>
            {stage.fim ? fmtDateTimeLocal(stage.fim) : "—"}
          </span>
        </div>

        <div className="apt-stage__elapsed">
          {stage.status === "em_andamento" && (
            <span className="apt-stage__pulse" />
          )}
          <span>{elapsedStr || "—"}</span>
        </div>
      </div>

      {(canPause || canResume) && (
        <div className="apt-stage__actions">
          {canPause && (
            <button
              className="apt-stage__btn apt-stage__btn--pause"
              onClick={(e) => {
                e.stopPropagation();
                onAction("pausar");
              }}
            >
              <Pause size={13} /> Pausar
            </button>
          )}
          {canResume && (
            <button
              className="apt-stage__btn apt-stage__btn--resume"
              onClick={(e) => {
                e.stopPropagation();
                onAction("retomar");
              }}
            >
              <Play size={13} /> Retomar
            </button>
          )}
        </div>
      )}

      {isDone && (
        <div className="apt-stage__done-row">
          <div className="apt-stage-paused">
            <CheckCircle2 size={14} />
            <span>Concluído{elapsedStr ? ` em ${elapsedStr}` : ""}</span>
          </div>
          {isStoped && (
            <div className="done-row-pause">
              <Pause size={18} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
