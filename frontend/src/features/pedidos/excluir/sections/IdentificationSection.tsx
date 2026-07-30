import { Input } from "../../../../components/Input";
import { FormSection } from "../../../../components/FormSection";
import type { SectionProps } from "../../../../types/project";

interface IdentificationSectionProps extends SectionProps {
  onNumOCBlur?: () => void;
  loadingProject?: boolean;
}

export function IdentificationSection({
  form,
  onChange,
  errors,
  onNumOCBlur,
  loadingProject,
}: IdentificationSectionProps) {
  return (
    <FormSection step={1} title="Identificação do Projeto">
      <div className="frow frow--3">
        <Input
          label="Num. OC"
          value={form.numOC}
          onChange={(e) => onChange("numOC", e.target.value)}
          onBlur={onNumOCBlur}
          disabled={loadingProject}
          error={errors?.numOC}
          placeholder="Ex: 1234567890"
        />
        <Input label="Contrato"     value={form.contrato}      readOnly />
        <Input label="N° Projeto"   value={form.numeroProjeto} readOnly />
      </div>
      <div className="frow frow--2">
        <Input label="Tipo do Contrato" value={String(form.tipoContrato)} readOnly />
        <Input label="Etapa"            value={String(form.etapa)}        readOnly />
      </div>
    </FormSection>
  );
}
