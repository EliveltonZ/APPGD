import "./index.css";

export type StageStatus =
  | "nao_iniciado"
  | "em_andamento"
  | "pausado"
  | "concluido";

export interface ProductionStageCardProps {
  index: number;
  label: string;
  status: StageStatus;
  inicio: string;
  fim: string;
  responsavel: string;
  pausa?: string;
}

const STATUS_LABELS: Record<StageStatus, string> = {
  nao_iniciado: "Não Iniciado",
  em_andamento: "Em Andamento",
  pausado: "Pausado",
  concluido: "Concluído",
};

function DateValue({ iso }: { iso: string }) {
  if (!iso) return <strong>—</strong>;
  if (iso.includes("T")) {
    // Parseia a string diretamente sem criar Date para evitar conversão de fuso.
    // O banco armazena hora local (timestamp without time zone); o servidor UTC
    // serializa com Z, e new Date() subtrairia 3h no browser em UTC-3.
    const [datePart, timePart] = iso.split("T");
    const [y, m, d] = datePart.split("-");
    const [hh, min] = timePart.split(":");
    return (
      <>
        <strong>{`${d}/${m}/${y}`}</strong>
        <span className="psc-field__time">{`${hh}:${min}`}</span>
      </>
    );
  }
  const [y, m, d] = iso.split("-");
  return <strong>{`${d}/${m}/${y}`}</strong>;
}

export function ProductionStageCard({
  index,
  label,
  status,
  inicio,
  fim,
  pausa,
  responsavel,
}: ProductionStageCardProps) {
  return (
    <div className={`psc-card psc-card--${status}`}>
      <div className="psc-card__header">
        <span className="psc-card__index">{index}</span>
        <span className="psc-card__label">{label}</span>
        <span className={`psc-badge psc-badge--${status}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="psc-card__body">
        <div className="psc-field">
          <span>Início</span>
          <DateValue iso={inicio} />
        </div>
        <div className="psc-field">
          <span>Fim</span>
          <DateValue iso={fim} />
        </div>
        {pausa && (
          <div className="psc-field">
            <span>Pausa</span>
            <DateValue iso={pausa} />
          </div>
        )}
        <div className="psc-field psc-field--full">
          <span>Responsável</span>
          <strong>{responsavel || "—"}</strong>
        </div>
      </div>
    </div>
  );
}
