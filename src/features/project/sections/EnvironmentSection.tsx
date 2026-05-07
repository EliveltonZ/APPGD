import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { FormSection } from "../../../components/FormSection";
import { AMBIENT_TYPE_OPTIONS } from "../../../data/projectConfig";
import type { SectionProps } from "../../../types/project";

export function EnvironmentSection({ form, onChange, errors }: SectionProps) {
  return (
    <FormSection step={4} title="Ambiente do Projeto">
      <div className="frow frow--2">
        <Select
          label="Tipo do Ambiente"
          value={form.tipoAmbiente}
          onChange={(e) => onChange("tipoAmbiente", e.target.value)}
          options={AMBIENT_TYPE_OPTIONS}
          error={errors?.tipoAmbiente}
        />
        <Input
          label="Descrição do Ambiente"
          value={form.ambiente}
          onChange={(e) => onChange("ambiente", e.target.value)}
          error={errors?.ambiente}
          placeholder="Ex: Sala de reuniões principal"
        />
      </div>
    </FormSection>
  );
}
