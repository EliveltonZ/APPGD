import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { fmtDate } from "../../../utils/dateUtils";
import { STAGE_ORDER } from "../types";
import type { ApontamentoProject } from "../types";
import "./index.css";

function isLate(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso + "T23:59:59") < new Date();
}

interface Props {
  project: ApontamentoProject;
}

export function ProjectSummaryCard({ project }: Props) {
  const late = isLate(project.dataentrega);
  const stages = STAGE_ORDER.map((id) => project.etapas[id]);
  const done = stages.filter((s) => s.status === "finalizado").length;
  const pct = Math.round((done / stages.length) * 100);

  return (
    <div className="apt-sum">
      {/* Identidade do pedido */}
      <div className="apt-sum__identity">
        <div className="apt-sum__pedido">
          <span className="apt-sum__pedido-lbl">Pedido</span>
          <strong className="apt-sum__pedido-num">{project.pedido}</strong>
        </div>
      </div>

      <div className="apt-sum__divider" />

      {/* Campos principais */}
      <div className="apt-sum__fields">
        <div className="apt-sum__field">
          <span className="apt-sum__lbl">Cliente</span>
          <span className="apt-sum__val">{project.cliente || "—"}</span>
        </div>
        <div className="apt-sum__field">
          <span className="apt-sum__lbl">Ambiente</span>
          <span className="apt-sum__val">{project.ambiente || "—"}</span>
        </div>
        <div className="apt-sum__field">
          <span className="apt-sum__lbl">Contrato</span>
          <span className="apt-sum__val">{project.contrato || "—"}</span>
        </div>
        <div className="apt-sum__field">
          <span className="apt-sum__lbl">Cód. Corte</span>
          <span className="apt-sum__val">{project.codcc || "—"}</span>
        </div>
        <div className="apt-sum__field">
          <span className="apt-sum__lbl">Nº Projeto</span>
          <span className="apt-sum__val">{project.numproj || "—"}</span>
        </div>
        <div className="apt-sum__field">
          <span className="apt-sum__lbl">Lote</span>
          <span className="apt-sum__val">{project.lote || "—"}</span>
        </div>
        <div className="apt-sum__field">
          <span className="apt-sum__lbl">Prazo</span>
          <span className={`apt-sum__val${late ? " apt-sum__val--late" : ""}`}>
            {late && <AlertTriangle size={11} />}
            {fmtDate(project.dataentrega) || "—"}
          </span>
        </div>
        <div className="apt-sum__field">
          <span className="apt-sum__lbl">Previsão</span>
          <span className="apt-sum__val">
            <Clock size={11} />
            {fmtDate(project.previsao) || "—"}
          </span>
        </div>
        {project.pronto && (
          <div className="apt-sum__field">
            <span className="apt-sum__lbl">Concluído</span>
            <span className="apt-sum__val apt-sum__val--done">
              <CheckCircle2 size={11} />
              {fmtDate(project.pronto)}
            </span>
          </div>
        )}
      </div>

      <div className="apt-sum__divider" />

      {/* Progresso */}
      <div className="apt-sum__progress">
        <div className="apt-sum__progress-dots">
          {stages.map((s) => (
            <span
              key={s.id}
              className={`apt-sum__dot apt-sum__dot--${s.status}`}
              title={s.label}
            />
          ))}
        </div>
        <div className="apt-sum__progress-bar">
          <div
            className="apt-sum__progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="apt-sum__progress-pct">
          {done}/{stages.length}
        </span>
      </div>
    </div>
  );
}
