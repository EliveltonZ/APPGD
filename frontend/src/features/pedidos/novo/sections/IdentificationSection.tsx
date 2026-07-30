import { Input } from "../../../../components/Input";
import { Select } from "../../../../components/Select";
import { FormSection } from "../../../../components/FormSection";
import type { SelectOption } from "../../../../components/Select";
import type { SectionProps } from "../../../../types/project";

function maskNumeroProjeto(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

interface IdentificationSectionProps extends SectionProps {
  onContractBlur?: () => void;
  onNumOCDoubleClick?: () => void;
  loadingContract?: boolean;
  optionsTipoContrato?: SelectOption[];
  optionsEtapa?: SelectOption[];
}

export function IdentificationSection({
  form,
  onChange,
  errors,
  onContractBlur,
  onNumOCDoubleClick,
  loadingContract,
  optionsTipoContrato = [],
  optionsEtapa = [],
}: IdentificationSectionProps) {
  return (
    <FormSection step={1} title="Identificação do Projeto">
      <div className="frow frow--3">
        <Input
          label="Contrato"
          value={form.contrato}
          onChange={(e) => onChange("contrato", e.target.value)}
          onBlur={onContractBlur}
          disabled={loadingContract}
          error={errors?.contrato}
          placeholder="Digite contrato"
        />
        <Input
          label="Num. OC"
          value={form.numOC}
          onChange={(e) => onChange("numOC", e.target.value)}
          onDoubleClick={onNumOCDoubleClick}
          error={errors?.numOC}
          placeholder="Ex: 1234567890"
        />
        <Input
          label="N° Projeto"
          value={form.numeroProjeto}
          onChange={(e) => onChange("numeroProjeto", maskNumeroProjeto(e.target.value))}
          error={errors?.numeroProjeto}
          placeholder="Ex: 01/01"
        />
      </div>
      <div className="frow frow--2">
        <Select
          label="Tipo do Contrato"
          value={form.tipoContrato}
          onChange={(e) => onChange("tipoContrato", e.target.value)}
          options={optionsTipoContrato}
          error={errors?.tipoContrato}
        />
        <Select
          label="Etapa"
          value={form.etapa}
          onChange={(e) => onChange("etapa", e.target.value)}
          options={optionsEtapa}
          error={errors?.etapa}
        />
      </div>
    </FormSection>
  );
}
