import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { FormSection } from "../../../../components/FormSection";
import type { SelectOption } from "../../../../components/Select";
import type { SectionProps } from "../../../../types/project";

interface EnvironmentSectionProps extends SectionProps {
  optionsTipoAmbiente?: SelectOption[];
}

export function EnvironmentSection({
  form,
  onChange,
  errors,
  optionsTipoAmbiente = [],
}: EnvironmentSectionProps) {
  return (
    <FormSection step={4} title="Ambiente do Projeto">
      <div className="frow frow--2">
        <Select
          label="Tipo do Ambiente"
          value={form.tipoAmbiente}
          onChange={(e) => onChange("tipoAmbiente", e.target.value)}
          options={optionsTipoAmbiente}
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
