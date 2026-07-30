const VARIANT_MAP: Record<string, string> = {
  AGUARDANDO: "aguardando",
  INICIADO: "iniciado",
  ATRASADO: "atrasado",
  PARCEADO: "parceado",
  "A VENCER": "a-vencer",
  URGENTE: "urgente",
  PENDENCIA: "pendencia",
  PRONTO: "pronto",
  ENTREGUE: "entregue",
};

const LABEL_MAP: Record<string, string> = {
  AGUARDANDO: "Aguardando",
  INICIADO: "Iniciado",
  ATRASADO: "Atrasado",
  PARCEADO: "Parceado",
  "A VENCER": "A Vencer",
  URGENTE: "Urgente",
  PENDENCIA: "Pendência",
  PRONTO: "Pronto",
  ENTREGUE: "Entregue",
};

interface ProjectStatusBadgeProps {
  status: string;
  label?: string;
}

export function ProjectStatusBadge({ status, label }: ProjectStatusBadgeProps) {
  const variant = VARIANT_MAP[status] ?? "aguardando";
  const text = label ?? LABEL_MAP[status] ?? status;
  return (
    <span
      className={[
        `status-badge form-section__title status-badge--${variant}`,
        variant === "urgente" ? " transition" : "",
      ].join("")}
    >
      {text}
    </span>
  );
}
