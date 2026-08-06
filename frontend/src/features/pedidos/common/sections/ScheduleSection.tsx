import { Input } from "../../../../components/Input";
import { FormSection } from "../../../../components/FormSection";
import type { SectionProps } from "../../../../types/project";

export function ScheduleSection({ form, onChange, errors, readOnly }: SectionProps & { readOnly?: boolean }) {
  return (
    <FormSection step={5} title="Cronograma">
      <div className="frow frow--4">
        <Input
          label="Data do Contrato"
          type="date"
          value={form.dataContrato}
          onChange={(e) => onChange("dataContrato", e.target.value)}
          readOnly={readOnly}
          error={errors?.dataContrato}
        />
        <Input
          label="Data da Assinatura"
          type="date"
          value={form.dataAssinatura}
          onChange={(e) => onChange("dataAssinatura", e.target.value)}
          readOnly={readOnly}
          error={errors?.dataAssinatura}
        />
        <Input
          label="Chegou na Fábrica"
          type="date"
          value={form.chegouFabrica}
          onChange={(e) => onChange("chegouFabrica", e.target.value)}
          readOnly={readOnly}
          error={errors?.chegouFabrica}
        />
        <Input
          label="Data de Entrega"
          type="date"
          value={form.dataEntrega}
          onChange={(e) => onChange("dataEntrega", e.target.value)}
          readOnly={readOnly}
          error={errors?.dataEntrega}
        />
      </div>
    </FormSection>
  );
}
