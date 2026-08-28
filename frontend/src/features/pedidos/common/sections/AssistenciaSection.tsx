import { useState } from "react";
import { Users, Package } from "lucide-react";
import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { Button } from "../../../../components/Button";
import { FormSection } from "../../../../components/FormSection";
import { useApiData } from "../../../../hooks/useApiData";
import { fetchTiposAssistencia } from "../../../../services/utils";
import { fetchContratoInfo } from "../../../../services/project";
import { TeamModal } from "../../../assistencias/nova/TeamModal";
import { PartsModal } from "../../../assistencias/nova/PartsModal";
import { SelectedTeamTable } from "../../../assistencias/nova/SelectedTeamTable";
import { SelectedPartsTable } from "../../../assistencias/nova/SelectedPartsTable";
import { DESTINATION_OPTIONS } from "../../../../data/assistenciaConfig";
import type { TeamMember, ServicePart } from "../../../../types/assistencia";
import type { SectionProps } from "../../../../types/project";

export function AssistenciaSection({ form, onChange, errors, readOnly }: SectionProps & { readOnly?: boolean }) {
  const { data: tiposAssistencia = [] } = useApiData(fetchTiposAssistencia);
  const [teamOpen, setTeamOpen] = useState(false);
  const [partsOpen, setPartsOpen] = useState(false);

  async function handleContratoBlur() {
    const num = form.contrato.trim();
    if (!num) return;
    const info = await fetchContratoInfo(num);
    if (!info) return;
    if (info.clienteId) onChange("clienteId", info.clienteId);
    if (info.clienteNome) onChange("clienteNome", info.clienteNome);
    if (info.liberadorNome) onChange("liberadorNome", info.liberadorNome);
  }

  function addMember(member: TeamMember) {
    onChange("equipe", [...form.equipe, member]);
  }
  function removeMember(id: number) {
    onChange("equipe", form.equipe.filter((m) => m.id !== id));
  }
  function addPart(part: ServicePart) {
    onChange("pecas", [...form.pecas, part]);
  }
  function removePart(id: string) {
    onChange("pecas", form.pecas.filter((p) => p.id !== id));
  }

  return (
    <>
      <FormSection step={7} title="Dados da Assistência">
        {/* Row 1 — Nº Solicitação + Contrato + Responsável */}
        <div className="frow frow--3">
          <Input
            label="Nº Solicitação *"
            value={form.numeroSolicitacao}
            onChange={(e) => onChange("numeroSolicitacao", e.target.value)}
            error={errors?.numeroSolicitacao}
            placeholder="Número informado pelo solicitante"
            readOnly={readOnly}
          />
          <Input
            label="Nº Contrato"
            value={form.contrato}
            onChange={(e) => onChange("contrato", e.target.value)}
            onBlur={handleContratoBlur}
            placeholder="Nº do contrato relacionado"
            readOnly={readOnly}
          />
          <Input
            label="Responsável"
            value={form.responsavel}
            readOnly
          />
        </div>

        {/* Row 2 — Bairro + Supervisor + Liberador */}
        <div className="frow frow--3">
          <Input
            label="Bairro"
            value={form.bairro}
            onChange={(e) => onChange("bairro", e.target.value)}
            placeholder="Bairro / Localidade"
            readOnly={readOnly}
          />
          <Input
            label="Supervisor *"
            value={form.supervisor}
            onChange={(e) => onChange("supervisor", e.target.value)}
            error={errors?.supervisor}
            placeholder="Nome do supervisor"
            readOnly={readOnly}
          />
          <Input
            label="Liberador"
            value={form.liberadorNome}
            onChange={(e) => onChange("liberadorNome", e.target.value)}
            placeholder="Nome do liberador"
            readOnly={readOnly}
          />
        </div>

        {/* Row 3 — Tipo de Solicitação + Destino + Tempo Estimado */}
        <div className="frow frow--3">
          <Select
            label="Tipo de Solicitação"
            value={form.tipoSolicitacaoAssist}
            onChange={(e) => onChange("tipoSolicitacaoAssist", e.target.value ? Number(e.target.value) : '')}
            options={tiposAssistencia}
            placeholder="Selecionar..."
            disabled={readOnly}
          />
          <Select
            label="Destino"
            value={form.destino}
            onChange={(e) => onChange("destino", e.target.value)}
            options={DESTINATION_OPTIONS}
            placeholder="Selecionar..."
            disabled={readOnly}
          />
          <Input
            label="Tempo Estimado"
            value={form.tempo}
            onChange={(e) => onChange("tempo", e.target.value)}
            placeholder="Ex: 2 horas"
            readOnly={readOnly}
          />
        </div>

        {/* Row 4 — Checkboxes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 32px', padding: '2px 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: readOnly ? 'default' : 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.urgente}
              onChange={(e) => onChange("urgente", e.target.checked)}
              disabled={readOnly}
              style={{ width: 15, height: 15 }}
            />
            Urgente
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: readOnly ? 'default' : 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.origemMontagem}
              onChange={(e) => onChange("origemMontagem", e.target.checked)}
              disabled={readOnly}
              style={{ width: 15, height: 15 }}
            />
            Origem: Montagem
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: readOnly ? 'default' : 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.origemPromob}
              onChange={(e) => onChange("origemPromob", e.target.checked)}
              disabled={readOnly}
              style={{ width: 15, height: 15 }}
            />
            Origem: Promob
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: readOnly ? 'default' : 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.origemEntrega}
              onChange={(e) => onChange("origemEntrega", e.target.checked)}
              disabled={readOnly}
              style={{ width: 15, height: 15 }}
            />
            Origem: Entrega
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: readOnly ? 'default' : 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.origemCobrada}
              onChange={(e) => onChange("origemCobrada", e.target.checked)}
              disabled={readOnly}
              style={{ width: 15, height: 15 }}
            />
            Cobrada
          </label>
        </div>

        {/* Motivo da Assistência */}
        <div className="projeto-textarea-group">
          <label className="input-label" htmlFor="motivo-assistencia">
            Motivo da Assistência *
          </label>
          <textarea
            id="motivo-assistencia"
            className={`projeto-textarea${errors?.motivoAssistencia ? " projeto-textarea--error" : ""}`}
            value={form.motivoAssistencia}
            onChange={(e) => onChange("motivoAssistencia", e.target.value)}
            placeholder="Descreva detalhadamente o motivo da assistência..."
            rows={3}
            readOnly={readOnly}
          />
          {errors?.motivoAssistencia && (
            <span className="input-error-msg">{errors.motivoAssistencia}</span>
          )}
        </div>

        {/* Observações */}
        <div className="projeto-textarea-group">
          <label className="input-label" htmlFor="observacoes-assist">
            Observações
          </label>
          <textarea
            id="observacoes-assist"
            className="projeto-textarea"
            value={form.observacoesAssist}
            onChange={(e) => onChange("observacoesAssist", e.target.value)}
            placeholder="Informações adicionais..."
            rows={2}
            readOnly={readOnly}
          />
        </div>
      </FormSection>

      {/* Equipe de Montagem */}
      <FormSection step={8} title="Equipe de Montagem">
        {!readOnly && (
          <Button type="button" variant="secondary" size="sm" onClick={() => setTeamOpen(true)}>
            <Users size={13} />
            Adicionar Montador
          </Button>
        )}
        <SelectedTeamTable equipe={form.equipe} onRemove={readOnly ? () => {} : removeMember} />
      </FormSection>

      {/* Peças para Assistência */}
      <FormSection step={9} title="Peças para Assistência">
        {!readOnly && (
          <Button type="button" variant="secondary" size="sm" onClick={() => setPartsOpen(true)}>
            <Package size={13} />
            Gerenciar Peças
          </Button>
        )}
        <SelectedPartsTable pecas={form.pecas} onRemove={readOnly ? () => {} : removePart} />
      </FormSection>

      {!readOnly && (
        <>
          <TeamModal isOpen={teamOpen} onClose={() => setTeamOpen(false)} currentTeam={form.equipe} onAdd={addMember} />
          <PartsModal isOpen={partsOpen} onClose={() => setPartsOpen(false)} pecas={form.pecas} onAdd={addPart} onRemove={removePart} />
        </>
      )}
    </>
  );
}
