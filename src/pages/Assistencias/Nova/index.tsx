import { useState } from "react";
import { Users, Package } from "lucide-react";
import { AppLayout } from "../../../components/Layout/AppLayout";
import { FormSection } from "../../../components/FormSection";
import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { StatusBadge } from "../../../features/assistencias/nova/StatusBadge";
import { SelectedTeamTable } from "../../../features/assistencias/nova/SelectedTeamTable";
import { SelectedPartsTable } from "../../../features/assistencias/nova/SelectedPartsTable";
import { TeamModal } from "../../../features/assistencias/nova/TeamModal";
import { PartsModal } from "../../../features/assistencias/nova/PartsModal";
import { buildInitialRequest } from "../../../data/assistenciaMocks";
import {
  REQUEST_TYPE_OPTIONS,
  DESTINATION_OPTIONS,
  URGENTE_OPTIONS,
} from "../../../data/assistenciaConfig";
import type {
  ServiceRequest,
  TeamMember,
  ServicePart,
} from "../../../types/assistencia";
import "./index.css";

// ── Validation ───────────────────────────────────────────

interface FormErrors {
  numContrato?: string;
  cliente?: string;
  ambiente?: string;
  tipoSolicitacao?: string;
  destino?: string;
  supervisor?: string;
  liberador?: string;
}

function validate(req: ServiceRequest): FormErrors {
  const e: FormErrors = {};
  if (!req.numContrato.trim()) e.numContrato = "Informe o número do contrato";
  if (!req.cliente.trim()) e.cliente = "Informe o cliente";
  if (!req.ambiente.trim()) e.ambiente = "Informe o ambiente";
  if (!req.tipoSolicitacao)
    e.tipoSolicitacao = "Selecione o tipo de solicitação";
  if (!req.destino) e.destino = "Selecione o destino";
  if (!req.supervisor.trim()) e.supervisor = "Informe o supervisor";
  if (!req.liberador.trim()) e.liberador = "Informe o liberador";
  return e;
}

// ── Component ────────────────────────────────────────────

export function AssistenciasNovaPage() {
  const [req, setReq] = useState<ServiceRequest>(buildInitialRequest);
  const [errors, setErrors] = useState<FormErrors>({});
  const [teamOpen, setTeamOpen] = useState(false);
  const [partsOpen, setPartsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function patch<K extends keyof ServiceRequest>(
    key: K,
    value: ServiceRequest[K],
  ) {
    setReq((prev) => ({ ...prev, [key]: value }));
  }

  function clearError(key: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function addMember(member: TeamMember) {
    patch("equipe", [...req.equipe, member]);
  }

  function removeMember(id: number) {
    patch(
      "equipe",
      req.equipe.filter((m) => m.id !== id),
    );
  }

  function addPart(part: ServicePart) {
    patch("pecas", [...req.pecas, part]);
  }

  function removePart(id: string) {
    patch(
      "pecas",
      req.pecas.filter((p) => p.id !== id),
    );
  }

  function handleSubmit() {
    const errs = validate(req);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AppLayout pageTitle="Nova Solicitação">
        <div className="as-page">
          <div className="as-success">
            <h2>Solicitação enviada com sucesso!</h2>
            <p>
              Número da solicitação: <strong>{req.numSolicitacao}</strong>
            </p>
            <button
              className="as-btn as-btn--primary as-btn--lg"
              onClick={() => {
                setReq(buildInitialRequest());
                setErrors({});
                setSubmitted(false);
              }}
              type="button"
            >
              Nova Solicitação
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Nova Solicitação">
      <div className="as-page">
        {/* ── Header ── */}
        <div className="as-page__header">
          <div>
            <h1 className="as-page__title">Nova Solicitação</h1>
            <p className="as-page__subtitle">
              Assistência Técnica · Preencha todos os campos obrigatórios
            </p>
          </div>
          <StatusBadge situacao={req.situacao} urgente={req.urgente} />
        </div>

        {/* ── Seção 1: Identificação ── */}
        <FormSection step={1} title="Identificação">
          <div className="frow--4">
            <div className="as-static-field">
              <Input label="Nº Solicitação" placeholder={req.numSolicitacao} />
            </div>
            <Input
              label="Nº Contrato *"
              value={req.numContrato}
              onChange={(e) => {
                patch("numContrato", e.target.value);
                clearError("numContrato");
              }}
              error={errors.numContrato}
              placeholder="Ex: 1901"
            />
            <div className="as-static-field">
              <span className="as-static-field__label">Solicitante</span>
              <span className="as-static-field__value">{req.solicitante}</span>
            </div>
            <div className="as-static-field">
              <span className="as-static-field__label">Data / Hora</span>
              <span className="as-static-field__value">{req.dataHora}</span>
            </div>
          </div>
        </FormSection>

        {/* ── Seção 2: Cliente ── */}
        <FormSection step={2} title="Cliente">
          <div className="frow--3">
            <Input
              label="Cliente *"
              value={req.cliente}
              onChange={(e) => {
                patch("cliente", e.target.value);
                clearError("cliente");
              }}
              error={errors.cliente}
              placeholder="Nome do cliente"
              className="fcol--span2"
            />
            <Input
              label="Bairro"
              value={req.bairro}
              onChange={(e) => patch("bairro", e.target.value)}
              placeholder="Bairro / Localidade"
            />
          </div>
          <div className="frow--2">
            <Input
              label="Ambiente *"
              value={req.ambiente}
              onChange={(e) => {
                patch("ambiente", e.target.value);
                clearError("ambiente");
              }}
              error={errors.ambiente}
              placeholder="Ex: Cozinha, Banheiro..."
            />
            <Input
              label="Supervisor *"
              value={req.supervisor}
              onChange={(e) => {
                patch("supervisor", e.target.value);
                clearError("supervisor");
              }}
              error={errors.supervisor}
              placeholder="Nome do supervisor"
            />
          </div>
        </FormSection>

        {/* ── Seção 3: Tipo de Solicitação ── */}
        <FormSection step={3} title="Tipo de Solicitação">
          <div className="frow--3">
            <Select
              label="Tipo *"
              value={req.tipoSolicitacao}
              onChange={(e) => {
                patch(
                  "tipoSolicitacao",
                  e.target.value as ServiceRequest["tipoSolicitacao"],
                );
                clearError("tipoSolicitacao");
              }}
              options={REQUEST_TYPE_OPTIONS}
              error={errors.tipoSolicitacao}
              placeholder="Selecionar..."
            />
            <Select
              label="Destino *"
              value={req.destino}
              onChange={(e) => {
                patch("destino", e.target.value as ServiceRequest["destino"]);
                clearError("destino");
              }}
              options={DESTINATION_OPTIONS}
              error={errors.destino}
              placeholder="Selecionar..."
            />
            <Select
              label="Urgente"
              value={req.urgente}
              onChange={(e) =>
                patch("urgente", e.target.value as "sim" | "nao")
              }
              options={URGENTE_OPTIONS}
            />
          </div>
          <div className="frow--2">
            <Input
              label="Liberador *"
              value={req.liberador}
              onChange={(e) => {
                patch("liberador", e.target.value);
                clearError("liberador");
              }}
              error={errors.liberador}
              placeholder="Nome do liberador"
            />
            <Input
              label="Tempo Estimado"
              value={req.tempo}
              onChange={(e) => patch("tempo", e.target.value)}
              placeholder="Ex: 2 horas"
            />
          </div>
        </FormSection>

        {/* ── Seção 4: Origem do Problema ── */}
        <FormSection step={4} title="Origem do Problema">
          <div className="as-checkbox-group">
            <label className="as-checkbox">
              <input
                type="checkbox"
                checked={req.origemMontagem}
                onChange={(e) => patch("origemMontagem", e.target.checked)}
              />
              Origem da Montagem
            </label>
            <label className="as-checkbox">
              <input
                type="checkbox"
                checked={req.origemPromob}
                onChange={(e) => patch("origemPromob", e.target.checked)}
              />
              Origem Promob
            </label>
            <label className="as-checkbox">
              <input
                type="checkbox"
                checked={req.origemEntrega}
                onChange={(e) => patch("origemEntrega", e.target.checked)}
              />
              Origem da Entrega
            </label>
            <label className="as-checkbox">
              <input
                type="checkbox"
                checked={req.origemCobrada}
                onChange={(e) => patch("origemCobrada", e.target.checked)}
              />
              Origem Cobrada
            </label>
          </div>
        </FormSection>

        {/* ── Seção 5: Observações ── */}
        <FormSection step={5} title="Observações">
          <textarea
            className="as-textarea"
            rows={4}
            value={req.observacoes}
            onChange={(e) => patch("observacoes", e.target.value)}
            placeholder="Descreva detalhadamente o problema ou informações adicionais..."
          />
        </FormSection>

        {/* ── Seção 6: Equipe de Montagem ── */}
        <div className="as-section-card">
          <div className="as-section-card__header">
            <h3 className="as-section-card__title">6. Equipe de Montagem</h3>
            <button
              className="as-btn as-btn--secondary as-btn--sm"
              onClick={() => setTeamOpen(true)}
              type="button"
            >
              <Users size={13} />
              Adicionar Montador
            </button>
          </div>
          <div className="as-section-card__body">
            <SelectedTeamTable equipe={req.equipe} onRemove={removeMember} />
          </div>
        </div>

        {/* ── Seção 7: Peças ── */}
        <div className="as-section-card">
          <div className="as-section-card__header">
            <h3 className="as-section-card__title">
              7. Peças para Assistência
              {req.pecas.length > 0 && (
                <span className="as-section-card__count">
                  {req.pecas.length}
                </span>
              )}
            </h3>
            <button
              className="as-btn as-btn--secondary as-btn--sm"
              onClick={() => setPartsOpen(true)}
              type="button"
            >
              <Package size={13} />
              Gerenciar Peças
            </button>
          </div>
          <div className="as-section-card__body">
            <SelectedPartsTable pecas={req.pecas} onRemove={removePart} />
          </div>
        </div>

        {/* ── Ações ── */}
        <div className="as-form-actions">
          <button
            className="as-btn as-btn--ghost"
            onClick={() => {
              setReq(buildInitialRequest());
              setErrors({});
            }}
            type="button"
          >
            Descartar
          </button>
          <div style={{ flex: 1 }} />
          <button
            className="as-btn as-btn--primary as-btn--lg"
            onClick={handleSubmit}
            type="button"
          >
            Enviar Solicitação
          </button>
        </div>
      </div>

      {/* ── Modais ── */}
      <TeamModal
        isOpen={teamOpen}
        onClose={() => setTeamOpen(false)}
        equipeAtual={req.equipe}
        onAdd={addMember}
      />
      <PartsModal
        isOpen={partsOpen}
        onClose={() => setPartsOpen(false)}
        pecas={req.pecas}
        onAdd={addPart}
        onRemove={removePart}
      />
    </AppLayout>
  );
}
