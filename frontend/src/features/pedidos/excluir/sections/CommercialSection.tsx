import { Input } from "../../../../components/Input";
import { FormSection } from "../../../../components/FormSection";
import type { SectionProps } from "../../../../types/project";

export function CommercialSection({ form }: Pick<SectionProps, 'form'>) {
  return (
    <FormSection step={3} title="Informações Comerciais">
      <div className="frow frow--3">
        <Input label="Vendedor"  value={String(form.vendedor)}  readOnly />
        <Input label="Liberador" value={String(form.liberador)} readOnly />
        <Input label="Loja"      value={String(form.loja)}      readOnly />
      </div>
    </FormSection>
  );
}
