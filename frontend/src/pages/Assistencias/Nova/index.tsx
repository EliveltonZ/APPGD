import { useState, useEffect, useRef } from "react";
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
import { submitSolicitacaoCompleta, fetchContratoAssist } from "../../../services/assistencia";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
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
  numSolicitacao?: string;
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
  if (!req.numSolicitacao.trim())
    e.numSolicitacao = "Informe o número da solicitação";
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
  const toast = useToast();
  const { user } = useAuth();
  const [req, setReq] = useState<ServiceRequest>(() =>
    buildInitialRequest(user?.nome ?? ""),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [teamOpen, setTeamOpen] = useState(false);
  const [partsOpen, setPartsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [sending, setSending] = useState(false);
  const [clockNow, setClockNow] = useState(new Date());
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    clockRef.current = setInterval(() => setClockNow(new Date()), 1000);
    return () => {
      if (clockRef.current) clearInterval(clockRef.current);
    };
  }, []);

  function patch<K extends keyof ServiceRequest>(
    key: K,
    value: ServiceRequest[K],
  ) {
    setReq((prev) => ({ ...prev, [key]: value }));
  }

  function clearError(key: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function scrollToFirstError() {
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>('.input-has-error, .select-has-error');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  async function handleContratoBlur() {
    const num = Number(req.numContrato.trim());
    if (!num) return;
    const data = await fetchContratoAssist(num);
    if (!data) return;
    setReq((prev) => ({
      ...prev,
      cliente:   data.cliente   || prev.cliente,
      liberador: data.liberador || prev.liberador,
    }));
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

  async function handleSubmit() {
    const errs = validate(req);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      scrollToFirstError();
      return;
    }
    setSending(true);
    const dataHoraEnvio = new Date().toISOString().slice(0, 19);
    try {
      const solicitacaoId = await submitSolicitacaoCompleta(
        req.numSolicitacao,
        dataHoraEnvio,
        {
          numContrato: req.numContrato,
          solicitante: req.solicitante,
          cliente: req.cliente,
          ambiente: req.ambiente,
          urgente: req.urgente,
          montador: req.equipe
            .map((m) => {
              const parts = m.nome.trim().split(/\s+/);
              return parts.length > 1
                ? `${parts[0]} ${parts[parts.length - 1]}`
                : parts[0];
            })
            .join(" - "),
          bairro: req.bairro,
          tempo: req.tempo,
          tipoSolicitacao: req.tipoSolicitacao,
          origemMontagem: req.origemMontagem,
          origemPromob: req.origemPromob,
          origemEntrega: req.origemEntrega,
          origemCobrada: req.origemCobrada,
          supervisor: req.supervisor,
          destino: req.destino.toUpperCase(),
          observacoes: req.observacoes,
        },
        req.pecas,
        req.equipe,
      );
      setGeneratedId(solicitacaoId);
      setSubmitted(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : null;
      if (msg?.toLowerCase().includes('já cadastrado')) {
        setErrors((prev) => ({ ...prev, numSolicitacao: msg }));
        scrollToFirstError();
      } else {
        toast.error(msg ?? "Erro ao enviar solicitação. Tente novamente.");
      }
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <AppLayout pageTitle="Nova Solicitação">
        <div className="as-page">
          <div className="as-success">
            <h2>Solicitação enviada com sucesso!</h2>
            <p>
              Número da solicitação: <strong>{generatedId}</strong>
            </p>
            <button
              className="as-btn as-btn--primary as-btn--lg"
              onClick={() => {
                setReq(buildInitialRequest(user?.nome ?? ""));
                setErrors({});
                setGeneratedId("");
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
          <div className="frow--4 ap-dates-row">
            <Input
              label="Nº Solicitação *"
              value={req.numSolicitacao}
              onChange={(e) => {
                patch("numSolicitacao", e.target.value);
                clearError("numSolicitacao");
              }}
              error={errors.numSolicitacao}
              placeholder="Ex: AS-2025-001"
            />
            <Input
              label="Nº Contrato *"
              value={req.numContrato}
              onChange={(e) => {
                patch("numContrato", e.target.value);
                clearError("numContrato");
              }}
              onBlur={handleContratoBlur}
              error={errors.numContrato}
              placeholder="Ex: 1901"
            />
            <div className="as-static-field">
              <span className="as-static-field__label">Solicitante</span>
              <span className="as-static-field__value">{req.solicitante}</span>
            </div>
            <div className="as-static-field">
              <span className="as-static-field__label">Data / Hora</span>
              <span className="as-static-field__value">
                {clockNow.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </FormSection>

        {/* ── Seção 2: Cliente ── */}
        <FormSection step={2} title="Cliente">
          <div className="frow--3 ap-dates-row">
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
              label="Ambiente *"
              value={req.ambiente}
              onChange={(e) => {
                patch("ambiente", e.target.value);
                clearError("ambiente");
              }}
              error={errors.ambiente}
              placeholder="Ex: Cozinha, Banheiro..."
            />
          </div>
          <div className="frow--2 ap-dates-row">
            <Input
              label="Bairro"
              value={req.bairro}
              onChange={(e) => patch("bairro", e.target.value)}
              placeholder="Bairro / Localidade"
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
          <div className="frow--3 ap-dates-row">
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
          <div className="frow--2 ap-dates-row">
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
        <FormSection step={4} title="Dados Complementares">
          <div className="as-checkbox-group">
            <label className="as-checkbox">
              <input
                type="checkbox"
                checked={req.origemMontagem}
                onChange={(e) => patch("origemMontagem", e.target.checked)}
              />
              Montagem
            </label>
            <label className="as-checkbox">
              <input
                type="checkbox"
                checked={req.origemPromob}
                onChange={(e) => patch("origemPromob", e.target.checked)}
              />
              Promob
            </label>
            <label className="as-checkbox">
              <input
                type="checkbox"
                checked={req.origemEntrega}
                onChange={(e) => patch("origemEntrega", e.target.checked)}
              />
              Entrega
            </label>
            <label className="as-checkbox">
              <input
                type="checkbox"
                checked={req.origemCobrada}
                onChange={(e) => patch("origemCobrada", e.target.checked)}
              />
              Cobrada
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
              setReq(buildInitialRequest(user?.nome ?? ""));
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
            disabled={sending}
            type="button"
          >
            {sending ? "Enviando..." : "Enviar Solicitação"}
          </button>
        </div>
      </div>

      {/* ── Modais ── */}
      <TeamModal
        isOpen={teamOpen}
        onClose={() => setTeamOpen(false)}
        currentTeam={req.equipe}
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
