import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { FormSection } from "../../../../components/FormSection";
import { useApiData } from "../../../../hooks/useApiData";
import { fetchTiposAssistencia } from "../../../../services/utils";
import type { SectionProps } from "../../../../types/project";

export function AssistenciaSection({ form, onChange, errors, readOnly }: SectionProps & { readOnly?: boolean }) {
  const { data: tiposAssistencia = [] } = useApiData(fetchTiposAssistencia);

  return (
    <FormSection step={7} title="Dados da Assistência">
      {/* Row 1 — OC + Solicitante */}
      <div className="frow frow--2">
        <Input
          label="OC de Origem *"
          value={form.ocOrigem}
          onChange={(e) => onChange("ocOrigem", e.target.value)}
          error={errors?.ocOrigem}
          placeholder="Nº da OC do projeto original"
          readOnly={readOnly}
        />
        <Input
          label="Solicitante"
          value={form.solicitante}
          onChange={(e) => onChange("solicitante", e.target.value)}
          placeholder="Nome do solicitante"
          readOnly={readOnly}
        />
      </div>

      {/* Row 2 — Supervisor + Tipo de Solicitação */}
      <div className="frow frow--2">
        <Input
          label="Supervisor *"
          value={form.supervisor}
          onChange={(e) => onChange("supervisor", e.target.value)}
          error={errors?.supervisor}
          placeholder="Nome do supervisor"
          readOnly={readOnly}
        />
        <Select
          label="Tipo de Solicitação"
          value={form.tipoSolicitacaoAssist}
          onChange={(e) => onChange("tipoSolicitacaoAssist", e.target.value ? Number(e.target.value) : '')}
          options={tiposAssistencia}
          placeholder="Selecionar..."
          disabled={readOnly}
        />
      </div>

      {/* Row 3 — Checkboxes */}
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
  );
}
