import { useState, useEffect } from "react";
import { Pause, CheckCircle2, User, Clock } from "lucide-react";
import { fmtDateTime } from "../../../utils/dateUtils";
import { calcWorkMinutes, fmtWorkDuration } from "../../../utils/workTime";
import { findPersonByIdOrName } from "../../../utils/people";
import { validateOperadorIdOuNome } from "../../../validation";
import type { Stage, StageStatus, StageAction, Operator } from "../types";
import "./index.css";

const STATUS_LABELS: Record<StageStatus, string> = {
  nao_iniciado: "Aguardando",
  em_andamento: "Em Andamento",
  pausado: "Pausado",
  finalizado: "Concluído",
};

const FLASH_CLASS: Partial<Record<StageStatus, string>> = {
  em_andamento: "apt-stage--flash-iniciado",
  pausado:      "apt-stage--flash-atrasado",
  finalizado:   "apt-stage--flash-pronto",
};

// Sub-componente isolado para o campo de operador.
// Recebe `key={stage.responsavelId}` do pai, então remonta sempre
// que o ID salvo no banco mudar — garantindo que o input exiba o valor correto.
function OperatorInput({
  initialId,
  operators,
  responsavelNome,
  onOperatorChange,
}: {
  initialId: string;
  operators: Operator[];
  responsavelNome: string | null;
  onOperatorChange: (id: string, nome: string) => void;
}) {
  const [opInput, setOpInput] = useState(initialId);
  const [erro, setErro] = useState<string | null>(null);

  function resolveOperator(value: string) {
    if (!value.trim()) { setErro(null); onOperatorChange("", ""); return; }
    setErro(validateOperadorIdOuNome(value, operators));
    const match = findPersonByIdOrName(operators, value);
    onOperatorChange(match?.id ?? "", match?.nome ?? "");
  }

  return (
    <div className="apt-stage__operator-row">
      <input
        type="text"
        inputMode="numeric"
        className="apt-stage__operator-id"
        placeholder="ID"
        value={opInput}
        onChange={(e) => { setOpInput(e.target.value); setErro(null); }}
        onBlur={(e) => resolveOperator(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            resolveOperator((e.target as HTMLInputElement).value);
          }
        }}
      />
      <span className={`apt-stage__operator-name${!responsavelNome ? " apt-stage__operator-name--empty" : ""}`}>
        {erro ?? responsavelNome ?? "—"}
      </span>
    </div>
  );
}

interface Props {
  stage: Stage;
  operators: Operator[];
  isDirty: boolean;
  onAction: (action: StageAction) => void;
  onOperatorChange: (id: string, nome: string) => void;
  /** false no terminal público — lá o operador só entra por leitura de
   * crachá, nunca digitando o ID direto (furaria a exigência). */
  operatorEditable?: boolean;
}

export function TimelineStageCard({
  stage,
  operators,
  isDirty,
  onAction,
  onOperatorChange,
  operatorEditable = true,
}: Props) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (stage.status !== "em_andamento") return;
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [stage.status]);

  const isDone    = stage.status === "finalizado";
  const canPause  = stage.status === "em_andamento";
  // Pausado não tem retorno (a flag `pausa` é usada em análise — reverter
  // apagaria o histórico de que a etapa foi pausada). A única saída de
  // "pausado" é escanear o código de finalizar.
  const isActive  = canPause || stage.status === "pausado";
  const flashCls  = isDirty ? (FLASH_CLASS[stage.status] ?? "") : "";

  const endForCalc =
    stage.fim ?? (stage.inicio ? new Date(nowMs).toISOString() : null);
  const elapsedStr = fmtWorkDuration(calcWorkMinutes(stage.inicio, endForCalc));
  const isPaused = stage.pausa;

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
          {isActive && operatorEditable ? (
            <OperatorInput
              key={stage.responsavelId ?? ""}
              initialId={stage.responsavelId ?? ""}
              operators={operators}
              responsavelNome={stage.responsavelNome}
              onOperatorChange={onOperatorChange}
            />
          ) : (
            <span className={!stage.responsavelNome ? "apt-stage__info-row--empty" : ""}>
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
            {stage.inicio ? fmtDateTime(stage.inicio) : "—"}
          </span>
        </div>

        <div
          className={`apt-stage__info-row${!stage.fim ? " apt-stage__info-row--empty" : ""}`}
        >
          <Clock size={13} />
          <span>
            <span className="apt-stage__time-lbl">Fim </span>
            {stage.fim ? fmtDateTime(stage.fim) : "—"}
          </span>
        </div>

        <div className="apt-stage__elapsed">
          {stage.status === "em_andamento" && (
            <span className="apt-stage__pulse" />
          )}
          <span>{elapsedStr || "—"}</span>
        </div>
      </div>

      {canPause && (
        <div className="apt-stage__actions">
          <button
            className="apt-stage__btn apt-stage__btn--pause"
            onClick={(e) => { e.stopPropagation(); onAction("pausar"); }}
          >
            <Pause size={13} /> Pausar
          </button>
        </div>
      )}

      {isDone && (
        <div className="apt-stage__done-row">
          <div className="apt-stage-paused">
            <CheckCircle2 size={14} />
            <span>Concluído{elapsedStr ? ` em ${elapsedStr}` : ""}</span>
          </div>
          {isPaused && (
            <div className="done-row-pause">
              <Pause size={18} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
