import type { OperationalStatus } from "../../../../types/expedition";
import "./OperationalStatusSection.css";
import { User } from "lucide-react";

interface OperationalStatusSectionProps {
  data: OperationalStatus;
  onChange: (data: OperationalStatus) => void;
  onPickUser: (role: "embalagem" | "pronto" | "entrega") => void;
}

const EMB_BADGE: Record<string, string> = {
  active: "EM ANDAMENTO",
  paused: "PAUSADO",
  done: "CONCLUÍDO",
};

export function OperationalStatusSection({
  data,
  onChange,
  onPickUser,
}: OperationalStatusSectionProps) {
  const embState = data.embalagem.fim
    ? "done"
    : data.embalagem.pausa
      ? "paused"
      : data.embalagem.inicio
        ? "active"
        : null;

  function setEmbalagem(
    field: keyof typeof data.embalagem,
    value: string | boolean,
  ) {
    const updated = {
      ...data,
      embalagem: { ...data.embalagem, [field]: value },
    };
    // Validate: if fim has value but inicio empty → clear fim
    if (field === "fim" && value && !data.embalagem.inicio) {
      updated.embalagem.fim = "";
    }
    // Validate: if pausa=true but no inicio → prevent
    if (field === "pausa" && value === true && !data.embalagem.inicio) {
      return;
    }
    onChange(updated);
  }

  function handleEmbalagemInicio(value: string) {
    const updated = {
      ...data,
      embalagem: { ...data.embalagem, inicio: value },
    };
    // If clearing inicio, also clear fim and pausa
    if (!value) {
      updated.embalagem.fim = "";
      updated.embalagem.pausa = false;
    }
    onChange(updated);
  }

  function set(field: keyof OperationalStatus, value: string | boolean) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="ops-status">
      {/* Top row: 3 cards */}
      <div className="ops-status__cards-row">
        {/* Embalagem Card */}
        <div
          className={`ops-status__card${embState ? ` ops-status__card--${embState}` : ""}`}
        >
          <div className="ops-status__card-header">
            Embalagem
            {embState && (
              <span
                className={`ops-status__card-badge ops-status__card-badge--${embState}`}
              >
                {EMB_BADGE[embState]}
              </span>
            )}
          </div>
          <div className="ops-status__card-body">
            <div className="ops-status__field">
              <label className="ops-status__label">Início</label>
              <input
                type="datetime-local"
                className="ops-status__input"
                value={data.embalagem.inicio}
                onChange={(e) => handleEmbalagemInicio(e.target.value)}
              />
            </div>
            <div className="ops-status__field">
              <label className="ops-status__label">Fim</label>
              <input
                type="datetime-local"
                className="ops-status__input"
                value={data.embalagem.fim}
                disabled={!data.embalagem.inicio}
                onChange={(e) => setEmbalagem("fim", e.target.value)}
              />
            </div>
            <div className="ops-status__field ops-status__field--row">
              <input
                type="checkbox"
                className="ops-status__checkbox"
                id="emb-pausa"
                checked={data.embalagem.pausa}
                disabled={!data.embalagem.inicio}
                onChange={(e) => setEmbalagem("pausa", e.target.checked)}
              />
              <label
                className="ops-status__label ops-status__label--inline"
                htmlFor="emb-pausa"
              >
                Pausa
              </label>
            </div>
            <div className="ops-status__resp">
              <div className="ops-status__field">
                <label className="ops-status__label">ID</label>
                <input
                  type="text"
                  className="ops-status__input ops-status__input--id"
                  value={data.embalagem.responsavelId}
                  onChange={(e) =>
                    setEmbalagem("responsavelId", e.target.value)
                  }
                  placeholder="ID..."
                />
              </div>
              <div className="ops-status__field resp">
                <label className="ops-status__label">Nome</label>
                <div className="ops-status__input-row">
                  <input
                    type="text"
                    className="ops-status__input"
                    value={data.embalagem.responsavelNome}
                    readOnly
                    placeholder="Nome..."
                  />
                  <button
                    type="button"
                    className="ops-status__pick-btn"
                    onClick={() => onPickUser("embalagem")}
                    title="Selecionar funcionário"
                  >
                    <User />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pronto Card */}
        <div className="ops-status__card">
          <div className="ops-status__card-header">Pronto</div>
          <div className="ops-status__card-body">
            <div className="ops-status__field">
              <label className="ops-status__label">Data Pronto</label>
              <input
                type="date"
                className="ops-status__input"
                value={data.prontoData}
                onChange={(e) => set("prontoData", e.target.value)}
              />
            </div>
            <div className="ops-status__resp">
              <div className="ops-status__field">
                <label className="ops-status__label">ID</label>
                <input
                  type="text"
                  className="ops-status__input ops-status__input--id"
                  value={data.prontoResponsavelId}
                  onChange={(e) => set("prontoResponsavelId", e.target.value)}
                  placeholder="ID..."
                />
              </div>
              <div className="ops-status__field resp">
                <label className="ops-status__label">Nome</label>
                <div className="ops-status__input-row">
                  <input
                    type="text"
                    className="ops-status__input"
                    value={data.prontoResponsavelNome}
                    readOnly
                    placeholder="Nome..."
                  />
                  <button
                    type="button"
                    className="ops-status__pick-btn"
                    onClick={() => onPickUser("pronto")}
                    title="Selecionar funcionário"
                  >
                    <User />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Entrega Card */}
        <div className="ops-status__card">
          <div className="ops-status__card-header">Entrega</div>
          <div className="ops-status__card-body">
            <div className="ops-status__field">
              <label className="ops-status__label">Data Entrega</label>
              <input
                type="date"
                className="ops-status__input"
                value={data.entregaData}
                onChange={(e) => set("entregaData", e.target.value)}
              />
            </div>
            <div className="ops-status__resp">
              <div className="ops-status__field">
                <label className="ops-status__label">ID</label>
                <input
                  type="text"
                  className="ops-status__input ops-status__input--id"
                  value={data.entregaResponsavelId}
                  onChange={(e) => set("entregaResponsavelId", e.target.value)}
                  placeholder="ID..."
                />
              </div>
              <div className="ops-status__field resp">
                <label className="ops-status__label">Nome</label>
                <div className="ops-status__input-row">
                  <input
                    type="text"
                    className="ops-status__input"
                    value={data.entregaResponsavelNome}
                    readOnly
                    placeholder="Nome..."
                  />
                  <button
                    type="button"
                    className="ops-status__pick-btn"
                    onClick={() => onPickUser("entrega")}
                    title="Selecionar funcionário"
                  >
                    <User />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Almoxarifado + Alertas */}
      <div className="ops-status__bottom-row">
        {/* Almoxarifado */}
        <div className="ops-status__card ops-status__card--alm">
          <div className="ops-status__card-header">Almoxarifado</div>
          <div className="ops-status__card-body">
            <div className="ops-status__field">
              <label className="ops-status__label">Data / Hora</label>
              <input
                type="datetime-local"
                className="ops-status__input"
                value={data.almoxarifadoDataHora}
                onChange={(e) => set("almoxarifadoDataHora", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="ops-status__card ops-status__card--alertas">
          <div className="ops-status__card-header">Alertas</div>
          <div className="ops-status__card-body">
            <div className="ops-status__field">
              <label className="ops-status__label">Pendências</label>
              <textarea
                className="ops-status__textarea"
                value={data.pendencias}
                rows={2}
                onChange={(e) => set("pendencias", e.target.value)}
                placeholder="Descreva pendências..."
              />
            </div>
            <div className="ops-status__field ops-status__field--row ops-status__field--mt">
              <input
                type="checkbox"
                className="ops-status__checkbox"
                id="entrega-parcial"
                checked={data.entregaParcial}
                onChange={(e) => set("entregaParcial", e.target.checked)}
              />
              <label
                className="ops-status__label ops-status__label--inline"
                htmlFor="entrega-parcial"
              >
                Entrega Parcial
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
