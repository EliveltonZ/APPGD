import { Input } from "../../../../components/Input";
import { FormSection } from "../../../../components/FormSection";
import type { SectionProps } from "../../../../types/project";

export function EnvironmentSection({ form }: Pick<SectionProps, 'form'>) {
  return (
    <FormSection step={4} title="Ambiente do Projeto">
      <div className="frow frow--2">
        <Input label="Tipo do Ambiente"    value={String(form.tipoAmbiente)} readOnly />
        <Input label="Descrição do Ambiente" value={form.ambiente}           readOnly />
      </div>
    </FormSection>
  );
}
