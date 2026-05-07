import { Input } from "../../../components/Input";
import { Select } from "../../../components/Select";
import { FormSection } from "../../../components/FormSection";
import {
  CONTRACT_TYPE_OPTIONS,
  PROJECT_STAGE_OPTIONS,
} from "../../../data/projectConfig";
import type { SectionProps } from "../../../types/project";

export function IdentificationSection({
  form,
  onChange,
  errors,
}: SectionProps) {
  return (
    <FormSection step={1} title="Identificação do Projeto">
      <div className="frow frow--3">
        <Input
          label="Num. OC"
          value={form.numOC}
          onChange={(e) => onChange("numOC", e.target.value)}
          error={errors?.numOC}
          placeholder="Ex: 1234567890"
        />
        <Input
          label="Contrato"
          value={form.contrato}
          onChange={(e) => onChange("contrato", e.target.value)}
          error={errors?.contrato}
          placeholder="Digite contrato"
        />

        <Input
          label="N° Projeto"
          value={form.numeroProjeto}
          onChange={(e) => onChange("numeroProjeto", e.target.value)}
          error={errors?.numeroProjeto}
          placeholder="Ex: 01/01"
        />
      </div>
      <div className="frow frow--2">
        <Select
          label="Tipo do Contrato"
          value={form.tipoContrato}
          onChange={(e) => onChange("tipoContrato", e.target.value)}
          options={CONTRACT_TYPE_OPTIONS}
          error={errors?.tipoContrato}
        />
        <Select
          label="Etapa"
          value={form.etapa}
          onChange={(e) => onChange("etapa", e.target.value)}
          options={PROJECT_STAGE_OPTIONS}
          error={errors?.etapa}
        />
      </div>
    </FormSection>
  );
}
